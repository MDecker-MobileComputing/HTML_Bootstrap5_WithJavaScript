"use strict";


const PROXY_URL = "http://localhost:8080/erzeugeAntworten";  // Proxy URL for the API call to generate answer options

/** Random session ID (10 characters, hexadecimal) */
const SESSION_ID = Math.floor( Math.random() * 0x10000000000 )
                       .toString( 16 )
                       .padStart( 10, "0" );

let answerOptions = [];

let textAreaQuestion = null;
let buttonGenerate   = null;
let buttonClear      = null;
let alertDanger      = null;
let alertInfo        = null;


/**
 * Initializes the page after the DOM content has fully loaded.
 */
window.addEventListener( "load", function() {

    answerOptions = [
        document.getElementById( "answerOption1" ),
        document.getElementById( "answerOption2" ),
        document.getElementById( "answerOption3" ),
        document.getElementById( "answerOption4" )
    ];

    buttonGenerate   = document.getElementById( "buttonGenerate" );
    buttonClear      = document.getElementById( "buttonClear"    );
    textAreaQuestion = document.getElementById( "question"       );
    alertDanger      = document.getElementById( "alertDanger"    );
    alertInfo        = document.getElementById( "alertInfo"      );

    buttonGenerate.addEventListener( "click", onGenerateButtonPressed );

    buttonClear.addEventListener( "click", onClearButtonPressed );
} );


/**
 * Event handler for the "Generate" button click event.
 * Validates the question input and get answer options from AI via API call
 * to proxy.  
 */
async function onGenerateButtonPressed() {

    resetAlert();

    let question = textAreaQuestion.value.trim();

    if ( question.length === 0 ) {

        showAlert( "Please enter a question." );
        return;
    }

    const requestObject = {
        "frage"    : question,
        "sitzungID": SESSION_ID
    };

    const requestObjectStr = JSON.stringify( requestObject );

    try {

        const response =
            await fetch( PROXY_URL, {
                                        method: "POST",
                                        body  : requestObjectStr,
                                        headers: {
                                            "Content-Type": "application/json"
                                    }
                        } );

        if ( !response.ok ) {

            throw new Error( "Proxy returned HTTP status " + response.status );
        }

        // Expected format: { "richtigeAntwort": "...", "falscheAntworten": [ "...", "...", "..." ] }
        const responseObject = await response.json();

        const correctAnswer = responseObject.richtigeAntwort;
        const wrongAnswers  = responseObject.falscheAntworten;

        if ( typeof correctAnswer !== "string" || !Array.isArray( wrongAnswers ) ||
             wrongAnswers.length < answerOptions.length - 1 ) {

            throw new Error( "Unexpected response format: " + JSON.stringify( responseObject ) );
        }

        answerOptions[0].value = correctAnswer;

        for ( let i = 1; i < answerOptions.length; i++ ) {

            answerOptions[i].value = wrongAnswers[i - 1];
        }

        // info box about proxy is no longer needed when first successful response is received
        alertInfo.classList.add( "d-none" );
    }
    catch ( error ) {

        showAlert( "An error occurred while generating answer options." );
        console.error( error );
    }
}


/**
 * Event handler for the "Clear" button click event. 
 * Clears the question and answer option input fields.
 */
function onClearButtonPressed() {

    resetAlert();

    textAreaQuestion.value = "";

    for ( answerOption of answerOptions ) {

        answerOption.value = "";
    }
}


/**
 * Show error message in the alert box.
 * 
 * @param {string} message Error message to be displayed in the alert box. 
 */
function showAlert( message ) {

    alertDanger.textContent = message;
    alertDanger.classList.remove( "d-none" );
}


/**
 * Hide the alert box and clear its content.
 */
function resetAlert() {

    alertDanger.textContent = "";
    alertDanger.classList.add( "d-none" );
}