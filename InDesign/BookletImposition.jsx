/**
 * BookletImposition.jsx
 * Adobe InDesign ExtendScript (Classic Scripting Engine)
 *
 * Compatible with ALL versions of InDesign (CS4 through CC 2025).
 * Automatically creates a 2-up saddle-stitch booklet imposition document
 * from a folder of single-page PDFs based on their TrimBox and MediaBox dimensions.
 */

#target indesign

(function () {
    // Capture user's InDesign default measurement unit preferences
    var userDefaultHUnits = app.viewPreferences.horizontalMeasurementUnits;
    var userDefaultVUnits = app.viewPreferences.verticalMeasurementUnits;
    var origScriptUnit = app.scriptPreferences.measurementUnit;

    function extractPageNumber(filename) {
        var prefixMatch = filename.match(/(?:p|page)[-_ ]?(\d+)/i);
        if (prefixMatch) {
            return parseInt(prefixMatch[1], 10);
        }
        var suffixMatch = filename.match(/(\d+)(?=[^\d]*\.pdf$)/i);
        if (suffixMatch) {
            return parseInt(suffixMatch[1], 10);
        }
        return null;
    }

    function parsePdfBoxes(file) {
        try {
            file.open("r");
            file.encoding = "BINARY";
            var content = file.read(65536);
            file.close();

            var mediaMatch = content.match(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/);
            var trimMatch = content.match(/\/TrimBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/);
            var cropMatch = content.match(/\/CropBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/);

            if (!mediaMatch) return null;

            var mX0 = parseFloat(mediaMatch[1]);
            var mY0 = parseFloat(mediaMatch[2]);
            var mX1 = parseFloat(mediaMatch[3]);
            var mY1 = parseFloat(mediaMatch[4]);

            var wMedia = Math.abs(mX1 - mX0);
            var hMedia = Math.abs(mY1 - mY0);

            var targetBox = trimMatch || cropMatch || mediaMatch;
            var tX0 = parseFloat(targetBox[1]);
            var tY0 = parseFloat(targetBox[2]);
            var tX1 = parseFloat(targetBox[3]);
            var tY1 = parseFloat(targetBox[4]);

            var wTrim = Math.abs(tX1 - tX0);
            var hTrim = Math.abs(tY1 - tY0);

            var mLeft = Math.max(0, tX0 - mX0);
            var mRight = Math.max(0, mX1 - tX1);
            var mBottom = Math.max(0, tY0 - mY0);
            var mTop = Math.max(0, mY1 - tY1);

            if (wTrim > 0 && hTrim > 0 && wMedia > 0 && hMedia > 0) {
                return {
                    wTrim: wTrim,
                    hTrim: hTrim,
                    wMedia: wMedia,
                    hMedia: hMedia,
                    mLeft: mLeft,
                    mRight: mRight,
                    mTop: mTop,
                    mBottom: mBottom
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function probePdfDimensionsWithDoc(file) {
        var tempDoc = app.documents.add(false);
        try {
            tempDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
            tempDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

            var page = tempDoc.pages[0];

            // 1. Measure Trim
            app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_TRIM;
            var placedTrim = page.place(file, [0, 0])[0];
            var trimBounds = placedTrim.geometricBounds;
            var wTrim = trimBounds[3] - trimBounds[1];
            var hTrim = trimBounds[2] - trimBounds[0];

            // 2. Measure Media
            app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;
            var placedMedia = page.place(file, [0, 0])[0];
            var mediaBounds = placedMedia.geometricBounds;
            var wMedia = mediaBounds[3] - mediaBounds[1];
            var hMedia = mediaBounds[2] - mediaBounds[0];

            var diffW = Math.max(0, wMedia - wTrim);
            var diffH = Math.max(0, hMedia - hTrim);

            return {
                wTrim: wTrim,
                hTrim: hTrim,
                wMedia: wMedia,
                hMedia: hMedia,
                mLeft: diffW / 2,
                mRight: diffW / 2,
                mTop: diffH / 2,
                mBottom: diffH / 2
            };
        } finally {
            tempDoc.close(SaveOptions.NO);
        }
    }

    function run() {
        var folder = Folder.selectDialog("Select folder containing PDF pages");
        if (!folder) return;

        var rawFiles = folder.getFiles(function (f) {
            return f instanceof File && f.name.toLowerCase().match(/\.pdf$/);
        });

        if (!rawFiles || rawFiles.length === 0) {
            alert("No PDF files were found in the selected folder.");
            return;
        }

        rawFiles.sort(function (a, b) {
            var numA = extractPageNumber(a.name);
            var numB = extractPageNumber(b.name);
            if (numA !== null && numB !== null) {
                return numA - numB;
            }
            return a.name.localeCompare(b.name);
        });

        var originalCount = rawFiles.length;
        var paddedCount = Math.ceil(originalCount / 4) * 4;
        var paddedFiles = [];
        for (var i = 0; i < rawFiles.length; i++) {
            paddedFiles.push(rawFiles[i]);
        }
        while (paddedFiles.length < paddedCount) {
            paddedFiles.push(null);
        }

        var dimensions = parsePdfBoxes(rawFiles[0]);
        if (!dimensions || dimensions.wTrim <= 0 || dimensions.hTrim <= 0) {
            dimensions = probePdfDimensionsWithDoc(rawFiles[0]);
        }

        var wTrim = dimensions.wTrim;
        var hTrim = dimensions.hTrim;
        var wMedia = dimensions.wMedia;
        var hMedia = dimensions.hMedia;
        var mLeft = dimensions.mLeft;
        var mRight = dimensions.mRight;

        var docWidth = mLeft + (2 * wTrim) + mRight;
        var docHeight = hMedia;
        var xSpine = mLeft + wTrim;
        var docPageCount = paddedCount / 2;

        var doc = app.documents.add();
        doc.viewPreferences.horizontalMeasurementUnits = userDefaultHUnits;
        doc.viewPreferences.verticalMeasurementUnits = userDefaultVUnits;

        doc.documentPreferences.facingPages = false;
        doc.documentPreferences.pageWidth = docWidth;
        doc.documentPreferences.pageHeight = docHeight;

        try {
            doc.marginPreferences.top = 0;
            doc.marginPreferences.left = 0;
            doc.marginPreferences.bottom = 0;
            doc.marginPreferences.right = 0;
        } catch (_) {}

        while (doc.pages.length < docPageCount) {
            doc.pages.add();
        }

        app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;

        for (var sheetIdx = 1; sheetIdx <= docPageCount; sheetIdx++) {
            var page = doc.pages[sheetIdx - 1];

            var leftPageNum, rightPageNum;
            if (sheetIdx % 2 === 1) {
                leftPageNum = paddedCount - sheetIdx + 1;
                rightPageNum = sheetIdx;
            } else {
                leftPageNum = sheetIdx;
                rightPageNum = paddedCount - sheetIdx + 1;
            }

            var leftFile = paddedFiles[leftPageNum - 1];
            var rightFile = paddedFiles[rightPageNum - 1];

            // 1. Left Page
            if (leftFile) {
                var leftRect = page.rectangles.add();
                leftRect.strokeWeight = 0;
                try {
                    var noneSwatch = doc.swatches.itemByName("[None]") || doc.swatches.itemByName("None");
                    if (noneSwatch && noneSwatch.isValid) {
                        leftRect.fillColor = noneSwatch;
                        leftRect.strokeColor = noneSwatch;
                    }
                } catch (_) {}
                leftRect.geometricBounds = [0, 0, docHeight, xSpine];
                leftRect.place(leftFile);
                if (leftRect.graphics.length > 0) {
                    leftRect.graphics[0].geometricBounds = [0, 0, docHeight, wMedia];
                }
            }

            // 2. Right Page
            if (rightFile) {
                var rightRect = page.rectangles.add();
                rightRect.strokeWeight = 0;
                try {
                    var noneSwatch = doc.swatches.itemByName("[None]") || doc.swatches.itemByName("None");
                    if (noneSwatch && noneSwatch.isValid) {
                        rightRect.fillColor = noneSwatch;
                        rightRect.strokeColor = noneSwatch;
                    }
                } catch (_) {}
                rightRect.geometricBounds = [0, xSpine, docHeight, docWidth];
                rightRect.place(rightFile);
                if (rightRect.graphics.length > 0) {
                    rightRect.graphics[0].geometricBounds = [0, wTrim, docHeight, docWidth];
                }
            }
        }

        var padMsg = paddedCount > originalCount
            ? " (" + (paddedCount - originalCount) + " blank pages added to complete signature)"
            : "";

        alert(
            "Imposition Complete!\n\n" +
            "• Source PDFs: " + originalCount + padMsg + "\n" +
            "• Imposed Pages: " + docPageCount + "\n" +
            "• Trim Size: " + wTrim.toFixed(2) + " pt × " + hTrim.toFixed(2) + " pt\n" +
            "• Sheet Size: " + docWidth.toFixed(2) + " pt × " + docHeight.toFixed(2) + " pt"
        );
    }

    try {
        app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
        run();
    } catch (err) {
        alert("Error executing script:\n" + (err.message || err));
    } finally {
        app.scriptPreferences.measurementUnit = origScriptUnit;
    }
})();
