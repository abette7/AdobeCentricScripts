#target photoshop
var d = app.activeDocument;
var dPath = d.path;
var dname = d.name.replace(/\.[^\.]+$/, '');
var suffix = '';

var idsave = charIDToTypeID( "save" );
   var desc17 = new ActionDescriptor();
   var idAs = charIDToTypeID( "As  " );
   var desc18 = new ActionDescriptor();
   var idPhteight = charIDToTypeID( "Pht8" );
   desc17.putObject( idAs, idPhteight, desc18 );
   var idIn = charIDToTypeID( "In  " );
   desc17.putPath( idIn, new File( dPath + '/' + dname + suffix + '.psb' ) );
   var idDocI = charIDToTypeID( "DocI" );
   desc17.putInteger( idDocI, 195 );
   var idCpy = charIDToTypeID( "Cpy " );
   desc17.putBoolean( idCpy, true );
   var idLwCs = charIDToTypeID( "LwCs" );
   desc17.putBoolean( idLwCs, true );
   var idsaveStage = stringIDToTypeID( "saveStage" );
   var idsaveStageType = stringIDToTypeID( "saveStageType" );
   var idsaveSucceeded = stringIDToTypeID( "saveSucceeded" );
   desc17.putEnumerated( idsaveStage, idsaveStageType, idsaveSucceeded );
executeAction( idsave, desc17, DialogModes.NO );