import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
let config = undefined;


export default class Contract {
    constructor(network, callback) {

        config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        //this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));

        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.flights = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts(async (error, accts) => {
            let self = this;
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter]);
                this.flights.push({airline: accts[0], flight: `AM${counter}`, timestamp: Date.now()/3600000 });
                counter++;
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

           var select = document.getElementById("flight-number");

            this.flights.forEach (function (record, index) {
                select.add(new Option(record.flight.toString(), index.toString()));           
            });

            //window.alert("Text: " + select.options[select.selectedIndex].text + "\nValue: " + select.options[select.selectedIndex].value);

            await this.flightSuretyData.methods.authorizeCaller(config.appAddress).send({
                "from": this.owner
            });

            callback();
        });
    }
    
    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);//result
            });
    }

    buyInsurance(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .buyInsurance(payload.airline, payload.flight, payload.timestamp)
            .call({ from: self.owner, val: web3.toWei(1, "ether") }, (error, result) => {
                callback(error, payload);//result undefined
            });
    }

    safeWithdraw(amount, callback) {
        let self = this;
        let payload = {
            airline: amount
        } 
        self.flightSuretyApp.methods
            .safeWithdraw(payload.amount)
            .call({ from: self.owner}, (error, result) => {
                callback(error, payload);//result undefined
            });
    }
}