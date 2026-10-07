"use strict";

/** Regular expression pattern for validating the API key. */
const API_KEY_REGEXP_PATTERN = /^[A-Za-z0-9_\.-]{30,128}$/;

let inputTitle  = null;
let textArea    = null;
let inputApiKey = null;

let buttonGenerateTitleSuggestion = null;
let buttonDelete                  = null;
let buttonCheckApiKey             = null;

let alertMessageSettings = null;

/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 */
window.addEventListener( "load", function () {

    const rangeSuggestionCount = document.getElementById( "rangeSuggestionCount" );
    const rangeTemperature     = document.getElementById( "rangeTemperature" );

    rangeSuggestionCount.addEventListener( "input", function () {
        document.getElementById( "suggestionCountValue" ).textContent = rangeSuggestionCount.value;
    });

    rangeTemperature.addEventListener( "input", function () {
        document.getElementById( "temperatureValue" ).textContent =
                                Number( rangeTemperature.value ).toFixed( 1 );
    });

    inputTitle  = document.getElementById( "inputTitle"  );
    inputApiKey = document.getElementById( "inputApiKey" );
    textArea    = document.getElementById( "editor"      );

    buttonGenerateTitleSuggestion = document.getElementById( "buttonGenerateTitleSuggestion" );
    buttonDelete                  = document.getElementById( "buttonDelete"                  );
    buttonCheckApiKey             = document.getElementById( "buttonCheckApiKey"             );

    alertMessageSettings = document.getElementById( "alertMessageSettings" );

    buttonGenerateTitleSuggestion.addEventListener( "click", onButtonGenerateTitleSuggestion );
    buttonDelete.addEventListener( "click", onButtonDelete );
    buttonCheckApiKey.addEventListener( "click", onButtonCheckApiKey );

    console.log( "Initialization complete." );
});


/**
 * Event handler function for the "Generate Title Suggestion" button.
 */
function onButtonGenerateTitleSuggestion() {

    const inputText = textArea.value.trim();

    if ( inputText.length === 0 ) {

        alert( "Please enter some text before generating a title suggestion." );
        return;
    }

}


/**
 * Event handler function for the "Delete Title and Text" button.
 */
function onButtonDelete() {

    inputTitle.value = "";
    textArea.value   = "";
}



/**
 * Event handler function for the "Check API Key" button.
 */
function onButtonCheckApiKey() {

    hideAlertSettings();

    const apiKey = inputApiKey.value.trim();

    if ( apiKey.length === 0 ) {

        showAlertSettings( "Please enter your API key before checking it.", "danger" );
        return;
    }

    if ( !API_KEY_REGEXP_PATTERN.test( apiKey ) ) {

        showAlertSettings( "The API key format is invalid. Please check your input.", "danger" );
        return;
    }


    showAlertSettings( "The API key format appears to be valid.", "success" );
}


/**
 * Displays an alert message in the settings section with the specified message and type.
 *
 * @param {string} message Text to be displayed
 * @param {string} type    Type of alert: "success" or "danger" or "warning"
 */
function showAlertSettings( message, type ) {

    alertMessageSettings.textContent = message;

    alertMessageSettings.classList.add( "alert-" + type );
    alertMessageSettings.classList.remove( "d-none" );
}


/**
 * Hides the alert message in the settings section.
 */
function hideAlertSettings() {

    alertMessageSettings.textContent = "";
    alertMessageSettings.classList.remove( "alert-success", "alert-danger" );
    alertMessageSettings.classList.add( "d-none" );
}