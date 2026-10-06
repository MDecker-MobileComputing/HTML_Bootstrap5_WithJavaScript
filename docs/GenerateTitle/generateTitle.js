"use strict";


let inputTitle = null;
let textArea   = null;

let buttonGenerateTitleSuggestion = null;
let buttonDelete                  = null;


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
        document.getElementById( "temperatureValue" ).textContent = Number( rangeTemperature.value ).toFixed( 1 );
    });

    inputTitle = document.getElementById( "inputTitle" );
    textArea   = document.getElementById( "editor"     );

    buttonGenerateTitleSuggestion = document.getElementById( "buttonGenerateTitleSuggestion" );
    buttonDelete                  = document.getElementById( "buttonDelete"                  );

    buttonGenerateTitleSuggestion.addEventListener( "click", onButtonGenerateTitleSuggestion );
    buttonDelete.addEventListener( "click", onButtonDelete );

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