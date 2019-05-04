// Loads nearlib and this contract into nearplace scope.
nearplace = {};

async function initContract() {
  console.log("nearConfig", nearConfig);
  nearplace.near = await nearlib.dev.connect(nearConfig);
  nearplace.contract = await nearplace.near.loadContract(nearConfig.contractName, {
    viewMethods: ["totalClicks", "getUserClicks"],
    changeMethods: ["addClick"],
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


  var you_clicks = await nearplace.contract.getUserClicks({ user: nearlib.dev.myAccountId });
  console.log('USER CLICKS: ' + you_clicks);
}


let timer;
var isOn = false;

async function myButtonClick(e) {

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

function toggleSign(){
  $(".sign-jumbotron").toggleClass("sign-on sign-off");
  $(".sign-message").toggleClass("neon");
  isOn = false;
}
