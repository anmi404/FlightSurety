# FlightSurety
This repository containts an Ethereum DApp that demonstrates a Supply Chain flow for airlines.

## Project Requirements. There are five main requirements for the project:

* Separation of Concerns
* Airlines
* Passengers
* Oracles
* General

### Separation of Concerns, Operational Control and “Fail Fast”

#### Smart Contract Seperation. Smart Contract code is separated into multiple contracts:
- FlightSuretyData.sol for data persistence
- FlightSuretyApp.sol for app logic and oracles code

#### Dapp Created and Used for Contract Calls
A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at http://localhost:8000

#### Specific contract calls:
- Passenger can purchase insurance for a flight
- Trigger contract to request flight status update

#### Oracle Server Application
A server app has been created for simulating oracle's behavior. The server can be launched with “npm run server”

#### Operational status control is implemented in contracts
The operational status control has been implemented.

#### Fail Fast Contract
Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body

### Airlines
#### Airline Contract Initialization
First airline is registered when contract is deployed.

#### Multiparty Consensus
Only an existing airline may register a new airline until there are at least four airlines registered. Demonstrated either with Truffle test or by making call from client Dapp
#### Multiparty Consensus
Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines.
Demonstrated either with Truffle test or by making call from client Dapp
#### Airline Ante
Airline can be registered, but does not participate in contract until it submits funding of 10 ether. Demonstrated either with Truffle test or by making call from client Dapp

### Passengers
#### Passenger Airline Choice
Passengers can choose from a fixed list of flight numbers and departure that are defined in the Dapp client

#### Passenger Payment
Passengers may pay up to 1 ether for purchasing flight insurance.

#### Passenger Repayment
If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

#### Passenger Withdraw
Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout

#### Insurance Payouts
Insurance payouts are not sent directly to passenger’s wallet

### Oracles (Server App)
#### Functioning Oracle
Oracle functionality is implemented in the server app.

#### Oracle Initialization
Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

#### Oracle Updates
Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)

#### Oracle Functionality
Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)

## How to Deploy your Contract to Ganache

ganache-cli --gasLimit 300000000 --gasPrice 20000000  -m "thing beauty giggle lonely choice blindest era parent balcony menu napkin" -a 50

## Testing the project
In order to test the project in the local network, run:
```
truffle migrate --reset --network develop
truffle test test/flightSurety.js
truffle test test/oracle.js
```
## Libraries
No external libraries have been used. Frameworks version:
- Truffle v5.0.2 (core: 5.0.2)
- Solidity - 0.4.25 (solc-js)
- Node v10.13.0
- Ganache CLI v6.5.1 (ganache-core: 2.6.1-beta.0)
- web3 1.0.0-beta.37

## Built With
* [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
* [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot 
easier.

## Tested With
truffle-assertions

## Authors
See also the list of [contributors](https://github.com/anmi404/FlightSurety/contributors.md) who participated in this project.

## Acknowledgments

* Solidity
* Ganache-cli
* Truffle
* truffle-assertions 

