#!/bin/bash
# Crée l'application « Rapport du jour.app » (Mac) dans le dossier Applications.
# Elle ouvre index.html dans sa propre fenêtre (mode application de Chrome, Edge ou Brave),
# sans onglets ni barre d'adresse, toujours hors ligne. Le code ne change pas.
#
# Utilisation : double-clic sur ce fichier dans le Finder (ou : bash outils/creer-app-mac.command).
#
# IMPORTANT : les données sont rangées dans le navigateur. Choisir celui qui sert déjà au Rapport du jour,
# sinon faire Réglages → Télécharger une sauvegarde dans l'ancien, puis Restaurer dans le nouveau.
# Safari n'a pas de mode application : depuis Safari, passer par la sauvegarde.
# Relancer ce script si le dossier de l'application change de place.
set -e
racine="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$racine/index.html" ] || { echo "index.html introuvable dans $racine"; exit 1; }

noms=(); for n in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
  [ -d "/Applications/$n.app" ] || [ -d "$HOME/Applications/$n.app" ] && noms+=("$n")
done
[ ${#noms[@]} -gt 0 ] || { echo "Aucun navigateur compatible trouvé (Chrome, Edge ou Brave)."; exit 1; }

nav="${noms[0]}"
if [ ${#noms[@]} -gt 1 ]; then
  echo "Quel navigateur sert aujourd'hui au Rapport du jour ? (les données y sont rangées)"
  for i in "${!noms[@]}"; do echo "  $((i+1)) = ${noms[$i]}"; done
  read -r -p "Votre choix : " choix
  [[ "$choix" =~ ^[0-9]+$ ]] && [ "$choix" -ge 1 ] && [ "$choix" -le ${#noms[@]} ] && nav="${noms[$((choix-1))]}"
fi

url="$(osascript -l JavaScript -e 'function run(a){return encodeURI("file://"+a[0])}' "$racine/index.html")"

dest="/Applications"; [ -w "$dest" ] || { dest="$HOME/Applications"; mkdir -p "$dest"; }
app="$dest/Rapport du jour.app"
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$racine/img/icone.icns" "$app/Contents/Resources/icone.icns"

cat > "$app/Contents/MacOS/lanceur" <<EOF
#!/bin/bash
exec open -na "$nav" --args --app="$url"
EOF
chmod +x "$app/Contents/MacOS/lanceur"

cat > "$app/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>Rapport du jour</string>
  <key>CFBundleDisplayName</key><string>Rapport du jour</string>
  <key>CFBundleIdentifier</key><string>fr.campanile.nimes.rapportdujour</string>
  <key>CFBundleExecutable</key><string>lanceur</string>
  <key>CFBundleIconFile</key><string>icone</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
</dict></plist>
EOF
touch "$app"

echo "Application créée : $app"
echo "Navigateur : $nav"
echo "Astuce : faire glisser « Rapport du jour » depuis Applications vers le Dock."
