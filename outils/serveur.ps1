# Petit serveur web local pour le développement et les tests (tests/tests.html).
# L'application elle-même n'en a pas besoin : un double-clic sur index.html suffit.
# Utilisation : powershell -ExecutionPolicy Bypass -File outils\serveur.ps1 [-Port 8765]
param([int]$Port = 8765)
$racine = Split-Path -Parent $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
            '.json'='application/json'; '.xlsx'='application/octet-stream'; '.csv'='text/csv; charset=utf-8'; '.png'='image/png'; '.svg'='image/svg+xml' }
$ecoute = New-Object System.Net.HttpListener
$ecoute.Prefixes.Add("http://localhost:$Port/")
$ecoute.Start()
Write-Host "Rapport du jour : http://localhost:$Port/  (Ctrl+C pour arrêter)"
try {
  while ($ecoute.IsListening) {
    $ctx = $ecoute.GetContext()
    try {
      $chemin = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
      if ($chemin -eq '') { $chemin = 'index.html' }
      $fichier = [IO.Path]::GetFullPath((Join-Path $racine $chemin))
      if ($fichier.StartsWith($racine) -and (Test-Path $fichier -PathType Leaf)) {
        $octets = [IO.File]::ReadAllBytes($fichier)
        $ext = [IO.Path]::GetExtension($fichier).ToLower()
        $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
        $ctx.Response.Headers.Add('Cache-Control', 'no-store')
        $ctx.Response.ContentLength64 = $octets.Length
        if ($ctx.Request.HttpMethod -ne 'HEAD') { $ctx.Response.OutputStream.Write($octets, 0, $octets.Length) }
      } else {
        $ctx.Response.StatusCode = 404
      }
    } catch {
      Write-Host "Erreur : $($_.Exception.Message)"
    } finally {
      try { $ctx.Response.Close() } catch {}
    }
  }
} finally { $ecoute.Stop() }
