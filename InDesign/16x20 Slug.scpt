--expects a PDF preset set in Adobe InDesign named "Press with Marks"
on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run

on open theItems
	repeat with i from 1 to number of items in theItems
		--Get path and file name
		tell application "Finder" to set myPath to container of item i of theItems as string
		set posixMyPath to POSIX path of myPath as text
		tell application "System Events" to set FileName to name of item i of theItems
		set filenameBase to do shell script "cd " & quoted form of posixMyPath & ";var=" & quoted form of FileName & ";echo ${var%.*}"
		--display dialog filenameBase
		
		tell application id "com.adobe.indesign"
			tell view preferences
				set oldHUnits to horizontal measurement units
				set oldVUnits to vertical measurement units
				set horizontal measurement units to inches
				set vertical measurement units to inches
			end tell
			make new document with properties {document preferences:{page width:"16in", page height:"20in", facing pages:false}}
			set transform reference point of layout window 1 to center anchor
			tell document preferences of active document
				set slug bottom offset to ".625in"
				set slug top offset to "0in"
				set slug inside or left offset to "0in"
				set slug right or outside offset to "0in"
			end tell
			
			tell page 1 of document 1
				set rect1 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"0in", "0in", "20in", "16in"}}
				tell rect1 to set fill color to "None"
				tell rect1 to set stroke color to "None"
				set rect2 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"20in", "0in", "20.625in", "15.75in"}}
				tell rect2 to set stroke color to "None"
				tell rect2 to set fill color to "None"
				place item i of theItems on rect1
				tell rect1 to set {ITb, ILb, IBb, IRb} to item 1's graphic 1's geometric bounds
				set ImageHeight to (IBb - ITb) -- Height of image
				set ImageWidth to (IRb - ILb) -- Width of image			
				if ImageWidth is greater than ImageHeight then
					--set absolute rotation angle of graphic 1 of item 1 of rect1 to 90
					tell application id "com.adobe.indesign"
						set page width of document preferences of active document to "20in"
						set page height of document preferences of active document to "16in"
						tell page 1 of document 1
							set geometric bounds of rect1 to {0, 0, 16, 20}
							set geometric bounds of rect2 to {16, 0, 16.375, 19.75}
						end tell
					end tell
				end if
				fit rect1 given proportionally
				set myName to filenameBase
				set contents of rect2 to myName
				set justification of every line of rect2 to right align
				set fill color of every character of rect2 to "Black"
				set point size of every character of rect2 to 22
			end tell
			
			
			tell application "Finder" to set savePath to myPath
			set myDate to do shell script "date +%Y%m%d%H%M"
			
			
			set pdfname to the POSIX path of (savePath & filenameBase & ".pdf")
			set inddName to the POSIX path of (savePath & filenameBase & ".indd")
			
			set thePref to PDF export preset "Press with Marks"
			tell thePref
				--set PDF destination profile to "use no profile"
				--set crop marks to false
				--set crop marks to true
				--set bleed bottom to ".125in"
				--set bleed top to ".125in"
				--set bleed inside to ".125in"
				--set bleed outside to ".125in"
				--set include slug with PDF to true
				--set include ICC profiles to Include None
			end tell
			tell active document
				export format PDF type to pdfname using thePref without showing options
				
			end tell
			--display dialog inddName as string
			save active document to inddName
			close active document saving no
			tell view preferences
				set horizontal measurement units to oldHUnits
				set vertical measurement units to oldVUnits
			end tell
		end tell
		
	end repeat
end open
