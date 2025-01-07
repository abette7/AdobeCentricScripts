-- Ask for files on run
on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run
-- Dropped files will start on open

on open theItems
	-- If previous CSV exists then clear contents
	tell application "Finder"
		set checkCSV to container of (first item of theItems) as alias
		set checkPath to (the POSIX path of checkCSV)
		if (exists file "list.csv" of checkCSV) is true then
			set clearCSV to "echo @Image,Name > " & "'" & checkPath & "'" & "list.csv"
			do shell script clearCSV
		end if
	end tell
	
	-- repeat loop for files
	repeat with anItem in theItems
		-- get paths and file names
		try
			tell application "Finder"
				set uPath to (the POSIX path of anItem)
				set filePath to anItem as alias
				set fileName to name of file anItem as string
				set openName to filePath as string
				set aPath to container of anItem
				set bPath to aPath as string
				set vPath to (the POSIX path of bPath)
			end tell
		end try
		-- Clean up file names
		tell application "System Events" to set fileExtension to name extension of anItem as string
		tell application "Finder" to set baseName to name of anItem
		tell application "Finder" to set baseName to text 1 thru -((count fileExtension) + 2) of baseName
		-- Create CSV if needed and add entries 
		tell application "Finder"
			if (exists file "list.csv" of aPath) is not true then
				set createCSV to "echo @Image,Name > " & "'" & vPath & "'" & "list.csv"
				do shell script createCSV
			end if
			set addCSVentry to "echo " & "'" & uPath & "," & baseName & "'" & " >> '" & vPath & "list.csv'"
			do shell script addCSVentry
		end tell
	end repeat
	
	--set path to list.csv for indesign
	
	tell application "Finder"
		set myCSVpath to aPath as string
		set myCSVholder to myCSVpath & "list.csv"
		set myCSV to myCSVholder as alias
		
	end tell
	
	--build document
	
	tell application id "com.adobe.indesign"
		make new document with properties {document preferences:{page width:"43in", page height:"12in"}}
		
		--setup and set source file for data merge
		set myDataMerge to data merge 1 of document 1
		select data source of myDataMerge data source file myCSV
		--draw image and text frames		
		tell page 1 of document 1
			
			set myDataMergeProperties to properties
			set rect1 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"0.5in", "0.5in", "11.2847in", "9.2847in"}}
			--fit rect1 given proportionally
			--set absolute rotation angle of rect1 to 90
			--set rect2 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"3.28in", "0.5in", "3.5in", "3.25in"}}
			
		end tell
		
		--set placeholders for datamerge (place holder page item attaches them to image and text frames previously created)
		--set myStory to parent story of rect2
		--set properties of myStory to {justification:center align, vertical alignment:center align}
		tell document 1
			set myImagePlaceholder to make new data merge image placeholder with properties {field:(data merge field 1 of myDataMerge), placeholder page item:rect1, parent:document 1}
			--set myTextPlaceholder to make new data merge text placeholder with properties {field:(data merge field 2 of myDataMerge), placeholder page item:rect2, parent:document 1, parent story:myStory, story offset:-2}
			--set merge prefs and merge data			
			tell data merge preferences of myDataMerge
				set records per page to multiple record
				set arrange by to rows first
				set column spacing to "-.375in"
				set row spacing to "0in"
				set left margin to "0in"
				set top margin to ".25in"
			end tell
			merge records myDataMerge
		end tell
		--export pdf and save indd		
		set pdfname to POSIX path of (myCSVpath & "list.pdf")
		set inddName to POSIX path of (myCSVpath & "list.indd")
		set thePref to PDF export preset "Press No Marks"
		tell active document
			export format PDF type to pdfname using thePref without showing options
		end tell
		save document 1 to inddName
		--close docs
		close active document saving no
		close active document saving no
		activate application id "com.adobe.indesign"
		display dialog "Contact Sheets Generated"
	end tell
	
end open


