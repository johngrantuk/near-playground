// Loads nearlib and this contract into nearplace scope.
nearplace = {};
let refreshTimeout;
let message;
let timer;
var isOn = false;
var isFirst = true;

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
  setTimeout(() => {
    refreshMessage();
  }, 1000);
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

  message = await nearplace.contract.getMessage();
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

async function clickButton(e) {
  // Normal click button - user clicks this to see the message for 5secs and log a click on chain

  $('#success-alert').hide();                                                 // These are the alerts shown when a user tries to update the message
  $('#fail-alert').hide();

  flashSign();

  await nearplace.contract.addClick();                                        // Add the click to chain

  updatePage();                                                               // Update the UI
}

function toggleSign(){
  // Sorts css for sign on/off
  $(".sign-jumbotron").toggleClass("sign-on sign-off");
  $(".sign-message").toggleClass("neon");
  isOn = false;
}

function flashSign(){
  if(isOn){
    clearTimeout(timer);                                                      // If the sign is already on this resets the timer so it stays on for another 5 sec
  }else{
    toggleSign(isOn);                                                         // Turns the sign 'on'
    isOn = true;
  }

  timer = setTimeout(toggleSign, 3000);                                       // Sign is now 'on' so set a timer to turn it off in 5 seconds
}

async function addMessage(e) {

  var newMessage = $("#message").val();

  console.log('Adding Message: ' + newMessage)
  var result = await nearplace.contract.addMessage({ message: newMessage });

  console.log('Result: ');
  console.log(result);

  if(result.lastResult == true){
    // Means the message has been all good
    message = newMessage;
    updatePage();
    $('#success-alert').show();
  }else{
    // Problem time
    $('#fail-alert').show();
  }

}


async function refreshMessage() {
  console.log('refreshing')
  // Calls view function on the contract and sets up timeout to be called again in 5 seconds
  // It only calls the contract if the this page/tab is active.

  // Checking if the page is not active and exits without requesting messages from the chain
  // to avoid unnecessary queries to the devnet.
  if (document.hidden) {
    return;
  }

  // If we already have a timeout scheduled, cancel it
  if (!!refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  var newMessage = await nearplace.contract.getMessage();

  if(newMessage != message){
    if(isFirst == false){
      $('.sign-message').html(newMessage);                             // // get the message from the contract
      console.log('Message: ' + newMessage);
      flashSign();                                                  // show message if its new
      message = newMessage;
    }else{
      isFirst = false;
    }
  }

  // Schedules a new timeout
  refreshTimeout = setTimeout(refreshMessage, 2000);

}
