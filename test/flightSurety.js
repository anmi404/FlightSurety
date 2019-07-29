
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

    let status = await config.flightSuretyData.isAirline.call(config.firstAirline);
    assert.equal(status, true, "Incorrect initial status: First airline is not registered");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
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

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

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
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });
/*
  it('(airline) //Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });

  it('(airline) Airline can be registered, but does not participate in contract until it submits funding of 10 ether', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  

  it('(Passengers)   Passengers may pay up to 1 ether for purchasing flight insurance.', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  


it('(Passengers) If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  


//1)Get balance of the passenger previous to the transaction

//2) Get gasUsed by the transaction and multiply it by the gas price, to get the amount of WEI consumed in the transaction

//3) Get balance of the passenger after the transaction

//4) Check that this is valid:

//     let gas = await web3.eth.getGasPrice()
//     let fee = tx.receipt.gasUsed * gas 
//previousBalance < gasUsedWEI + afterBalance


  it('(Passenger) Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  
  
  
  it('(Oracle) Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  

  it('(Server) Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline1, {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline1, {from: config.firstAirline});
        result1 = await config.flightSuretyData.isAirline.call(newAirline1); 

        await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline3});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline3});
        result2 = await config.flightSuretyData.isAirline.call(newAirline2);      
    }
    catch(e) {
    }

    // ASSERT
    assert(result1==true && result2==false, "Only existing airline may register a new airline");

  });  
*/

}); 
