"use strict";


/** Prompt with placeholders for the number of title suggestions and the text to summarize. */
const PROMPT_TEMPLATE =
          "Generate a single title for the following text "              +
          "without any further explanations or formatting. "             +
          "The title must be written in the same language as the text: " +
          "%TEXT_TO_SUMMARIZE%";


let inputTitle = null;
let textArea   = null;

let alertPanelLocalAiStatus   = null;
let alertPanelTitleGeneration = null;

let buttonSuggestTitle = null;
let buttonDelete       = null;

let spinnerSuggestTitle = null;
let labelSuggestTitle   = null;

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

    spinnerSuggestTitle = document.getElementById( "spinnerSuggestTitle" );
    labelSuggestTitle   = document.getElementById( "labelSuggestTitle"   );

    buttonSuggestTitle.addEventListener( "click", onButtonSuggestTitle );
    buttonDelete.addEventListener      ( "click", onButtonDelete       );

    const aiSupported = await initializeLocalAI();
    if ( aiSupported ) {

        buttonSuggestTitle.disabled = false;
        textArea.disabled           = false;
    }

    console.log( "Initialization complete." );
} );


/**
 * Checks if a local AI model is supported in the currenty browser environment.
 * So far local AI models are only supported by Chrome, see also
 * https://caniuse.com/wf-languagemodel 
 * (Opera is also listed as supported, but seems not to work in Opera 137 on Windows 11).
 * 
 * However, if the local computer has not enough resources, the local model 
 * may not be available even in a supported browser.
 * 
 * @returns `true` iff a local model is supported; if `true` is returned, the
 *          local model might have to be downloaded first.
 */
async function initializeLocalAI() {

    showAlertForAiStatus( "Checking if your browser supports the local AI model ...", 
                          "warning" );

    if ( 
          typeof globalThis.LanguageModel              === "undefined" ||        
          typeof globalThis.LanguageModel.availability !== "function"
        )
    {
        showAlertForAiStatus( "The LanguageModel API is not supported by this browser.", 
                              "danger" );
        return false;
    }

    let status = null;
    try {

        console.log( "Calling LanguageModel.availability() ..." );

        const timeoutPromise = 
                    new Promise( (_, reject) =>
                                 setTimeout( () => reject( 
                                        new Error( "availability() did not respond within 10 seconds." ) ),
                                 10_000 ) );

        status = await Promise.race( [ LanguageModel.availability(), timeoutPromise ] );

    } catch ( error ) {

        console.error( "Error while checking availability of local AI model: ", error );
        showAlertForAiStatus( "Could not determine status of local AI model: " + error.message, "danger" );
        return false;
    }

    console.log( "Model availability status: " + status );

    switch ( status ) {

        case "available":

            aiSession = await LanguageModel.create();

            showAlertForAiStatus( "Your browser supports the local AI model, it is ready for use.", 
                                  "success" );
            return true;
            

        case "downloadable":
        case "downloading":

            showAlertForAiStatus( "Your browser supports the local AI model, and it is currently being downloaded.", 
                                  "warning" );

            aiSession = await LanguageModel.create({ // creation of the session will trigger the download of the model

                monitor(m) {

                    m.addEventListener( "downloadprogress", (e) => {

                        const downloadPercentage = Math.round(e.loaded * 100);
                        showAlertForAiStatus( 
                            `Your browser supports the local AI model, and it is currently being downloaded (${downloadPercentage}%).`, 
                            "warning" );
                    });
                }
            });

            showAlertForAiStatus( "Your browser supports the local AI model, it is ready for use.",
                                  "success" );
            return true;


        case "unavailable": 
            showAlertForAiStatus( "Your browser supports the local AI model, but your computer does not have enough resources to run it.",
                                  "danger" );
            return false;   


        default:

            showAlertForAiStatus( "Unknown status for local AI model: " + status, "danger" );
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

        showAlertForTitleGeneration( "Please enter some text to generate a title.",
                                     "warning" );
        return;
    }

    buttonSuggestTitle.disabled = true;
    spinnerSuggestTitle.classList.remove( "d-none" );
    labelSuggestTitle.textContent = "Generating ...";
    inputTitle.value = "";

    const prompt = PROMPT_TEMPLATE.replace( "%TEXT_TO_SUMMARIZE%", textToSummarize );

    try {

        const startTime = performance.now();

        const title = await aiSession.prompt( prompt );

        const durationSeconds = ( performance.now() - startTime ) / 1000;

        inputTitle.value = title;

        showAlertForTitleGeneration( `Title generated in ${durationSeconds.toFixed(1)} seconds.`,
                                     "success" );

    } catch ( error ) { 

        console.error( "Error while generating title: ", error );
        showAlertForTitleGeneration( "Error while generating title: " + error.message, "danger" );

    } finally {

        spinnerSuggestTitle.classList.add( "d-none" );
        labelSuggestTitle.textContent = "Suggest Title";
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

    buttonSuggestTitle.disabled = false;
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

    alertPanelLocalAiStatus.classList.remove( "alert-success", "alert-danger", "alert-warning" );
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
