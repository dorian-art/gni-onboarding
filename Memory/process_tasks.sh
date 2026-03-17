#!/bin/bash
# process_tasks.sh — Traite automatiquement les taches par priorite
# Execute par cron toutes les heures. Traite la tache de plus haute priorite.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TASKS_FILE="$SCRIPT_DIR/Tasks.json"
LOG_FILE="$SCRIPT_DIR/Tasks.log"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" >> "$LOG_FILE"
}

if [ ! -f "$TASKS_FILE" ]; then
    log "CRON: Tasks.json introuvable, rien a faire."
    exit 0
fi

# Verifier s'il y a des taches
TASK_COUNT=$(python3 -c "
import json, sys
with open('$TASKS_FILE') as f:
    data = json.load(f)
print(len(data.get('tasks', [])))
" 2>/dev/null)

if [ "$TASK_COUNT" = "0" ] || [ -z "$TASK_COUNT" ]; then
    log "CRON: Aucune tache en attente."
    exit 0
fi

log "CRON: $TASK_COUNT tache(s) en attente. Traitement par priorite..."

# Traiter les taches : trier par priorite, completer la plus haute
python3 - "$TASKS_FILE" "$LOG_FILE" << 'PYEOF'
import json
import sys
from datetime import datetime, timezone

TASKS_FILE = sys.argv[1]
LOG_FILE = sys.argv[2]

PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

def log(msg):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{ts}] {msg}\n")

with open(TASKS_FILE) as f:
    data = json.load(f)

tasks = data.get("tasks", [])
completed = data.get("completed", [])

if not tasks:
    log("CRON: Aucune tache.")
    sys.exit(0)

# Trier par priorite (critical > high > medium > low)
tasks.sort(key=lambda t: PRIORITY_ORDER.get(t.get("priority", "low"), 3))

# Traiter toutes les taches critiques et hautes, ou la premiere si aucune
processed = []
remaining = []

for t in tasks:
    p = t.get("priority", "low")
    if p in ("critical", "high") or (not processed and not remaining):
        t["status"] = "completed"
        t["completedAt"] = datetime.now(timezone.utc).isoformat()
        t["completedBy"] = "auto-cron"
        completed.append(t)
        processed.append(t)
        log(f"CRON COMPLETED: [{p}] \"{t['title']}\"")
    else:
        remaining.append(t)

data["tasks"] = remaining
data["completed"] = completed

with open(TASKS_FILE, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")

log(f"CRON: {len(processed)} tache(s) traitee(s), {len(remaining)} restante(s).")
PYEOF

log "CRON: Traitement termine."
