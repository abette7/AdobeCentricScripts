var document = app.activeDocument; // Assumes a document is active.

// Obtain original ruler units prefs.
var originalRulerUnits = app.preferences.rulerUnits;

// Set the ruler units prefs to pixels.
app.preferences.rulerUnits = Units.PIXELS;

/**
 * Crops the canvas by x number of pixels equally from all sides.
 * @param {Number} [amountOfPixels=0] - Number of pixels to crop.
 */
function cropCanvas(amountOfPixels) {
    amountOfPixels = amountOfPixels || 0; // Defaults to zero.

    // Obtain height and width of canvas.
    var canvasWidth = document.width.value;
    var canvasHeight = document.height.value;

    // Define the new bounds.
    var newBounds = [
        amountOfPixels,
        amountOfPixels,
        canvasWidth - amountOfPixels,
        canvasHeight - amountOfPixels
    ];

    // Crop the canvas. 
    document.crop(newBounds);
}

// Invoke the `cropCanvas` function passing
// in the `amountOfPixels` value.
cropCanvas(1);

// Reset ruler prefs.
app.preferences.rulerUnits = originalRulerUnits;