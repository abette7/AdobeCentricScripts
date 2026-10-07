/**
 * BookletImposition.jsx
 * Adobe InDesign ExtendScript (Classic Scripting Engine)
 *
 * Compatible with ALL versions of InDesign (CS4 through CC 2025).
 * Automatically creates a 2-up saddle-stitch booklet imposition document
 * from multiple single-page PDF files or a single multi-page PDF file
 * based on their TrimBox and MediaBox dimensions.
 */

#target indesign

(function () {
    // ES3 compatibility polyfills for ExtendScript
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    // Capture user's InDesign default measurement unit preferences
    var userDefaultHUnits = app.viewPreferences.horizontalMeasurementUnits;
    var userDefaultVUnits = app.viewPreferences.verticalMeasurementUnits;
    var origScriptUnit = app.scriptPreferences.measurementUnit;
    var origPdfCrop = app.pdfPlacePreferences.pdfCrop;
    var origPdfPageNumber = app.pdfPlacePreferences.pageNumber;

    /**
     * Decodes URL-encoded characters (such as %20 for spaces) from File/Folder names or strings.
     */
    function decodeName(item) {
        if (!item) return "";
        var name = (typeof item === "string") ? item : (item.name || "");
        try {
            if (typeof File !== "undefined" && File.decode) {
                return File.decode(name);
            }
        } catch (_) {}
        try {
            return decodeURI(name);
        } catch (_) {}
        return name.replace(/%20/g, " ");
    }

    /**
     * Converts a measurement in points to the user's InDesign measurement unit and formats it.
     */
    function formatDimension(points, unitEnum) {
        var unitStr = "pt";
        var factor = 1;

        try {
            if (typeof MeasurementUnits !== "undefined") {
                if (unitEnum === MeasurementUnits.MILLIMETERS) {
                    unitStr = "mm";
                    factor = 72 / 25.4;
                } else if (unitEnum === MeasurementUnits.INCHES || (MeasurementUnits.INCHES_DECIMAL && unitEnum === MeasurementUnits.INCHES_DECIMAL)) {
                    unitStr = "in";
                    factor = 72;
                } else if (unitEnum === MeasurementUnits.CENTIMETERS) {
                    unitStr = "cm";
                    factor = 72 / 2.54;
                } else if (unitEnum === MeasurementUnits.PICAS) {
                    unitStr = "p";
                    factor = 12;
                } else if (unitEnum === MeasurementUnits.POINTS) {
                    unitStr = "pt";
                    factor = 1;
                } else if (unitEnum === MeasurementUnits.PIXELS) {
                    unitStr = "px";
                    factor = 1;
                } else if (unitEnum === MeasurementUnits.CICEROS) {
                    unitStr = "c";
                    factor = 12.7872;
                } else if (unitEnum === MeasurementUnits.AGATES) {
                    unitStr = "ag";
                    factor = 5.142857;
                }
            }
        } catch (_) {}

        var converted = null;
        try {
            if (typeof UnitValue !== "undefined") {
                var uv = new UnitValue(points, "pt");
                var val = uv.as(unitStr);
                if (!isNaN(val) && typeof val === "number") {
                    converted = val;
                }
            }
        } catch (_) {}

        if (converted === null) {
            converted = points / factor;
        }

        var decimals = (unitStr === "in") ? 3 : 2;
        return converted.toFixed(decimals) + " " + unitStr;
    }

    /**
     * Extracts a page number from a filename if available.
     * Examples: 'p1.pdf', 'page-02.pdf', 'doc_03.pdf', '004.pdf'
     */
    function extractPageNumber(filename) {
        var cleanName = decodeName(filename);
        var prefixMatch = cleanName.match(/(?:p|page)[-_ ]?(\d+)/i);
        if (prefixMatch) {
            return parseInt(prefixMatch[1], 10);
        }
        var suffixMatch = cleanName.match(/(\d+)(?=[^\d]*\.pdf$)/i);
        if (suffixMatch) {
            return parseInt(suffixMatch[1], 10);
        }
        return null;
    }

    /**
     * Strips common page number descriptors from a single-page PDF filename.
     * Examples:
     *   'Booklet_Page_01.pdf' -> 'Booklet'
     *   'Catalog_p01.pdf'     -> 'Catalog'
     *   'Brochure-01.pdf'     -> 'Brochure'
     *   'Magazine_pg_12.pdf'  -> 'Magazine'
     *   '01_Flyer.pdf'        -> 'Flyer'
     *   'Annual_2025_p01.pdf' -> 'Annual_2025'
     */
    function stripPageDescriptors(name) {
        if (!name) return "";
        var s = decodeName(name).replace(/\.pdf$/i, "");

        // If the entire name is just a page descriptor or number, return empty for fallback
        if (/^\s*(?:(?:page|pg|p|part|pt)[-_ .]*)?\d+(?:[-_ .]*of[-_ .]*\d+)?\s*$/i.test(s)) {
            return "";
        }

        var stripped = false;

        // 1. Trailing "page X of Y" or "X of Y"
        var m = s.replace(/[-_ .]+(?:page|pg|p)[-_ .]*\d+[-_ .]+of[-_ .]+\d+$/i, "");
        if (m !== s) { s = m; stripped = true; }
        if (!stripped) {
            m = s.replace(/[-_ .]+\d+[-_ .]+of[-_ .]+\d+$/i, "");
            if (m !== s) { s = m; stripped = true; }
        }

        // 2. Trailing explicit page descriptor keyword (page, pg, p, part, pt) followed by number
        if (!stripped) {
            m = s.replace(/[-_ .]+(?:page|pg|p|part|pt)[-_ .]*\d+$/i, "");
            if (m !== s) { s = m; stripped = true; }
        }

        // 3. Trailing page keyword attached directly to word without separator: e.g. "DocPage01", "DocP01"
        if (!stripped) {
            m = s.replace(/(?:page|pg|p)\d+$/i, "");
            if (m !== s) { s = m; stripped = true; }
        }

        // 4. Trailing separator + number: e.g. "Doc_01", "Doc-001", "Doc 1"
        if (!stripped) {
            m = s.replace(/[-_ .]+\d+$/i, "");
            if (m !== s) { s = m; stripped = true; }
        }

        // 5. Trailing standalone page keyword preceded by separator (e.g. ".p", "_p", "-page", ".pg")
        s = s.replace(/[-_ .]+(?:page|pg|p|part|pt)$/i, "");

        // 6. Leading page descriptor at start: e.g. "01_Doc", "Page 1 - Doc", "p01_Doc"
        s = s.replace(/^(?:(?:page|pg|p|part|pt)[-_ .]*)?\d+[-_ .]+/i, "");

        // 7. Clean up leading/trailing separators and whitespace
        s = s.replace(/^[\s-_ .]+|[\s-_ .]+$/g, "");

        if (/^\s*(?:page|pg|p|part|pt|\d+)\s*$/i.test(s)) {
            return "";
        }

        return s;
    }

    /**
     * Derives the base document name from the selected PDF file(s).
     * For multi-page PDFs: uses the PDF filename (without .pdf).
     * For single-page PDFs: removes page number descriptors, falling back to parent folder if needed.
     */
    function deriveBaseDocName(rawFiles, mode) {
        if (!rawFiles || rawFiles.length === 0) return "Booklet_Imposition";

        if (mode === "multi") {
            var name = decodeName(rawFiles[0]).replace(/\.pdf$/i, "");
            name = name.replace(/[\/\\:*?"<>|]/g, "_").replace(/^[\s-_ .]+|[\s-_ .]+$/g, "");
            return name || "Booklet_Imposition";
        }

        // Single-page mode
        var docName = "";

        // If multiple files, inspect common prefix first (e.g. 'Booklet01' and 'Booklet02')
        if (rawFiles.length > 1) {
            var prefix = decodeName(rawFiles[0]).replace(/\.pdf$/i, "");
            for (var i = 1; i < rawFiles.length; i++) {
                var cur = decodeName(rawFiles[i]).replace(/\.pdf$/i, "");
                while (cur.indexOf(prefix) !== 0 && prefix.length > 0) {
                    prefix = prefix.substring(0, prefix.length - 1);
                }
                if (!prefix) break;
            }
            if (prefix) {
                var cleanPrefix = prefix.replace(/\d+$/, "").replace(/[-_ .]+$/, "");
                cleanPrefix = cleanPrefix.replace(/[-_ .]+(?:page|pg|p|part|pt)$/i, "").replace(/[-_ .]+$/, "");
                docName = stripPageDescriptors(cleanPrefix);
            }
        }

        if (!docName) {
            docName = stripPageDescriptors(decodeName(rawFiles[0]));
        }

        if (!docName && rawFiles.length > 1) {
            docName = stripPageDescriptors(decodeName(rawFiles[1]));
        }

        if (!docName && rawFiles[0].parent) {
            try {
                var parentName = decodeName(rawFiles[0].parent);
                if (parentName && parentName !== "/" && parentName !== ".") {
                    docName = parentName;
                }
            } catch (_) {}
        }

        if (!docName) {
            docName = "Booklet_Imposition";
        }

        docName = docName.replace(/[\/\\:*?"<>|]/g, "_").replace(/^[\s-_ .]+|[\s-_ .]+$/g, "");
        return docName || "Booklet_Imposition";
    }

    /**
     * Natural comparison for file sorting.
     */
    function naturalCompareFiles(a, b) {
        var strA = decodeName(a);
        var strB = decodeName(b);
        var numA = extractPageNumber(strA);
        var numB = extractPageNumber(strB);
        if (numA !== null && numB !== null) {
            if (numA !== numB) return numA - numB;
        }

        var ax = [], bx = [];
        strA.replace(/(\d+)|(\D+)/g, function (_, d, s) {
            ax.push({ num: d !== undefined ? parseInt(d, 10) : null, str: s || "" });
        });
        strB.replace(/(\d+)|(\D+)/g, function (_, d, s) {
            bx.push({ num: d !== undefined ? parseInt(d, 10) : null, str: s || "" });
        });

        while (ax.length > 0 && bx.length > 0) {
            var partA = ax.shift();
            var partB = bx.shift();
            if (partA.num !== null && partB.num !== null) {
                if (partA.num !== partB.num) return partA.num - partB.num;
            } else {
                var strA = partA.str.toLowerCase();
                var strB = partB.str.toLowerCase();
                var cmp = strA.localeCompare(strB);
                if (cmp !== 0) return cmp;
            }
        }
        return ax.length - bx.length;
    }

    /**
     * Fast parser for MediaBox and TrimBox in PDF header text.
     */
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

            if (wTrim > 0 && hTrim > 0 && wMedia > 0 && hMedia > 0 && wTrim <= wMedia && hTrim <= hMedia) {
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
        } catch (_) {
            return null;
        }
    }

    /**
     * Fallback probe for PDF dimensions using temporary InDesign page.
     */
    function measurePdfDimensions(file, pageNumber, page) {
        var prevCrop = app.pdfPlacePreferences.pdfCrop;
        var prevPage = app.pdfPlacePreferences.pageNumber;

        try {
            app.pdfPlacePreferences.pageNumber = pageNumber || 1;

            // 1. Measure Trim
            app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_TRIM;
            var placedTrim = page.place(file, [0, 0])[0];
            var trimBounds = placedTrim.geometricBounds;
            var wTrim = trimBounds[3] - trimBounds[1];
            var hTrim = trimBounds[2] - trimBounds[0];
            try { placedTrim.parent.remove(); } catch (_) {}

            // 2. Measure Media
            app.pdfPlacePreferences.pageNumber = pageNumber || 1;
            app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;
            var placedMedia = page.place(file, [0, 0])[0];
            var mediaBounds = placedMedia.geometricBounds;
            var wMedia = mediaBounds[3] - mediaBounds[1];
            var hMedia = mediaBounds[2] - mediaBounds[0];
            try { placedMedia.parent.remove(); } catch (_) {}

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
            app.pdfPlacePreferences.pdfCrop = prevCrop;
            app.pdfPlacePreferences.pageNumber = prevPage;
        }
    }

    /**
     * Determines the number of pages in a PDF file using exponential steps and binary search.
     * When requested page exceeds total page count, InDesign wraps to page 1.
     */
    function countPdfPages(file, tempRect) {
        var prevPage = app.pdfPlacePreferences.pageNumber;
        try {
            // Check page 1
            app.pdfPlacePreferences.pageNumber = 1;
            var placed = tempRect.place(file)[0];
            if (!placed || !placed.pdfAttributes || placed.pdfAttributes.pageNumber !== 1) {
                return 1;
            }

            // Exponential search for upper bound
            var low = 1;
            var step = 1;
            var high = 1;

            while (true) {
                var testPage = low + step;
                app.pdfPlacePreferences.pageNumber = testPage;
                var testPlaced = tempRect.place(file)[0];
                if (testPlaced && testPlaced.pdfAttributes && testPlaced.pdfAttributes.pageNumber === testPage) {
                    low = testPage;
                    step *= 2;
                } else {
                    high = testPage - 1;
                    break;
                }
            }

            // Binary search in (low + 1) .. high
            var pageCount = low;
            var bLow = low + 1;
            var bHigh = high;

            while (bLow <= bHigh) {
                var mid = Math.floor((bLow + bHigh) / 2);
                app.pdfPlacePreferences.pageNumber = mid;
                var midPlaced = tempRect.place(file)[0];
                if (midPlaced && midPlaced.pdfAttributes && midPlaced.pdfAttributes.pageNumber === mid) {
                    pageCount = mid;
                    bLow = mid + 1;
                } else {
                    bHigh = mid - 1;
                }
            }

            return pageCount;
        } catch (_) {
            return 1;
        } finally {
            app.pdfPlacePreferences.pageNumber = prevPage;
        }
    }

    /**
     * Reliably retrieves the built-in [None] swatch across different InDesign versions and locales.
     */
    function getNoneSwatch(doc) {
        try {
            var s1 = doc.swatches.itemByName("None");
            if (s1 && s1.isValid) return s1;
        } catch (_) {}

        try {
            var s2 = doc.swatches.itemByName("[None]");
            if (s2 && s2.isValid) return s2;
        } catch (_) {}

        try {
            var s3 = doc.swatches.itemByName("$ID/None");
            if (s3 && s3.isValid) return s3;
        } catch (_) {}

        try {
            var s0 = doc.swatches.item(0);
            if (s0 && s0.isValid) return s0;
        } catch (_) {}

        return null;
    }

    /**
     * Clears all strokes and fills from a frame to ensure no accidental borders appear around placed pages.
     */
    function clearFrameStroke(frame, doc) {
        if (!frame || !frame.isValid) return;

        var noneSwatch = getNoneSwatch(doc);

        // Apply [None] object style if available to override default graphic frame styles
        try {
            var noneStyle = doc.objectStyles.itemByName("[None]");
            if (noneStyle && noneStyle.isValid) {
                frame.applyObjectStyle(noneStyle, false);
            } else {
                var firstStyle = doc.objectStyles.item(0);
                if (firstStyle && firstStyle.isValid && /None/i.test(firstStyle.name)) {
                    frame.applyObjectStyle(firstStyle, false);
                }
            }
        } catch (_) {}

        try {
            frame.strokeWeight = 0;
        } catch (_) {}

        if (noneSwatch && noneSwatch.isValid) {
            try { frame.strokeColor = noneSwatch; } catch (_) {}
            try { frame.fillColor = noneSwatch; } catch (_) {}
        }

        try {
            frame.strokeWeight = 0;
            frame.strokeTint = -1;
        } catch (_) {}
    }

    /**
     * Shows initial prompt allowing user to choose between selecting single-page PDF files or a multi-page PDF.
     */
    function promptSourceSelection() {
        var dialog = new Window("dialog", "Booklet Imposition");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 15;
        dialog.margins = 20;

        var headerGroup = dialog.add("group");
        headerGroup.orientation = "column";
        headerGroup.alignChildren = ["left", "top"];
        headerGroup.spacing = 4;
        var titleText = headerGroup.add("statictext", undefined, "Select PDF Source");
        try {
            titleText.graphics.font = ScriptUI.newFont("dialog", "bold", 13);
        } catch (_) {}
        headerGroup.add("statictext", undefined, "Choose how you want to select your PDF pages for imposition:");

        var panel = dialog.add("panel");
        panel.orientation = "column";
        panel.alignChildren = ["left", "top"];
        panel.spacing = 12;
        panel.margins = 15;

        var rbSingle = panel.add("radiobutton", undefined, "Select single-page PDF files");
        var rbMulti = panel.add("radiobutton", undefined, "Select a multi-page PDF");
        rbSingle.value = true;

        var btnGroup = dialog.add("group");
        btnGroup.alignment = ["right", "bottom"];
        btnGroup.spacing = 10;
        btnGroup.add("button", undefined, "Cancel", { name: "cancel" });
        var btnOk = btnGroup.add("button", undefined, "Continue...", { name: "ok" });
        btnOk.active = true;

        if (dialog.show() !== 1) {
            return null;
        }

        return rbSingle.value ? "single" : "multi";
    }

    /**
     * Cross-platform file picker for selecting multiple single-page PDF files.
     */
    function selectSinglePagePdfs() {
        var winFilter = "PDF Files:*.pdf;All Files:*.*";
        var macRegex = /\.pdf$/i;
        var filter;

        if ($.os.indexOf("Windows") > -1) {
            filter = winFilter;
        } else {
            filter = function (item) {
                if (item instanceof Folder) return true;
                return macRegex.test(item.name);
            };
        }

        var result = File.openDialog("Select single-page PDF files to impose", filter, true);
        if (!result) return null;

        var files = (result instanceof Array) ? result : [result];
        var validFiles = [];
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof File && /\.pdf$/i.test(files[i].name)) {
                validFiles.push(files[i]);
            }
        }

        if (validFiles.length === 0) {
            alert("No valid PDF files were selected.");
            return null;
        }

        return validFiles;
    }

    /**
     * Cross-platform file picker for selecting a single multi-page PDF file.
     */
    function selectMultiPagePdf() {
        var winFilter = "PDF Files:*.pdf;All Files:*.*";
        var macRegex = /\.pdf$/i;
        var filter;

        if ($.os.indexOf("Windows") > -1) {
            filter = winFilter;
        } else {
            filter = function (item) {
                if (item instanceof Folder) return true;
                return macRegex.test(item.name);
            };
        }

        var result = File.openDialog("Select a multi-page PDF file to impose", filter, false);
        if (!result) return null;

        var file = (result instanceof Array) ? result[0] : result;
        if (!file || !(file instanceof File) || !/\.pdf$/i.test(file.name)) {
            alert("No valid PDF file was selected.");
            return null;
        }

        return [file];
    }

    /**
     * Prompts the user with a Save As dialog pre-filled with the clean document name plus '_bookImpo'.
     * If confirmed, saves the document to set the InDesign document tab name.
     * If cancelled, document remains active and unsaved (Untitled).
     */
    function promptSaveDocument(doc, defaultFolder, defaultDocName) {
        var baseName = /_bookImpo$/i.test(defaultDocName) ? defaultDocName : (defaultDocName + "_bookImpo");
        var saveName = baseName + ".indd";
        var defaultFile = null;

        try {
            if (defaultFolder && defaultFolder.exists) {
                defaultFile = new File(defaultFolder.fsName + "/" + saveName);
            } else {
                defaultFile = new File(saveName);
            }
        } catch (_) {
            defaultFile = new File(saveName);
        }

        var filter = ($.os.indexOf("Windows") > -1) ? "InDesign Document:*.indd;All Files:*.*" : null;
        var saveTarget = defaultFile.saveDlg("Save InDesign Document", filter);

        if (saveTarget) {
            // Ensure .indd extension if omitted by user
            if (!/\.indd$/i.test(saveTarget.name)) {
                saveTarget = new File(saveTarget.fsName + ".indd");
            }
            try {
                doc.save(saveTarget);
            } catch (e) {
                alert("Could not save document:\n" + (e.message || e));
            }
        }
    }

    function run() {
        var mode = promptSourceSelection();
        if (!mode) return;

        var rawFiles = (mode === "single") ? selectSinglePagePdfs() : selectMultiPagePdf();
        if (!rawFiles || rawFiles.length === 0) return;

        // Sort single-page files naturally by filename or page number
        if (mode === "single") {
            rawFiles.sort(naturalCompareFiles);
        }

        // Analyze page count and dimensions using a single background temporary document
        var sourcePages = [];
        var dimensions = null;

        var tempDoc = app.documents.add(false);
        try {
            tempDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
            tempDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

            if (mode === "single") {
                for (var f = 0; f < rawFiles.length; f++) {
                    sourcePages.push({ file: rawFiles[f], pageNumber: 1 });
                }
            } else {
                var tempRect = tempDoc.pages[0].rectangles.add();
                var multiFile = rawFiles[0];
                var pageCount = countPdfPages(multiFile, tempRect);
                for (var p = 1; p <= pageCount; p++) {
                    sourcePages.push({ file: multiFile, pageNumber: p });
                }
            }

            if (sourcePages.length > 0) {
                dimensions = parsePdfBoxes(sourcePages[0].file);
                if (!dimensions || dimensions.wTrim <= 0 || dimensions.hTrim <= 0) {
                    dimensions = measurePdfDimensions(sourcePages[0].file, sourcePages[0].pageNumber, tempDoc.pages[0]);
                }
            }
        } finally {
            tempDoc.close(SaveOptions.NO);
        }

        if (sourcePages.length === 0) {
            alert("No pages could be extracted from the selected PDF" + (mode === "single" ? "s" : "") + ".");
            return;
        }

        if (!dimensions || dimensions.wTrim <= 0 || dimensions.hTrim <= 0) {
            alert("Could not determine the dimensions of the selected PDF" + (mode === "single" ? "s" : "") + ".");
            return;
        }

        var originalCount = sourcePages.length;
        var paddedCount = Math.ceil(originalCount / 4) * 4;
        var paddedPages = [];
        for (var i = 0; i < sourcePages.length; i++) {
            paddedPages.push(sourcePages[i]);
        }
        while (paddedPages.length < paddedCount) {
            paddedPages.push(null);
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

        var docName = deriveBaseDocName(rawFiles, mode);
        var impoDocName = /_bookImpo$/i.test(docName) ? docName : (docName + "_bookImpo");

        var doc = app.documents.add();
        doc.viewPreferences.horizontalMeasurementUnits = userDefaultHUnits;
        doc.viewPreferences.verticalMeasurementUnits = userDefaultVUnits;

        try {
            doc.metadataPreferences.documentTitle = impoDocName;
        } catch (_) {}

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

        try {
            for (var p = 0; p < doc.pages.length; p++) {
                doc.pages[p].marginPreferences.top = 0;
                doc.pages[p].marginPreferences.left = 0;
                doc.pages[p].marginPreferences.bottom = 0;
                doc.pages[p].marginPreferences.right = 0;
            }
        } catch (_) {}

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

            var leftItem = paddedPages[leftPageNum - 1];
            var rightItem = paddedPages[rightPageNum - 1];

            // 1. Left Page
            if (leftItem) {
                app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;
                app.pdfPlacePreferences.pageNumber = leftItem.pageNumber;

                var leftRect = page.rectangles.add();
                clearFrameStroke(leftRect, doc);
                leftRect.geometricBounds = [0, 0, docHeight, xSpine];
                leftRect.place(leftItem.file);
                clearFrameStroke(leftRect, doc);

                if (leftRect.graphics.length > 0) {
                    leftRect.graphics[0].geometricBounds = [0, 0, docHeight, wMedia];
                }
            }

            // 2. Right Page
            if (rightItem) {
                app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;
                app.pdfPlacePreferences.pageNumber = rightItem.pageNumber;

                var rightRect = page.rectangles.add();
                clearFrameStroke(rightRect, doc);
                rightRect.geometricBounds = [0, xSpine, docHeight, docWidth];
                rightRect.place(rightItem.file);
                clearFrameStroke(rightRect, doc);

                if (rightRect.graphics.length > 0) {
                    var xRightGraphic = xSpine - mLeft;
                    rightRect.graphics[0].geometricBounds = [0, xRightGraphic, docHeight, xRightGraphic + wMedia];
                }
            }
        }

        // Prompt user to save the document with the clean default name pre-filled
        var sourceFolder = (rawFiles.length > 0 && rawFiles[0].parent) ? rawFiles[0].parent : null;
        promptSaveDocument(doc, sourceFolder, impoDocName);

        var padMsg = paddedCount > originalCount
            ? " (" + (paddedCount - originalCount) + " blank pages added to complete signature)"
            : "";

        var sourceMsg;
        if (mode === "multi") {
            sourceMsg = "1 multi-page PDF (" + originalCount + (originalCount === 1 ? " page)" : " pages)");
        } else {
            sourceMsg = originalCount === 1
                ? "1 single-page PDF file"
                : originalCount + " single-page PDF files";
        }

        var docDisplay = doc.saved ? decodeName(doc) : (impoDocName + " (Unsaved)");

        alert(
            "Imposition Complete!\n\n" +
            "- Document: " + docDisplay + "\n" +
            "- Source: " + sourceMsg + padMsg + "\n" +
            "- Imposed Sheets: " + docPageCount + " (" + paddedCount + " booklet pages)\n" +
            "- Trim Size: " + formatDimension(wTrim, userDefaultHUnits) + " x " + formatDimension(hTrim, userDefaultVUnits) + "\n" +
            "- Sheet Size: " + formatDimension(docWidth, userDefaultHUnits) + " x " + formatDimension(docHeight, userDefaultVUnits)
        );
    }

    try {
        app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
        run();
    } catch (err) {
        alert("Error executing script:\n" + (err.message || err));
    } finally {
        app.scriptPreferences.measurementUnit = origScriptUnit;
        try { app.pdfPlacePreferences.pdfCrop = origPdfCrop; } catch (_) {}
        try { app.pdfPlacePreferences.pageNumber = origPdfPageNumber; } catch (_) {}
    }
})();
