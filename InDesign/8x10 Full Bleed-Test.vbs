Set objArgs = WScript.Arguments
Set objFSO = CreateObject("Scripting.FileSystemObject")

Set oShell = WScript.CreateObject ("WScript.Shell")


For I = 0 to objArgs.Count - 1
rem WScript.Echo objArgs(I)
oShell.run "InDesign.exe "

rem Get file passed as argument and set variables for filename parts.

Set objFile = objFSO.GetFile(objArgs(I))
myFileName = objFSO.GetFileName(objFile)
myBaseName = objFSO.GetBaseName(objFIle)
myParentFolder = objFSO.GetParentFolderName(objFile)

rem setup document in InDesign (8x10 with 1/8in bleed and 3/8 slug)

Set myInDesign = CreateObject("InDesign.Application.CC.2019")
myInDesign.PublishTerminology(8.0)
myInDesign.ScriptPreferences.Version = 8.0
set myDocument = myInDesign.Documents.Add
  with myDocument.DocumentPreferences
    .PageHeight = "10in"
    .PageWidth = "8in"
    Rem Bleed
    .DocumentBleedBottomOffset = "0.125in"
    .DocumentBleedTopOffset = "0.125in"
    .DocumentBleedinsideOrLeftOffset = "0.125in"
    .DocumentBleedOutsideOrRightOffset = "0.125in"
    Rem Slug
    .SlugBottomOffset = "0.375in"
    .SlugTopOffset = "0.375in"
    .SluginsideOrLeftOffset = "0.375in"
    .SlugRightOrOutsideOffset = "0.375in"

    end with
rem create page items for image name in slug and full bleed image placement.
set myPage = myDocument.Pages.Item(1)
set mySlugTextBox = myPage.TextFrames.Add
mySlugTextBox.GeometricBounds = Array(-0.25, 0.125, 0, 8.0)
mySlugTextBox.Contents = myBaseName
set myImageRectangle = myPage.Rectangles.Add
myImageRectangle.GeometricBounds = Array(-.125,-.125,10.125,8.125)
myImageRectangle.StrokeWeight = 0
myImageRectangle.Place objFIle
rem the following parameter requires enumeration number when script is launched via windows scripting host rather than InDesign.
myImageRectangle.fit (1718185072)
rem Msgbox("This message from Vbscript")
myPDFPath = myParentFolder & "\" & myBaseName & ".pdf"
myInddPath = myParentFolder & "\" & myBaseName & ".indd"
rem Msgbox(myExportPath)
rem the following parameter requires enumeration number when script is launched via windows scripting host rather than InDesign.
myInDesign.ActiveDocument.Export (1952403524), myPDFPath, False, myinDesign.PDFExportPresets.Item("Press With Marks")
myInDesign.ActiveDocument.Save myInddPath
myInDesign.ActiveDocument.Close

next

Set oShell = Nothing
