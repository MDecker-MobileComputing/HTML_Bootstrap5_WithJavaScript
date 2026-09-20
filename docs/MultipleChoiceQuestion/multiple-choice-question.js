"use strict";

let buttonAntwortPruefen = null;

let modalErgebnis          = null;
let modalErgebnisTitel     = null;
let modalErgebnisNachricht = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has loaded.
 */
window.addEventListener( "load", function () {

    buttonAntwortPruefen = document.getElementById( "buttonAntwortPruefen" );
    if ( buttonAntwortPruefen ) { // != null && != undefined

        buttonAntwortPruefen.addEventListener( "click", onButtonAntwortPruefen );

    } else {

        console.error( "Could not find the 'Check answer' button!" );
    }


    // Bootstrap provides its own class to retrieve a modal by ID
    modalErgebnis = new bootstrap.Modal( "#modalErgebnis", {} );
    if ( !modalErgebnis ) {

        console.error( "Could not find the result modal element!" );
    }

    modalErgebnisTitel = document.getElementById( "modalErgebnisTitel" );
    if ( !modalErgebnisTitel ) {

        console.error( "Could not find the title element for the result modal!" );
    }

    modalErgebnisNachricht = document.getElementById( "modalErgebnisNachricht" );
    if ( !modalErgebnisNachricht ) {

        console.error( "Could not find the message element for the result modal!" );
    }

    const tooltipTriggerList = [].slice.call( document.querySelectorAll( "[data-bs-toggle=\"tooltip\"]") );
    tooltipTriggerList.map( function ( tooltipTriggerEl ) {

        return new bootstrap.Tooltip( tooltipTriggerEl );
    });

    console.log( "Initialization complete." );
});


/**
 * Event handler for clicking the "Check answer" button.
 */
function onButtonAntwortPruefen() {

    const antwortArray = [];

    const alleCheckboxen = document.querySelectorAll( ".form-check-input" );
    alleCheckboxen.forEach( function( checkbox ) {

        if ( checkbox.checked ) {

            antwortArray.push( checkbox.id );
        }
    });
    console.log( "Ausgewählte Checkboxen:", antwortArray );

    if ( antwortArray.length === 0 ) {

        modalErgebnisTitel.innerText     = "Error";
        modalErgebnisNachricht.innerText = "Please select at least one answer.";

    } else if ( antwortArray.length === 2                  &&
                antwortArray.includes( "checkboxMercury" ) &&
                antwortArray.includes( "checkboxVenus"   ) ) {

        modalErgebnisTitel.innerText     = "Correct answer";
        modalErgebnisNachricht.innerText = "Congratulations!";

    } else {

        modalErgebnisTitel.innerText     = "Wrong answer";
        modalErgebnisNachricht.innerText = "Think again!";

        // clear all checkboxes
        alleCheckboxen.forEach( function( checkbox ) {

            checkbox.checked = false;
        });
    }

    modalErgebnis.show();
}
