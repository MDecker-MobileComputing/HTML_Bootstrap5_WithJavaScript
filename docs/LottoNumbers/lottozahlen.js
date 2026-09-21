"use strict";


/**
 * An object of this class represents a number pair consisting of a lotto number
 * and a random number. The random number is generated when the object is created.
 * The number pairs are sorted by the random number.
 */
class NumberPair {

    /**
     * Create a lotto number together with a random number.
     *
     * @param {*} number Lotto number between 1 and 49
     */
    constructor( number ) {

        this._number       = number;
        this._randomNumber = Math.random();
    }

    get number() { return this._number; }

    get randomNumber() { return this._randomNumber; }
}


/** <input> element for entering the number of lotto numbers to generate. */
let inputCount = null;

/** Button used to delete the generated lotto numbers. */
let buttonClear = null;

/* <div> element to which the <input> elements with the lotto numbers are added. */
let resultContainer = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 */
window.addEventListener( "load", function () {

    inputCount = document.getElementById( "inputCount" );
    if ( !inputCount ) {

        console.error( "Could not find the input field for the count!" );
    }

    let drawButton = document.getElementById( "buttonDraw" );
    if ( drawButton ) {

        drawButton.addEventListener( "click", onDrawButton );

    } else {

        console.error( "Button 'Go' not found!" );
    }

    buttonClear = document.getElementById( "buttonClear" );
    if ( buttonClear ) {

        buttonClear.addEventListener( "click", onClearButton );

    } else {

        console.error( "Button 'Clear' not found!" );
    }

    resultContainer = document.getElementById( "resultContainer" );
    if ( !resultContainer ) {

        console.error( "Could not find the 'div' element for the result display!" );
    }

    console.log( "Initialization complete." );
});


/**
 * Event handler for the click on the "Clear" button to generate the lotto numbers.
 */
function onClearButton() {

    resultContainer.innerHTML = "";

    buttonClear.classList.add( "d-none" ); // .d-none: element is hidden (display: none)
}


/**
 * Event handler for the click on the "Go" button to generate the lotto numbers.
 *
 * The lotto numbers are displayed in readonly <input> elements because when copying
 * and pasting, one might otherwise accidentally copy beyond the edge.
 */
function onDrawButton() {

    onClearButton();

    const count = inputCount.value;

    for ( let i = 1; i <= count; i++ ) {

        const resultString = generateLottoNumbers();

        const inputElement = document.createElement( "input" );

        inputElement.value    = " " + resultString;
        inputElement.readOnly = true;
        inputElement.disabled = true;
        inputElement.type     = "text";

        inputElement.classList.add( "form-control" );
        inputElement.classList.add( "mb-2"         );
        inputElement.classList.add( "col-md-3"     );

        resultContainer.appendChild( inputElement );
    }

    buttonClear.classList.remove( "d-none" );
}


/**
 * Function returns a string with a random tip for Lotto 6 out of 49.
 * The numbers are sorted in ascending order.
 *
 * @returns {string} String with 6 numbers separated by commas.
 *                   Example: "3, 7, 12, 19, 23, 49"
 */
function generateLottoNumbers() {

    const numberPairArray = [];

    for ( let i = 1; i <= 49; i++ ) {

        let numberPair = new NumberPair( i );
        numberPairArray.push( numberPair );
    }

    // Sort elements in numberPairArray by random number
    numberPairArray.sort( (a, b) => a.randomNumber - b.randomNumber );

    // Take the first 6 numbers
    const resultArray = [];
    for ( let i = 0; i < 6; i++ ) {

        resultArray.push( numberPairArray[i].number );
    }

    resultArray.sort( (a, b) => a - b );

    const resultString = resultArray.join( ", " );
    return resultString;
}
