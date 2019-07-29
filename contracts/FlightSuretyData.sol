pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    // Data persistance

    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;        // Account used to deploy contract
    bool private operational = true;      // Blocks all state changes throughout the contract if false   
    
    struct airlinesRegistered{
        bool funded;
        uint votes;
        string name;
        bool elected;
    }

    address[] airlines;

    mapping (address => airlinesRegistered) private registeredAirlines;

    mapping(address => uint256) private credit;

    mapping(address => bool) private authorizedCaller;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event FundsWithdrawed(address sender, uint256 value);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                ) 
                                public 
    {
        contractOwner = msg.sender;   

        registeredAirlines[firstAirline].votes = 1;
        registeredAirlines[firstAirline].elected = true;
        registeredAirlines[firstAirline].name = "first airline";
        airlines.push(firstAirline);
        //registerAirline(firstAirline);
        //flightSuretyData.registerAirline(firstAirline, firstAirlineName);
        //flightSuretyData.fund.value(10 ether)(firstAirline);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

      modifier requireIsAuthorized(address addr) 
    {
        require(authorizedCaller[addr]==true, "Contract is not authorized");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier requireEnoughFunds(uint256 amount)
    {
        require(msg.value >= amount, "Not enough funds");
        _;
    }
  
   // Define a modifier that checks the price and refunds the remaining balance
    modifier checkValue(uint256 price, address to) {
        _;
        uint256 amountToReturn = msg.value - price;
        if (amountToReturn >= 0) to.transfer(amountToReturn);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational()  
                            view 
                            external
                            returns(bool) 
    {
        return operational;
    }

  /**
    *
    * @return A bool that is this is an airline
    */      
    function isAirline(address addr)  
                            view 
                            external
                            returns(bool) 
    {
        return registeredAirlines[addr].elected;
    }
 

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add a contract to the authorization list
    *
    */   
    function authorizeCaller
                            (   
                                address contractAddress
                            )
                            external
                            requireContractOwner
                            returns(bool success)
    {
        authorizedCaller[contractAddress] = true;
        return (true);
    }


    function deauthorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedCaller[contractAddress];
    }


   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address addr, string airline
                            )
                            external
                            requireIsAuthorized(msg.sender)
                            returns(bool success, uint256 votes)
    {
        require ( registeredAirlines[msg.sender].funded == true, "cannot register an Airline using registerAirline() if it is not funded");
        success = false;
        if (registeredAirlines[addr].votes == 0) { 
            registeredAirlines[addr].votes = 1;
            registeredAirlines[addr].elected==false;
            registeredAirlines[addr].name = airline;
        }
        else {
            registeredAirlines[addr].votes = registeredAirlines[addr].votes.add(1);
        }
        // if enough voted
        if (registeredAirlines[addr].elected==false && ( (airlines.length < 2 * registeredAirlines[addr].votes) || (airlines.length < 4 ))) {
            airlines.push(addr);
            registeredAirlines[addr].elected==true;
            success = true;
        }
    
        return (success, registeredAirlines[addr].votes);
    }

    //Track everyone who paid the insurance
    struct clients {
        address addr;
        uint value;// less than 1 ether
    }

    mapping(bytes32 => clients[]) private insuree; 
   /**
    * @dev Buy insurance for a flight
    Returns an identification number
    *
    */   
    function buy
                            (
                                address airline, string flight, uint256 timestamp
                            )
                            external
                            payable
                            //requireEnoughFunds(0)
                            //checkValue(insurancePrice, tx.origin)
                            returns (uint256)
    {
// Transfer money to fund
        bytes32 flightKey = keccak256(abi.encodePacked(airline, flight, timestamp));
        uint256 txId = insuree[flightKey].push(clients({addr: tx.origin,value: msg.value}));
        if (credit[msg.sender] == 0) { //force initialization
            credit[msg.sender] = 0;
        }

        return txId;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    bytes32 keyFlight
                                )
                                external
                                requireIsAuthorized(msg.sender)
    {
        clients[] storage ins = insuree[keyFlight];
        for (uint i = 0; i < ins.length; i++) {
            credit[ins[i].addr].add(3 * ins[i].value / 2);
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                uint256 amount
                            )
                            external
                            requireIsOperational
    {
        address ins = tx.origin;

        //check
        require (amount <= credit[ins], "Not enough credit");

        //effect 
        credit[ins] = credit[ins].sub(amount);

        //interaction
        ins.transfer(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   

    function fund
                            (
                                address airlineAddress

                            )
                            external
                            payable
                            //requireEnoughFunds(10 ether)
                            
    {
        // if this is an airline, register as funded
        registeredAirlines[airlineAddress].funded = true;
    }

    function safeWithdraw
    (
        uint256 amount
    )
        external requireEnoughFunds (amount)
        //recipient.call.gas(0).value(...)
    {
        // check
        require(msg.sender == tx.origin, "Contracts not allowed to call this function");
        //effect
        credit[msg.sender] = credit[msg.sender].sub(amount);
        //Interaction
        msg.sender.transfer(amount);
        emit FundsWithdrawed(msg.sender, amount);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        public
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external
                            payable
    {
        //fund();
    }


}

