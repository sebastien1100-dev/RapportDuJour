# Crée le raccourci « Rapport du jour » sur le Bureau et dans le menu Démarrer (Windows).
# L'application s'ouvre dans sa propre fenêtre (mode application de Edge ou de Chrome), sans onglets
# ni barre d'adresse, toujours hors ligne. Le code ne change pas : le raccourci ouvre index.html.
#
# Utilisation (clic droit → « Exécuter avec PowerShell », ou dans une fenêtre PowerShell) :
#   powershell -ExecutionPolicy Bypass -File outils\creer-raccourci.ps1 [-Navigateur edge|chrome]
#
# IMPORTANT : les données sont rangées dans le navigateur. Choisir celui qui sert déjà au Rapport du jour,
# sinon faire Réglages → Télécharger une sauvegarde dans l'ancien, puis Restaurer dans le nouveau.
# Relancer ce script si le dossier de l'application change de place.
param([ValidateSet('', 'edge', 'chrome')][string]$Navigateur = '')

$racine = Split-Path -Parent $PSScriptRoot
$index = Join-Path $racine 'index.html'
$icone = Join-Path $racine 'img\icone.ico'
if (-not (Test-Path $index)) { Write-Host "index.html introuvable dans $racine" -ForegroundColor Red; exit 1 }

function Trouver([string[]]$chemins) {
  foreach ($c in $chemins) { if ($c -and (Test-Path $c)) { return $c } }
  return $null
}
$trouves = [ordered]@{}
$edge = Trouver @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
                  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
$chrome = Trouver @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
                    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
                    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
if ($edge) { $trouves['edge'] = $edge }
if ($chrome) { $trouves['chrome'] = $chrome }
if ($trouves.Count -eq 0) { Write-Host "Ni Edge ni Chrome n'ont été trouvés sur ce poste." -ForegroundColor Red; exit 1 }

if (-not $Navigateur) {
  if ($trouves.Count -eq 1) {
    $Navigateur = @($trouves.Keys)[0]
  } else {
    Write-Host "Quel navigateur sert aujourd'hui au Rapport du jour ? (les données y sont rangées)"
    Write-Host "  1 = Microsoft Edge"
    Write-Host "  2 = Google Chrome"
    $Navigateur = if ((Read-Host 'Votre choix (1 ou 2)') -eq '2') { 'chrome' } else { 'edge' }
  }
}
$exe = $trouves[$Navigateur]
if (-not $exe) { Write-Host "Le navigateur « $Navigateur » n'est pas installé sur ce poste." -ForegroundColor Red; exit 1 }

$url = ([Uri]$index).AbsoluteUri
$shell = New-Object -ComObject WScript.Shell
$dossiers = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
foreach ($d in $dossiers) {
  $lnk = $shell.CreateShortcut((Join-Path $d 'Rapport du jour.lnk'))
  $lnk.TargetPath = $exe
  $lnk.Arguments = "--app=`"$url`""
  $lnk.WorkingDirectory = $racine
  $lnk.IconLocation = "$icone,0"
  $lnk.Description = 'Rapport du jour - réception de nuit'
  $lnk.Save()
  Write-Host "Raccourci créé : $(Join-Path $d 'Rapport du jour.lnk')" -ForegroundColor Green
}
Write-Host "Navigateur : $exe"
Write-Host "Astuce : une fois l'appli ouverte, clic droit sur son icône dans la barre des tâches → « Épingler à la barre des tâches »."
