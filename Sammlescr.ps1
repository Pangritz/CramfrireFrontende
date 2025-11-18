<#
.SYNOPSIS
Sucht rekursiv nach Dateien im Skriptverzeichnis und dessen Unterverzeichnissen,
wobei nur Dateien mit bestimmten Dateiendungen berücksichtigt werden und
spezifische Unterverzeichnisse ausgeschlossen werden.
Führt den Inhalt aller gefundenen Dateien in einer Zieldatei (Websrc.txt) zusammen.
Fügt vor dem Inhalt jeder Datei eine Trennzeile mit dem relativen Pfad ein.

.DESCRIPTION
Dieses Skript führt die folgenden Schritte aus:
1. Bestimmt das Verzeichnis, in dem das Skript ausgeführt wird.
2. Definiert den Namen der Zieldatei als "Websrc.txt" im Skriptverzeichnis.
3. Definiert ein Array mit Dateierweiterungen, die in den Prozess eingeschlossen werden sollen.
4. Definiert ein Array von Unterverzeichnissen, deren Inhalt komplett ausgeschlossen wird.
5. Sucht rekursiv nach allen Dateien, die EINE der Endungen aus der Einschlussliste haben
   UND NICHT in einem der ausgeschlossenen Unterverzeichnisse sind, beginnend im Skriptverzeichnis.
6. Leert die Zieldatei, falls sie bereits existiert, oder erstellt sie neu.
7. Geht jede gefundene Datei durch:
    a. Ermittelt den relativen Pfad der Datei zum Skriptverzeichnis.
    b. Erstellt eine Trennzeile im Format "XXXXXXXXXXXXXXXXXXXX Relativer\Pfad\zur\Datei.ext".
    c. Liest den gesamten Inhalt der Quelldatei.
    d. Schreibt die Trennzeile und den Inhalt der Quelldatei in die Zieldatei (Websrc.txt).
8. Gibt eine Erfolgsmeldung aus, wenn der Vorgang abgeschlossen ist.

.NOTES
    Autor: Gemini
    Datum: 2025-05-09
    Version: 1.4 (Unterstützung für mehrere auszuschliessende Verzeichnisse)
    Benötigt PowerShell Version 3.0 oder höher (für $PSScriptRoot und Get-ChildItem -File).
    Die Zieldatei wird bei jeder Ausführung überschrieben.
    Die Dateiinhalte werden in UTF-8-Kodierung in die Zieldatei geschrieben.
    Die auszuschließenden Unterverzeichnisse können über die Variable $AuszuschliessendeUnterverzeichnisse_Relativ konfiguriert werden.
    Die einzuschliessenden Dateierweiterungen können über die Variable $EinzuschliessendeDateiErweiterungen konfiguriert werden.
#>
param() # Standard Parameter Block

# --- Konfiguration ---
$ZielDateiname = "Projektdateien-frontend.txt"
$TrennzeichenPraefix = "XXXXXXXXXXXXXXXXXXXX "

# Array mit Dateierweiterungen, die in die Zieldatei aufgenommen werden sollen
# Die Endungen MÜSSEN mit einem Punkt beginnen (z.B. ".html", ".css", ".txt")
$EinzuschliessendeDateiErweiterungen = @(".html", ".vue", ".js", ".sh", ".json", ".php", ".sql", ".env", ".yml", ".log", ".xml") # Hier können Sie die gewünschten Endungen hinzufügen

# Array von Namen der relativ zum Basisverzeichnis auszugliessenden Unterverzeichnisse
$AuszuschliessendeUnterverzeichnisse_Relativ = @("vendor","database",".git",".devcontainer") # Fügen Sie hier weitere Verzeichnisse hinzu

# --- Skriptlogik ---

# 1. Verzeichnis des Skripts ermitteln
#    $PSScriptRoot ist eine automatische Variable, die den Pfad zum Verzeichnis des Skripts enthält.
#    Falls das Skript interaktiv ausgeführt wird (nicht aus einer .ps1-Datei), wird das aktuelle Verzeichnis verwendet.
if ($PSScriptRoot) {
    $BasisVerzeichnis = $PSScriptRoot
} else {
    $BasisVerzeichnis = Resolve-Path -Path "."
    Write-Warning "Skript wird nicht aus einer Datei ausgeführt. Verwende aktuelles Verzeichnis: $BasisVerzeichnis"
}

$ZielDateiPfad = Join-Path -Path $BasisVerzeichnis -ChildPath $ZielDateiname

# Erstelle ein Array von vollständigen Pfaden für die auszuschließenden Verzeichnisse
$AuszuschliessendeVollePfade = @()
foreach ($dir in $AuszuschliessendeUnterverzeichnisse_Relativ) {
    $AuszuschliessendeVollePfade += Join-Path -Path $BasisVerzeichnis -ChildPath $dir
}

# 2. Zieldatei leeren oder erstellen (überschreiben)
try {
    Clear-Content -Path $ZielDateiPfad -ErrorAction SilentlyContinue # Versuche zu leeren, Fehler ignorieren (wenn nicht vorhanden)
    if (-not (Test-Path -Path $ZielDateiPfad)) {
        New-Item -Path $ZielDateiPfad -ItemType File -Force -ErrorAction Stop | Out-Null
        Write-Host "Zieldatei '$ZielDateiname' wurde neu erstellt."
    } else {
        Write-Host "Vorhandene Zieldatei '$ZielDateiname' wird überschrieben."
    }
} catch {
    Write-Error "Fehler beim Erstellen/Leeren der Zieldatei '$ZielDateiPfad': $_"
    # Skript beenden, da das Schreiben nicht möglich ist
    exit 1
}

# 1. Suche nach allen relevanten Dateien rekursiv
Write-Host "Suche nach Dateien in '$BasisVerzeichnis' und Unterverzeichnissen..."
if ($AuszuschliessendeUnterverzeichnisse_Relativ.Count -gt 0) {
    Write-Host "Folgende Unterverzeichnisse werden ausgeschlossen: ($($AuszuschliessendeUnterverzeichnisse_Relativ -join ', '))"
} else {
    Write-Host "Keine Unterverzeichnisse werden explizit ausgeschlossen."
}
Write-Host "Es werden NUR Dateien mit den Endungen ($($EinzuschliessendeDateiErweiterungen -join ', ')) berücksichtigt."


$GefundeneDateien = Get-ChildItem -Path $BasisVerzeichnis -Recurse -File -Filter * -ErrorAction SilentlyContinue | Where-Object {
    $fileInExcludedDir = $false
    foreach ($excludedPath in $AuszuschliessendeVollePfade) {
        if ($_.FullName.StartsWith($excludedPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $fileInExcludedDir = $true
            break
        }
    }
    # Behalte die Datei, wenn sie eine der einzuschliessenden Endungen hat UND NICHT in einem der auszuschliessenden Verzeichnisse liegt.
    ($EinzuschliessendeDateiErweiterungen -contains $_.Extension.ToLower()) -and # Check, ob Endung in Einschlussliste ist (case-insensitive)
    (-not $fileInExcludedDir) # Check, ob Datei NICHT in einem der Ausschlussverzeichnisse ist
}


if ($GefundeneDateien.Count -eq 0) {
    Write-Warning "Keine passenden Dateien (mit den angegebenen Endungen und außerhalb der ausgeschlossenen Verzeichnisse) gefunden."
    # Optional: Skript hier beenden oder einfach fortfahren (leere Zieldatei bleibt bestehen)
    exit 0
}

Write-Host "$($GefundeneDateien.Count) passenden Datei(en) gefunden. Verarbeite..."

# Wechsel temporär in das Basisverzeichnis, um relative Pfade korrekt zu erhalten
Push-Location $BasisVerzeichnis

try {
	# --- Header einmalig schreiben ---
$Header = @"
=================== HEADER ======================================================
Diese Datei enthält den Inhalt aller wichtigen Dateien des Projektes.
Jeder Dateiabschnitt beginnt mit einer Kopfzeile.
Diese Kopfzeile ist mit dem Trennpräfix XXXXXXXXXXXXXXXXXXXX gekennzeichnet.
Nach dem Trennpräfix folgt der vollständige Pfad und der Name der Datei.
In den nächsten Zeilen steht dann der Inhalt der Datei, bis zum nächsten Trennpräfix.
=================================================================================
"@

Add-Content -Path $ZielDateiPfad -Value $Header -Encoding UTF8

    # 3. & 4. & 5. Inhalte kopieren und Trennzeichen einfügen
    foreach ($Datei in $GefundeneDateien) {
        # Relativen Pfad ermitteln (relativ zum $BasisVerzeichnis)
        $RelativerPfad = Resolve-Path -Path $Datei.FullName -Relative -ErrorAction SilentlyContinue

        # Entferne das führende '.\' falls vorhanden
        if ($RelativerPfad -like '.\*') {
            $RelativerPfad = $RelativerPfad.Substring(2)
        }

        # Trennzeile erstellen
        # Verwenden Sie $TrennzeichenPraefix, wie in der Konfiguration definiert
        $Trennlinie = $TrennzeichenPraefix + $RelativerPfad

        Write-Verbose "Verarbeite Datei: $RelativerPfad"

        try {
            # Inhalt der Quelldatei lesen (als einzelner String mit -Raw)
            $DateiInhalt = Get-Content -Path $Datei.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        } catch {
            Write-Error "Fehler beim Lesen der Datei '$($Datei.FullName)': $_"
            continue # Fahre mit der nächsten Datei fort
        }

        # Erstelle den gesamten Block (Trennlinie + Zeilenumbruch + Inhalt)
        # Der `n backtick n ist das Zeichen für einen Zeilenumbruch in PowerShell-Strings
        $BlockZumSchreiben = $Trennlinie + "`n" + $DateiInhalt

        # Schreibe den gesamten Block auf einmal in die Zieldatei
        # Add-Content fügt nach diesem Block automatisch einen weiteren Zeilenumbruch hinzu,
        # was für die Trennung zum nächsten Block sorgt.
        Add-Content -Path $ZielDateiPfad -Value $BlockZumSchreiben -Encoding UTF8
    }
}
finally {
    # Unbedingt zum ursprünglichen Verzeichnis zurückkehren
    Pop-Location
}

Write-Host "Skript erfolgreich abgeschlossen."
Write-Host "Der Inhalt von $($GefundeneDateien.Count) passenden Datei(en) wurde in '$ZielDateiPfad' zusammengeführt."