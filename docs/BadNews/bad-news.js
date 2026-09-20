"use strict";

let newsList             = null;
let checkboxDomesticOnly = null;
let rangeCount           = null;
let countDisplay         = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 */
window.addEventListener( "load", function () {

    let loadButton = document.getElementById( "buttonLoadNews" );
    if ( loadButton ) {

        loadButton.addEventListener( "click", onLoadNewsButton );

    } else {

        console.error( "Button 'Load news' not found!" );
    }

    let resetButton = document.getElementById( "buttonReset" );
    if ( resetButton ) {

        resetButton.addEventListener( "click", onResetButton );

    } else {

        console.error( "Button 'Reset' not found!" );
    }

    newsList = document.getElementById( "listGroupNews" );
    if ( !newsList ) {

        console.error( "Root element for the news list not found!" );
    }

    checkboxDomesticOnly = document.getElementById( "checkboxDomesticOnly" );
    if ( !checkboxDomesticOnly ) {

        console.error( "Checkbox for 'Domestic only' not found!" );
    }

    rangeCount = document.getElementById( "rangeCount" );
    if ( rangeCount ) {

        rangeCount.addEventListener( "input", onCountChange );

    } else {

        console.error( "Range element 'Amount' not found!" );
    }

    countDisplay = document.getElementById( "countDisplay" );
    if ( !countDisplay ) {

        console.error( "Element for displaying the count not found!" );
    }

    console.log( "Initialization complete." );
});


/**
 * Event handler for changes to the range element for the number of headlines.
 */
function onCountChange() {

    const count = rangeCount.value;
    countDisplay.textContent = count;
}


/**
 * Event handler for the button resetting the app.
 */
function onResetButton() {

    // Delete potentially displayed news
    newsList.innerHTML = "";

    // Reset form fields
    rangeCount.value = 5;
    onCountChange();

    checkboxDomesticOnly.checked = false;
}


/**
 * Event handler for the button loading news from the web API.
 * API documentation: https://api.el-decker.de/badnews_doku.html
 */
async function onLoadNewsButton() {

    newsList.innerHTML = "";

    const count = rangeCount.value;
    const domesticOnly = checkboxDomesticOnly.checked;
    const url = `https://api.el-decker.de/badnews.php?anzahl=${count}&nur_inland=${domesticOnly}`;

    console.log( "Loading news from the web API ..." );

    try {

        const response = await fetch( url );
        if (!response.ok) {

            throw new Error( "Error loading news: " + response.status );
        }

        const responseJSON = await response.json();
        displayNews( responseJSON.items, domesticOnly );
    }
    catch (error) {

        console.error( "Error loading news: " + error );
    }
}


/**
 * This function displays the headlines in the list.
 */
function displayNews( newsItems, domesticOnly ) {

    for ( let i = 0; i < newsItems.length; i++ ) {

        const headlineText = newsItems[i].schlagzeile;
        const isDomestic   = newsItems[i].inland;

        const listItem = document.createElement( "li" );
        listItem.classList.add( "list-group-item",
                                "d-flex",
                                "justify-content-between",
                                "align-items-center"
                              );
        listItem.textContent = headlineText;

        if ( !domesticOnly ) {

            const badge = document.createElement( "span" );
            badge.classList.add( "badge", "ms-2" );
            if ( isDomestic ) {

                badge.classList.add( "bg-primary" ); // blue
                badge.textContent = "Domestic";

            } else {

                badge.classList.add( "bg-success" ); // green
                badge.textContent = "World";
            }

            listItem.appendChild( badge );
        }

        newsList.appendChild( listItem );
    }
}

