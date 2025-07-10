#target Photoshop
function main(argv) {
    var fileName = File(argv[0]).fsName.toString();
	//var fileName = '/Users/adam.betterton/Desktop/In/919WL_252WL.tif';
    var inFolder = argv[1].toString();
	//var inFolder = '/Users/adam.betterton/Desktop/In';
    var outFolder = argv[2].toString();
	//var outFolder = '/Users/adam.betterton/Desktop/Out';
 	//alert(fileName + '\n' + inFolder + '\n' + outFolder);
	var myRoomFolder = Folder("/Volumes/Photography_2025/AI Stuff/SS_RoomScenes");
	var myRoomScenes = myRoomFolder.getFiles();
	var docRef = app.open(File(fileName));
	
	var swatchName = getBaseName();	
	definePattern();

	moveFile(fileName, outFolder);
	for (var i = 0; i < myRoomScenes.length; i++) {
		var roomFileRef = app.open(File(myRoomScenes[i]));
		var roomName = getBaseName();
		editSmartObject();
		updateSmartObject();
		var folderString = outFolder+"/" + "DataSet";
		if (Folder(folderString).exists == false) {new Folder(folderString).create()};
		// jpg options;
		var jpegOptions = new JPEGSaveOptions();
		jpegOptions.quality = 8;
		jpegOptions.embedColorProfile = true;
		jpegOptions.matte = MatteType.NONE;
		//save jpg as a copy:
		var thedoc = app.activeDocument;
		thedoc.saveAs((new File(folderString+"/"+swatchName+"_"+roomName+"_RS.jpg")),jpegOptions,true);
		var captionFile = folderString+"/"+swatchName+"_"+roomName+"_RS.txt";
		var myCaption = new File(captionFile);
		myCaption.encoding = "UTF8";
		try {
		  // Open the file for writing
		  myCaption.open("w");

		  // Write the content
		  myCaption.writeln("A room with floor "+swatchName+".");

		  // Close the file
		  myCaption.close();

		  
		} catch (e) {
		  alert("Error writing file: " + e);
		}
		
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	}

}

function moveFile(sourceFilePath, destinationFolderPath) {
    // Create File object for the source file
    var sourceFile = new File(sourceFilePath);

    // Create Folder object for the destination folder
    var destinationFolder = new Folder(destinationFolderPath);

    // Check if the source file exists
    if (!sourceFile.exists) {
        alert("Error: Source file does not exist.");
        return false;
    }

    // Check if the destination folder exists, and create it if it doesn't
    if (!destinationFolder.exists) {
        destinationFolder.create();
    }

    // Construct the full path for the new file location
    var newFilePath = new File(destinationFolder.fsName + "/" + sourceFile.name);

    // Copy the file to the new location
    if (sourceFile.copy(newFilePath)) {
        // If the copy is successful, delete the original file
        if (sourceFile.remove()) {
            //alert("File moved successfully to: " + newFilePath.fsName);
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

	if (app.documents.length > 0) {
	var thedoc = app.activeDocument;
	// getting the name and location;
	var docName = thedoc.name;
	if (docName.indexOf(".") != -1) {var basename = docName.match(/(.*)\.[^\.]+$/)[1]}
	else {var basename = docName};
	return (basename);
	}
}

function definePattern() {
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
	var idcopyEvent = stringIDToTypeID( "copyEvent" );
	    var desc368 = new ActionDescriptor();
	    var idcopyHint = stringIDToTypeID( "copyHint" );
	    desc368.putString( idcopyHint, """pixels""" );
	executeAction( idcopyEvent, desc368, DialogModes.NO );

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
	    desc378.putString( idname, """myPattern""" );
	executeAction( idmake, desc378, DialogModes.NO );
	activeDocument.close();
}

function editSmartObject() {

var doc0 = app.activeDocument;

var idselectNoLayers = stringIDToTypeID( "selectNoLayers" );
    var desc401 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref27 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idtargetEnum = stringIDToTypeID( "targetEnum" );
        ref27.putEnumerated( idlayer, idordinal, idtargetEnum );
    desc401.putReference( idnull, ref27 );
executeAction( idselectNoLayers, desc401, DialogModes.NO );

// =======================================================
var idselect = stringIDToTypeID( "select" );
    var desc402 = new ActionDescriptor();
    var idnull = stringIDToTypeID( "null" );
        var ref28 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
        ref28.putName( idlayer, "Floor" );
    desc402.putReference( idnull, ref28 );
    var idmakeVisible = stringIDToTypeID( "makeVisible" );
    desc402.putBoolean( idmakeVisible, false );
    var idlayerID = stringIDToTypeID( "layerID" );
        var list10 = new ActionList();
        list10.putInteger( 5 );
    desc402.putList( idlayerID, list10 );
executeAction( idselect, desc402, DialogModes.NO );

// =======================================================
var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
    var desc409 = new ActionDescriptor();
    var iddocumentID = stringIDToTypeID( "documentID" );
    desc409.putInteger( iddocumentID, 91 );
    var idlayerID = stringIDToTypeID( "layerID" );
    desc409.putInteger( idlayerID, 5 );
executeAction( idplacedLayerEditContents, desc409, DialogModes.NO );

// =======================================================

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
            desc434.putString( idname, """myPattern""" );
            var idID = stringIDToTypeID( "ID" );
            //desc434.putString( idID, """9d52750d-e4a2-5941-af56-defbcd87d87d""" );
        var idpattern = stringIDToTypeID( "pattern" );
        desc433.putObject( idpattern, idpattern, desc434 );
    var idpatternLayer = stringIDToTypeID( "patternLayer" );
    desc432.putObject( idto, idpatternLayer, desc433 );
executeAction( idset, desc432, DialogModes.NO );

activeDocument.save();
activeDocument.close();
}

function updateSmartObject() {
    var idplacedLayerUpdateAllModified = stringIDToTypeID("placedLayerUpdateAllModified");
    var desc = new ActionDescriptor();
    executeAction(idplacedLayerUpdateAllModified, desc, DialogModes.NO);
}
//main();
