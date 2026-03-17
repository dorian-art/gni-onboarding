# Preferences

Preferences de travail et conventions du projet.

## Style de travail

- **Pas de confirmation** : Dorian valide tout automatiquement. Agir directement sans demander permission pour les déploiements, modifications, etc.
- **Langue** : Communiquer en francais.
- **Rapidite** : Aller droit au but, pas de blabla.

## Conventions techniques

- **Un seul App.js** par projet (pas de decoupage en composants separés).
- **React CRA** comme base pour tous les projets.
- **Supabase** pour le backend (auth, DB, storage).
- **Vercel** pour le deploiement.
- **Pas de TypeScript** : JavaScript simple.

## Deploiement

- Commande backoffice : `cd /Users/doriandelchambre/Desktop/gni-onboarding && npx vercel --prod --yes`
- Commande portail : `cd /Users/doriandelchambre/Desktop/gni-portail && npx vercel --prod --yes`
- URLs :
  - Backoffice : https://gni-onboarding.vercel.app
  - Portail : https://gni-portail.vercel.app?id=<clientId>
