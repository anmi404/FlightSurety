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
    mapping (address => string) private registeredAirlineQueue;

    mapping(address => uint256) private credit;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
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
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address addr, string airline
                            )
                            external
                            returns(bool success, uint256 votes)
    {
        registeredAirlineQueue[addr] = airline;
        return (true, 256);
    }

    //Track everyone who paid the insurance
    mapping(bytes32 => address[]) private insuree; //error, byte32 not basic type!
   /**
    * @dev Buy insurance for a flight
    Returns an identification number
    *
    */   
    function buy
                            (
                                address airline, string flight, uint256 timestamp, uint32 amount
                            )
                            external
                            payable
                            requireEnoughFunds(amount)
                            //checkValue(insurancePrice, tx.origin)
                            returns (bytes memory)
    {
// Transfer money to fund
        bytes32 flightKey = keccak256(abi.encodePacked(airline, flight, timestamp));
        uint256 txId = insuree[flightKey].push(tx.origin);
        if (credit[msg.sender] == 0) { //force initialization
            credit[msg.sender] = 0;
        }

        return abi.encodePacked(flightKey, txId);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    bytes32 keyFlight,
                                    uint256 amount
                                )
                                external
    {
        address[] storage addr = insuree[keyFlight];
        for (uint i = 0; i < addr.length; i++) {
            credit[addr[i]].add(amount);
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
                            requireEnoughFunds(amount)
                            checkValue(amount, tx.origin)
    {
        //effect 
        tx.origin.transfer(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   

    function fund
                            (
                            )
                            public
                            payable
    {
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
        fund();
    }


}

