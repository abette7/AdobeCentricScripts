#target photoshop;
app.bringToFront();

// ===============================================================
// NOTE: GO THRU EACH DOCUMENT AND SAVE OUT LAYERS BY DOCNAME & layerIndex:
// NOTE: MUST SAVE DOCUMENT IN LOCATION FIRST FOR CODE TO WORK
// ===============================================================

openDocuments();

function openDocuments() {

	var docLength = app.documents.length;

	for ( var i = 0; i < docLength; i++ ) {
		if ( i === docLength ) {
			break;
		}

		var doc = documents[ i ];
		app.activeDocument = doc;

		// NOTE: ===============================================================
		// NOTE: call to function below:
		// NOTE: ===============================================================

		saveTIF();

		// NOTE: ===============================================================
		// NOTE: ===============================================================

	}

	alert( "STACKS Saved: " + "\n\n" + i + " Opened Documents" );
}

// Function to Align Layer

function align(method) {

   var desc = new ActionDescriptor();

   var ref = new ActionReference();

   ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );

   desc.putReference( charIDToTypeID( "null" ), ref );

   desc.putEnumerated( charIDToTypeID( "Usng" ), charIDToTypeID( "ADSt" ), charIDToTypeID( method ) );

   executeAction( charIDToTypeID( "Algn" ), desc, DialogModes.NO );

};

// NOTE: ===============================================================
// NOTE: below is the save stack tiff files
// NOTE: ODS stands for Open Document's Stacks!
// NOTE: ===============================================================


function saveTIF() {


	var doc = app.activeDocument;
	var docPath = doc.path;
	var docName = doc.name.replace( /\.[^\.]+$/, '' );


	doc.activeLayer = doc.layers.getByName( "Swatches" );

	if ( app.documents.length > 0 ) {
		if ( app.activeDocument.activeLayer.layers ) {

		} else {
			alert( "OOPS! \nLayer Group not Selected!!!" );

		}
	}

	var group = doc.activeLayer;
	var groupLength = group.layers.length;

	for ( var i = 0; i < groupLength; i++ ) {
		group.layers[ i ].visible = false;
	}

	for ( i = 0; i < groupLength; i++ ) {

		var layer = group.layers[ i ];
		var layerIndex = i + 1;
		// var layerName = layer.name.slice( 0, -4 ); // Omit the file extension.

		layer.visible = true; //////////////////////////////////////////
		doc.activeLayer = layer;
		app.activeDocument.selection.selectAll();
		// Call function to align layer
		// Left('AdLf'); Right('AdRg'); Top('AdTp'); Bottom('AdBt'); Center Horizontal('AdCH'); Center Vertical('AdCV');
		align("AdCH");
		align("AdCV");
		app.activeDocument.selection.deselect(); 
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

  

		var folderString = docPath + "/" + "TIF_Stack";
		if ( Folder( folderString )
			.exists == false ) {
			new Folder( folderString )
				.create();
		}

		TiffOpts = new TiffSaveOptions();
		TiffOpts.embedColorProfile = true;
		TiffOpts.alphaChannels = false;
		TiffOpts.imageCompression = TIFFEncoding.NONE;
		TiffOpts.layers = false;
		TiffOpts.spotColors = true;

		// Save Doc // Prefix is Doc Name. Suffix is Number Each.
		doc.saveAs( ( new File( folderString + "/" + docName + "_" + layerIndex + ".tif" ) ), TiffOpts, true );

		layer.visible = false; //////////////////////////////////////////

	}

	// app.refresh();
	//doc.save();
	//doc.close( SaveOptions.SAVECHANGES );
	//doc.close();
	doc.close(SaveOptions.DONOTSAVECHANGES);
}