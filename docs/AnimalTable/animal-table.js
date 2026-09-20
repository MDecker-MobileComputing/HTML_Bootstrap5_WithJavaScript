"use strict";


let animalTable = null;

let herbivoreRows = null;
let petRows       = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 */
window.addEventListener( "load", function () {

    const radioButtonsArray = document.querySelectorAll( "input[name='radioGroup']" );
    radioButtonsArray.forEach( radioButton => {

        radioButton.addEventListener( "change", onRadioButtonChange );
    });

    animalTable = document.querySelector( ".table" );
    if ( !animalTable ) {

        console.error( "Could not find the table!" );
    }

    herbivoreRows = document.querySelectorAll( ".herbivore" );
    if ( herbivoreRows ) {

        console.log( `Herbivore count: ${herbivoreRows.length}` );

    } else {

        console.error( "Could not find the table rows with herbivores!" );
    }


    petRows = document.querySelectorAll( ".pet" );
    if ( petRows ) {

        console.log( `Pet count: ${petRows.length}` );

    } else {

        console.error( "Could not find the table rows with pets!" );
    }


    console.log( "Initialization complete." );
});


/**
 * Event handler function invoked when another radio button is selected.
 */
function onRadioButtonChange(event) {

    const selectedRadioButtonValue = event.target.value;

    console.log( "Selected radio button:", selectedRadioButtonValue );

    resetTableHighlight();

    switch ( selectedRadioButtonValue ) {

        case "herbivores":
            herbivoreRows.forEach( row => {
                row.classList.add( "table-primary" );
            });
        break;

        case "pets":
            petRows.forEach( row => {
                row.classList.add( "table-info" );
            });
        break;

        case "zebra":
            animalTable.classList.add( "table-striped" );
            break;

        default:
            console.error(
                `Internal error: Unexpected radio button value: "${selectedRadioButtonValue}"`
            );
    }
}


/**
 * Reset function that clears table highlighting.
 */
function resetTableHighlight() {

    animalTable.classList.remove( "table-striped" );

    herbivoreRows.forEach( row => {
        row.classList.remove( "table-primary" );
    });

    petRows.forEach( row => {
        row.classList.remove( "table-info" );
    });

}