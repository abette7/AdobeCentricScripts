on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run
-- Dropped files will start on open

on open theItems
	repeat with i from 1 to number of items in theItems
		tell application id "com.adobe.indesign"
			make new document with properties {document preferences:{page width:"8in", page height:"10in", facing pages:false}}
			set transform reference point of layout window 1 to center anchor
			tell document preferences of active document
				set document bleed bottom offset to ".125in"
				set document bleed top offset to ".125in"
				set document bleed inside or left offset to ".125in"
				set document bleed outside or right offset to ".125in"
				set slug bottom offset to ".5in"
				set slug top offset to ".5in"
				set slug inside or left offset to ".5in"
				set slug right or outside offset to ".5in"
			end tell
			
			--repeat with i from 1 to number of items in theItems
			--if i - 1 is greater than 0 then tell document 1 to make new page
			tell page 1 of document 1
				set rect1 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"0in", "0in", "10in", "8in"}}
				tell rect1 to set fill color to "None"
				tell rect1 to set stroke color to "None"
				set rect2 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"-.25in", ".125in", "0in", "1.75in"}}
				tell rect2 to set stroke color to "None"
				tell rect2 to set fill color to "None"
				place item i of theItems on rect1
				tell rect1 to set {ITb, ILb, IBb, IRb} to item 1's graphic 1's geometric bounds
				set ImageHeight to (IBb - ITb) -- Height of image
				set ImageWidth to (IRb - ILb) -- Width of image			
				--if ImageWidth is greater than ImageHeight then
				--set absolute rotation angle of graphic 1 of item 1 of rect1 to 90
				--	tell application id "com.adobe.indesign"
				--		set page width of document preferences of active document to "10in"
				--		set page height of document preferences of active document to "8in"
				--		tell page 1 of document 1
				--			set geometric bounds of rect1 to {0, 0, 8, 10}
				--			set geometric bounds of rect2 to {-0.25, 0.125, 0, 1.75}
				--		end tell
				--	end tell
				--end if
				--fit rect1 given proportionally
				tell application "System Events" to set FileName to name of item i of theItems
				set oldDelimiters to AppleScript's text item delimiters
				set AppleScript's text item delimiters to "."
				set myName to text item 1 of FileName
				set AppleScript's text item delimiters to oldDelimiters
				set contents of rect2 to myName
				--set rect2Story to parent story of rect2
				--set properties of rect2Story to {stroke weight:"1", stroke color:"White"}
				set justification of every line of rect2 to right align
				--set stroke color of every character of rect2 to "Black"
				set fill color of every character of rect2 to "Black"
			end tell
			--end repeat
			
			
			tell application "Finder" to set savePath to container of item i of theItems as string
			set myDate to do shell script "date +%Y%m%d%H%M"
			
			set oldDelimiters to AppleScript's text item delimiters
			set AppleScript's text item delimiters to "."
			set fileNameBase to text item 1 of FileName
			set AppleScript's text item delimiters to oldDelimiters
			
			set pdfname to the POSIX path of (savePath & fileNameBase & ".pdf")
			set inddName to the POSIX path of (savePath & fileNameBase & ".indd")
			--display dialog pdfname
			set thePref to PDF export preset "Press with Marks"
			--tell thePref
			--	set PDF destination profile to "use no profile"
			--	set crop marks to true
			--end tell
			tell active document
				export format PDF type to pdfname using thePref without showing options
				
			end tell
			--display dialog inddName as string
			save active document to inddName
			close active document saving no
			--activate application id "com.adobe.indesign"
			--display dialog "Contact Sheets Generated"
		end tell
	end repeat
end open
