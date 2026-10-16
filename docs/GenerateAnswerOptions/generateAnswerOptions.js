"use strict";


const PROXY_URL = "http://localhost:8080/generateAnswers";  // Proxy URL for the API call to generate answer options

/** Random session ID (10 characters, hexadecimal), e.g., 17ae311e63  */
const SESSION_ID = Math.floor( Math.random() * 0x10000000000 )
                       .toString( 16 )
                       .padStart( 10, "0" );

let answerOptions     = [];
let copyAnswerButtons = [];

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
    copyAnswerButtons = document.querySelectorAll( "[data-copy-answer]" );

    buttonGenerate   = document.getElementById( "buttonGenerate" );
    buttonClear      = document.getElementById( "buttonClear"    );
    textAreaQuestion = document.getElementById( "question"       );
    alertDanger      = document.getElementById( "alertDanger"    );
    alertInfo        = document.getElementById( "alertInfo"      );

    buttonGenerate.addEventListener( "click", onGenerateButtonPressed );

    buttonClear.addEventListener( "click", onClearButtonPressed );

    for ( let i = 0; i < copyAnswerButtons.length; i++ ) {

        copyAnswerButtons[i].addEventListener( "click", function() {

            copyAnswerToClipboard( answerOptions[i].value );
        } );
    }

    // ENTER triggers generation
    textAreaQuestion.addEventListener( "keydown", onQuestionKeyDown );
} );


/**
 * Event handler for key presses in the question text area:
 * ENTER triggers the "Generate" button, Shift+ENTER still inserts a line break.
 *
 * @param {KeyboardEvent} event Keyboard event.
 */
function onQuestionKeyDown( event ) {

    if ( event.key === "Enter" && !event.shiftKey ) {

        event.preventDefault();

        if ( !buttonGenerate.disabled ) { buttonGenerate.click(); }
    }
}


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

    buttonGenerate.disabled = true;
    buttonClear.disabled    = true;

    const requestObject = {
                            "question" : question,
                            "sessionID": SESSION_ID
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

        if ( response.status === 429 ) { // Proxy server blocking requests due to rate limiting?

            showAlert( "Too many requests. Please wait 30 seconds and try again." );
            return;
        }

        if ( !response.ok ) {

            throw new Error( "Proxy returned HTTP status " + response.status );
        }

        // Expected format: { "correctAnswer": "...", "wrongAnswers": [ "...", "...", "..." ] }
        // Example: https://gist.github.com/MDecker-MobileComputing/50b83a4b9bf211b57b0a4e2ac6b9eace
        const responseObject = await response.json();

        const correctAnswer = responseObject.correctAnswer;
        const wrongAnswers  = responseObject.wrongAnswers;

        if ( typeof correctAnswer !== "string"              ||
             !Array.isArray( wrongAnswers )                 ||
             wrongAnswers.length < answerOptions.length - 1
           ) {

            throw new Error( "Unexpected response format: " +
                                    JSON.stringify( responseObject ) );
        }

        answerOptions[0].value = correctAnswer;

        for ( let i = 1; i < answerOptions.length; i++ ) {

            answerOptions[ i ].value = wrongAnswers[ i - 1 ];
        }
        updateCopyAnswerButtons();

        alertInfo.classList.add( "d-none" );
    }
    catch ( error ) {

        showAlert( "An error occurred while generating answer options." );
        console.error( error );
    }
    finally {

        // enable the two buttons
        buttonGenerate.disabled = false;
        buttonClear.disabled    = false;
    }
}


/**
 * Event handler for the "Clear" button click event.
 * Clears the question and answer option input fields.
 */
function onClearButtonPressed() {

    resetAlert();

    textAreaQuestion.value = "";

    for ( let answerOption of answerOptions ) {

        answerOption.value = "";
    }

    updateCopyAnswerButtons();
}


/**
 * Enables copy controls only when their associated answer option has content.
 */
function updateCopyAnswerButtons() {

    for ( let i = 0; i < copyAnswerButtons.length; i++ ) {

        copyAnswerButtons[i].disabled = answerOptions[i].value.length === 0;
    }
}


/**
 * Copies an answer option to the system clipboard.
 *
 * @param {string} answer Answer option to copy.
 */
async function copyAnswerToClipboard( answer ) {

    try {

        await navigator.clipboard.writeText( answer );
    }
    catch ( error ) {

        showAlert( "Could not copy the answer option to the clipboard." );
        console.error( error );
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