import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

 //   this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
//list airlines, 
//airline sends funds, 
//passenger buys flight insurance, 
//airline updates flight status, 
//passenger claims insurance payout. 


        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            //display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
            if (result) 
                DOM.elid("contract-operational").value = "operational";
            else
                DOM.elid("contract-operational").value = "not operational";

            contract.flights.forEach(flight => {
                displayList(flight, document.getElementById("flight-number").parentNode)
            });    
        });           
        
        //fund airline
        DOM.elid('fund-airline').addEventListener('click', async (e) => {
            let flight = DOM.elid('flight-number').value;
            let value = DOM.elid("valueStep").value;
            e.preventDefault(); // OK
            // Write transaction
            await contract.fundAirline(flight, value, (error, result)  => {
                display('Airline is funded', 'Success!', [ { value: result.airline} ]);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', async (e) => {
            let flight = DOM.elid('flight-number').value;
            e.preventDefault(); // OK
            // Write transaction
            await contract.fetchFlightStatus(flight, (error, result)  => {
                DOM.elid("flight-status").value = "timestamp " + result.timestamp;
                display('Oracles', 'Trigger oracles', [{
                    label: 'Fetch Flight Status',
                    error: error,
                    value: result.timestamp
                }]);
            });
        })

        DOM.elid('pay-insurance').addEventListener('click', (e) => {
            let flight = DOM.elid('flight-number').value;
            let value = DOM.elid("valueStep").value;
            e.preventDefault(); // OK

            // Write transaction
            contract.buyInsurance(flight, value, (error) => {
                DOM.elid("text-output").value = error;
            });
        })

        //only makes sense after the flight is delayed!
        // DOM.elid('claim-insurance').addEventListener('click', () => {
        //     let value = DOM.elid("valueStep").value;
        //     console.log("Value to withdraw", value);
            
        //     // Write transaction
        //      contract.safeWithdraw(value, (error, result) => {
        //          display('Credit withdrawn', 'Success!', [ { label: 'Your Withdrawal was sucessful ', error: error, value: result} ]);
        //      });
        // })

      
    });
    

})();

function displayList(flight, parentEl) {
    let el = document.createElement("option");
    el.text = `${flight.flight} - ${new Date((flight.timestamp))}`;
    el.value = JSON.stringify(flight);
    console.log(el.value);
    //parentEl.appendChild(el);
}

function display(title, description, results) {
    // let displayDiv = DOM.elid("display-wrapper");
    // let section = DOM.section();
    // section.appendChild(DOM.h2(title));
    // section.appendChild(DOM.h5(description));
    // results.map((result) => {
    //     let row = section.appendChild(DOM.div({className:'row'}));
    //     row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
    //     row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
    //     section.appendChild(row);
    // })
    // displayDiv.append(section);
    console.log(results);
    DOM.elid("text-output").value = title + "  " + description + "  " + results[0].value;


}

