"use strict";

/** Regular expression pattern for validating the API key. */
const API_KEY_REGEXP_PATTERN = /^[A-Za-z0-9_\.-]{30,128}$/;

const COOKIE_NAME_API_KEY          = "generateTitle_apiKey";
const COOKIE_NAME_SUGGESTION_COUNT = "generateTitle_suggestionCount";
const COOKIE_NAME_TEMPERATURE      = "generateTitle_temperature";
const COOKIE_NAME_MODEL            = "generateTitle_model";

let inputTitle  = null;
let textArea    = null;
let inputApiKey = null;

let buttonGenerateTitleSuggestion = null;
let buttonDelete                  = null;
let buttonCheckApiKey             = null;

let alertPanel = null;


/**
 * Initializes the page after the DOM content has fully loaded:
 * Sets up event listeners and restores settings from cookies.
 */
window.addEventListener( "load", function() {

    const rangeSuggestionCount = document.getElementById( "rangeSuggestionCount" );
    const rangeTemperature     = document.getElementById( "rangeTemperature"     );
    const selectGeminiModel    = document.getElementById( "selectGeminiModel"    );

    rangeSuggestionCount.addEventListener( "input" , onRangeSuggestionCountInput );
    rangeTemperature.addEventListener(     "input" , onRangeTemperatureInput     );
    selectGeminiModel.addEventListener(    "change", onGeminiModelChange         );

    inputTitle  = document.getElementById( "inputTitle"  );
    inputApiKey = document.getElementById( "inputApiKey" );
    textArea    = document.getElementById( "editor"      );
    alertPanel  = document.getElementById( "alertPanel"  );

    buttonGenerateTitleSuggestion = document.getElementById( "buttonGenerateTitleSuggestion" );
    buttonDelete                  = document.getElementById( "buttonDelete"                  );
    buttonCheckApiKey             = document.getElementById( "buttonCheckApiKey"             );

    buttonGenerateTitleSuggestion.addEventListener( "click", onButtonGenerateTitleSuggestion );
    buttonDelete.addEventListener                 ( "click", onButtonDelete                  );
    buttonCheckApiKey.addEventListener            ( "click", onButtonCheckApiKey             );

    restoreSettingsFromCookies();

    console.log( "Initialization complete." );
} );



/**
 * Updates the suggestion count label when its range input changes.
 */
function onRangeSuggestionCountInput( event ) {

    document.getElementById( "suggestionCountValue" ).textContent = event.currentTarget.value;

    setCookie( COOKIE_NAME_SUGGESTION_COUNT, event.currentTarget.value );
}


/**
 * Updates the temperature label when its range input changes.
 */
function onRangeTemperatureInput( event ) {

    const temperatureValue = Number( event.currentTarget.value ).toFixed( 1 ); // Round to one decimal place

    document.getElementById( "temperatureValue" ).textContent = temperatureValue;

    setCookie( COOKIE_NAME_TEMPERATURE, temperatureValue );
}


/**
 * Stores the selected Gemini model when the selector for the AI model changes.
 */
function onGeminiModelChange( event ) {

    setCookie( COOKIE_NAME_MODEL, event.currentTarget.value );
}


/**
 * Event handler function for the "Generate Title Suggestion" button.
 */
function onButtonGenerateTitleSuggestion() {

    resetAlert();

    const inputText = textArea.value.trim();

    if ( inputText.length === 0 ) {

        showAlert( "Please enter some text before generating a title suggestion.",
                   "warning" );
        return;
    }

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
 * Event handler function for the "Check API Key" button.
 */
function onButtonCheckApiKey() {

    resetAlert();

    const apiKey = inputApiKey.value.trim();

    if ( apiKey.length === 0 ) {

        showAlert( "Please enter your API key before checking it.", "danger" );
        return;
    }

    if ( !API_KEY_REGEXP_PATTERN.test( apiKey ) ) {

        showAlert( "The API key format is invalid. Please check your input.", "danger" );
        return;
    }

    setCookie( COOKIE_NAME_API_KEY, apiKey );

    showAlert( "API key was saved." );
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


/**
 * Sets a cookie with the specified key and value.
 * The cookie will be stored for a year.
 *
 * @param {string} cookieName  Cookie name
 *
 * @param {string} cookieValue Cookie value
 */
function setCookie( cookieName, cookieValue ) {

    const cookieKeyEncoded   = encodeURIComponent( cookieName  );
    const cookieValueEncoded = encodeURIComponent( cookieValue );

    document.cookie = cookieKeyEncoded + "=" + cookieValueEncoded +
                      "; max-age=31536000; path=/; SameSite=Strict";
    // 31536000 seconds = 1 year
    // Other values for SameSite: "Lax" or "None" (if using HTTPS)
}


/**
 * Gets the value of a cookie with the specified key.
 *
 * @param {string} cookieKey Cookie name
 *
 * @return {string|null} Cookie value or null if not found
 */
function getCookie( cookieName ) {

    const cookieNamedEncoded = encodeURIComponent( cookieName );
    const cookies            = document.cookie.split( ";" );

    for ( let i = 0; i < cookies.length; i++ ) {

        const cookie = cookies[i].trim();

        if ( cookie.startsWith( cookieNamedEncoded + "=" ) ) {

            return decodeURIComponent(
                        cookie.substring(
                            cookieNamedEncoded.length + 1
                        )
                   );
        }
    }

    return null;
}


/**
 * Restores the settings from cookies if they exist.
 */
function restoreSettingsFromCookies() {

    const apiKeyCookieValue = getCookie( COOKIE_NAME_API_KEY );
    if ( apiKeyCookieValue !== null ) {

        inputApiKey.value = apiKeyCookieValue;
        console.log( "Restored API key from cookie." );
    }

    const suggestionCountCookieValue = getCookie( COOKIE_NAME_SUGGESTION_COUNT );
    if ( suggestionCountCookieValue !== null ) {

        const rangeSuggestionCount = document.getElementById( "rangeSuggestionCount" );
        rangeSuggestionCount.value = suggestionCountCookieValue;
        document.getElementById( "suggestionCountValue" ).textContent = suggestionCountCookieValue;
        console.log( "Restored suggestion count from cookie." );
    }

    const temperatureCookieValue = getCookie( COOKIE_NAME_TEMPERATURE );
    if ( temperatureCookieValue !== null ) {

        const rangeTemperature = document.getElementById( "rangeTemperature" );
        rangeTemperature.value = temperatureCookieValue;
        document.getElementById( "temperatureValue" ).textContent = temperatureCookieValue;
        console.log( "Restored temperature from cookie." );
    }

    const modelCookieValue = getCookie( COOKIE_NAME_MODEL );
    if ( modelCookieValue !== null ) {

        const selectGeminiModel = document.getElementById( "selectGeminiModel" );
        selectGeminiModel.value = modelCookieValue;
        console.log( "Restored model from cookie." );
    }
}