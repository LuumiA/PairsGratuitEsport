# PairsGratuitEsport

Plateforme de prédiction esport 100% gratuite — aucune mise réelle, uniquement des points virtuels gagnés via un quiz quotidien et misés sur de vrais matchs **Valorant**, **CS2** et **League of Legends**.

## Fonctionnalités

- Compte (email/mot de passe), profil avec pseudo/bio/photo
- Paris en points virtuels sur de vrais matchs (données [PandaScore](https://pandascore.co)), cotes dynamiques (Elo)
- Quiz esport quotidien, banque de questions gérable depuis `/admin/quiz`
- Groupes d'amis avec mini-tournois sur une durée définie par le créateur
- Classement global du serveur

## Stack

Next.js 16 (App Router, TypeScript, Turbopack) · Tailwind CSS v4 · shadcn/ui (Base UI) · Supabase (Auth, Postgres, Storage, RLS) · API PandaScore

## Démarrage local

```bash
npm install
npm run dev
```

Crée un fichier `.env.local` à la racine avec :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PANDASCORE_API_KEY=
CRON_SECRET=
```

Les migrations SQL (schéma, RLS, fonctions) sont dans `supabase/migrations/` — à exécuter dans l'ordre via le SQL Editor du dashboard Supabase.

## Synchronisation des matchs

Les routes `/api/cron/sync-matches`, `/api/cron/settle-matches` et `/api/cron/rotate-quiz` sont protégées par le header `Authorization: Bearer $CRON_SECRET` et doivent être appelées périodiquement par un scheduler externe (le cron gratuit de Vercel est limité à 1 exécution/jour).
