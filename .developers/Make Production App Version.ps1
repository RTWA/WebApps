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
Write-Host "|             App Production Version Creation Tool             |" -ForegroundColor Cyan
Write-Host "|______________________________________________________________|" -ForegroundColor Cyan


# Ask for App Name
$appName = Read-Host "Enter App Name"
# Ask for version number
$verNum = Read-Host "Enter Version Number"
# Ask for absolute App path
$appPath = Read-Host "Enter Full (Absolute) Path to App"

cls; cd $appPath

# Handle either direction slash!
$_appArray = $appPath.Split("\")
$_appArray = $_appArray.Split("/")

if ($_appArray[$_appArray.Length - 1] -eq "") {
    $appDir = $_appArray[$_appArray.Length - 2]
} else {
    $appDir = $_appArray[$_appArray.Length - 1]
}

# Run Laravel Mix in Production mode
Write-Host "Minimising Scripts..." -ForegroundColor White
Write-Host "(this may take some time)" -ForegroundColor DarkMagenta
Write-Host ""
npm run i --silent | Out-Null
npm run production --silent | Out-Null
Write-Host "Scripts minimised!" -ForegroundColor Green
Write-Host ""
Write-Host ""

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
    if (Test-Path .\Commands) { Copy-Item .\Commands $path\Commands -force -recurse }
    if (Test-Path .\Controllers) { Copy-Item .\Controllers $path\Controllers -force -recurse }
    if (Test-Path .\Models) { Copy-Item .\Models $path\Models -force -recurse }
    if (Test-Path .\Mail) { Copy-Item .\Mail $path\Mail -force -recurse }
    if (Test-Path .\Database\Seeders) { Copy-Item .\Database\Seeders $path\Database\Seeders -force -recurse }
    if (Test-Path .\Database\Factories) { Copy-Item .\Database\Factories $path\Database\Factories -force -recurse }
    if (Test-Path .\Providers) { Copy-Item .\Providers $path\Providers -force -recurse }
    if (Test-Path .\Routes) { Copy-Item .\Routes $path\Routes -force -recurse }
    if (Test-Path .\Views) { Copy-Item .\Views $path\Views -force -recurse }
    if (Test-Path .\public) { Copy-Item .\public $path\public -force -recurse }
    Copy-Item .\manifest.json $path\manifest.json -force -recurse

    Write-Host "`"$path`" created!" -ForegroundColor Green
    Write-Host ""
    Write-Host ""

    
    # Update the manifest.json file
    Write-Host "Updating app name and version in manifest.json" -ForegroundColor DarkYellow
    $manifest = Get-Content -Raw -Path "$appPath\$path\manifest.json" | ConvertFrom-Json
    $manifest.name = $appName
    $manifest.slug = $appDir
    $manifest.version = $verNum
    $manifestJSON = $manifest | ConvertTo-Json
    Set-Content -Path "$appPath\$path\manifest.json" -Value $manifestJSON

    Write-Host "`"$path\manifest.json`" updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host ""

    $zip = $Host.UI.PromptForChoice('', "Do you require a ZIP file to be created?", $choices, 0)
    if ($zip -eq 0) {
        Write-Host "Creating ZIP file..." -ForegroundColor DarkYellow
        Write-Host ""

        $zipPath = "releases\App-$appname-$verNum.zip"
        # Delete existing ZIP
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        # Create the ZIP
        Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory("$appPath/$path", "$appPath/$zipPath")
        
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
Write-Host "    $appname Version $verNum                           " -ForegroundColor Cyan
Write-Host ""
Write-Host ""
Write-Host "All the tasks have been completed. WebApps App: $appName version $verNum has been made ready for production use."  -ForegroundColor Cyan
Write-Host "Press any key to exit this wizard." -ForegroundColor Cyan

Read-Host
cd $originalPath