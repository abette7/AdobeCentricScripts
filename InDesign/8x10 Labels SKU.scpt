on run
	tell application "Finder" to set inputItems to (choose file with prompt "Choose images:" with multiple selections allowed without invisibles)
	set theFiles to (every item of inputItems)
	open theFiles
end run
-- Dropped files will start on open

on open theItems
	activate
	set mytext to "" & the text returned of (display dialog "Installation Method:" default answer "")
	repeat with i from 1 to number of items in theItems
		tell application id "com.adobe.indesign"
			make new document with properties {document preferences:{page width:"8in", page height:"10in", facing pages:false}}
			set transform reference point of layout window 1 to center anchor
			tell document preferences of active document
				set document bleed bottom offset to ".125in"
				set document bleed top offset to ".125in"
				set document bleed inside or left offset to ".125in"
				set document bleed outside or right offset to ".125in"
				set slug bottom offset to ".375in"
				set slug top offset to ".375in"
				set slug inside or left offset to ".375in"
				set slug right or outside offset to ".375in"
			end tell
			--repeat with i from 1 to number of items in theItems
			--if i - 1 is greater than 0 then tell document 1 to make new page
			tell page 1 of document 1
				set rect1 to make new rectangle with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"-.125in", "-.125in", "10.125in", "8.125in"}}
				tell rect1 to set fill color to "None"
				tell rect1 to set stroke color to "None"
				set rect2 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"-.25in", ".125in", "0in", "4.75in"}}
				tell rect2 to set stroke color to "None"
				tell rect2 to set fill color to "None"
				
				set rect3 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"9.295in", "0.625in", "9.66in", "3.8125in"}}
				tell rect3 to set stroke color to "None"
				tell rect3 to set fill color to "None"
				set vertical justification of text frame preferences of rect3 to bottom align
				
				set rect4 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"9.295in", "3.8125in", "9.66in", "7.375in"}}
				tell rect4 to set stroke color to "None"
				tell rect4 to set fill color to "None"
				set vertical justification of text frame preferences of rect4 to bottom align
				
				set rect5 to make new text frame with properties {stroke weight:"0", stroke color:"None", geometric bounds:{"9.25in", "0.625in", "9.45in", "3.8125in"}}
				tell rect5 to set stroke color to "None"
				tell rect5 to set fill color to "None"
				set vertical justification of text frame preferences of rect5 to bottom align
				
				
				place item i of theItems on rect1
				tell rect1 to set {ITb, ILb, IBb, IRb} to item 1's graphic 1's geometric bounds
				set ImageHeight to (IBb - ITb) -- Height of image
				set ImageWidth to (IRb - ILb) -- Width of image			
				--	if ImageWidth is greater than ImageHeight then
				--set absolute rotation angle of graphic 1 of item 1 of rect1 to 90
				--	tell application id "com.adobe.indesign"
				--		set page width of document preferences of active document to "10in"
				--		set page height of document preferences of active document to "8in"
				--		tell page 1 of document 1
				--			set geometric bounds of rect1 to {-0.125, -0.125, 8.125, 10.125}
				--			set geometric bounds of rect2 to {-0.25, 0.125, 0, 4.75}
				--		end tell
				--	end tell
				--	end if
				fit rect1 given fill proportionally
				tell application "System Events" to set FileName to name of item i of theItems
				set oldDelimiters to AppleScript's text item delimiters
				set AppleScript's text item delimiters to "."
				set myName to text item 1 of FileName
				set AppleScript's text item delimiters to "_"
				set colorNumber to text item 2 of FileName
				--display dialog colorNumber
				
				tell application "System Events" to set skuNumber to (text -5 through -1 of myName) as string
				set AppleScript's text item delimiters to oldDelimiters
				set contents of rect2 to myName
				
				
				
				set contents of rect3 to "Color: " & colorNumber
				set contents of rect4 to skuNumber
				set contents of rect5 to mytext
				--set rect2Story to parent story of rect2
				--set properties of rect2Story to {stroke weight:"1", stroke color:"White"}
				set justification of every line of rect2 to left align
				--set stroke color of every character of rect2 to "paper"
				set fill color of every character of rect2 to "Black"
				tell paragraph 1 of rect2
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect2 to "10"
				
				set fill color of every character of rect3 to "Paper"
				tell paragraph 1 of rect3
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect3 to "9"
				set justification of every line of rect3 to left align
				
				set fill color of every character of rect4 to "Paper"
				tell paragraph 1 of rect4
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect4 to "9"
				set justification of every line of rect4 to right align
				
				set fill color of every character of rect5 to "Paper"
				tell paragraph 1 of rect5
					set applied font to "Helvetica Neue LT	LT 55 Roman"
				end tell
				set point size of every character of rect5 to "9"
				set justification of every line of rect5 to left align
				
			end tell
			--end repeat
			
			
			tell application "Finder" to set savePath to container of item i of theItems as string
			set myDate to do shell script "date +%Y%m%d%H%M"
			
			set oldDelimiters to AppleScript's text item delimiters
			set AppleScript's text item delimiters to "."
			set fileNameBase to text item 1 of FileName
			set AppleScript's text item delimiters to oldDelimiters
			
			set pdfname to POSIX path of (savePath & skuNumber & ".pdf")
			set inddName to POSIX path of (savePath & fileNameBase & ".indd")
			
			set thePref to PDF export preset "[Press Quality]"
			tell thePref
				set PDF destination profile to use no profile
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
