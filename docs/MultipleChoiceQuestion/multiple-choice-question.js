"use strict";

let buttonCheckAnswer = null;

let modalResult        = null;
let modalResultTitle   = null;
let modalResultMessage = null;


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has loaded.
 */
window.addEventListener( "load", function () {

    buttonCheckAnswer = document.getElementById( "buttonAnswerCheck" );
    if ( buttonCheckAnswer ) { // != null && != undefined

        buttonCheckAnswer.addEventListener( "click", onCheckAnswerButtonClick );

    } else {

        console.error( "Could not find the 'Check answer' button!" );
    }


    // Bootstrap provides its own class to retrieve a modal by ID
    modalResult = new bootstrap.Modal( "#modalResult", {} );
    if ( !modalResult ) {

        console.error( "Could not find the result modal element!" );
    }

    modalResultTitle = document.getElementById( "modalResultTitle" );
    if ( !modalResultTitle ) {

        console.error( "Could not find the title element for the result modal!" );
    }

    modalResultMessage = document.getElementById( "modalResultMessage" );
    if ( !modalResultMessage ) {

        console.error( "Could not find the message element for the result modal!" );
    }

    const tooltipTriggerList = [].slice.call( document.querySelectorAll( "[data-bs-toggle=\"tooltip\"]") );
    tooltipTriggerList.map( function ( tooltipTriggerEl ) {

        return new bootstrap.Tooltip( tooltipTriggerEl );
    });

    console.log( "Initialization complete." );
});


/**
 * Event handler for clicking the "Check answer" button.
 */
function onCheckAnswerButtonClick() {

    const checkboxArray =  document.querySelectorAll( ".form-check-input" );            

    const answerArray = [];

    checkboxArray.forEach( function( checkbox ) {

        if ( checkbox.checked ) {

            answerArray.push( checkbox.id );
        }
    });

    console.log( "Selected checkboxes:", answerArray );

    if ( answerArray.length === 0 ) {

        modalResultTitle.innerText   = "Error";
        modalResultMessage.innerText = "Please select at least one answer.";

    } else if ( answerArray.length === 2                  &&
                answerArray.includes( "checkboxMercury" ) &&
                answerArray.includes( "checkboxVenus"   ) ) {

        modalResultTitle.innerText   = "Correct answer";
        modalResultMessage.innerText = "Congratulations!";

    } else {

        modalResultTitle.innerText   = "Wrong answer";
        modalResultMessage.innerText = "Think again!";

        // clear all checkboxes
        checkboxArray.forEach( function( checkbox ) {

            checkbox.checked = false;
        });
    }

    modalResult.show();
}
