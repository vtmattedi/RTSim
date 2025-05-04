:: This script builds the rtsim.exe executable from the source code.
:: It uses esbuild to bundle the JavaScript code and then uses node-sea to create a self-extracting executable.
:: The script is designed to be run in a Windows environment.
:: Ensure that the required tools are installed: node, esbuild.

echo off
:: gets first argument from command line
set arg1=%1
set arg2=%2
:: default output path
set foldername=./dist
set clean=0
:: check if the first argument is -h
IF "%arg1%"=="-h" (
  CALL echo RTsim Build Script
  CALL echo Usage: build.bat [output_path] default: ./dist
  CALL echo -c: Clean up temporary files after build
  CALL echo -h: Show this help message
  EXIT /B 0
) 
IF "%arg2%"=="-h" (
  CALL echo RTsim Build Script
  CALL echo Usage: build.bat [output_path] default: ./dist
  CALL echo OPTIONAL: -c: Clean up temporary files after build
  CALL echo OPTIONAL: -h: Show this help message
  EXIT /B 0
) 

IF "%arg1%"=="-c" (
    set clean=1
    CALL echo Cleaning up temporary files after build enabled.
    ) ELSE (
        :: check if the first argument is empty
        IF "%arg1%"=="" (
            CALL echo No output path provided. Using default: %foldername%
            ) ELSE (
            CALL echo Output path provided: %arg1%
            set foldername=%arg1%
            )
    )
if "%arg2%"=="-c" (
    set clean=1
) 
set fp=%foldername%
::create a second variable with \ instead of /. this is needed for the mkdir command
set foldername=%foldername:/=\%
:: check if the output path is a valid directory
IF NOT EXIST %~dp0%foldername% (
  CALL echo Creating directory %fp%...
  mkdir %~dp0%foldername%
  IF %ERRORLEVEL% NEQ 0 (
    echo Failed to create directory %fp%. Please check permissions.
    exit %ERRORLEVEL%
  )
)
::"Main" Script
::Following these steps: https://nodejs.org/api/single-executable-applications.html
::Create the sea-blob.json file with the main entry point and output path
CALL echo { "main": "dist/bundle/index.cjs", "output": "%fp%/sea-prep.blob" } > %fp%/sea-config.json
IF %ERRORLEVEL% NEQ 0 (
  echo Build failed. Cannot write to %fp%/sea-config.json.
  exit %ERRORLEVEL%
)
CALL echo Building rtsim.exe...
CALL echo Bundling with esbuild...
:: Bundle the JavaScript code into a single file.
CALL npx esbuild main.js --bundle --outfile=%fp%/bundle/index.cjs --platform=node
IF %ERRORLEVEL% NEQ 0 (
  echo Build failed. Please check the error messages above.
  exit %ERRORLEVEL%
)
CALL echo Creating a blob with the code...
:: Create a SEA blob from the bundled JavaScript code.
CALL node --experimental-sea-config %fp%/sea-config.json
IF %ERRORLEVEL% NEQ 0 (
  echo Node SEA blob creation failed. Please check the error messages above.
  exit %ERRORLEVEL%
)
CALL echo Creating the NodeJS executable...
:: Copy the NodeJS executable to the output directory and inject the SEA blob into it.
CALL node -e "console.log('Executable Path:','%fp%/rtsim.exe');require('fs').copyFileSync(process.execPath, '%fp%/rtsim.exe')" 
IF %ERRORLEVEL% NEQ 0 (
  echo Executable copy failed. Please check the error messages above.
  exit %ERRORLEVEL%
)
CALL echo Injecting the executable [signature warning expected]...
:: Inject the SEA blob into the NodeJS executable.
CALL npx postject %fp%/rtsim.exe NODE_SEA_BLOB %fp%/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
IF %ERRORLEVEL% NEQ 0 (
  echo Executable injection failed. Please check the error messages above.
  exit %ERRORLEVEL%
)
CALL echo Executable file created at: '%fp%/rtsim.exe'
IF "%clean%"=="1" (
    CALL echo Cleaning up temporary files...
    :: Remove the temporary files created during the build process.
    CALL echo Removing Folder: %~dp0%foldername%\bundle
    CALL rmdir /s /q %~dp0%foldername%\bundle
    CALL echo Removing File: %~dp0%foldername%\sea-prep.blob
    DEL %~dp0%foldername%\sea-prep.blob
    CALL echo Removing File: %~dp0%foldername%\sea-config.json
    DEL %~dp0%foldername%\sea-config.json
)
