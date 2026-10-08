"use strict";

/** Regular expression pattern for validating the API key. */
const API_KEY_REGEXP_PATTERN = /^[A-Za-z0-9_\.-]{30,128}$/;

const COOKIE_NAME_API_KEY          = "generateTitle_apiKey";
const COOKIE_NAME_SUGGESTION_COUNT = "generateTitle_suggestionCount";
const COOKIE_NAME_TEMPERATURE      = "generateTitle_temperature";
const COOKIE_NAME_MODEL            = "generateTitle_model";

/** Base URL for the Gemini when OpenAI API format is used. */
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/** Prompt with placeholders for the number of title suggestions and the text to summarize. */
const GEMINI_PROMPT_TEMPLATE=
          `Generate exactly %NUMBER_TITLE_SUGGESTIONS% title suggestions for the following text.
           The titles should be factual and matter-of-fact, without sensational or promotional language.
           Write all titles in the same language as the input text.
           Return the result as a valid JSON array of strings, with one title per array element.
           Example: ["Title 1", "Title 2", "Title 3"]
           Output only the JSON array. Do not include Markdown, comments, or explanatory text.
           Ensure the JSON is valid and contains exactly %NUMBER_TITLE_SUGGESTIONS% titles.
           Text: %TEXT_TO_SUMMARIZE%`;

let inputTitle  = null;
let textArea    = null;
let inputApiKey = null;

let rangeSuggestionCount = null;
let rangeTemperature     = null;
let selectGeminiModel    = null;

let buttonSuggestTitle = null;
let buttonDelete       = null;
let buttonCheckApiKey  = null;

let alertPanel               = null;
let spanSuggestionCountValue = null;
let spanTemperatureValue     = null;
let badgeSuggestionCount     = null;


/** Array to hold the generated title suggestions (cache for prefetched title suggestions). */
const titleSuggestionsArray = [];


/**
 * Initializes the page after the DOM content has fully loaded:
 * Sets up event listeners and restores settings from cookies.
 */
window.addEventListener( "load", function() {

    rangeSuggestionCount = document.getElementById( "rangeSuggestionCount" );
    rangeTemperature     = document.getElementById( "rangeTemperature"     );
    selectGeminiModel    = document.getElementById( "selectGeminiModel"    );

    rangeSuggestionCount.addEventListener( "input" , onRangeSuggestionCountInput );
    rangeTemperature.addEventListener(     "input" , onRangeTemperatureInput     );
    selectGeminiModel.addEventListener(    "change", onGeminiModelChange         );

    inputTitle  = document.getElementById( "inputTitle"  );
    inputApiKey = document.getElementById( "inputApiKey" );
    textArea    = document.getElementById( "editor"      );
    alertPanel  = document.getElementById( "alertPanel"  );

    spanSuggestionCountValue = document.getElementById( "suggestionCountValue" );
    spanTemperatureValue     = document.getElementById( "temperatureValue"     );

    buttonSuggestTitle = document.getElementById( "buttonSuggestTitle" );
    buttonDelete       = document.getElementById( "buttonDelete"       );
    buttonCheckApiKey  = document.getElementById( "buttonCheckApiKey"  );

    badgeSuggestionCount = document.getElementById( "badgeSuggestionCount" );
    badgeSuggestionCount.textContent = "0";

    buttonSuggestTitle.addEventListener( "click", onButtonSuggestTitle );
    buttonDelete.addEventListener      ( "click", onButtonDelete       );
    buttonCheckApiKey.addEventListener ( "click", onButtonCheckApiKey  );

    restoreSettingsFromCookies();

    console.log( "Initialization complete." );
} );


/**
 * Updates the suggestion count label when its range input changes.
 */
function onRangeSuggestionCountInput( event ) {

    const newValue = event.currentTarget.value;

    spanSuggestionCountValue.textContent = newValue;

    setCookie( COOKIE_NAME_SUGGESTION_COUNT, newValue );
}


/**
 * Updates the temperature label when its range input changes.
 */
function onRangeTemperatureInput( event ) {

    const newValue = event.currentTarget.value;

    const temperatureValue = Number( newValue ).toFixed( 1 ); // Round to one decimal place

    spanTemperatureValue.textContent = temperatureValue;

    setCookie( COOKIE_NAME_TEMPERATURE, temperatureValue );
}


/**
 * Stores the selected Gemini model when the selector for the AI model changes.
 */
function onGeminiModelChange( event ) {

    const newValue = event.currentTarget.value;

    setCookie( COOKIE_NAME_MODEL, newValue );
}


/**
 * Adds title suggestions to the queue.
 *
 * @param {string[]} titleSuggestionArrays - An array of title suggestions to add to the queue.
 */
function titleQueueEnqueue( titleSuggestionArrays ) {

    titleSuggestionsArray.push( ...titleSuggestionArrays );
    updateBadgeSuggestionCount();
}


/**
 * Removes a title suggestion from the queue.
 *
 * @returns {string|null} The removed title suggestion, or null if the queue is empty.
 */
function titleQueueDequeue() {

    if ( titleSuggestionsArray.length > 0 ) {

        const titleSuggestion = titleSuggestionsArray.shift();
        updateBadgeSuggestionCount();
        return titleSuggestion;

    } else {

        return null;
    }
}


/**
 * Clears all title suggestions from the queue.
 */
function titleQueueClear() {

    titleSuggestionsArray.length = 0;
    updateBadgeSuggestionCount();
}


/**
 * Updates the badge that displays the count of title suggestions in the queue.
 */
function updateBadgeSuggestionCount() {

    const count = titleSuggestionsArray.length;
    badgeSuggestionCount.textContent = count.toString();
}


/**
 * Event handler function for the "Suggest Title" button.
 */
async function onButtonSuggestTitle() {

    resetAlert();

    const inputText = textArea.value.trim();

    if ( inputText.length === 0 ) {

        showAlert( "Please enter some text before requesting a title suggestion.",
                   "warning" );
        return;
    }

    const apiKey = getCookie( COOKIE_NAME_API_KEY );
    if ( ! apiKey ) {

        showAlert( "API key is missing. Please enter your API key in the settings.", "danger" );
        return;
    }

    const titleFromQueue = titleQueueDequeue();
    if ( titleFromQueue ) {

        inputTitle.value = titleFromQueue;
        return;
    }

    console.log( "Queue empty, requesting title suggestions from Gemini..." );

    buttonSuggestTitle.disabled = true;
    buttonDelete.disabled       = true;
    textArea.disabled           = true;

    try {

        const titleSuggestionsArray = await fetchTitleSuggestionsFromGemini( inputText );
        if ( titleSuggestionsArray && titleSuggestionsArray.length > 0 ) {

            titleQueueEnqueue( titleSuggestionsArray );

            const firstTitleSuggestion = titleQueueDequeue();
            inputTitle.value = firstTitleSuggestion;

        } else {

            showAlert( "No title suggestions were generated. Please try again.", "warning" );
        }

    } catch ( error ) {

        console.error( "Error generating title suggestions:", error );
        showAlert( "An error occurred while generating title suggestions.", "danger" );

    } finally {

        buttonSuggestTitle.disabled = false;
        buttonDelete.disabled       = false;
        textArea.disabled           = false;
    }
}


/**
 * Event handler function for the "Delete Title and Text" button.
 */
function onButtonDelete() {

    resetAlert();
    titleQueueClear();

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

        rangeSuggestionCount.value           = suggestionCountCookieValue;
        spanSuggestionCountValue.textContent = suggestionCountCookieValue;
        console.log( "Restored suggestion count from cookie." );
    }

    const temperatureCookieValue = getCookie( COOKIE_NAME_TEMPERATURE );
    if ( temperatureCookieValue !== null ) {

        rangeTemperature.value           = temperatureCookieValue;
        spanTemperatureValue.textContent = temperatureCookieValue;
        console.log( "Restored temperature from cookie." );
    }

    const modelCookieValue = getCookie( COOKIE_NAME_MODEL );
    if ( modelCookieValue !== null ) {

        selectGeminiModel.value = modelCookieValue;
        console.log( "Restored model from cookie." );
    }
}


/**
 * Fetch title suggestions for the given input text.
 *
 * @param {String} inputText Text for which some title suggestions are to be generated
 *
 * @return {Promise<string[]>} A promise that resolves to the generated title suggestions
 */
async function fetchTitleSuggestionsFromGemini( inputText ) {

    const apiKey = getCookie( COOKIE_NAME_API_KEY );
    if ( ! apiKey ) {

        showAlert( "API key is missing. Please enter your API key in the settings.", "danger" );
        return [];
    }

    let suggestionCount = rangeSuggestionCount.value;
    if ( ! suggestionCount ) { suggestionCount = 5; } // Default to 5 suggestions if not set

    const prompt =
            GEMINI_PROMPT_TEMPLATE.replace( "%NUMBER_TITLE_SUGGESTIONS%", suggestionCount )
                                  .replace( "%TEXT_TO_SUMMARIZE%"       , inputText       );

    // Use the generated prompt to call the Gemini API and get title suggestions.

    const requestObject = {
                             "model"  : selectGeminiModel.value,
                             "messages": [
                                 {
                                     "role"   : "user",
                                     "content": prompt
                                 }
                             ]
                          };

    const requestObjectString = JSON.stringify( requestObject );

    try {

        const response = await fetch( GEMINI_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: requestObjectString
        } );

        if ( !response.ok ) {

            throw new Error( `HTTP error! status: ${response.status}` );
        }

        const data = await response.json();

        // Extract the content from the response
        const content = data.choices[0].message.content;

        // Parse the content as JSON to get the array of title suggestions
        const titleSuggestionsArray = JSON.parse( content );
        return titleSuggestionsArray;
    }
    catch ( error ) {

        console.error( "Error generating title suggestions:", error );
        showAlert( "An error occurred while generating title suggestions. Please try again.", "danger" );
    }
}