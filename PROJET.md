# Mémo technique — supabase-test-project

Document de référence permettant de reconstituer ou de reprendre le projet depuis zéro.

---

## 1. Objectif du projet

Application web full-stack de démonstration CRUD utilisant Supabase comme base de données PostgreSQL hébergée. Elle expose une API REST en Node.js et une interface web minimaliste en HTML/CSS/JS vanilla.

---

## 2. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Base de données | **Supabase** (PostgreSQL hébergé) | Gratuit, API REST auto-générée, dashboard intégré |
| Backend | **Node.js + Express 5** | Simple, compatible avec les handlers déjà écrits pour Vercel |
| Frontend | **HTML/CSS/JS vanilla** | Pas de framework nécessaire pour un projet de test |
| Tests | **Jest 29** | Standard de l'écosystème JS |
| Runtime | **Node.js 22 (ESM)** | `"type": "module"` dans package.json — import/export natif |

---

## 3. Structure du projet

```
test-subabase/
├── server.js                  # Point d'entrée : serveur Express
├── package.json
├── .env                       # Variables d'environnement (non versionné)
├── .env.example               # Template des variables requises
├── public/
│   └── index.html             # Interface web SPA (dark theme)
├── api/
│   ├── _supabase.js           # Initialisation du client Supabase
│   ├── profiles/
│   │   ├── index.js           # GET /api/profiles, POST /api/profiles
│   │   └── [id].js            # GET/PUT/DELETE /api/profiles/:id
│   └── posts/
│       ├── index.js           # GET /api/posts, POST /api/posts
│       └── [id].js            # GET/PUT/DELETE /api/posts/:id
├── src/
│   ├── index.js               # Script de démo CLI (CRUD complet)
│   ├── db/supabase.js         # Client Supabase pour la couche service
│   └── services/
│       ├── profileService.js  # Logique métier profils
│       └── postService.js     # Logique métier articles
├── tests/
│   ├── profileService.test.js
│   └── postService.test.js
└── supabase/
    └── migrations/
        ├── 001_create_tables.sql   # Schéma : profiles, posts, tags, post_tags
        └── 002_seed_data.sql       # Données de test
```

---

## 4. Schéma de base de données

```sql
-- Profils utilisateurs
profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  age        INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Articles
posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  content    TEXT,
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  published  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Tags (many-to-many avec posts via post_tags)
tags       (id, name UNIQUE, created_at)
post_tags  (post_id FK, tag_id FK, PRIMARY KEY(post_id, tag_id))
```

Trigger `update_updated_at()` appliqué sur `profiles` et `posts` pour mettre à jour `updated_at` automatiquement.

---

## 5. Variables d'environnement

Fichier `.env` à créer à la racine (ne jamais versionner) :

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # optionnel
PORT=3000
```

Ces valeurs se trouvent dans le dashboard Supabase : **Project Settings → API**.

---

## 6. Installation et lancement

```bash
git clone <repo>
cd test-subabase
npm install
cp .env.example .env   # puis remplir les valeurs Supabase
npm start              # http://localhost:3000
```

Lancer les tests :

```bash
npm test
```

Appliquer les migrations (une seule fois, dans le SQL Editor du dashboard Supabase) :

```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_seed_data.sql
```

---

## 7. API REST — routes disponibles

### Profils

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/profiles` | Liste tous les profils |
| POST | `/api/profiles` | Crée un profil (`name`, `email` requis, `age` optionnel) |
| GET | `/api/profiles/:id` | Profil + ses posts associés |
| PUT | `/api/profiles/:id` | Met à jour un profil |
| DELETE | `/api/profiles/:id` | Supprime un profil |

### Articles

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/posts` | Liste les posts (`?published=true`, `?search=mot`) |
| POST | `/api/posts` | Crée un post (`title`, `author_id` requis) |
| GET | `/api/posts/:id` | Post + auteur + tags |
| PUT | `/api/posts/:id` | Met à jour un post |
| DELETE | `/api/posts/:id` | Supprime un post |

---

## 8. Historique des décisions techniques

### Abandons de Vercel

**Contexte :** Le projet était initialement configuré pour être déployé sur Vercel (fichier `vercel.json`, handlers au format Vercel serverless). Vercel CLI a été utilisé pour le développement local (`vercel dev`).

**Décision :** Remplacement par un serveur Express local (`server.js`).

**Raison :** Vercel CLI n'était pas nécessaire pour le développement et ajoutait une complexité inutile. Express est plus simple à lancer et correspond mieux à un projet de test local.

**Impact :** Les handlers `api/**/*.js` n'ont pas été modifiés — ils utilisent déjà l'interface `(req, res)` compatible Express.

---

### ESM (ES Modules) et Jest

**Contexte :** Le projet utilise `"type": "module"` dans `package.json`, ce qui active les imports natifs (`import/export`) dans Node.js.

**Problème rencontré :** Jest ne supporte pas nativement les ES Modules. Plusieurs tentatives ont échoué :
- `jest.mock()` ne fonctionne pas avec ESM → remplacé par `jest.unstable_mockModule()`
- La configuration `extensionsToTreatAsEsm` générait des erreurs quand `.js` était inclus (il est automatiquement inféré par `type: module`)
- Le script `test` devait pointer explicitement sur le binaire Jest avec `--experimental-vm-modules`

**Solution finale :**
```json
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
```
Et dans les fichiers de test :
```js
import { jest } from '@jest/globals'
const { createClient } = await jest.unstable_mockModule('@supabase/supabase-js', () => ({ ... }))
```

---

### Double client Supabase

**Contexte :** Il existe deux endroits d'initialisation du client Supabase :
- `api/_supabase.js` — utilisé par les handlers Express
- `src/db/supabase.js` — utilisé par la couche service (`src/services/`)

**Raison :** Les deux couches ont été développées indépendamment. Pas de refactorisation faite volontairement pour ne pas casser les tests existants.

---

## 9. Points d'attention pour une reprise

- Le fichier `.env` n'est pas versionné — il faut le recréer depuis `.env.example`
- Les migrations SQL ne sont pas appliquées automatiquement — à exécuter manuellement dans le dashboard Supabase
- `vercel.json` est toujours présent mais n'est plus utilisé — peut être supprimé
- Le serveur doit rester **ouvert dans le terminal** pendant l'utilisation de l'interface web
- Jest est en mode expérimental pour ESM — des warnings peuvent apparaître, c'est normal

---

## 10. Environnement de développement

| Élément | Version / Détail |
|---|---|
| OS de développement | Windows (Chrome pour les tests navigateur) |
| Node.js | 22.x |
| npm | inclus avec Node 22 |
| Éditeur | — |
| Navigateur | Google Chrome |
| Hébergement DB | Supabase Cloud (plan gratuit) |
| Port local | 3000 |
