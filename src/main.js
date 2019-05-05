// Loads nearlib and this contract into nearplace scope.
nearplace = {};

async function initContract() {
  console.log("nearConfig", nearConfig);
  nearplace.near = await nearlib.dev.connect(nearConfig);
  nearplace.contract = await nearplace.near.loadContract(nearConfig.contractName, {
    viewMethods: ["totalClicks", "getUserClicks", "getTopTen", "getMessage"],
    changeMethods: ["addClick", "addMessage"],
    sender: nearlib.dev.myAccountId
  });

  console.log(nearlib.dev.myAccountId);
  getTotalClicks();
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

async function getTotalClicks(){
  console.log('GEtting clicks...')
  var total_clicks = await nearplace.contract.totalClicks();
  console.log(total_clicks)
  $("#totalClicks").text(total_clicks);

  var your_clicks = await nearplace.contract.getUserClicks({ user: nearlib.dev.myAccountId });
  $("#your-clicks").text(your_clicks);

  var top_ten = await nearplace.contract.getTopTen();
  $("#score_table").find("tr:gt(0)").remove();
  console.log(top_ten)

  console.log('keys')
  for(key in top_ten){
    var clicks = await nearplace.contract.getUserClicks({ user: top_ten[key] });

    console.log(top_ten[key] + ': ' + clicks);  /// Gets user name key

    var row = '<tr><td>' + top_ten[key] + '</td><td>' + clicks + '</td></tr>';
    $('#score_table').append(row);
  }

  console.log('Getting Message...');
  var message = await nearplace.contract.getMessage();
  console.log(message)
  $('.sign-message').html(message);
}


let timer;
var isOn = false;

async function myButtonClick(e) {

  var message = $("#message").val();

  if(isOn)
    clearTimeout(timer);

  if(!isOn){
    toggleSign(isOn);
    isOn = true;
  }

  timer = setTimeout(toggleSign, 5000);
  await nearplace.contract.addClick();

  getTotalClicks();
}

async function add_message(e) {

  var message = $("#message").val();

  console.log('Adding Message: ' + message)
  var result = await nearplace.contract.addMessage({ message: message });

  console.log('Result: ')
  console.log(result)
  $('.sign-message').html(message);

}

function toggleSign(){
  $(".sign-jumbotron").toggleClass("sign-on sign-off");
  $(".sign-message").toggleClass("neon");
  isOn = false;
}
