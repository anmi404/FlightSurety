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
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);

            contract.flights.forEach(flight => {
                displayList(flight, DOM.flightSelector)
            });    
        });
        
        //fund airline
        DOM.elid('fund-airline').addEventListener('click', async (e) => {
            let flight = DOM.elid('flight-number').value;
            e.preventDefault(); // OK
            // Write transaction
            await contract.fetchFlightStatus(flight, (error, result)  => {
                DOM.elid("flight-status").value = result.flight;
            });
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', async (e) => {
            let flight = DOM.elid('flight-number').value;
            e.preventDefault(); // OK
            // Write transaction
            await contract.fetchFlightStatus(flight, (error, result)  => {
                DOM.elid("flight-status").value = result.flight;
            });
        })

        DOM.elid('pay-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            e.preventDefault(); // OK

            // Write transaction
            contract.buyInsurance(flight, (error, result) => {
                display('Insurance paid', 'Success!', [ { label: 'Your Insurance number is ', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('claim-insurance').addEventListener('click', () => {
            let value = DOM.querySelector("#valueStep").value;

            // Write transaction
            contract.safeWithdraw(value, (error, result) => {
                display('Credit withdrawn', 'Success!');
            });
        })

      
    });
    

})();

function displayList(flight, parentEl) {
    console.log(flight);
    console.log(parentEl);
    let el = document.createElement("option");
    el.text = `${flight.flight} - ${new Date((flight.timestamp))}`;
    el.value = JSON.stringify(flight);
    parentEl.add(el);
}

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

