# 🏥 Entretiens Cohort360

> **Projet d'exercices techniques Fullstack & Data**

---

### Lancement rapide avec Docker Compose

Les deux projets (backend Django + frontend React) se lancent ensemble depuis la racine :

```bash
docker compose up --build
```

- Backend disponible sur : http://localhost:8000
- Frontend disponible sur : http://localhost:3000

> Le backend démarre en premier (migrations + seed automatique), le frontend attend que le backend soit prêt avant de démarrer.

---

### Backend Django — `Exercice_Django/`

**Stack :** Python 3.12 · Django 5.x · Django REST Framework · django-filter · pytest

**Ce qui a été implémenté :**
- Modèle `Prescription` lié à `Patient` et `Medication`, avec validation des dates (`end_date >= start_date`) appliquée au niveau modèle (`clean/save`) et sérialiseur
- API REST complète : `GET`, `POST`, `PUT`, `PATCH`, `DELETE` sur `/api/prescriptions`
- Filtres avancés : par patient, médicament, statut, et 5 opérateurs de date (exact, gte, lte, gt, lt) sur `start_date` et `end_date`, combinables
- Pagination configurable (`page`, `page_size`, max 100)
- Données de démonstration : `python manage.py seed_demo`

**Lancer le backend (sans Docker) :**

```bash
cd Exercice_Django
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

**Lancer les tests Django :**

```bash
cd Exercice_Django
pip install -r requirements-dev.txt
pytest
```

---

### Frontend React — `Exercice_Front/`

**Stack :** React 18 · TypeScript · Vite · TanStack Query · React Hook Form · Tailwind CSS

**Ce qui a été implémenté :**
- Interface complète de gestion des prescriptions : liste, création, modification, suppression
- Filtres combinables (patient, médicament, statut, dates avec opérateurs et mode intervalle)
- Pagination côté serveur synchronisée avec le backend
- Gestion des erreurs et états de chargement

**Lancer le frontend (sans Docker) :**

```bash
cd Exercice_Front
npm install
npm run dev
```

**Lancer les tests React :**

```bash
cd Exercice_Front
npm test -- --run
```

---

Ce projet regroupe trois repositories distincts, chacun correspondant à un exercice technique différent dans le contexte
d'une application médicale.

---

## 🎯 Exercice Principal : API Fullstack Prescriptions Médicamenteuses

L'objectif principal de ces exercices est de **développer une nouvelle route API REST pour gérer les prescriptions
médicamenteuses des patients** et d'exposer ces données de manière complète et utilisable.

### Fonctionnalités attendues :

- ✅ Créer un modèle de données pour les prescriptions (lien Patient ↔ Médicament)
- ✅ Implémenter des endpoints REST (GET, POST, PUT/PATCH)
- ✅ Ajouter des filtres avancés (patient, médicament, dates, statut)
- ✅ Exposer, consommer ces données dans le frontend et permettre l'ajout de nouvelles prescriptions

---

## 📦 Structure du Projet

Le projet est organisé en trois sous-repositories indépendants :

### 1. 🖥️ **Frontend**

Exercice de développement côté client pour afficher et interagir avec les données de prescriptions.

**Voir** → [`/Exercice_Front/README.md`](./Exercice_Front/README.md) pour l'énoncé détaillé

---

### 2. ⚙️ **Backend Django**

Exercice backend avec Django REST Framework pour créer l'API de gestion des prescriptions.

**Voir** → [`/Exercice_Django/README.md`](./Exercice_Django/README.md) pour l'énoncé détaillé

---

### 3. 📊 **Backend Scala / Spark** *(optionnel)*

Exercice orienté traitement de données massives avec Scala et Apache Spark.

**Voir** → [`/Exercice_scala_spark/README.md`](./Exercice_scala_spark/README.md) pour l'énoncé détaillé

---

## 🔗 Dépendances entre les Exercices

Les exercices **Backend Django** et **Frontend** sont **liés** et doivent être réalisés dans l'ordre :

1. **Backend Django** : Créer l'API REST pour les prescriptions
2. **Frontend** : Consommer l'API Django, afficher les données, permettre l'ajout de nouvelles prescriptions

Le troisième exercice (**Scala/Spark**) est :

- ✨ **Indépendant** des deux autres
- 🎁 **Optionnel**

---

## ▶️ Ordre Recommandé de Réalisation

| Ordre | Exercice           | Statut      | Durée estimée |
|-------|--------------------|-------------|---------------|
| 1️⃣   | **Backend Django** | Obligatoire | ~1h           |
| 2️⃣   | **Frontend**       | Obligatoire | ~2-3h         |
| 3️⃣   | **Scala/Spark**    | Optionnel   | <1h           |

---

## 📖 Documentation

Chaque sous-repository contient son propre **README détaillé** avec :

- 📋 L'énoncé complet de l'exercice
- 🛠️ Les instructions d'installation
- 🚀 Les commandes de lancement
- ✅ Les critères d'acceptation

**Consultez les README individuels pour commencer !**

## 📖 Rendu

Vous pouvez fork ce repository afin de recuperer le code existant et lancer le projet facilement, puis nous soumettre l'URL de votre repo par e-mail.


---

**Bon courage ! 🎓**

