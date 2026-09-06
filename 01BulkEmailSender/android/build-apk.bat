@echo off
echo ========================================================
echo Building Bulk Email Sender base.apk
echo ========================================================

where gradle >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Gradle is not found in PATH.
    echo Opening Android project in Android Studio or running via GitHub Actions is recommended.
    echo If you have Android Studio installed, open the 'android' folder and click Build -> Build APK.
    pause
    exit /b 1
)

echo Running Gradle assembleRelease...
call gradle assembleRelease

echo.
echo Searching for generated APK...
for /R "%~dp0app\build\outputs\apk" %%f in (*.apk) do (
    echo Copying %%f to %~dp0base.apk
    copy /Y "%%f" "%~dp0base.apk"
    echo.
    echo ========================================================
    echo Successfully generated base.apk at: %~dp0base.apk
    echo ========================================================
    pause
    exit /b 0
)

echo No APK found in build outputs.
pause
