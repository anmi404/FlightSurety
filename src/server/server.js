import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

//import { resolve } from 'web3-core-promievent';

let TEST_ORACLES_COUNT = 20;
//web3.eth.defaultAccount = web3.eth.accounts[0];

  //In server.js register 20 oracles
web3.eth.getAccounts().then (accounts => {testOracles(accounts);});

function testOracles(accounts) {
  for(let a=1; a<=TEST_ORACLES_COUNT; a++) {
    // Register 20 oracles
    flightSuretyApp.methods.REGISTRATION_FEE().call().then((fee) => {
      //promise
      flightSuretyApp.methods.registerOracle().send({"from": accounts[a], "value": fee, "gas": 4712388, "gasPrice": 100000000000})
        .then(() => { 
        })
        .catch(e => {
          console.log ("register", e);
        });
    })
    .catch (e => {
      console.log ("fee", e);
    });
  }
}      //console.log(a, accounts[a], fee);
  
       /* flightSuretyApp.methods.getMyIndexes().call({
            "from": accounts[a]
       })
        .then((result) => {
          oracles.push(result);
          resolve(oracles);
        })
          .catch(e => {console.log("error on oracle registration");})
          })*/
  //In server.js handle the OracleRequest events that are emitted when the function fetchFlightStatus is called
  // (emits OracleRequest)
  // Event fired when flight status request is submitted
  // Oracles track this and if they have a matching index
  // they fetch data and submit a response

      let events = flightSuretyApp.events.allEvents(function(error, result) {
        console.log(events, error, result);
      });
      
      flightSuretyApp.events.OracleRequest({fromBlock: 0, toBlock: 'latest'}, function (error, event) {
        console.log("Server received event OracleRequest: ", event);
        let index = event.returnValues.index;
        let airline = event.returnValues.airline;
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp;
        for(let a=1; a<TEST_ORACLES_COUNT; a++) {
          // Every one of the 20 oracles will submit the response, only some of them will be successful
            console.log("Oracle submitting response ");
            //if having a matching index Oracles fetch data and submit a response
            config.flightSuretyApp.submitOracleResponse.send (index,  airline,  flight,  timestamp,  20).send({"from": accounts[a]})
            .then(result => {
              console.log("Oracle was successful");
            })
            .catch(error => {
              console.log("Oracle was unlucky");
            });
        }
      });

  const app = express();

  app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    });
  });

  
export default app;


  /* flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});
*/
//FlightStatusInfo
//emit FlightStatusInfo(airline, flight, timestamp, statusCode);

//emit FlightStatusInfo(airline, flight, timestamp, statusCode);
/*event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    event FlightDelayed(address airline, string flight, uint256 timestamp);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);
*/
  /*In server.js submit the oracle response calling the function submitOracleResponse in the contracts
you need to implement this functionality of registering the 20 oracles in server.js file where the oracle server 
is implemented. When you run the command npm run server the 20 oracles need to be registered so that you can use the Dapp.
*/

//"@Alvaro: always update the status of the flight to delayed 
// by executing the function in the smart contract to submit an oracle response"


