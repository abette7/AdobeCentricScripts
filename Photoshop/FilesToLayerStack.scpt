on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run

on open theItems
	tell application "System Events"
		set myName to name of item 1 of theItems as string
		set myPath to path of item 1 of theItems as string
		tell application "Finder"
			set aPath to container of item 1 of theItems
			set bPath to aPath as string
			set oldDelimiters to AppleScript's text item delimiters
			set AppleScript's text item delimiters to "."
			set fileNameBase to text item 1 of myName
			set AppleScript's text item delimiters to oldDelimiters
			
		end tell
	end tell
	--repeat with anItem in theItems
	
	tell application id "com.adobe.photoshop"
		open item 1 of theItems
		--duplicate (layer 1 of document 1) to document 2
		
	end tell
	--	end repeat
	
	repeat with i from 2 to number of items in theItems
		
		tell application "System Events"
			set currentFile to name of item i of theItems
			tell application id "com.adobe.photoshop"
				open item i of theItems
				set current document to document currentFile
				
				
				duplicate (layer 1 of current document) to document myName
				close document currentFile
				
			end tell
		end tell
	end repeat
	
	my renameLayers(myName)
	
	
end open

on renameLayers(myName)
	--display dialog "Hello renameLayers"
	tell application id "com.adobe.photoshop"
		tell document myName to set layerCount to layers count
		repeat with i from 1 to layerCount
			--display dialog i
			tell document myName to set name of layer i to i
		end repeat
    --launch a photoshop action after layers are renamed
		--do action "Build1" from "Set1"
	end tell
	
end renameLayers

