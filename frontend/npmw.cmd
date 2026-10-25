@echo off
set "NODE_PATH=C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"
"%NODE_PATH%\npm.cmd" %*
