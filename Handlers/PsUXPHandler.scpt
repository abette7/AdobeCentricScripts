on run {theScript, FileName, inFolder, outFolder}
	--set FileName to "FileName"
	--set inFolder to "inFolder"
	--set outFolder to "outFolder"
	--set theScript to "theScript"
	tell application id "com.adobe.Photoshop"
		activate
		set myArgs to "var FileName=" & quoted form of FileName & ";" & return & "var inFolder=" & quoted form of inFolder & ";" & return & "var outFolder= " & quoted form of outFolder & ";" & return & "main(FileName,inFolder,outFolder);" & return
		
		--display dialog myArgs
		set myGlobals to do shell script "echo " & quoted form of myArgs & "> ~/Scriptik/tempScript.psjs"
		set myScript to "/bin/cat " & quoted form of theScript & " >> ~/Scriptik/tempScript.psjs"
		display dialog myScript
		do shell script myScript
		do shell script "/usr/bin/open ~/Scriptik/tempScript.psjs"
	end tell
	
end run
