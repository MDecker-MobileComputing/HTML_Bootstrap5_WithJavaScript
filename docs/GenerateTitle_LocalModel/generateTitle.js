"use strict";


/** Prompt with placeholders for the number of title suggestions and the text to summarize. */
const PROMPT_TEMPLATE=
          `Generate a single title for the following text without any further explanations or formatting: %TEXT_TO_SUMMARIZE%`;

let inputTitle  = null;
let textArea    = null;
let alertPanel  = null;

let buttonSuggestTitle = null;
let buttonDelete       = null;

let aiSession = null;


/**
 * Initializes the page after the DOM content has fully loaded:
 * Sets up event listeners.
 */
window.addEventListener( "load", async function() {

    inputTitle  = document.getElementById( "inputTitle" );
    textArea    = document.getElementById( "editor"     );
    alertPanel  = document.getElementById( "alertPanel" );

    buttonSuggestTitle = document.getElementById( "buttonSuggestTitle" );
    buttonDelete       = document.getElementById( "buttonDelete"       );

    buttonSuggestTitle.addEventListener( "click", onButtonSuggestTitle );
    buttonDelete.addEventListener      ( "click", onButtonDelete       );

    const modelSupported = await isLocalAiModelSupported();
    if ( modelSupported ) {

        buttonSuggestTitle.disabled = false;
        aiSession = await LanguageModel.create();
    }

    console.log( "Initialization complete." );
} );


/**
 * Checks if a local AI model is supported in the currenty browser environment.
 * So far local AI models are only supported by Chrome and Opera, see also
 * https://caniuse.com/wf-languagemodel 
 * 
 * However, if the local computer has not enough resources, the local model 
 * may not be available even in a supported browser.
 * 
 * @returns true iff a local model is supported; if `true` is returned, the
 *          local model might have to be downloaded first.
 */
async function isLocalAiModelSupported() {

    // So far only Chrome and Opera support the LanguageModel API
    if ( 
          typeof globalThis.LanguageModel              === "undefined" ||        
          typeof globalThis.LanguageModel.availability !== "function"
        )
    {
        showAlert( "The LanguageModel API is not supported by this browser.", "danger" );
        return false;
    }

    const status = await LanguageModel.availability();

    console.log( "Model availability status: " + status );

    switch ( status ) {

        case "available":
            return true;
            
        case "downloadable":
            showAlert( "The model will be downloaded at first use.", "warning" );
            return true;

        case "downloading":
            showAlert( "The model is currently being downloaded. Please wait.", "warning" );
            return true;

        case "unavailable": 
            showAlert( "The local model is not available in this browser or on this device.", 
                       "danger" );
            return false;   

        default:
            showAlert( "Unknown model status: " + status, "danger" );
    }

    return false;
}


/**
 * Event handler function for the "Suggest Title" button.
 */
async function onButtonSuggestTitle() {

    resetAlert();

    const textToSummarize = textArea.value.trim();

    if ( textToSummarize.length === 0 ) {

        showAlert( "Please enter some text to generate a title.",
                   "warning" );
        return;
    }

    buttonSuggestTitle.disabled = true;
    inputTitle.value = "";

    const prompt = PROMPT_TEMPLATE.replace( "%TEXT_TO_SUMMARIZE%", textToSummarize );

    try {

        const title = await aiSession.prompt( prompt );

        inputTitle.value = title;

    } catch ( error ) { 

        console.error( "Error while generating title: ", error );
        showAlert( "Error while generating title: " + error.message, "danger" );

    } finally {

        buttonSuggestTitle.disabled = false;
    }
}


/**
 * Event handler function for the "Delete Title and Text" button.
 */
function onButtonDelete() {

    resetAlert();

    inputTitle.value = "";
    textArea.value   = "";

    buttonSuggestTitle.disabled = true;
}




/**
 * Displays an alert message in the settings section with the specified message and type.
 *
 * @param {string} message Text to be displayed
 *
 * @param {string} type    Type of alert: "success" (default value), "danger", "warning"
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
