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
A server app has been created for simulating oracle behavior. The server can be launched with “npm run server”

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


## How to Deploy your Contract to Rinkeby

In order to deploy the contract to the Rinkeby Public Network, you need to configure file truffle-config.js (or truffle.js). 
To that end the following steps can be followed:
1. Get the endpoint address from https://infura.io: Create a new project and choose the Rinkeby network from the Endpoints menu. Copy the address and paste the infura key into the truffle.js file. 
2. Uncomment the line: 
```
const HDWalletProvider = require('truffle-hdwallet-provider'); 
```
3. Copy the mnemonic returned by Metamask to constant __mnemonic__. 
4. Insert the following lines into the networks table:
```
rinkeby: {
        provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
          network_id: 4,       // rinkeby's id
          gas: 4500000,        // rinkeby has a lower block limit than mainnet
          gasPrice: 10000000000
        },
```
5. Setup a valid Rinkeby account in Metamask.

## Testing the project
In order to test the project in the local network, run:
```
truffle migrate --reset --network develop
truffle test 
```
To execute in the rinkeby network the contract run command:
```
truffle migrate --reset --network rinkeby
```
* Transaction Hash:  0xb22e1d14a98babfd19121b7103113cd3fce535f7307b2fbf5d6afa8828906c09 
* Contract address: https://rinkeby.etherscan.io/address/0xaD386197E618d70e55974477bC5cc919B5c1B94f

## Libraries
No external libraries have been used. Frameworks version:
- Truffle v4.1.15 - a development framework for Ethereum
- Node v10.13.0
- Ganache CLI v6.4.5 (ganache-core: 2.5.7)

## Built With
* [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
* [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.

## Authors
See also the list of [contributors](https://github.com/anmi404/FlightSurety/contributors.md) who participated in this project.

## Acknowledgments

* Solidity
* Ganache-cli
* Truffle

