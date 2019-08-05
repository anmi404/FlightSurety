const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

const fs = require('fs');

let firstAirline = '0x09cA62860d3a215e8999d9eD76306899ec0d42f5';

async function getAccounts() {
    var accounts = await web3.eth.getAccounts();
    return accounts;
}

module.exports = function(deployer) {
        promise = getAccounts();
        //getAccounts().then ((_accounts) => {
  //      firstAirline = _accounts[1];        
        promise.then(accounts => {
            firstAirline = accounts[1];
        });
        deployer.deploy(FlightSuretyData, firstAirline)
        .then( () => {  
            return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
                    .then(async () => {           
                        let config = {
                            localhost: {
                                url: 'http://localhost:8545',
                                dataAddress: FlightSuretyData.address,
                                appAddress: FlightSuretyApp.address,
                            }
                        };

                        // Call constructors

                        let flightSuretyData = await FlightSuretyData.new(firstAirline);//firstAirline
                        let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address); //

                        await flightSuretyData.authorizeCaller(flightSuretyApp.address);

                        fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                        fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    });
            });
  //  });
}