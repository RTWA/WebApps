### Setup some variables
$Host.UI.RawUI.BackgroundColor = "black"; cls;
$choices = New-Object Collections.ObjectModel.Collection[Management.Automation.Host.ChoiceDescription]
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&Yes'))
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&No'))
$originalPath = $PSScriptRoot
###

Write-Host " ______________________________________________________________ " -ForegroundColor Cyan
Write-Host "|       \ \        / / | |      /\                             |" -ForegroundColor Cyan
Write-Host "|        \ \  /\  / /__| |__   /  \   _ __  _ __  ___          |" -ForegroundColor Cyan
Write-Host "|         \ \/  \/ / _ \ '_ \ / /\ \ | '_ \| '_ \/ __|         |" -ForegroundColor Cyan
Write-Host "|          \  /\  /  __/ |_) / ____ \| |_) | |_) \__ \         |" -ForegroundColor Cyan
Write-Host "|           \/  \/ \___|_.__/_/    \_\ .__/| .__/|___/         |" -ForegroundColor Cyan
Write-Host "|                                    | |   | |                 |" -ForegroundColor Cyan
Write-Host "|____________________________________|_|___|_|_________________|" -ForegroundColor Cyan
Write-Host "|                                                              |" -ForegroundColor Cyan
Write-Host "|           Plugin Production Version Creation Tool            |" -ForegroundColor Cyan
Write-Host "|______________________________________________________________|" -ForegroundColor Cyan


# Ask for Plugin Name
$pluginName = Read-Host "Enter Plugin Name"
# Ask for version number
$verNum = Read-Host "Enter Version Number"
# Ask for absolute Plugin path
$pluginPath = Read-Host "Enter Full (Absolute) Path to Plugin"

cls; cd $pluginPath

# Handle either direction slash!
$_pluginArray = $pluginPath.Split("\")
$_pluginArray = $_pluginArray.Split("/")

if ($_pluginArray[$_pluginArray.Length - 1] -eq "") {
    $pluginDir = $_pluginArray[$_pluginArray.Length - 2]
} else {
    $pluginDir = $_pluginArray[$_pluginArray.Length - 1]
}

# Ask user if releases\$VERNUM folder is required?
$decision = $Host.UI.PromptForChoice('', "Do you require a `"releases\$verNum`" folder to be created?", $choices, 0)
if ($decision -eq 0) {
    # Yes
    $path = "releases\$verNum"
    Write-Host "Creating `"$path`"..." -ForegroundColor DarkYellow
    Write-Host "(this may take some time)" -ForegroundColor DarkMagenta
    Write-Host ""

    # If the folder currently exists, delete it
    if (Test-Path $path) { Remove-Item $path -Force -Recurse }
    # Copy items
    if (Test-Path .\include) { Copy-Item .\include $path\include -force -recurse }
    Copy-Item .\plugin.json $path\plugin.json -force -recurse
    Copy-Item .\Plugin.php $path\Plugin.php -force -recurse

    Write-Host "`"$path`" created!" -ForegroundColor Green
    Write-Host ""
    Write-Host ""

    
    # Update the manifest.json file
    Write-Host "Updating Plugin name and version in plugin.json" -ForegroundColor DarkYellow
    $manifest = Get-Content -Raw -Path "$pluginPath\$path\plugin.json" | ConvertFrom-Json
    $manifest.name = $pluginName
    $manifest.slug = $pluginDir
    $manifest.version = $verNum
    $manifestJSON = $manifest | ConvertTo-Json
    Set-Content -Path "$pluginPath\$path\plugin.json" -Value $manifestJSON

    Write-Host "`"$path\plugin.json`" updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host ""

    $zip = $Host.UI.PromptForChoice('', "Do you require a ZIP file to be created?", $choices, 0)
    if ($zip -eq 0) {
        Write-Host "Creating ZIP file..." -ForegroundColor DarkYellow
        Write-Host ""

        $zipPath = "releases\Plugin-$pluginName-$verNum.zip"
        # Delete existing ZIP
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        # Create the ZIP
        Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory("$pluginPath/$path", "$pluginPath/$zipPath")
        
        Write-Host "ZIP file created!" -ForegroundColor Green
        Write-Host ""
        Write-Host ""

        # Ask user if "releases\"%VERNUM%"" folder can be deleted?
        $delete = $Host.UI.PromptForChoice('', "Would you like the `"$path`" folder to be deleted?", $choices, 0)
        if ($delete -eq 0) {
            # Delete the folder
            Write-Host "Deleting `"$path`" folder..." -ForegroundColor DarkYellow
            Remove-Item $path -Force -Recurse
            Write-Host "`"$path`" folder deleted!" -ForegroundColor DarkMagenta
            Write-Host ""
            Write-Host ""

            Start-Sleep -Seconds 1
        }
    }
}

cls

# Script complete
Write-Host "\ \        / / | |      /\                             " -ForegroundColor Cyan
Write-Host " \ \  /\  / /__| |__   /  \   _ __  _ __  ___          " -ForegroundColor Cyan
Write-Host "  \ \/  \/ / _ \ '_ \ / /\ \ | '_ \| '_ \/ __|         " -ForegroundColor Cyan
Write-Host "   \  /\  /  __/ |_) / ____ \| |_) | |_) \__ \         " -ForegroundColor Cyan
Write-Host "    \/  \/ \___|_.__/_/    \_\ .__/| .__/|___/         " -ForegroundColor Cyan
Write-Host "                             | |   | |                 " -ForegroundColor Cyan
Write-Host "                             |_|   |_|                 " -ForegroundColor Cyan
Write-Host "    $pluginName Version $verNum                        " -ForegroundColor Cyan
Write-Host ""
Write-Host ""
Write-Host "All the tasks have been completed. WebApps Plugin: $pluginName version $verNum has been made ready for production use."  -ForegroundColor Cyan
Write-Host "Press any key to exit this wizard." -ForegroundColor Cyan

Read-Host
cd $originalPath