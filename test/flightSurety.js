
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    //let result = await flightSuretyApp.fundAirline(firstAirline, {from:firstAirline, value: (new BigNumber(10)).pow(18)});
    //  flightSuretyApp.registerAirline("FirstAirline", {from:firstAirline});
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(airlines) First airline is registered when contract is deployed`, async function () {

    let status = await config.flightSuretyData.airlineIsRegistered.call(config.firstAirline);
    assert.equal(status, true, "Incorrect initial status: First airline is not registered");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {          
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[3] });

      }
      catch(e) {
          accessDenied = true;

      }


      assert.equal(accessDenied, true, "cannot block access to setOperatingStatus() for non-Contract Owner account");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let result = true;

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, "TESTFLIGHT", {from: config.firstAirline});
    }
    catch(e) {
        result = false;
    }
    result = await config.flightSuretyData.airlineIsFunded.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(user) can buy an insurance', async () => {

    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
    let reverted = false;

    // ACT
    try {
        await config.flightSuretyApp.buyInsurance ( config.firstAirline, "TESTFLIGHT", 
        1111, {from: config.owner, value: fee});
    }
    catch(e) {
        reverted = true;
        console.log("error, cannot buy insurance"); 
    }

    // ASSERT
    assert.equal (reverted , false,  "Error while buying insurance");

  });

it('(airline) Only existing airline may register a new airline until there are at least four airlines registered', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[3];
    let newAirline2 = accounts[4];
    let newAirline3 = accounts[5];
    let newAirline4 = accounts[6];

    let result1 = false;
    let result2 = false;
    let result3 = false;
    let result4 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, "TESTFLIGHT",{from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(newAirline2, "TESTFLIGHT",{from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(newAirline3, "TESTFLIGHT",{from: config.firstAirline});
        
        result1 = await config.flightSuretyData.airlineIsRegistered.call(newAirline1); 
        result2 = await config.flightSuretyData.airlineIsRegistered.call(newAirline2); 
        result3 = await config.flightSuretyData.airlineIsRegistered.call(newAirline3); 

        await config.flightSuretyApp.registerAirline(newAirline4, "TESTFLIGHT",{from: newAirline2});
        result4 = await config.flightSuretyData.airlineIsRegistered.call(newAirline4); 
    }
    catch(e) {
        //console.log("error",result1, result2, result3, result4);
        //console.log(e);
    }

    // ASSERT
    assert(result1==true && result2==true && result3==true && result4==false, "Only existing airline may register a new airline");

  });

  it('(airline) Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[7];
    let newAirline2 = accounts[8];
    let newAirline3 = accounts[9];
    let newAirline4 = accounts[10];
      
    let result1 = false;
    let result2 = false;

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, "TESTFLIGHT", {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: newAirline1, value: 1000000000});

        await config.flightSuretyApp.registerAirline(newAirline2, "TESTFLIGHT", {from: newAirline1});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline2, value: 1000000000});

        await config.flightSuretyApp.registerAirline(newAirline3, "TESTFLIGHT", {from: newAirline2});
        await config.flightSuretyApp.fundAirline (newAirline3, {from: newAirline3, value: 1000000000});
        
        //Fourth registration
        await config.flightSuretyApp.registerAirline(newAirline4, "TESTFLIGHT", {from: newAirline3});

        result2 = await config.flightSuretyData.airlineIsRegistered.call(newAirline1);      
        result2 = result2 && await config.flightSuretyData.airlineIsRegistered.call(newAirline2);      
        result2 = result2 && await config.flightSuretyData.airlineIsRegistered.call(newAirline3);      
        result1 = await config.flightSuretyData.airlineIsRegistered.call(newAirline4);      
    }
    catch(e) {
        console.log(result1, result2);
        console.log(e);
    }

    // ASSERT
    assert(result1==false && result2==true , "Registration from fifth on requires multi-party consensus of 50% at least");

  });

  it('(airline) Airline can be registered, but does not participate in contract until it submits funding of 10 ether', async () => {
    
    // ARRANGE
    let newAirline2 = accounts[2];
    let newAirline3 = accounts[11];
    let newAirline4 = accounts[12];

    let result1 = false;
    let result2 = false;
    let result3 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline2, "TESTFLIGHT", {from: config.firstAirline});
        result1 = await config.flightSuretyData.airlineIsRegistered.call(newAirline3);  //false
        result3 = await config.flightSuretyData.airlineIsFunded.call(newAirline2);  //false
        console.log(result3);
        await config.flightSuretyApp.registerAirline(newAirline3, "TESTFLIGHT", {from: newAirline2}); //error

    }

    catch(e) {
        console.log("result1",result1, result3);
        //console.log(e);
    }        

    try {
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline2, value: 1000000000});  //(new BigNumber(10)).pow(18)});
        await config.flightSuretyApp.registerAirline(newAirline3, "TESTFLIGHT", {from: newAirline2}); //now ok
        result2 = await config.flightSuretyData.airlineIsRegistered.call(newAirline2);   //true   
    }
    catch(e) {
        console.log("result2", result2);
        console.log(e);
    }

    // ASSERT
    assert(result1==false && result2==true, "Only a funded airline may register a new airline");

  });  


  it('(Passengers)   Passengers may pay up to 1 ether for purchasing flight insurance.', async () => {
    
    // ARRANGE
    let txId = 0;

   // ACT
    try { 
    
        let firstAirlineName, timestamp = await config.flightSuretyApp.getFlightData (config.firstAirline);
        txId = await config.flightSuretyApp.buyInsurance (config.firstAirline, firstAirlineName, timestamp, {from:config.owner});    
     }
    catch(e) {
    }

    // ASSERT
    assert(txId > 0, "Unable to buy insurance");

  });  


it('(Passengers) If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid', async () => {
    
    // ARRANGE

    let result1 = undefined;
    let result2 = undefined;
    let amountPaid = undefined;
    // ACT
    try {
        let firstAirlineName, timestamp = await config.flightSuretyApp.getFlightData.call (config.firstAirline);
        //(address airline,string flight, uint256 timestamp)
        txId = await config.flightSuretyApp.buyInsurance.sendTransaction (config.firstAirline, firstAirlineName, timestamp);    
        result1 = await config.flightSuretyApp.getCredit(owner);

        config.flightSuretyApp.events.FlightStatusInfo(config.firstAirline, flight, timestamp, status, {fromBlock: 0}, async function (error, event) {
            if (error) console.log(error);
            console.log("flightsurety test received event FlightStatusInfo: ", event);
            result2 = await config.flightSuretyApp.getCredit(owner);
            amountPaid = await config.flightSuretyApp.howMuchPaid.call(user, config.firstAirline, flight, timestamp);
        //    if (status == 20)     credit (index,  airline,  flight,  timestamp,  20);
                //if having a matching index Oracles fetch data and submit a response
        });
    
    }
    catch(e) {
        console.log(result1, result2, amountPaid);
    }

    // ASSERT: VERIFY AMOUNT CREDITED
    assert(result1 + amountPaid.mul(15).div(10) == result2, "Passenger did not receive credit of 1.5X the amount they paid");
  });  

  it('(Passenger) Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout', async () => {
    
    // ARRANGE
    let gasUsedWEI = undefined;
    let gas = undefined;
    let balance1 = undefined;
    let balance2 = undefined;

    //1)Get balance of the passenger previous to the transaction
    try {
        await web3.eth.getBalance(config.owner, async (balance1)=> {
        //async web3.eth.getBalance(accounts[0]).then(function(result){
            console.log( "Balance : " ,web3.utils.fromWei(result, 'ether'));            //2) Get gasUsed by the transaction and multiply it by the gas price, to get the amount of WEI consumed in the transaction
            gas = await web3.eth.getGasPrice();
            gasUsedWEI = tx.receipt.gasUsedWEI * gas ;
            //3) Get balance of the passenger after the transaction
            balance2 = await web3.eth.getBalance(config.owner);
            //4) Check that this is valid:

            assert(balance1 < gasUsedWEI + balance2, "Passenger couldn't withdraw any funds owed to them");
        });

    // ASSERT
    }
    catch(e) {
        console.log(e);
    }
  });  
}); 
