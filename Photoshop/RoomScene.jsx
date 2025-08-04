#target Photoshop
function main(argv) {
//Variables set from Scriptik, comment out these and the call for main() at the EOF when using scriptik
    var fileName = File(argv[0]).fsName.toString();
    var inFolder = argv[1].toString();
    var outFolder = argv[2].toString();
//Variables for executing within photoshop, comment out the variables above and activate the call to main() at the EOF
	//var fileName = '/Users/adam.betterton/Desktop/In/7054T_3296_Mono.tif';
	//var inFolder = '~/Desktop/In';
	//var outFolder = '~/Desktop/Out';
	
	//Location for layered room images. 

	var docRef = app.open(File(fileName));
	
	var swatchName = getBaseName();	
	var swatchKeywords = docRef.info.keywords;
	var mySwatchData = getSwatchData(swatchKeywords);
	//alert(mySwatchData);
	var installMethod = mySwatchData[0];
	var surfaceType = mySwatchData[1];
	var usageType = mySwatchData[2];

	var myRes = 1024

	//alert("installMethod="+installMethod+", surfaceType="+surfaceType+", usageType="+usageType);

	
	if ( surfaceType == "HS" && usageType == "Commercial") {
		var myRoomFolder = Folder("/Volumes/Photography_2025/AI Stuff/HS Comm_RoomScenes");
	}
	
	else if ( surfaceType == "SS" && usageType == "Commercial") {
		var myRoomFolder = Folder("/Volumes/Photography_2025/AI Stuff/SS Comm_RoomScenes");
	}

	else if ( surfaceType == "HS" && usageType == "Residential") {
		var myRoomFolder = Folder("/Volumes/Photography_2025/AI Stuff/HS Res_RoomScenes");
	}
	
	else if ( surfaceType == "SS" && usageType == "Residential") {
		var myRoomFolder = Folder("/Volumes/Photography_2025/AI Stuff/SS Res_RoomScenes");
	}
	else {
		alert("Roomscenes missing");
		throw("Roomscenes missing");
	}
	//alert(myRoomFolder);
	
	if (Folder(myRoomFolder).exists == false) {
		alert("Path not found: "+ myRoomFolder);
		throw("Path not found: "+ myRoomFolder);
	}
	
	var myRoomScenes = myRoomFolder.getFiles();

	definePattern();
	
	for (var i = 0; i < myRoomScenes.length; i++) {
		var roomFileRef = app.open(File(myRoomScenes[i]));
		var roomName = getBaseName();
		editSmartObject(roomName, fileName, outFolder);
		updateSmartObject();
		var folderString = outFolder+"/" + "DataSet";
		if (Folder(folderString).exists == false) {new Folder(folderString).create()};
		//flatten then resize
		flattenImage();
		myResizeImage(myRes);
		// jpg options;
		var jpegOptions = new JPEGSaveOptions();
		jpegOptions.quality = 8;
		jpegOptions.embedColorProfile = true;
		jpegOptions.matte = MatteType.NONE;
		//save jpg as a copy:
		var thedoc = app.activeDocument;
		//var roomKeywords = thedoc.info.keywords;
		//var myKeywords = roomKeywords+" with floor "+swatchName+" installed "+installMethod+".";
		var roomDesc = thedoc.info.caption;
		var myRoomDesc = roomDesc+" with floor "+swatchName+" installed "+installMethod+".";
		var myKeywords = ""
		thedoc.info.keywords = [myKeywords];
		thedoc.info.caption = myRoomDesc;
		thedoc.saveAs((new File(folderString+"/"+swatchName+"_"+roomName+"_RS.jpg")),jpegOptions,true);
		
		//Write a caption file
		var captionFile = folderString+"/"+swatchName+"_"+roomName+"_RS.txt";
		var myCaption = new File(captionFile);
		myCaption.encoding = "UTF8";
		try {
		  myCaption.open("w");
		  myCaption.writeln(myRoomDesc);
		  myCaption.close();
		} catch (e) {
		  alert("Error writing file: " + e);
		}
		
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	}
	
	deletePatternByName('myPattern');
	moveFile(fileName, outFolder);

}

function moveFile(sourceFilePath, destinationFolderPath) {
// Move a processed file from the inFolder to the outFolder
    var sourceFile = new File(sourceFilePath);
    var destinationFolder = new Folder(destinationFolderPath);
    if (!sourceFile.exists) {
        alert("Error: Source file does not exist.");
        return false;
    }

    if (!destinationFolder.exists) {
        destinationFolder.create();
    }

    var newFilePath = new File(destinationFolder.fsName + "/" + sourceFile.name);

    if (sourceFile.copy(newFilePath)) {
        if (sourceFile.remove()) {
            return true;
        } else {
            alert("Error: Could not delete the original file.");
            return false;
        }
    } else {
        alert("Error: Could not copy the file.");
        return false;
    }
}

	
function getBaseName() {
//Get the base name of the file name being processed
	if (app.documents.length > 0) {
	var thedoc = app.activeDocument;
	var docName = thedoc.name;
	if (docName.indexOf(".") != -1) {var basename = docName.match(/(.*)\.[^\.]+$/)[1]}
	else {var basename = docName};
	return (basename);
	}
}

function definePattern() {
//Create a pattern from an image
	var idset = stringIDToTypeID( "set" );
	    var desc367 = new ActionDescriptor();
	    var idnull = stringIDToTypeID( "null" );
	        var ref16 = new ActionReference();
	        var idchannel = stringIDToTypeID( "channel" );
	        var idselection = stringIDToTypeID( "selection" );
	        ref16.putProperty( idchannel, idselection );
	    desc367.putReference( idnull, ref16 );
	    var idto = stringIDToTypeID( "to" );
	    var idordinal = stringIDToTypeID( "ordinal" );
	    var idallEnum = stringIDToTypeID( "allEnum" );
	    desc367.putEnumerated( idto, idordinal, idallEnum );
	executeAction( idset, desc367, DialogModes.NO );

	// =======================================================

	var idmake = stringIDToTypeID( "make" );
	    var desc378 = new ActionDescriptor();
	    var idnull = stringIDToTypeID( "null" );
	        var ref19 = new ActionReference();
	        var idpattern = stringIDToTypeID( "pattern" );
	        ref19.putClass( idpattern );
	    desc378.putReference( idnull, ref19 );
	    var idusing = stringIDToTypeID( "using" );
	        var ref20 = new ActionReference();
	        var idproperty = stringIDToTypeID( "property" );
	        var idselection = stringIDToTypeID( "selection" );
	        ref20.putProperty( idproperty, idselection );
	        var iddocument = stringIDToTypeID( "document" );
	        var idordinal = stringIDToTypeID( "ordinal" );
	        var idtargetEnum = stringIDToTypeID( "targetEnum" );
	        ref20.putEnumerated( iddocument, idordinal, idtargetEnum );
	    desc378.putReference( idusing, ref20 );
	    var idname = stringIDToTypeID( "name" );
		//The following line sets the pattern name
	    desc378.putString( idname, """myPattern""" );
		//alert("definePattern()")
	executeAction( idmake, desc378, DialogModes.NO );
	activeDocument.close();
}

function editSmartObject(roomName, fileName, outFolder) {
//Modify a smart object in a photoshop PSD/PSB file 
var doc0 = app.activeDocument;
var psdName = roomName;
var fileName = fileName;
var outFolder = outFolder;
var idselectNoLayers = stringIDToTypeID( "selectNoLayers" );
    var desc401 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref27 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idtargetEnum = stringIDToTypeID( "targetEnum" );
        ref27.putEnumerated( idlayer, idordinal, idtargetEnum );
    desc401.putReference( idnull, ref27 );
	//alert("editSmartObject():Deselect Layers")
executeAction( idselectNoLayers, desc401, DialogModes.NO );

// =======================================================
try {
var idselect = stringIDToTypeID( "select" );
    var desc402 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref28 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
		//The following line selects the smart object to edit using a layer name
        ref28.putName( idlayer, "Floor" );
    desc402.putReference( idnull, ref28 );
    var idmakeVisible = stringIDToTypeID( "makeVisible" );
    desc402.putBoolean( idmakeVisible, false );
    var idlayerID = stringIDToTypeID( "layerID" );
        var list10 = new ActionList();
        list10.putInteger( 5 );
    desc402.putList( idlayerID, list10 );
	//alert("editSmartObject():Select Floor smart object")
executeAction( idselect, desc402, DialogModes.NO );
} catch (e) {
	moveFile(fileName, outFolder);
	alert("Error selecting layer named 'Floor': " + psdName);
	throw("Error selecting layer named 'Floor': " + psdName);

	//break;
}

// =======================================================
try {
var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
    var desc409 = new ActionDescriptor();
    var iddocumentID = stringIDToTypeID( "documentID" );
    desc409.putInteger( iddocumentID, 91 );
    var idlayerID = stringIDToTypeID( "layerID" );
    desc409.putInteger( idlayerID, 5 );
	//alert("editSmartObject():Open smart object")
executeAction( idplacedLayerEditContents, desc409, DialogModes.NO );
} catch (e) {
	moveFile(fileName, outFolder);
	alert("Error opening 'Floor' as a smart object: " + psdName);
	throw("Error opening 'Floor' as a smart object: " + psdName);

	//break;
}

// =======================================================

try {
var idselect = stringIDToTypeID( "select" );
    var desc202 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref28 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
		//The following line selects the smart object to edit using a layer name
        ref28.putName( idlayer, "pattern" );
    desc202.putReference( idnull, ref28 );
    var idmakeVisible = stringIDToTypeID( "makeVisible" );
    desc202.putBoolean( idmakeVisible, false );
    var idlayerID = stringIDToTypeID( "layerID" );
        var list10 = new ActionList();
        list10.putInteger( 5 );
    desc202.putList( idlayerID, list10 );
	//alert("editSmartObject():Select Floor smart object")
executeAction( idselect, desc202, DialogModes.NO );
} catch (e) {
	moveFile(fileName, outFolder);
	alert("Error selecting layer named 'pattern' inside 'Floor' " + psdName);
	throw("Error selecting layer named 'pattern' inside 'Floor' " + psdName);

	//break;
}

// =======================================================
try {
var idset = stringIDToTypeID( "set" );
    var desc432 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref31 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idtargetEnum = stringIDToTypeID( "targetEnum" );
        ref31.putEnumerated( idcontentLayer, idordinal, idtargetEnum );
    desc432.putReference( idnull, ref31 );
    var idto = stringIDToTypeID( "to" );
        var desc433 = new ActionDescriptor();
        var idscale = stringIDToTypeID( "scale" );
        var idpercentUnit = stringIDToTypeID( "percentUnit" );
        //desc433.putUnitDouble( idscale, idpercentUnit, 70.000000 );
        var idpattern = stringIDToTypeID( "pattern" );
            var desc434 = new ActionDescriptor();
            var idname = stringIDToTypeID( "name" );
			//The following line uses the pattern name that was set in the definePattern() function
            desc434.putString( idname, """myPattern""" );
            var idID = stringIDToTypeID( "ID" );
            //desc434.putString( idID, """9d52750d-e4a2-5941-af56-defbcd87d87d""" );
        var idpattern = stringIDToTypeID( "pattern" );
        desc433.putObject( idpattern, idpattern, desc434 );
    var idpatternLayer = stringIDToTypeID( "patternLayer" );
	//alert("editSmartObject():Install new pattern")
    desc432.putObject( idto, idpatternLayer, desc433 );
executeAction( idset, desc432, DialogModes.NO );
} catch (e) {
	moveFile(fileName, outFolder);
	alert("Error assigning pattern in 'Floor': " + psdName);
	throw("Error assigning pattern in 'Floor': " + psdName);

	//break;
}

activeDocument.save();
activeDocument.close();
}

function updateSmartObject() {
//Update the smart object call this after the editSmartObject() function
    var idplacedLayerUpdateAllModified = stringIDToTypeID("placedLayerUpdateAllModified");
    var desc = new ActionDescriptor();
	//alert("updateSmartObject")
    executeAction(idplacedLayerUpdateAllModified, desc, DialogModes.NO);
}

function deletePatternByName(patternName) {
	//Delete 
    var s2t = function(s) { return app.stringIDToTypeID(s); };

    try {
        var ref = new ActionReference();
        ref.putName(s2t('pattern'), patternName); // Target the pattern by its name

        var desc = new ActionDescriptor();
        desc.putReference(s2t('target'), ref);

        executeAction(s2t('delete'), desc, DialogModes.NO);
        //alert("Pattern '" + patternName + "' deleted successfully.");
    } catch (e) {
        alert("Error deleting pattern: " + e.message);
    }
}

function getSwatchData(swatchKeywords) {
	
	//alert(swatchKeywords);
	var separator = "=";
	var swatchData = [];
	for (var i = 0; i < swatchKeywords.length; i++) {
		if (swatchKeywords[i].indexOf("installMethod=") !== -1) {
			installMethod = swatchKeywords[i];
			//alert(installMethod);
			index = installMethod.indexOf(separator);
			if (index > -1) {
				swatchData.push(installMethod.substring(index + 1));
			} else {
				alert("Swatch image missing keyword installMethod=");
			}
		}
	}	
	for (var i = 0; i < swatchKeywords.length; i++) {
		if (swatchKeywords[i].indexOf("surfaceType=") !== -1) {
			surfaceType = swatchKeywords[i];
			//alert(surfaceType);
			index = surfaceType.indexOf(separator);
			if (index > -1) {
				swatchData.push(surfaceType.substring(index + 1));
			} else {
				alert("Swatch image missing keyword surfaceType=");
			}
		}
	}
	for (var i = 0; i < swatchKeywords.length; i++) {
		if (swatchKeywords[i].indexOf("usageType=") !== -1) {
			usageType = swatchKeywords[i];
			//alert(usageType);
			index = usageType.indexOf(separator);
			if (index > -1) {
				swatchData.push(usageType.substring(index + 1));
			} else {
				alert("Swatch image missing keyword usageType=");
			}
		}
	}
	//alert(swatchData);
	return swatchData;
	
}

function myResizeImage(myRes){

	// =======================================================
	var idimageSize = stringIDToTypeID( "imageSize" );
	    var desc231 = new ActionDescriptor();
	    var idwidth = stringIDToTypeID( "width" );
	    var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
	    desc231.putUnitDouble( idwidth, idpixelsUnit, myRes );
	    var idscaleStyles = stringIDToTypeID( "scaleStyles" );
	    desc231.putBoolean( idscaleStyles, true );
	    var idconstrainProportions = stringIDToTypeID( "constrainProportions" );
	    desc231.putBoolean( idconstrainProportions, true );
	    var idinterfaceIconFrameDimmed = stringIDToTypeID( "interfaceIconFrameDimmed" );
	    var idinterpolationType = stringIDToTypeID( "interpolationType" );
	    var iddeepUpscale = stringIDToTypeID( "deepUpscale" );
	    desc231.putEnumerated( idinterfaceIconFrameDimmed, idinterpolationType, iddeepUpscale );
	    var idnoise = stringIDToTypeID( "noise" );
	    desc231.putInteger( idnoise, 0 );
	executeAction( idimageSize, desc231, DialogModes.NO );

}

function flattenImage(){
	var idflattenImage = stringIDToTypeID( "flattenImage" );
	executeAction( idflattenImage, undefined, DialogModes.NO );
}

//main();
