# Instructions Claude

## Memoire persistante

Au debut de chaque session, lis les fichiers du repertoire `/Memory` :
- `Memory/Decisions.md` — Decisions techniques et produit
- `Memory/People.md` — Personnes et roles
- `Memory/Preferences.md` — Preferences de travail et conventions
- `Memory/Users.md` — Utilisateurs finaux des apps

A la fin de chaque session ou quand une information importante emerge :
- Mets a jour le fichier Memory correspondant
- Ajoute les nouvelles decisions dans Decisions.md
- Ajoute les nouvelles personnes dans People.md
- Mets a jour les preferences si elles changent dans Preferences.md
- Mets a jour les infos utilisateurs dans Users.md

## Task Dashboard

Au debut de chaque session, lis `Memory/Tasks.json`. S'il y a des taches en attente :
1. Lister les taches au user, triees par priorite (critical > high > medium > low)
2. Proposer de traiter la tache de plus haute priorite
3. Quand une tache est realisee, la marquer comme completee via l'API ou directement dans Tasks.json
4. Logger l'activite dans Tasks.log

Quand le user dit "fais mes taches" ou "traite le dashboard" :
- Lire Tasks.json
- Executer concretement le travail decrit (code, fix, deploiement, etc.)
- Marquer comme termine
- Passer a la suivante par ordre de priorite

## Regles generales

- **Langue** : Communiquer en francais
- **Pas de confirmation** : Dorian valide tout automatiquement. Agir directement.
- **Concision** : Aller droit au but, pas de blabla
- **Architecture** : Un seul App.js par projet, React CRA, Supabase, Vercel
- **Deploiement** : `npx vercel --prod --yes` (pas de vercel global)
