# Inhalt.ps1
# Listet alle Ordner und Dateien im Verzeichnis, in dem dieses Skript liegt,
# und speichert das Ergebnis in "Inhalt.txt".

# Verzeichnis des Skripts ermitteln
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ausgabedatei festlegen
$OutFile = Join-Path $ScriptDir "Projektstruktur.txt"

# Baumstruktur mit Dateien erzeugen
tree $ScriptDir /F /A | Out-File $OutFile -Encoding UTF8
