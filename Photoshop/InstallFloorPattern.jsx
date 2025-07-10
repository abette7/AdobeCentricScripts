#target photoshop

main();


function main() {

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
            desc434.putString( idID, """9d52750d-e4a2-5941-af56-defbcd87d87d""" );
        var idpattern = stringIDToTypeID( "pattern" );
        desc433.putObject( idpattern, idpattern, desc434 );
    var idpatternLayer = stringIDToTypeID( "patternLayer" );
    desc432.putObject( idto, idpatternLayer, desc433 );
executeAction( idset, desc432, DialogModes.NO );

activeDocument.save();
activeDocument.close();

function updateSmartObject() {
    var idplacedLayerUpdateAllModified = stringIDToTypeID("placedLayerUpdateAllModified");
    var desc = new ActionDescriptor();
    executeAction(idplacedLayerUpdateAllModified, desc, DialogModes.NO);
}

updateSmartObject()




//var idplacedLayerUpdateAllModified = stringIDToTypeID( "placedLayerUpdateAllModified" );
//executeAction(idplacedLayerUpdateAllModified, undefined, DialogModes.NO);
}