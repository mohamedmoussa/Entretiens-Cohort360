# Application Frontend - Gestion des Prescriptions

Application React + TypeScript pour gérer les prescriptions médicamenteuses des patients.

## 🚀 Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique strict
- **Vite** - Build tool moderne et rapide
- **TanStack Query (React Query)** - Gestion d'état serveur
- **React Hook Form** - Gestion des formulaires
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS utility-first
- **Vitest** - Framework de test unitaire
- **ESLint** - Linter pour qualité du code

## 📋 Prérequis

- Node.js >= 18
- npm ou yarn
- Backend Django en cours d'exécution sur `http://localhost:8000`

## 🔧 Installation

### Option 1: Développement local

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Option 2: Avec Docker

```bash
# Build et démarrage avec docker-compose (frontend + backend)
docker compose up --build

# L'application sera accessible sur http://localhost:3000
# Le backend sur http://localhost:8000
```

## 📜 Scripts disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de développement

# Build
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Qualité du code
npm run lint         # Vérifier le code avec ESLint
npm run type-check   # Vérifier les types TypeScript

# Tests
npm run test         # Lancer les tests unitaires
npm run test:ui      # Interface graphique pour les tests
```

## 🏗️ Architecture du projet

```
src/
├── components/          # Composants React réutilisables
│   ├── PrescriptionList.tsx      # Affichage tableau des prescriptions
│   ├── PrescriptionForm.tsx      # Formulaire création/édition
│   └── PrescriptionFilters.tsx   # Filtres de recherche
├── hooks/               # Custom hooks React
│   └── useApi.ts                 # Hooks React Query pour l'API
├── services/            # Services et logique métier
│   └── api.ts                    # Client API Axios
├── types/               # Définitions TypeScript
│   └── api.ts                    # Types pour l'API
├── utils/               # Fonctions utilitaires
│   └── formatters.ts             # Formatage dates, statuts, etc.
├── test/                # Configuration des tests
│   └── setup.ts
├── App.tsx              # Composant principal
├── main.tsx             # Point d'entrée
└── index.css            # Styles globaux + Tailwind
```

## ✨ Fonctionnalités

### 1. Affichage des prescriptions
- Liste paginée avec toutes les informations (patient, médicament, dates, statut, commentaire)
- Détails du patient (nom, prénom, date de naissance)
- Détails du médicament (code, label)
- Badge coloré pour le statut (Valide, En attente, Supprimé)

### 2. Filtrage avancé
- Par patient (sélection dropdown)
- Par médicament (sélection dropdown)
- Par statut (Valide / En attente / Supprimé)
- Par date de début (minimum)
- Par date de fin (maximum)
- Combinaison de plusieurs filtres simultanément
- Bouton de réinitialisation des filtres

### 3. Création de prescription
- Formulaire complet avec validation
- Sélection patient parmi la liste
- Sélection médicament parmi la liste (uniquement actifs)
- Dates avec validation (date fin >= date début)
- Choix du statut
- Commentaire optionnel
- Gestion des erreurs et retour utilisateur

### 4. Suppression
- Suppression d'une prescription avec confirmation
- Rafraîchissement automatique de la liste

## 🎨 Bonnes pratiques implémentées

### 1. TypeScript strict
- Configuration `strict: true` dans tsconfig.json
- Typage complet de toutes les fonctions et variables
- Pas d'utilisation de `any`
- Interfaces pour toutes les données de l'API

### 2. Séparation des responsabilités
- **Services** : Logique d'appels API
- **Hooks** : Logique de gestion d'état
- **Components** : UI uniquement
- **Utils** : Fonctions réutilisables

### 3. Gestion d'état optimisée
- React Query pour le cache et synchronisation serveur
- Invalidation automatique du cache après mutations
- Stale time configuré pour éviter requêtes inutiles
- Loading states et error handling

### 4. Performance
- Composants fonctionnels avec hooks
- React Query évite les requêtes redondantes
- Build optimisé avec Vite (code splitting, tree shaking)
- Images et assets optimisés
- Lazy loading potentiel pour routes futures

### 5. Accessibilité
- Labels associés aux inputs (`htmlFor`)
- Attributs ARIA sur les boutons
- Structure sémantique HTML
- Contraste des couleurs respecté

### 6. Validation
- Validation côté client avec React Hook Form
- Messages d'erreur clairs et contextuels
- Validation des dates (fin >= début)
- Champs requis marqués visuellement

### 7. UX/UI
- Design responsive (mobile, tablet, desktop)
- Loading states pour les actions asynchrones
- Feedback visuel (success, error)
- Confirmation avant suppression
- Design cohérent avec Tailwind

## 🔌 Configuration de l'API

Le frontend communique avec le backend Django via l'URL configurée dans `.env`:

```env
VITE_API_URL=http://localhost:8000
```

En développement, Vite proxy automatiquement `/api` vers le backend (voir `vite.config.ts`).

## 🧪 Tests

Les tests unitaires utilisent Vitest et Testing Library:

```bash
# Lancer les tests
npm run test

# Interface graphique
npm run test:ui
```

Structure des tests:
- Tests des utilitaires (formatters)
- Tests des composants (comportement UI)
- Tests des hooks (logique métier)

## 🐳 Docker

### Build de l'image

```bash
docker build -t prescription-frontend .
```

### Déploiement

L'image Docker utilise nginx pour servir l'application en production:
- Build multi-stage pour optimiser la taille
- Configuration nginx pour SPA routing
- Gzip compression activée
- Cache optimisé pour les assets statiques

## 📊 Optimisations futures possibles

- [ ] Pagination côté serveur pour grandes listes
- [ ] Recherche textuelle en temps réel
- [ ] Export CSV/PDF des prescriptions
- [ ] Graphiques et statistiques
- [ ] Notifications en temps réel (WebSocket)
- [ ] Mode hors-ligne avec service worker
- [ ] Thème dark mode
- [ ] Internationalisation (i18n)

## 🤝 Contribution

Code respectant:
- Convention de nommage TypeScript
- Composants fonctionnels uniquement
- Hooks personnalisés pour logique réutilisable
- Props typées avec interfaces
- Documentation JSDoc pour fonctions complexes

## 📝 License

Projet d'exercice technique - APHP Cohort360
