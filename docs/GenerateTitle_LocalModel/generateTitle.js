"use strict";


/** Prompt with placeholders for the number of title suggestions and the text to summarize. */
const PROMPT_TEMPLATE=
          `Erzeuge mir einen einzigen Titel für den folgenden Text ohne weitere Erklärungen oder Formatierungen: %TEXT_TO_SUMMARIZE%`;

let inputTitle  = null;
let textArea    = null;
let alertPanel  = null;

let buttonSuggestTitle = null;
let buttonDelete       = null;


/**
 * Initializes the page after the DOM content has fully loaded:
 * Sets up event listeners.
 */
window.addEventListener( "load", function() {

    inputTitle  = document.getElementById( "inputTitle"  );
    textArea    = document.getElementById( "editor"      );
    alertPanel  = document.getElementById( "alertPanel"  );

    buttonSuggestTitle = document.getElementById( "buttonSuggestTitle" );
    buttonDelete       = document.getElementById( "buttonDelete"       );

    buttonSuggestTitle.addEventListener( "click", onButtonSuggestTitle );
    buttonDelete.addEventListener      ( "click", onButtonDelete       );

    console.log( "Initialization complete." );
} );


/**
 * Event handler function for the "Suggest Title" button.
 */
async function onButtonSuggestTitle() {

    resetAlert();

    const textToSummarize = textArea.value.trim();

    if ( textToSummarize.length === 0 ) {

        showAlert( "Bitte geben Sie einen Text ein, um einen Titel zu generieren.",
                   "warning" );
        return;
    }

    inputTitle.value = "";

    // TODO ...
}


/**
 * Event handler function for the "Delete Title and Text" button.
 */
function onButtonDelete() {

    resetAlert();

    inputTitle.value = "";
    textArea.value   = "";
}




/**
 * Displays an alert message in the settings section with the specified message and type.
 *
 * @param {string} message Text to be displayed
 *
 * @param {string} type    Type of alert: "success" (default value) or "danger" or "warning"
 */
function showAlert( message, type="success" ) {

    alertPanel.textContent = message;

    alertPanel.classList.add( "alert-" + type );
    alertPanel.classList.remove( "d-none" );
}


/**
 * Hides the alert message and resets the alert panel to its default state.
 */
function resetAlert() {

    alertPanel.textContent = "";
    alertPanel.classList.remove( "alert-success", "alert-danger", "alert-warning" );
    alertPanel.classList.add( "d-none" );
}
