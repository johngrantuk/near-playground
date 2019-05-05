// Loads nearlib and this contract into nearplace scope.
nearplace = {};

async function initContract() {
  console.log("nearConfig", nearConfig);
  nearplace.near = await nearlib.dev.connect(nearConfig);
  nearplace.contract = await nearplace.near.loadContract(nearConfig.contractName, {
    viewMethods: ["totalClicks", "getUserClicks", "getTopTen", "getMessage", "getRequiredUserMessageClicks"],
    changeMethods: ["addClick", "addMessage"],
    sender: nearlib.dev.myAccountId
  });

  console.log(nearlib.dev.myAccountId);
  updatePage();
  nearplace.timedOut = false;
  const timeOutPeriod = 10 * 60 * 1000; // 10 min
  setTimeout(() => { nearplace.timedOut = true; }, timeOutPeriod);
}

function sleep(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, time);
  });
}

let initPromise = initContract().catch(console.error);

async function updatePage(){

  $('#success-alert').hide();
  $('#fail-alert').hide();
  $("#who").text(nearlib.dev.myAccountId);
  // Update the various metrics, etc
  var total_clicks = await nearplace.contract.totalClicks();
  console.log('Total Clicks: ' + total_clicks);
  $("#totalClicks").text(total_clicks);

  var your_clicks = await nearplace.contract.getUserClicks({ user: nearlib.dev.myAccountId });
  $("#your-clicks").text(your_clicks);
  console.log('User Clicks: ' + your_clicks);

  var message = await nearplace.contract.getMessage();
  $('.sign-message').html(message);
  console.log('Message: ' + message)

  var required_clicks = await nearplace.contract.getRequiredUserMessageClicks({ user: nearlib.dev.myAccountId });
  $('#required_clicks').text(required_clicks);
  console.log('Required Clicks: ' + required_clicks);

  var top_ten = await nearplace.contract.getTopTen();
  $("#score_table").find("tr:gt(0)").remove();

  console.log('Top Ten: ')
  for(key in top_ten){
    var clicks = await nearplace.contract.getUserClicks({ user: top_ten[key] });

    console.log(top_ten[key] + ': ' + clicks);  /// Gets user name key

    var row = '<tr><td>' + top_ten[key] + '</td><td>' + clicks + '</td></tr>';
    $('#score_table').append(row);
  }
}

let timer;
var isOn = false;

async function clickButton(e) {

  $('#success-alert').hide();
  $('#fail-alert').hide();
  // Turns the sign 'on' for 5 seconds and updates the user with a click
  if(isOn)
    clearTimeout(timer);

  if(!isOn){
    toggleSign(isOn);
    isOn = true;
  }

  timer = setTimeout(toggleSign, 5000);
  await nearplace.contract.addClick();

  updatePage();
}

async function addMessage(e) {

  var message = $("#message").val();

  console.log('Adding Message: ' + message)
  var result = await nearplace.contract.addMessage({ message: message });

  console.log('Result: ');
  console.log(result);

  if(result.lastResult == true){
    // Means the message has been all good
    updatePage();
    $('#success-alert').show();
  }else{
    // Problem time
    $('#fail-alert').show();
  }

}

function toggleSign(){
  $(".sign-jumbotron").toggleClass("sign-on sign-off");
  $(".sign-message").toggleClass("neon");
  isOn = false;
}
