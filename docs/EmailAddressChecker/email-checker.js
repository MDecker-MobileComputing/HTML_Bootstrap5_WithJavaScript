"use strict";


let inputLocalPart      = null;
let inputDomain         = null;
let inputTopLevelDomain = null;

let alertSuccess = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 */
window.addEventListener("load", function () {

    let buttonCheck = document.getElementById( "buttonCheck" );
    if ( buttonCheck ) {

        buttonCheck.addEventListener( "click", onCheckButton );

    } else {

        console.error( "Button 'Check' not found!" );
    }

    let buttonReset = document.getElementById( "buttonReset" );
    if ( buttonReset ) {

        buttonReset.addEventListener( "click", onResetButton );

    } else {

        console.error( "Button 'Reset' not found!" );
    }

    inputLocalPart = document.getElementById( "inputLocalPart" );
    if ( !inputLocalPart ) {

        console.error( "Input field for the local part of the email address not found!" );
    }

    inputDomain = document.getElementById( "inputDomain" );
    if ( !inputDomain ) {

        console.error( "Input field for the domain part of the email address not found!" );
    }

    inputTopLevelDomain = document.getElementById( "inputTopLevelDomain" );
    if ( !inputTopLevelDomain ) {

        console.error( "Input field for the top-level domain part of the email address not found!" );
    }

    alertSuccess = document.getElementById( "alertSuccess" );
    if ( !alertSuccess ) {

        console.error( "Success alert not found!" );
    }

    console.log( "Initialization complete." );
});



/**
 * Event handler for the click on the "Check" button.
 */
function onCheckButton() {

    resetValidInvalid();

    const valid1 = checkLocalPart();
    const valid2 = checkDomainPart();
    const valid3 = checkTopLevelDomain();

    const validOverall = valid1 && valid2 && valid3;
    if ( validOverall ) {

        alertSuccess.classList.remove( "d-none" );
    }
}


/**
 * Check the local part (part 1) of the email address.
 *
 * @returns {boolean} true if the local part is valid, otherwise false.
 */
function checkLocalPart() {

    const regexLocalPart = /^[a-z0-9.]{1,64}$/;

    const localPart = inputLocalPart.value.toLowerCase();
    if ( regexLocalPart.test( localPart ) ) {

        inputLocalPart.classList.add( "is-valid" );
        return true;

    } else {

        inputLocalPart.classList.add( "is-invalid" );
        return false;
    }
}


/**
 * Check the domain part (part 2) of the email address.
 *
 * @return {boolean} true if the domain part is valid, otherwise false.
 */
function checkDomainPart() {

    const regexDomain = /^[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

    const domain = inputDomain.value.toLowerCase();
    if ( regexDomain.test( domain ) ) {

        inputDomain.classList.add( "is-valid" );
        return true;

    } else {

        inputDomain.classList.add( "is-invalid" );
        return false;
    }
}


/**
 * Check the top-level domain (part 3).
 *
 * @return {boolean} true if the top-level domain is valid, otherwise false.
 */
function checkTopLevelDomain() {

    // Max length according to: https://stackoverflow.com/questions/9238640/
    const regexTopLevelDomain = /^[a-z]{2,63}$/;

    const topLevelDomain = inputTopLevelDomain.value.toLowerCase();
    if ( regexTopLevelDomain.test( topLevelDomain ) ) {

        inputTopLevelDomain.classList.add( "is-valid" );
        return true;

    } else {

        inputTopLevelDomain.classList.add( "is-invalid" );
        return false;
    }
}


/**
 * Event handler for the click on the "Reset" button.
 */
function onResetButton() {

    inputLocalPart.value      = "";
    inputDomain.value         = "";
    inputTopLevelDomain.value = "";

    resetValidInvalid();
}


/**
 * Remove the .is-valid and .is-invalid CSS classes from the input fields.
 */
function resetValidInvalid() {

    alertSuccess.classList.add( "d-none" );

    inputLocalPart.classList.remove(      "is-valid", "is-invalid" );
    inputDomain.classList.remove(         "is-valid", "is-invalid" );
    inputTopLevelDomain.classList.remove( "is-valid", "is-invalid" );
}