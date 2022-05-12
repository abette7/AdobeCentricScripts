//Launch this as part of an action and/or script to save out layers of differing dimensions as their own images.

main();

function main(){
var layer = activeDocument.activeLayer; //Grab the currently selected layer
      var strtRulerUnits = app.preferences.rulerUnits;  //store current ruler increments
        app.preferences.rulerUnits = Units.PIXELS; 
    // Calculate width and height based on the rectangular bounds of the selected layer
var mywidth= layer.bounds[2]-layer.bounds[0]; //Grab the length
var myheight = layer.bounds[3]-layer.bounds[1]; //Grab the width
    
//Canvas Size cropped to dimensions above.
        var idcanvasSize = stringIDToTypeID( "canvasSize" );
    var desc215 = new ActionDescriptor();
    var idwidth = stringIDToTypeID( "width" );
    var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
    desc215.putUnitDouble( idwidth, idpixelsUnit, mywidth );
    var idheight = stringIDToTypeID( "height" );
    var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
    desc215.putUnitDouble( idheight, idpixelsUnit, myheight );
    var idhorizontal = stringIDToTypeID( "horizontal" );
    var idhorizontalLocation = stringIDToTypeID( "horizontalLocation" );
    var idcenter = stringIDToTypeID( "center" );
    desc215.putEnumerated( idhorizontal, idhorizontalLocation, idcenter );
    var idvertical = stringIDToTypeID( "vertical" );
    var idverticalLocation = stringIDToTypeID( "verticalLocation" );
    var idcenter = stringIDToTypeID( "center" );
    desc215.putEnumerated( idvertical, idverticalLocation, idcenter );
executeAction( idcanvasSize, desc215, DialogModes.NO );
app.preferences.rulerUnits = strtRulerUnits; 

}
