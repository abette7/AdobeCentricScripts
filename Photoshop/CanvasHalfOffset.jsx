(function main() {
    // Check if there is an active document open
    if (app.documents.length === 0) {
        alert("Please open a document before running this script.");
        return;
    }

    var doc = app.activeDocument;
    var layer = doc.activeLayer;

    // Ensure the selected layer is an ArtLayer (not a Layer Group/Folder)
    if (layer.typename !== "ArtLayer") {
        alert("Please select a standard pixel layer, not a layer group.");
        return;
    }

    // Check if the current layer is a locked Background layer
    if (layer.isBackgroundLayer) {
        alert("The offset filter cannot be applied to a locked Background layer.\nPlease convert it to a regular layer first.");
        return;
    }

    // Save the user's current ruler units
    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    try {
        // layer.bounds returns an array: [left, top, right, bottom]
        var bounds = layer.bounds;
        
        // Calculate the exact width and height of the layer's pixels
        var layerWidth = bounds[2].value - bounds[0].value;
        var layerHeight = bounds[3].value - bounds[1].value;

        // Calculate 50% of the layer dimensions (rounded to nearest integer)
        var offsetX = Math.round(layerWidth / 2);
        var offsetY = Math.round(layerHeight / 2);

        // Apply the native offset filter using Wrap Around
        layer.applyOffset(offsetX, offsetY, OffsetUndefinedAreas.WRAPAROUND);
        
    } catch (error) {
        alert("An error occurred while applying the offset: " + error.message + 
              "\n(Make sure your layer actually contains pixels).");
    } finally {
        // Use a finally block to guarantee ruler units are restored, even if the script fails
        app.preferences.rulerUnits = originalRulerUnits;
    }
})();