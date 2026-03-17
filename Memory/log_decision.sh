#!/bin/bash
# log_decision.sh — Enregistre une decision dans decisions.csv
# Usage: ./log_decision.sh "decision" "raisonnement" "resultat attendu"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CSV_FILE="$SCRIPT_DIR/decisions.csv"

if [ $# -lt 3 ]; then
    echo "Usage: $0 \"decision\" \"raisonnement\" \"resultat_attendu\""
    echo "Exemple: $0 \"Migrer vers TypeScript\" \"Meilleure maintenabilite\" \"Moins de bugs en prod\""
    exit 1
fi

DECISION="$1"
RAISONNEMENT="$2"
RESULTAT="$3"

TODAY=$(date +%Y-%m-%d)
REVIEW_DATE=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)

# Echapper les guillemets dans les champs CSV
escape_csv() {
    local val="$1"
    if [[ "$val" == *","* || "$val" == *'"'* || "$val" == *$'\n'* ]]; then
        val="${val//\"/\"\"}"
        val="\"$val\""
    fi
    echo "$val"
}

D=$(escape_csv "$DECISION")
R=$(escape_csv "$RAISONNEMENT")
RES=$(escape_csv "$RESULTAT")

echo "$TODAY,$D,$R,$RES,$REVIEW_DATE,active" >> "$CSV_FILE"

echo "Decision enregistree :"
echo "  Date        : $TODAY"
echo "  Decision    : $DECISION"
echo "  Raisonnement: $RAISONNEMENT"
echo "  Resultat    : $RESULTAT"
echo "  Revision    : $REVIEW_DATE"
