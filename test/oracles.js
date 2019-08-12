
var Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');
const flightSuretyApp = artifacts.require('FlightSuretyApp');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract('Oracles', async (accounts) => {

  const TEST_ORACLES_COUNT = 20;
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });
    // Watch contract events
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  it('can register oracles', async () => {
    
    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
    let result = undefined; 
    // ACT
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
    try{
        await config.flightSuretyApp.registerOracle.sendTransaction({ from: accounts[a], value: fee });
        result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
        console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        assert(result.length > 0, "Oracle not registered");
      }
    catch(e) {
      console.log("Oracle Registered: error ", a, e);
    }
  }
  });

  /*it('(Server) Server will loop through all registered oracles, \
  identify those oracles for which the OracleRequest event applies, \
  and respond by calling into FlightSuretyApp contract with random status code of \
  Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)',\
  */
  it('can request flight status', async () => {
    
    // ARRANGE
    let flight = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    // Submit a request for oracles to get status information for a flight
    let myreceipt = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);

    // ACT emit OracleRequest(index, airline, flight, timestamp)
    truffleAssert.eventEmitted(myreceipt, 'OracleRequest', (ev) => {
      console.log(ev.index, ev.airline, ev.flight, ev.timestamp);
      return true;
    });

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          //console.log( oracleIndexes[idx], accounts[a], flight, timestamp, STATUS_CODE_ON_TIME);

          await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] })
                      
          //OracleReport(airline, flight, timestamp, statusCode);

          console.log(  idx, oracleIndexes[idx].toNumber(), flight, timestamp, a);
    
        }
        catch(e) {
          // Enable this when debugging
           console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp, a, accounts[a]);
          }

      }
    }

  }); 
});
