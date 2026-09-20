"use strict";


/** Reference to <canvas> element. */
let drawingSurface = null;

/** Reference to the 2D drawing context for the <canvas> element. */
let drawingContext = null;

let drawingSurfaceWidth = -1;
let drawingSurfaceHeight = -1;

/** Reference to the <input> element for the "Fill" switch. */
let fillToggle = null;

/** Reference to the chart created with Chart.js */
let chartJsDiagram = null;


/**
 * Options object for Chart.js charts.
 *
 * The options responsive=false and maintainAspectRatio=false prevent the chart
 * from resizing itself to fit the canvas element.
 */
const chartJsOptions = {
                            responsive: false,
                            maintainAspectRatio: false,
                            scales: {
                                y: { beginAtZero: true }
                            }
                        };


/**
 * This function is called when the document including all
 * resources (e.g. images or stylesheets) has finished loading.
 *
 * References to the needed DOM elements are retrieved and the event handler
 * functions are registered.
 */
window.addEventListener( "load", function() {

    drawingSurface = document.getElementById( "drawingSurface" );
    if ( !drawingSurface ) {

        console.error( "Canvas element not found." );

    } else {

        drawingContext = drawingSurface.getContext( "2d" );
        if ( !drawingContext ) {

            console.error( "2D drawing context could not be retrieved." );
        }

        setCanvasSize();
    }


    fillToggle = document.getElementById( "fillToggle" );
    if ( !fillToggle ) {

        console.error( "Toggle 'Fill' not found." );
    }

    registerClickHandlerForShape( "diagonals", drawDiagonals   );
    registerClickHandlerForShape( "triangle" , drawTriangle    );
    registerClickHandlerForShape( "rectangle", drawRectangle   );
    registerClickHandlerForShape( "circle"   , drawCircle      );
    registerClickHandlerForShape( "ellipse"  , drawEllipse     );
    registerClickHandlerForShape( "bezier"   , drawBezierCurve );

    registerClickHandlerForShape( "pieChart" , drawPieChart  );
    registerClickHandlerForShape( "barChart" , drawBarChart  );
    registerClickHandlerForShape( "lineChart", drawLineChart );

    console.log( "Initialization complete." );
});


/**
 * Event handler for the "resize" event; called when the viewport size changes.
 */
window.addEventListener( "resize", function() {

    setCanvasSize();
});


/**
 * Set the size of the <canvas> element programmatically based on the current
 * viewport size so that lines remain sharp.
 * Both the internal size of the element and the CSS size (screen size) are set
 * to the same values.
 *
 * See also: https://stackoverflow.com/a/61902385/1364368
 *
 * Drawback: when resizing, the previously drawn elements disappear again.
 */
function setCanvasSize() {

    drawingSurfaceWidth  = 80 * window.innerWidth / 100;
    drawingSurfaceHeight = 50 * window.innerHeight / 100 || 766; // 766: fallback for innerHeight === null

    drawingSurface.width        = drawingSurfaceWidth;
    drawingSurface.height       = drawingSurfaceHeight;
    drawingSurface.style.width  = drawingSurfaceWidth;
    drawingSurface.style.height = drawingSurfaceHeight;

    console.log( "Canvas size was reset." );
}


/**
 * Set an event handler for a click event.
 *
 * @param {*} id ID of the element for which the event handler should be registered
 * @param {*} eventHandlerFunction Event-handler function
 */
function registerClickHandlerForShape( id, eventHandlerFunction ) {

    const element = document.getElementById( id )
    if ( element ) {

        element.addEventListener( "click", eventHandlerFunction );
        console.log( `Event handler for ID "${id}" registered.` );

    } else {

        console.error( `Element with ID "${id}" not found.` );
    }
}


/**
 * Clear the drawing surface; should be called at the start of every drawXXX() function.
 */
function clearDrawingSurface() {

    drawingContext.clearRect( 0, 0,
                              drawingSurfaceWidth,
                              drawingSurfaceHeight );
}


/**
 * Function to fill a drawn shape, but only when enabled by the user switch.
 * This function should only be called at the end of drawXXX() functions that draw a
 * shape with a closed area. In drawXXX() functions that call this method, use "black"
 * as the strokeStyle (i.e. the border color of the filled area).
 */
function fillIfNeeded() {

    if ( fillToggle.checked ) {

        drawingContext.fillStyle = "orange";
        drawingContext.fill();
    }
}


/**
 * Function to draw diagonals on the canvas.
 */
function drawDiagonals() {

    clearDrawingSurface();

    // Diagonal 1: from top left to bottom right
    drawingContext.strokeStyle = "red";
    drawingContext.beginPath();
    drawingContext.moveTo( 0, 0 );
    drawingContext.lineTo( drawingSurfaceWidth, drawingSurfaceHeight );
    drawingContext.stroke();


    // Diagonal 2: from bottom left to top right
    drawingContext.strokeStyle = "blue";
    drawingContext.beginPath();
    drawingContext.moveTo( 0, drawingSurfaceHeight );
    drawingContext.lineTo( drawingSurfaceWidth, 0 );
    drawingContext.stroke();
}


/**
 * Function to draw a triangle on the canvas.
 */
function drawTriangle() {

    clearDrawingSurface();

    const margin = 5;

    // Point A: top center
    const ax = drawingSurfaceWidth / 2;
    const ay = margin;

    // Point B: bottom left
    const bx = margin;
    const by = drawingSurfaceHeight - margin;

    // Point C: bottom right
    const cx = drawingSurfaceWidth - margin;
    const cy = by;

    drawingContext.strokeStyle = "black";

    drawingContext.beginPath();
    drawingContext.moveTo( ax, ay );
    drawingContext.lineTo( bx, by );
    drawingContext.lineTo( cx, cy );
    drawingContext.closePath();

    drawingContext.stroke(); // draw border

    fillIfNeeded();
}


/**
 * Function to draw a rectangle on the canvas.
 */
function drawRectangle() {

    clearDrawingSurface();

    const margin = 10;

    const width  = drawingSurfaceWidth  - 2 * margin;
    const height = drawingSurfaceHeight - 2 * margin;

    drawingContext.strokeStyle = "black";

    // Draw rectangle
    drawingContext.beginPath();
    drawingContext.rect( margin,  // x
                         margin,  // y
                         width, height );
    drawingContext.stroke();

    fillIfNeeded();
}


/**
 * Function to draw a circle on the canvas.
 */
function drawCircle() {

    clearDrawingSurface();

    const centerX = drawingSurfaceWidth  / 2;
    const centerY = drawingSurfaceHeight / 2;

    const radius = 0.4 * Math.min( drawingSurfaceWidth,
                                   drawingSurfaceHeight );

    drawingContext.strokeStyle = "black";

    drawingContext.beginPath();
    drawingContext.arc( centerX, centerY,
                        radius,
                        0, // start angle
                        2 * Math.PI // end angle
                      );
    drawingContext.stroke();

    fillIfNeeded();
}


/**
 * Function to draw an ellipse on the canvas.
 */
function drawEllipse() {

    clearDrawingSurface();

    const centerX = drawingSurfaceWidth  / 2;
    const centerY = drawingSurfaceHeight / 2;

    const horizontalRadius = drawingSurfaceWidth  * 0.5 * 0.9;
    const verticalRadius   = drawingSurfaceHeight * 0.5 * 0.4;

    drawingContext.strokeStyle = "black";

    drawingContext.beginPath();
    drawingContext.ellipse( centerX, centerY,
                            horizontalRadius, verticalRadius,
                            0, // rotation
                            0, // start angle
                            2 * Math.PI // end angle
                         );
    drawingContext.stroke();

    fillIfNeeded();
}


/**
 * Function to draw a Bézier curve in the canvas element.
 */
function drawBezierCurve() {

    clearDrawingSurface();

    const startX = 0;
    const startY = 0;
    const endX = drawingSurfaceWidth;
    const endY = drawingSurfaceHeight;

    // Control point 1
    const cp1x = drawingSurfaceWidth  * 0.2;
    const cp1y = drawingSurfaceHeight * 0.8;

    // Control point 2
    const cp2x = drawingSurfaceWidth  * 0.8;
    const cp2y = drawingSurfaceHeight * 0.2;

    drawingContext.strokeStyle = "red";

    drawingContext.beginPath();
    drawingContext.moveTo( startX, startY );
    drawingContext.bezierCurveTo( cp1x, cp1y, cp2x, cp2y, endX, endY );
    drawingContext.stroke();
}


/**
 * Function to draw a pie chart in the canvas element using Chart.js.
 */
function drawPieChart() {

    if ( chartJsDiagram ) { chartJsDiagram.destroy(); }

    const dataObject = {
                            labels: [ "Party A", "Party B", "Party C", "Invalid" ],
                            datasets: [
                                {
                                    label: "Votes",
                                    data: [ 25, 40, 66, 10 ], // absolute numbers, not percentages!
                                    borderWidth: 1
                                }
                            ]
                        };

    const chartObject = {
                            type   : "pie",
                            data   : dataObject,
                            options: chartJsOptions
                        };

    chartJsDiagram = new Chart( drawingContext, chartObject );
}


/**
 * Function to draw a bar chart in the canvas element using Chart.js.
 */
function drawBarChart() {

    if ( chartJsDiagram ) { chartJsDiagram.destroy(); }

    const dataObject = {

        labels: [ "Company A", "Company B", "Company C", "Company D" ],
        datasets: [
            {
                label: "Sales 2022",
                data: [ 20500, 10300, 5100, 16300 ],
                borderWidth: 1
            },
            {
                label: "Sales 2023",
                data: [ 19100, 12300, 4100, 17300 ],
                borderWidth: 1
            }
        ]
    };

    const chartObject = {
                            type   : "bar",
                            data   : dataObject,
                            options: chartJsOptions
                        };

    chartJsDiagram = new Chart( drawingContext, chartObject );
}


/**
 * Function to draw a line chart in the canvas element using Chart.js.
 */
function drawLineChart() {

    if ( chartJsDiagram ) { chartJsDiagram.destroy(); }

    const dataObject = {

        labels: [ "January", "February", "March", "April", "May", "June" ],
        datasets: [
            {
                label: "Country A",
                data: [ 10, 15, 22, 40, 51, 60 ],
                borderWidth: 1
              },
              {
                label: "Country B",
                data: [ 4, 15, 8, 55, 35, 32 ],
                borderWidth: 1
              }
        ]
    };

    const chartObject = {
        type   : "line",
        data   : dataObject,
        options: chartJsOptions
    };

    chartJsDiagram = new Chart( drawingContext, chartObject );
}
