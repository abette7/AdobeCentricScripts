#target photoshop

main();


function main() {
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
}