// Code hacked together from the following resources: Davide Barranca's RecordableGBlur, JJMack's RatioSelection, and Adobe's FitImage
// Used in actions for cropping batches of images to specific ratios, settings are action recordable.
/*
@@@BUILDINFO@@@ RatioCrop.jsx 1.0
*/
/*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>$$$/RBG/RatioCrop=RatioCrop...</name>
<menu>automate</menu>
<enableinfo>true</enableinfo>
<eventid>07d2f0b1-653d-11e0-ae3e-0800200c9a66</eventid>
<terminology><![CDATA[<<  /Version 1
                          /Events <<
                            /07d2f0b1-653d-11e0-ae3e-0800200c9a66 [($$$/RBG/RatioCrop=RatioCrop) 
                            /imageReference <<
                              /width [($$$/Actions/Key/RatioCrop/Width=Width) /uint]
                              /height [($$$/Actions/Key/RatioCrop/Height=Height) /uint]
                            >>]
                          >>
                      >> ]]></terminology>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/;

#target photoshop
var Globals, ParamHolder, RecordableGB, paramHolder, rGB;
 
ParamHolder = function() {
  return this.width = Globals.defaultWidth;
  return this.height = Globals.defaultHeight;
};

RecordableGB = function() {
  var actualRoutine, win;
  win = null;
  this.actualRoutine = function(param) {
        
       var strtRulerUnits = app.preferences.rulerUnits;  
        app.preferences.rulerUnits = Units.PIXELS;  
        var W = activeDocument.width;  
        var H = activeDocument.height;          
        var Hpics = param.height;
        var Wpics = param.width;
        var ratio = Wpics+":"+Hpics;  
        ratio = ratio.split(":");  
        var Hpics =(W/Number(ratio[0]))*Number(ratio[1]);  
        if(Hpics > H){  
            Wpics = (H/Number(ratio[1]))*Number(ratio[0]);  
            Hpics = H;  
            }else{  
                Wpics = W;  
                }  
        var Left,Top,Right,Bottom=0;  
        if (W==Wpics) Left = 0; Right = W;   
        if (W!=Wpics) {  
            var diffw = (W-Wpics)/2;  
            Left = diffw; Right = Wpics+diffw;  
            }  
        if (H==Hpics) Top = 0; Bottom = H;  
        if( H!=Hpics){  
            var diffh = (H-Hpics)/2;  
            Top = diffh; Bottom = Hpics+diffh;  
            } 
        var idcanvasSize = stringIDToTypeID( "canvasSize" );
    var desc215 = new ActionDescriptor();
    var idwidth = stringIDToTypeID( "width" );
    var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
    desc215.putUnitDouble( idwidth, idpixelsUnit, Wpics );
    var idheight = stringIDToTypeID( "height" );
    var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
    desc215.putUnitDouble( idheight, idpixelsUnit, Hpics );
    var idhorizontal = stringIDToTypeID( "horizontal" );
    var idhorizontalLocation = stringIDToTypeID( "horizontalLocation" );
    var idcenter = stringIDToTypeID( "center" );
    desc215.putEnumerated( idhorizontal, idhorizontalLocation, idcenter );
    var idvertical = stringIDToTypeID( "vertical" );
    var idverticalLocation = stringIDToTypeID( "verticalLocation" );
    var idcenter = stringIDToTypeID( "center" );
    desc215.putEnumerated( idvertical, idverticalLocation, idcenter );
executeAction( idcanvasSize, desc215, DialogModes.NO );
        //activeDocument.selection.select([[Left,Top],[Right,Top],[Right,Bottom],[Left,Bottom]], SelectionType.REPLACE, 0, false);   
        //executeAction(charIDToTypeID( "Crop" ), new ActionDescriptor(), DialogModes.NO );  
        app.preferences.rulerUnits = strtRulerUnits;  
    Globals.isCancelled = false;
    return false;
  };
  actualRoutine = this.actualRoutine;
  this.CreateDialog = function() {
    var windowResource;
    windowResource = "dialog {\
    valuePanel: Panel {orientation: 'row',alignChildren: ['fill', 'top'], \
    text: '  Width  :  Height', \
    widthText: EditText {preferredSize: [45, 20]}, \
    heightText: EditText {preferredSize: [45, 20]}, \
    buttonsGroup: Group {\
    cancelButton: Button {text: 'cancel', properties: {name: 'cancel'}}, \
    okButton: Button {text: 'Ok', properties: {name: 'ok'}}}}}";

    win = new Window(windowResource);
    win.text = Globals.stringTitle;
    win.valuePanel.widthText.active = true;
 //   win.valuePanel.heightText.active = true;
    win.valuePanel.buttonsGroup.cancelButton.onClick = function() {
      return win.close();
    };
    win.valuePanel.buttonsGroup.okButton.onClick = function() {
      paramHolder.width = Number(win.valuePanel.widthText.text);
      paramHolder.height = Number(win.valuePanel.heightText.text);
      actualRoutine(paramHolder);
      win.close();
    };
  };
  this.runDialog = function() {
    app.bringToFront();
    win.center();
    win.show();
  };
  this.initParameters = function() {
    var isFromAction;
    isFromAction = !!app.playbackParameters.count;
    if (isFromAction) {
      descriptorToObject(paramHolder, app.playbackParameters, Globals.stringMessage);
    }
  };
  this.saveOffParameters = function(paramObject) {
    var desc;
    desc = objectToDescriptor(paramObject, Globals.stringMessage);
    app.playbackParameters = desc;
  };
};

Globals = {
  scriptUUID: "07d2f0b1-653d-11e0-ae3e-0800200c9a66",
  defaultWidth: 30,
  defaultHeight: 30,  
  stringWidth: localize("$$$/Actions/Key/RatioCrop/Width=Width"),
  stringHeight: localize("$$$/Actions/Key/RatioCrop/Height=Height"),
  stringTitle: "Ratio Crop",
  stringMessage: "Ratio Crop Action Settings",
  isCancelled: true
};

paramHolder = new ParamHolder();

rGB = new RecordableGB();

if (app.playbackDisplayDialogs === DialogModes.ALL) {
  rGB.CreateDialog();
  rGB.runDialog();
} else {
  rGB.initParameters();
  rGB.actualRoutine(paramHolder);
}

if (!Globals.isCancelled) {
  rGB.saveOffParameters(paramHolder);
}

//isCancelled ? 'cancel' : undefined;

///////////////////////////////////////////////////////////////////////////////
// Function: objectToDescriptor
// Usage: create an ActionDescriptor from a JavaScript Object
// Input: JavaScript Object (o)
//        object unique string (s)
//        Pre process converter (f)
// Return: ActionDescriptor
// NOTE: Only boolean, string, number and UnitValue are supported, use a pre processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function objectToDescriptor (o, s, f) {
   if (undefined != f) {
      o = f(o);
   }

   var d = new ActionDescriptor;
   var l = o.reflect.properties.length;
   d.putString( app.charIDToTypeID( 'Msge' ), s );
   for (var i = 0; i < l; i++ ) {
      var k = o.reflect.properties[i].toString();
      if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
         continue;
      var v = o[ k ];
      k = app.stringIDToTypeID(k);
      switch ( typeof(v) ) {
         case "boolean":
            d.putBoolean(k, v);
            break;
         case "string":
            d.putString(k, v);
            break;
         case "number":
            d.putDouble(k, v);
            break;
         default:
         {
            if ( v instanceof UnitValue ) {
               var uc = new Object;
               uc["px"] = charIDToTypeID("#Pxl"); // pixelsUnit
               uc["%"] = charIDToTypeID("#Prc"); // unitPercent
               d.putUnitDouble(k, uc[v.type], v.value);
            } else {
               throw( new Error("Unsupported type in objectToDescriptor " + typeof(v) ) );
            }
         }
      }
   }
    return d;
}

///////////////////////////////////////////////////////////////////////////////
// Function: descriptorToObject
// Usage: update a JavaScript Object from an ActionDescriptor
// Input: JavaScript Object (o), current object to update (output)
//        Photoshop ActionDescriptor (d), descriptor to pull new params for object from
//        object unique string (s)
//        JavaScript Function (f), post process converter utility to convert
// Return: Nothing, update is applied to passed in JavaScript Object (o)
// NOTE: Only boolean, string, number and UnitValue are supported, use a post processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////

function descriptorToObject (o, d, s, f) {
   var l = d.count;
   if (l) {
       var keyMessage = app.charIDToTypeID( 'Msge' );
        if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
   }
   for (var i = 0; i < l; i++ ) {
      var k = d.getKey(i); // i + 1 ?
      var t = d.getType(k);
      strk = app.typeIDToStringID(k);
      switch (t) {
         case DescValueType.BOOLEANTYPE:
            o[strk] = d.getBoolean(k);
            break;
         case DescValueType.STRINGTYPE:
            o[strk] = d.getString(k);
            break;
         case DescValueType.DOUBLETYPE:
            o[strk] = d.getDouble(k);
            break;
         case DescValueType.UNITDOUBLE:
            {
            var uc = new Object;
            uc[charIDToTypeID("#Rlt")] = "px"; // unitDistance
            uc[charIDToTypeID("#Prc")] = "%"; // unitPercent
            uc[charIDToTypeID("#Pxl")] = "px"; // unitPixels
            var ut = d.getUnitDoubleType(k);
            var uv = d.getUnitDoubleValue(k);
            o[strk] = new UnitValue( uv, uc[ut] );
            }
            break;
         case DescValueType.INTEGERTYPE:
         case DescValueType.ALIASTYPE:
         case DescValueType.CLASSTYPE:
         case DescValueType.ENUMERATEDTYPE:
         case DescValueType.LISTTYPE:
         case DescValueType.OBJECTTYPE:
         case DescValueType.RAWTYPE:
         case DescValueType.REFERENCETYPE:
         default:
            throw( new Error("Unsupported type in descriptorToObject " + t ) );
      }
   }
   if (undefined != f) {
      o = f(o);
   }
};
