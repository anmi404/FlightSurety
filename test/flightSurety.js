
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
var globalTimestamp = `${Date.now()}`;
const flightSuretyApp = artifacts.require('FlightSuretyApp');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const TEST_ORACLES_COUNT = 20;
//FlightSuretyApp already available?


contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    //  @testconfig.js:  let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
    //let events = config.flightSuretyApp.allEvents(function(error, result) {
        /*if (result.event === 'OracleRequest') {
          console.log("Oracle"); //`\n\nOracle Requested: index: ${result.args.index.toNumber()}, flight:  ${result.args.flight}, timestamp: ${result.args.timestamp.toNumber()}`);
        } else {
          console.log("Outro"); //`\n\nFlight Status Available: flight: ${result.args.flight}, timestamp: ${result.args.timestamp.toNumber()}, status: ${result.args.status.toNumber() == ON_TIME ? 'ON TIME' : 'DELAYED'}, verified: ${result.args.verified ? 'VERIFIED' : 'UNVERIFIED'}`);
        }
        */
      //  console.log("err/result", error, result);
      //});
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
    await config.flightSuretyData.cleansRegistered();

    let newAirline2 = accounts[11];
    let newAirline3 = accounts[12];
    let newAirline4 = accounts[13];

    let result1 = false;
    let result2 = false;
    // ACT
    try {
        //funded is ok
        await config.flightSuretyApp.registerAirline(newAirline2, "TESTFLIGHT", {from: config.firstAirline});
        await config.flightSuretyApp.fundAirline (newAirline2, {from: newAirline2, value: 1000000000});  //(new BigNumber(10)).pow(18)});
        await config.flightSuretyApp.registerAirline(newAirline3, "TESTFLIGHT", {from: newAirline2}); //true
        result1 = await config.flightSuretyData.airlineIsRegistered.call(newAirline3);  //true
   
        await config.flightSuretyApp.registerAirline(newAirline4, "TESTFLIGHT", {from: newAirline3}); //now ok
        result2 = await config.flightSuretyData.airlineIsRegistered.call(newAirline2);   //false   
    }
    catch(e) {
        //console.log(e);
    }

    // ASSERT
    assert(result1==true && result2==false, "Only a funded airline may register a new airline");

  });  


  it('(Passengers)   Passengers may pay up to 1 ether for purchasing flight insurance', async () => {
    
    // ARRANGE
    let failed = false;
   // ACT
    try { //use call() for getter methods!
        await config.flightSuretyApp.getFlightData.call (config.firstAirline).then(async function (timestamp, error) {
            //buyInsurance(address airline,string flight,uint256 timestamp)
            await config.flightSuretyApp.buyInsurance.sendTransaction (config.firstAirline, "First airline", timestamp.toNumber(), {"from":config.owner, "value": 100000000})
            .then(function () {
                //insuranceBought (uint256 txId, address from, uint256 value);
                // truffleAssert.eventEmitted(tx, 'insuranceBought', (ev) => {
                //     console.log(ev);
                //     return true;
                // });
                //config.flightSuretyData.events.insuranceBought({fromBlock: "latest"}, function (error, event) {
                //    console.log("Server received event OracleRequest: ", event);
                //    txId = event.returnValues.txId;
                //    from = event.returnValues.from;
                //    let value = event.returnValues.value;
                //});
            })
            .catch(e => {
                console.log("errors", e);

                failed = true;
            });
        })
        .catch(e => {
            console.log("error at ", e);
        });
    }
    catch(e) {
        console.log("error in ", e);
    }

    // ASSERT
    assert(failed == false, "Unable to buy insurance");

  });  

/*it('(Passengers) If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid', async () => {
    
    // ARRANGE
    let result1 = undefined;
    let result2 = undefined;
    let amountPaid = undefined;
    let sucess = 0;
    let index = undefined;
    // ACT
    try {
        let firstAirlineName, timestamp = await config.flightSuretyApp.getFlightData.call (config.firstAirline);
        //(address airline,string flight, uint256 timestamp)
        console.log("timestamp", timestamp);
        await config.flightSuretyApp.getCreditAmount.call(config.owner).then (async function (result1) {
            //Initial value in amount1.toNumber()
            flight = new String("First airline");
            await config.flightSuretyApp.buyInsurance.sendTransaction (config.firstAirline, flight.toString(), timestamp, {"from":config.owner, "value": 100000000})
                    //insuranceBought event
            .then(async () => {
                let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
                // ACT
                for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
                    await config.flightSuretyApp.registerOracle.sendTransaction({ from: accounts[a], value: fee });
                    result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
                    let tx = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, "First airline", timestamp, {from: config.owner});
                    
                    //event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);
                    truffleAssert.eventEmitted(tx, 'OracleRequest', (ev) => {
                        console.log(ev.index, ev.airline, ev.flight, ev.timestamp);
                        return true;
                    });
                    let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});

                    for(let idx=0;idx<3;idx++) {

                        try {
                            // Submit a response...it will only be accepted if there is an Index match
                            //console.log( oracleIndexes[idx], accounts[a], flight, timestamp, STATUS_CODE_ON_TIME);
                            
                            await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, 20, { from: accounts[a] });
                            console.log("Submitting oracle response");
                        }
                        catch{
                            console.log("Not submitting oracle response");

                        };

                        let tx_data = await truffleAssert.createTransactionResult(config.flightSuretyData, tx.tx);
                        truffleAssert.eventEmitted(tx, 'OracleReport', () => {return true;});
                        sucess++;
                        if (success>3) {
                            //   event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);
                            truffleAssert.eventEmitted(tx, 'FlightStatusInfo');
                            // event insureesCredited (address who, uint256 value, bytes32 flightKey, uint256 credited);
                            truffleAssert.eventEmitted(tx_data, 'insureesCredited', null, 'insureesCredited not emitted');
                            truffleAssert.eventEmitted(tx_data, 'insureesCredited', (ev) => {
                            console.log(web3.utils.fromWei(ev.credited.toString(), 'ether'));
                            console.log(web3.utils.fromWei(ev.value.toString(), 'ether'));
                            return ev.who === config.owner && ev.credited.eq(ev.value.mul(15).div(10));
                            }, 'InsureeCredit emited wrong parameters');
                            return;
                        }
                    }
                }
                   
            })
            .catch(e => {
                console.log("1", e);
            });
        })
        .catch(e => {
            console.log("2", e);
        });
    }
    catch (e) {
        console.log("error on try", e);
    }
}); 
*/
                    /* 
                   
                    // emit insuranceBought (uint256 txId, address from, uint256 value, bytes32 flightKey, address airline, string flight, uint256 timestamp, uint256 credited);
                truffleAssert.eventEmitted(tx, 'insuranceBought', (ev) => {
                        console.log("amount paid", ev.credited);
                        amountPaid = ev.credited;
                });
                let result2 = await config.flightSuretyApp.getCreditAmount.call(config.owner)
                .then((res) => {console.log(res);})
                .catch((e)=> {console.log("error", e);});
                assert((result1 + amountPaid.mul(15).div(10)) >= result2);
                    */
              


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
       // console.log(e);
    }
  });  
}); 
