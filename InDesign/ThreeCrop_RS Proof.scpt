on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run

on open theItems
	activate
	--set mytext to "installation: " & the text returned of (display dialog "Installation Method:" default answer "")
	repeat with i from 1 to number of items in theItems
		tell application "Finder" to set myPath to container of item i of theItems as string
		set posixMyPath to POSIX path of myPath as text
		tell application "System Events" to set FileName to name of item i of theItems
		set filenameBase to do shell script "cd " & quoted form of posixMyPath & ";var=" & quoted form of FileName & ";echo ${var%.*}"
		
		tell application id "com.adobe.indesign"
			make new document with properties {document preferences:{page width:"19in", page height:"13in", facing pages:false}}
			set transform reference point of layout window 1 to center anchor
			tell document preferences of active document
				set document bleed bottom offset to ".125in"
				set document bleed top offset to ".125in"
				set document bleed inside or left offset to ".125in"
				set document bleed outside or right offset to ".125in"
				--set slug bottom offset to ".375in"
				--set slug top offset to ".375in"
				--set slug inside or left offset to ".375in"
				--set slug right or outside offset to ".375in"
			end tell
			tell page 1 of document 1
				set rect1 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"0.5 in", "0.5in", "5.5461in", "10.2201in"}}
				tell rect1 to set fill color to "None"
				tell rect1 to set stroke color to "None"
				set rect2 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"5.5461in", "0.5in", "5.92in", "4.52in"}}
				tell rect2 to set stroke color to "None"
				tell rect2 to set fill color to "None"
				
				set rect3 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"6.5in", "2.2313 in", "11.5382 in", "8.48881in"}}
				tell rect3 to set fill color to "None"
				tell rect3 to set stroke color to "None"
				
				set rect4 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"11.5382in", "2.2313in", "11.9121in", "6.2513in"}}
				tell rect4 to set stroke color to "None"
				tell rect4 to set fill color to "None"
				
				set rect5 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"1.25in", "10.5 in", "11.25in", "18.5in"}}
				tell rect5 to set fill color to "None"
				tell rect5 to set stroke color to "None"
				
				set rect6 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"12.125in", "10.5in", "12.5in", "18.5in"}}
				tell rect6 to set stroke color to "None"
				tell rect6 to set fill color to "None"
				
				
				place item i of theItems on rect1
				tell rect1 to set {ITb, ILb, IBb, IRb} to item 1's graphic 1's geometric bounds
				set ImageHeight to (IBb - ITb) -- Height of image
				set ImageWidth to (IRb - ILb) -- Width of image		
				fit rect1 given fill proportionally
				
				place item i of theItems on rect3
				fit rect3 given fill proportionally
				
				place item i of theItems on rect5
				fit rect5 given proportionally
				
				--tell application "System Events" to set FileName to name of item i of theItems
				--set oldDelimiters to AppleScript's text item delimiters
				--set AppleScript's text item delimiters to "."
				set myName to FileName as string
				
				--set AppleScript's text item delimiters to oldDelimiters
				set contents of rect2 to "Retail 2.0 SS Backliner"
				
				set justification of every line of rect2 to left align
				
				set fill color of every character of rect2 to "Black"
				tell paragraph 1 of rect2
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect2 to "10"
				
				set contents of rect4 to "Retail 2.0 SS Backliner w Feat"
				
				set justification of every line of rect4 to left align
				
				set fill color of every character of rect4 to "Black"
				tell paragraph 1 of rect4
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect4 to "10"
				
				set contents of rect6 to myName
				
				set justification of every line of rect6 to right align
				
				set fill color of every character of rect6 to "Black"
				tell paragraph 1 of rect4
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect6 to "14"
				
				set myRectangle to make new rectangle with properties {geometric bounds:{11.06, 0.125, 12.86, 1.925}}
				
				set theQRCodeText to myName & return
				
				Create Plain Text QR Code myRectangle plain text theQRCodeText qr code swatch "Black"
				
			end tell
			
			tell application "Finder" to set savePath to container of item i of theItems as string
			set myDate to do shell script "date +%Y%m%d%H%M"
			
			--set oldDelimiters to AppleScript's text item delimiters
			--set AppleScript's text item delimiters to "."
			--set fileNameBase to text item 1 of FileName
			--set AppleScript's text item delimiters to oldDelimiters
			
			set pdfname to savePath & filenameBase & ".pdf"
			set inddName to savePath & filenameBase & ".indd"
			
			set thePref to PDF export preset "Press with Marks"
			tell thePref
				--set PDF destination profile to "use no profile"
				set crop marks to true
				set bleed bottom to ".125in"
				set bleed top to ".125in"
				set bleed inside to ".125in"
				set bleed outside to ".125in"
				set include slug with PDF to true
			end tell
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

