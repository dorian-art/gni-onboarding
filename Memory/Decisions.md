# Decisions

Historique des décisions techniques et produit prises sur le projet.

## Architecture

- **Monofichier App.js** : chaque projet (backoffice, portail, performance) utilise un seul fichier App.js pour simplifier le développement rapide.
- **Supabase unique** : une seule instance Supabase (`niueqiwxhljhouqsjqqx`) partagée entre tous les projets GNI.
- **Déploiement Vercel** : via `npx vercel --prod --yes` (CLI non installée globalement).
- **Pas de GitHub** pour gni-performance (travail local uniquement pour le moment).

## Base de données

- Table `clients` : colonnes JSONB (`documents`, `informations`, `communication`) plutôt que tables relationnelles pour flexibilité.
- Storage Supabase : bucket `documents`, path `{clientId}/{itemId}.{ext}`.
- IDs clients en production : strings "1", "2", "3", "4".

## Appels vocaux (Vapi)

- Utilisation d'un assistant Vapi existant avec `assistantId` + `variableValues` pour personnaliser chaque appel avec le contexte client.
- Voix Azure fr-FR-DeniseNeural pour le français.
- Modèle OpenAI gpt-4o avec `language: fr`.

## GNI Performance

- Mode démo activé (`DEMO_MODE = true`) avec données fictives Belliss'Immo.
- Schéma SQL préparé mais pas encore exécuté dans Supabase.
- Libs séparées dans `src/lib/` (kpis, compensation, simulator, auth, formatters).
