import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let TEST_ORACLES_COUNT = 20;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);



  //In server.js register 20 oracles

   for(let a=1; a<=TEST_ORACLES_COUNT; a++) {
    // Register 20 oracles
      await config.flightSuretyApp.registerOracle(accounts[a]);
   }

  //In server.js handle the OracleRequest events that are emitted when the function fetchFlightStatusfunction is called
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
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


