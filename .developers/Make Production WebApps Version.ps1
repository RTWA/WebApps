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
Write-Host "|               Production Version Creation Tool               |" -ForegroundColor Cyan
Write-Host "|______________________________________________________________|" -ForegroundColor Cyan


# Ask for version number
$verNum = Read-Host "Enter Version Number"

cls; cd "$($originalPath)/../"
$appPath = Get-Location
$appPath = $appPath.toString()

# Handle either direction slash!
$_appArray = $appPath.Split("\")
$_appArray = $_appArray.Split("/")

if ($_appArray[$_appArray.Length - 1] -eq "") {
    $appDir = $_appArray[$_appArray.Length - 2]
} else {
    $appDir = $_appArray[$_appArray.Length - 1]
}

Write-Host "Performing Cleanup..." -ForegroundColor White
Write-Host ""
php artisan webapps:uninstall -E -F -q
php artisan config:clear -q
php artisan cache:clear -q
php artisan route:clear -q
php artisan view:clear -q
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host ""

# Run Laravel Mix in Production mode
Write-Host "Minimising scripts..." -ForegroundColor White
Write-Host "(this may take some time)" -ForegroundColor DarkMagenta
Write-Host ""
npm run i --silent | Out-Null
npm run production --silent | Out-Null
Write-Host "Scripts minimised!" -ForegroundColor Green
Write-Host ""
Write-Host ""

# Create releases\$VERNUM directory
$path = "releases\$verNum"
Write-Host "Creating `"$path`"..." -ForegroundColor DarkYellow
Write-Host "(this may take some time)" -ForegroundColor DarkMagenta
Write-Host ""

# If the folder currently exists, delete it
if (Test-Path $path) { Remove-Item $path -Force -Recurse }
# Copy bare minmum Laravel!
if (Test-Path .\app) { Copy-Item .\app $path\app -force -recurse }
if (Test-Path .\bootstrap) { Copy-Item .\bootstrap $path\bootstrap -force -recurse }
if (Test-Path .\config) { Copy-Item .\config $path\config -force -recurse }
if (Test-Path .\database) { Copy-Item .\database $path\database -force -recurse }
if (Test-Path .\resources) { Copy-Item .\resources $path\resources -force -recurse }
if (Test-Path .\routes) { Copy-Item .\routes $path\routes -force -recurse }
if (Test-Path .\storage) { Copy-Item .\storage $path\storage -force -recurse }
if (Test-Path .\public) { Copy-Item .\public $path\public -force -recurse }
Copy-Item .\.env.example $path\.env.example -force
Copy-Item .\artisan $path\artisan -force
Copy-Item .\composer.json $path\composer.json -force
Copy-Item .\composer.lock $path\composer.lock -force

# Tidy storage directories
Get-ChildItem -Path $path\storage\app\public -Exclude .gitignore | Remove-Item -Recurse -Force
Get-ChildItem -Path $path\storage\framework\sessions -Exclude .gitignore | Remove-Item -Recurse -Force
Get-ChildItem -Path $path\storage\framework\testing -Exclude .gitignore | Remove-Item -Recurse -Force
Get-ChildItem -Path $path\storage\logs -Exclude .gitignore | Remove-Item -Recurse -Force

# Tidy public directory
Get-ChildItem -Path $path\public\js\apps | Remove-Item -Recurse -Force

# Delete installed.json, if present (shouldn't be as webapps:uninstall was called)
if (Test-Path $path\storage\webapps\installed.json) { Remove-Item $path\storage\webapps\installed.json -Force -Recurse }

# Ensure the default is to not allow empty DB password!
(Get-Content -path $path\config\installer.php -Raw) -replace "'allowEmptyPassword' => true,","'allowEmptyPassword' => false," | Set-Content -Path $path\config\installer.php | Out-Null

Write-Host "`"$path`" created!" -ForegroundColor Green
Write-Host ""
Write-Host ""


# Update the manifest.json file
Write-Host "Updating Product Information" -ForegroundColor DarkYellow
$manifest = Get-Content -Raw -Path "$appPath\$path\storage\webapps\core\webapps.json" | ConvertFrom-Json
$manifest.app_name = "WebApps"
$manifest.app_version = $verNum
$manifestJSON = $manifest | ConvertTo-Json
Set-Content -Path "$appPath\$path\storage\webapps\core\webapps.json" -Value $manifestJSON

Write-Host "`"$appPath\$path\storage\webapps\core\webapps.json`" updated!" -ForegroundColor Green
Write-Host ""
Write-Host ""

    
# Install Optimised Packages
Write-Host "Installing optimised Packages..." -ForegroundColor White
Write-Host "(this may take some time)" -ForegroundColor DarkMagenta
Write-Host ""
cd $path
php artisan key:generate | Out-Null
composer install --optimize-autoloader --no-dev -q | Out-Null
cd "$($originalPath)/../"
Write-Host "Optimised packages installed!" -ForegroundColor Green
Write-Host ""
Write-Host ""


# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor DarkYellow
Write-Host ""

$zipPath = "releases\WebApps-$verNum.zip"
# Delete existing ZIP
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
# Create the ZIP
Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory("$appPath/$path", "$appPath/$zipPath")

Write-Host "ZIP file created!" -ForegroundColor Green
Write-Host ""
Write-Host ""

    
# Delete the folder
Write-Host "Deleting `"$path`" folder..." -ForegroundColor DarkYellow
Remove-Item $path -Force -Recurse
Write-Host "`"$path`" folder deleted!" -ForegroundColor DarkMagenta
Write-Host ""
Write-Host ""

Start-Sleep -Seconds 1

cls

# Script complete
Write-Host "\ \        / / | |      /\                             " -ForegroundColor Cyan
Write-Host " \ \  /\  / /__| |__   /  \   _ __  _ __  ___          " -ForegroundColor Cyan
Write-Host "  \ \/  \/ / _ \ '_ \ / /\ \ | '_ \| '_ \/ __|         " -ForegroundColor Cyan
Write-Host "   \  /\  /  __/ |_) / ____ \| |_) | |_) \__ \         " -ForegroundColor Cyan
Write-Host "    \/  \/ \___|_.__/_/    \_\ .__/| .__/|___/         " -ForegroundColor Cyan
Write-Host "                             | |   | |                 " -ForegroundColor Cyan
Write-Host "                             |_|   |_|                 " -ForegroundColor Cyan
Write-Host "             Version $verNum                           " -ForegroundColor Cyan
Write-Host ""
Write-Host ""
Write-Host "All the tasks have been completed. WebApps version $verNum has been made ready for production use."  -ForegroundColor Cyan
Write-Host "Press any key to exit this wizard." -ForegroundColor Cyan

Read-Host
cd $originalPath