"use strict";


/** Prompt with placeholders for the number of title suggestions and the text to summarize. */
const PROMPT_TEMPLATE=
          `Generate a single title for the following text without any further explanations or formatting: %TEXT_TO_SUMMARIZE%`;

let inputTitle  = null;
let textArea    = null;

let alertPanelLocalAiStatus   = null;
let alertPanelTitleGeneration = null;

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
    
    alertPanelLocalAiStatus   = document.getElementById( "alertPanelLocalAiStatus"   );
    alertPanelTitleGeneration = document.getElementById( "alertPanelTitleGeneration" );

    buttonSuggestTitle = document.getElementById( "buttonSuggestTitle" );
    buttonDelete       = document.getElementById( "buttonDelete"       );

    buttonSuggestTitle.addEventListener( "click", onButtonSuggestTitle );
    buttonDelete.addEventListener      ( "click", onButtonDelete       );

    const aiSupported = await initializeLocalAI();
    if ( aiSupported ) {

        buttonSuggestTitle.disabled = false;
        textArea.disabled           = false;
        
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
async function initializeLocalAI() {

    // So far only Chrome and Opera support the LanguageModel API
    if ( 
          typeof globalThis.LanguageModel              === "undefined" ||        
          typeof globalThis.LanguageModel.availability !== "function"
        )
    {
        showAlertForAiStatus( "The LanguageModel API is not supported by this browser.", "danger" );
        return false;
    }

    const status = await LanguageModel.availability();

    console.log( "Model availability status: " + status );

    switch ( status ) {

        case "available":
            showAlertForAiStatus( "Your browser supports the local AI model, it is ready for use.", 
                                  "success" );
            return true;
            
        case "downloadable":
            showAlertForAiStatus( "Your browser supports the local AI model, but it needs to be downloaded first.", 
                                  "warning" );
            return true;

        case "downloading":
            showAlertForAiStatus( "Your browser supports the local AI model, and it is currently being downloaded.", 
                                  "warning" );
            return true;

        case "unavailable": 
            showAlert( "Your browser supports the local AI model, but your computer does not have enough resources to run it.",
                       "danger" );
            return false;   

        default:
            showAlert( "Unknown status for local AI model: " + status, "danger" );
    }

    return false;
}


/**
 * Event handler function for the "Suggest Title" button.
 */
async function onButtonSuggestTitle() {

    resetAlertForTitleGeneration();

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

    resetAlertForTitleGeneration();

    inputTitle.value = "";
    textArea.value   = "";

    buttonSuggestTitle.disabled = true;
}




/**
 * Displays an alert message about the local AI status.
 *
 * @param {string} message Text to be displayed
 *
 * @param {string} type    Type of alert: "success" (default value), "danger", "warning"
 */
function showAlertForAiStatus( message, type="success" ) {

    alertPanelLocalAiStatus.textContent = message;

    alertPanelLocalAiStatus.classList.add( "alert-" + type );
    alertPanelLocalAiStatus.classList.remove( "d-none" );
}


/**
 * Displays an alert message about the title generation.
 *
 * @param {string} message Text to be displayed
 * 
 * @param {string} type    Type of alert: "success" (default value), "danger", "warning"
 */
function showAlertForTitleGeneration( message, type="success" ) {

    alertPanelTitleGeneration.textContent = message;

    alertPanelTitleGeneration.classList.add( "alert-" + type );
    alertPanelTitleGeneration.classList.remove( "d-none" );
}


/**
 * Resets the alert message for the title generator: hides the alert panel and removes 
 * any previous alert type classes.
 */
function resetAlertForTitleGeneration() {

    alertPanelTitleGeneration.textContent = "";
    alertPanelTitleGeneration.classList.remove( "alert-success", "alert-danger", "alert-warning" );
    alertPanelTitleGeneration.classList.add( "d-none" );
}
