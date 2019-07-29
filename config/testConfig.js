
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');


var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x09ca62860d3a215e8999d9ed76306899ec0d42f5",
        "0x9c5073e861405c8f2c3afc9932bc026310012f41",
        "0x63a59dd1594f866ea763aff8ddc3101955a0df66",
        "0x28d1515a897bdc5212b79cd614c805740d02acf5",
        "0x9f7a40bfacab7665f1f7802955747ba86a6eb8fb",
        "0x0c08a91bcd655598a6dde428acdf40115da14666",
        "0x661b03327b7d27d535f82283fd07d083bf8fb9ff",
        "0x5fbe05ca0768533aa4e377ff8a242a5c2f18b20a",
        "0x5ac7c639f193dca7ee35d959de924ca63eb3462b",
        "0x1403a107a01f5dc11c29d1c57896b036528b84df",
        "0x19668bd8b7baf5b9ee545e5e4c351a7986035569",
        "0x88b23ad3b6c2c2be2882e608790155aabefc9b38",
        "0x2f1ce1eb29c4561a6d8b11de5186b7dfda48fddc",
        "0xee47a601f98f7fc287d7904fd77ada07abed2180",
        "0x59ef40d35f2cfddb1153e98365913b0c4a3ce455",
        "0xc1d1b3f3eee59373a7f6afe1835eff389577f3dc",
        "0xd2218a02c592eafbf5d47693b2c9fd28228caabe",
        "0xdce3a7bdc34a35209689504a936947dedd0eb674",
        "0x2113f93ab3b75270ccdb9e7f9d86b9ceb7379eba",
        "0xcf8a2991e4387632a4377392c6cb9a23493dd927",
        "0x239f5c08a52a35378a1c2fdcd4d37672e629ea60"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];


    let flightSuretyData = await FlightSuretyData.new(firstairline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    var eth = BigNumber(10e+18).toString(16);


    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp,
       
    }
}

module.exports = {
    Config: Config
};