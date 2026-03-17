#!/bin/bash
# Review.sh — Affiche uniquement les decisions flaggees "review_due"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CSV_FILE="$SCRIPT_DIR/decisions.csv"

if [ ! -f "$CSV_FILE" ]; then
    echo "Fichier $CSV_FILE introuvable."
    exit 1
fi

# Compter les decisions a reviser
COUNT=$(grep -c ",review_due" "$CSV_FILE" 2>/dev/null)
if [ -z "$COUNT" ]; then COUNT=0; fi

if [ "$COUNT" -eq 0 ]; then
    echo "Aucune decision en attente de revision."
    exit 0
fi

echo "========================================"
echo "  DECISIONS A REVISER ($COUNT)"
echo "========================================"
echo ""

# Afficher chaque decision flaggee
grep ",review_due" "$CSV_FILE" | while IFS=',' read -r date decision raisonnement resultat date_revision status; do
    # Nettoyer les guillemets CSV
    decision=$(echo "$decision" | sed 's/^"//;s/"$//')
    raisonnement=$(echo "$raisonnement" | sed 's/^"//;s/"$//')
    resultat=$(echo "$resultat" | sed 's/^"//;s/"$//')

    echo "----------------------------------------"
    echo "  Date        : $date"
    echo "  Decision    : $decision"
    echo "  Raisonnement: $raisonnement"
    echo "  Resultat    : $resultat"
    echo "  Revision    : $date_revision"
    echo "----------------------------------------"
    echo ""
done

echo "Pour marquer une decision comme revisee, editez decisions.csv"
echo "et changez 'review_due' en 'reviewed' ou 'active' (nouveau cycle)."
