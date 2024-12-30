//execute within InDesign, expects a layer with the script label <@qrCodeReplace@> to be populated with the text lines with data corresponding to the variables below
qrCodeReplace();
myObject = app.activeDocument;
function qrCodeReplace() {
    var qrCodeLayer = app.documents.item(0).layers.itemByName("<@qrCodeReplace@>");
        if (qrCodeLayer.isValid) {
            var myFrame = app.activeDocument.textFrames.item(0);
            var mytextframe = myFrame.texts[0];
            var mylines = mytextframe.contents;
            var theLines = mylines.split("\r")
            var myLastName = theLines[0];
            var myFirstName = theLines[1];
            var myTitle = theLines[2];
            var myOrg = theLines[3];
            var myStreet = theLines[4];
            var myCity = theLines[5];
            var myState = theLines[6];
            var myZip = theLines[7];
            var myEmail = theLines[8];
            var myTelWork = theLines[9];
            var myTelCell = theLines[10];
            var myURL = theLines[11];
            //alert (myLastName)

            for (var counter = 0; counter < app.documents.item(0).textFrames.length; counter++) {
                if (app.documents.item(0).textFrames[counter].label == "<@qrCodeReplace@>") {
                    var qrcode1 = ({firstName:myFirstName, lastName:myLastName, phone:myTelWork,cellPhone:myTelCell,
                    email:myEmail, organisation:myOrg, website:myURL,
                    jobTitle:myTitle, streetAddress:myStreet, adrState:myState, city:myCity, postalCode:myZip, qrCodeSwatch:"Black"}
                    );
                    //alert(qrcode1);
                    var myObject = app.documents.item(0).textFrames[counter];
                    myObject.createVCardQRCode(qrcode1);  
                    }
                }
            }
        }
