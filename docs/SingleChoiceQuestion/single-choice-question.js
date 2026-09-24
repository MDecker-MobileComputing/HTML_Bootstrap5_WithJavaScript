"use strict";

let selectedCity = null;

let checkAnswerButton = null;

let resultModal        = null;
let resultModalTitle   = null;
let resultModalMessage = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has loaded.
 */
window.addEventListener( "load", function () {

    checkAnswerButton = document.getElementById( "checkAnswerButton" );
    if ( checkAnswerButton ) { // != null && != undefined

        checkAnswerButton.addEventListener( "click", onCheckAnswerButton );

    } else {

        console.error( "Could not find the 'Check Answer' button!" );
    }


    // Get the selection element with a CSS selector instead of an ID; the first matching element is returned.
    selectedCity = document.querySelector( ".container-sm .form-select" );
    if ( !selectedCity ) {

        console.error( "Could not find the city selection element!" );
    }


    // Bootstrap provides its own class that can fetch a modal by its ID.
    resultModal = new bootstrap.Modal( "#resultModal", {} );
    if ( !resultModal ) {

        console.error( "Could not find the result modal element!" );
    }

    resultModalTitle = document.getElementById( "resultModalTitle" );
    if ( !resultModalTitle ) {

        console.error( "Could not find the title element for the result modal!" );
    }

    resultModalMessage = document.getElementById( "resultModalMessage" );
    if ( !resultModalMessage ) {

        console.error( "Could not find the message element for the result modal!" );
    }

    console.log( "Initialization complete." );
});


/**
 * Event handler for clicking the "Check Answer" button.
 */
function onCheckAnswerButton() {

    const cityValue = selectedCity.value;

    switch ( cityValue ) {

        case "none":

            resultModalTitle.innerText   = "Error";
            resultModalMessage.innerText = "Please select a city.";
            break;

        case "hamburg":

            resultModalTitle.innerText   = "Correct";
            resultModalMessage.innerText = "Hamburg is actually farther north than Amsterdam and London.";
            break;

        default:
            resultModalTitle.innerText   = "Incorrect";
            resultModalMessage.innerText = "Think again!";
            selectedCity.value           = "none";
    }

    resultModal.show();
}
