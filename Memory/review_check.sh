#!/bin/bash
# review_check.sh — Verifie quotidiennement les decisions a reviser
# Les decisions dont la date_revision est atteinte passent en "review_due"
# Concu pour etre execute par cron chaque jour.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CSV_FILE="$SCRIPT_DIR/decisions.csv"
TODAY=$(date +%Y-%m-%d)

if [ ! -f "$CSV_FILE" ]; then
    echo "Fichier $CSV_FILE introuvable."
    exit 1
fi

TEMP_FILE=$(mktemp)
FLAGGED=0

# Lire le header
head -1 "$CSV_FILE" > "$TEMP_FILE"

# Traiter chaque ligne (sauf header) — redirection pour eviter le subshell
while IFS= read -r line; do
    if [ -z "$line" ]; then
        continue
    fi

    REVIEW_DATE=$(echo "$line" | awk -F',' '{print $5}')
    STATUS=$(echo "$line" | awk -F',' '{print $6}')

    if [ "$STATUS" = "active" ] && [[ "$TODAY" > "$REVIEW_DATE" || "$TODAY" == "$REVIEW_DATE" ]]; then
        UPDATED_LINE=$(echo "$line" | sed 's/,active$/,review_due/')
        echo "$UPDATED_LINE" >> "$TEMP_FILE"
        FLAGGED=$((FLAGGED + 1))
    else
        echo "$line" >> "$TEMP_FILE"
    fi
done < <(tail -n +2 "$CSV_FILE")

mv "$TEMP_FILE" "$CSV_FILE"

if [ "$FLAGGED" -gt 0 ]; then
    echo "$FLAGGED decision(s) flaggee(s) pour revision."
else
    echo "Aucune decision a reviser aujourd'hui."
fi
