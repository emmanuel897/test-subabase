# Supabase Test Project

Projet de démonstration des opérations CRUD avec [Supabase](https://supabase.com) et JavaScript (ES Modules).

## Structure du projet

```
supabase-test-project/
├── src/
│   ├── db/
│   │   └── supabase.js          # Client Supabase
│   ├── services/
│   │   ├── profileService.js    # CRUD profils
│   │   └── postService.js       # CRUD articles
│   └── index.js                 # Script de démonstration
├── supabase/
│   └── migrations/
│       ├── 001_create_tables.sql  # Schéma de la BDD
│       └── 002_seed_data.sql      # Données initiales
├── tests/
│   ├── profileService.test.js   # Tests unitaires profils
│   └── postService.test.js      # Tests unitaires articles
├── .env.example                 # Variables d'environnement (template)
└── package.json
```

## Prérequis

- Node.js >= 18
- Un projet [Supabase](https://app.supabase.com) (gratuit)

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos identifiants Supabase
```

## Configuration Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez vos clés API dans **Settings > API**
4. Remplissez `.env` :

```env
SUPABASE_URL=https://votre-projet-id.supabase.co
SUPABASE_ANON_KEY=votre-cle-anon
```

5. Exécutez les migrations SQL dans **SQL Editor** du dashboard Supabase :
   - `supabase/migrations/001_create_tables.sql`
   - `supabase/migrations/002_seed_data.sql` (optionnel)

## Utilisation

```bash
# Lancer la démo CRUD complète
npm start

# Lancer les tests unitaires
npm test
```

## Fonctionnalités démontrées

### profileService
| Méthode | Description |
|---------|-------------|
| `create(data)` | Créer un profil |
| `getAll()` | Lister tous les profils |
| `getById(id)` | Récupérer par ID |
| `getByEmail(email)` | Récupérer par email |
| `update(id, data)` | Mettre à jour |
| `delete(id)` | Supprimer |

### postService
| Méthode | Description |
|---------|-------------|
| `create(data)` | Créer un article |
| `getAll()` | Lister tous les articles |
| `getPublished()` | Articles publiés uniquement |
| `getById(id)` | Récupérer par ID (avec auteur et tags) |
| `getByAuthor(authorId)` | Articles d'un auteur |
| `update(id, data)` | Mettre à jour |
| `publish(id)` | Publier un brouillon |
| `delete(id)` | Supprimer |
| `search(query)` | Recherche full-text |

## Schéma de la base de données

```
profiles          posts             tags
─────────         ─────────         ────────
id (UUID)    ←── author_id          id (UUID)
name              id (UUID)         name
email             title
age               content        post_tags
created_at        published      ─────────
updated_at        created_at     post_id ──→ posts
                  updated_at     tag_id  ──→ tags
```

## Technologies

- **[Supabase](https://supabase.com)** - Backend as a Service (PostgreSQL)
- **[@supabase/supabase-js](https://github.com/supabase/supabase-js)** - Client JavaScript officiel
- **[dotenv](https://github.com/motdotla/dotenv)** - Gestion des variables d'environnement
- **[Jest](https://jestjs.io)** - Framework de tests
