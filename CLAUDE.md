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

## Regles generales

- **Langue** : Communiquer en francais
- **Pas de confirmation** : Dorian valide tout automatiquement. Agir directement.
- **Concision** : Aller droit au but, pas de blabla
- **Architecture** : Un seul App.js par projet, React CRA, Supabase, Vercel
- **Deploiement** : `npx vercel --prod --yes` (pas de vercel global)
