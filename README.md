# 🏆 CHAMPION - Version 1

CHAMPION est une application de jeux de connaissances, de langue, de logique et de réflexion, conçue pour être évolutive et modulaire.

## 🎯 Mission V1

La VERSION 1 est centrée principalement sur :
- La langue française
- Les devinettes
- Les énigmes
- Les proverbes
- Le français ↔ créole haïtien
- Les jeux de logique
- Le Sudoku

L'architecture est conçue pour évoluer vers d'autres catégories et vers la génération de questions par IA dans les versions futures.

## 🛠️ Stack Technique

- **Framework**: Next.js 14+ avec App Router
- **Langage**: TypeScript
- **ORM**: Prisma
- **Base de données**: SQLite (développement) / PostgreSQL (production)
- **Authentification**: NextAuth.js
- **Styling**: Tailwind CSS
- **Tests**: Jest

## 📁 Structure du Projet

```
champion/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                # Données de démonstration
│   └── migrations/            # Migrations Prisma
├── src/
│   ├── app/                   # Pages Next.js
│   │   ├── api/              # Routes API
│   │   │   ├── admin/        # API Admin
│   │   │   ├── auth/         # API Authentification
│   │   │   ├── game/         # API Jeu
│   │   │   ├── riddles/      # API Devinettes
│   │   │   └── sudoku/       # API Sudoku
│   │   ├── admin/            # Pages Admin
│   │   ├── auth/             # Pages Authentification
│   │   └── page.tsx          # Page d'accueil
│   ├── lib/                  # Utilitaires
│   │   ├── auth.ts           # Configuration NextAuth
│   │   └── prisma.ts         # Client Prisma
│   ├── services/             # Services métier
│   │   ├── QuestionBankService.ts
│   │   ├── QuestionSelectionService.ts
│   │   ├── ScoringService.ts
│   │   ├── GameService.ts
│   │   ├── RiddleService.ts
│   │   ├── SudokuService.ts
│   │   └── __tests__/        # Tests unitaires
│   └── types/                # Types TypeScript
│       ├── question.ts       # Enums et types
│       └── next-auth.d.ts    # Types NextAuth
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── jest.config.js
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Charger les données de démonstration
npm run seed
```

### Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 👤 Utilisateurs de Développement

Le script de seed crée deux utilisateurs de test :

- **Admin**: `admin@champion.com` / `admin123`
- **User**: `user@champion.com` / `user123`

## 🏗️ Architecture

### Modèles de Données

#### Utilisateur & Authentification
- **User**: Informations utilisateur et rôle
- **Progression**: XP, niveau, série
- **Badge**: Badges et achievements
- **UserBadge**: Badges obtenus par les utilisateurs

#### Système de Questions
- **Question**: Question avec métadonnées
- **QuestionOption**: Options de réponse pour QCM
- **Riddle**: Données spécifiques aux devinettes

#### Système de Quiz
- **Quiz**: Quiz avec questions ordonnées
- **QuizQuestion**: Relation entre quiz et questions

#### Système de Jeu
- **GameSession**: Partie jouée par un utilisateur
- **PlayerAnswer**: Réponses du joueur
- **Sudoku**: Grilles Sudoku
- **SudokuGameSession**: Parties Sudoku

#### Classement & Progression
- **LeaderboardEntry**: Entrées du classement
- **ScoringConfig**: Configuration du système de points

### Services Métier

#### QuestionBankService
Gestion de la banque de questions :
- Création de questions
- Validation (admin)
- Filtrage et recherche
- Statistiques

#### QuestionSelectionService
Sélection automatique de questions :
- Sélection par critères
- Évitement des doublons
- Gestion des questions récentes

#### ScoringService
Système de points configurables :
- Calcul de score avec multiplicateurs
- Gestion de l'XP et des niveaux
- Système de séries (streaks)
- Configuration dynamique

#### GameService
Moteur de jeu :
- Création de sessions
- Soumission de réponses
- Suivi de progression
- Statistiques utilisateur

#### RiddleService
Module de devinettes :
- Création de devinettes
- Système d'indices avec pénalités
- Vérification des réponses

#### SudokuService
Moteur Sudoku indépendant :
- Génération de grilles
- Validation des mouvements
- Différentes tailles (4x4, 6x6, 9x9)
- Niveaux de difficulté

## 🔐 Sécurité

### Rôles d'Utilisateur
- **USER**: Accès aux jeux publics
- **ADMIN**: Accès complet à l'administration
- **MODERATOR**: Validation de contenu (à implémenter)

### Protection des Données
- Les réponses correctes ne sont jamais exposées au client
- Validation serveur de toutes les actions
- Protection des routes admin via middleware
- Hachage des mots de passe avec bcrypt

### Sources de Questions
- **MANUAL**: Questions créées par admin
- **SYSTEM**: Sélection automatique (pas de génération)
- **AI**: Préparé mais désactivé en V1

## 📡 API Routes

### Authentification
- `POST /api/auth/register` - Inscription
- `GET/POST /api/auth/[...nextauth]` - NextAuth

### Admin
- `GET/POST /api/admin/questions` - Gestion des questions
- `GET/PUT/DELETE /api/admin/questions/[id]` - Question spécifique
- `POST /api/admin/questions/[id]/validate` - Validation
- `GET /api/admin/statistics` - Statistiques

### Jeu
- `POST /api/game/session` - Créer une session
- `GET /api/game/session` - Session active
- `GET /api/game/session/[id]` - Session spécifique
- `POST /api/game/session/[id]` - Compléter une session
- `DELETE /api/game/session/[id]` - Abandonner
- `POST /api/game/answer` - Soumettre une réponse

### Devinettes
- `GET /api/riddles` - Devinette aléatoire
- `GET /api/riddles/[id]` - Devinette spécifique
- `POST /api/riddles/[id]` - Vérifier réponse
- `GET /api/riddles/[id]/hint` - Obtenir un indice

### Sudoku
- `GET /api/sudoku` - Grille aléatoire
- `POST /api/sudoku/session` - Démarrer une partie
- `GET /api/sudoku/session/[id]` - Session spécifique
- `POST /api/sudoku/session/[id]` - Faire un mouvement
- `DELETE /api/sudoku/session/[id]` - Abandonner

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests avec couverture
npm test -- --coverage
```

### Tests Implémentés
- QuestionBankService (création, validation, sécurité)
- ScoringService (calcul, progression, streaks)
- SudokuService (génération, validation)

## 🎨 Catégories V1

### Français
- Grammaire
- Orthographe
- Conjugaison
- Syntaxe
- Vocabulaire
- Homophones
- Synonymes
- Antonymes
- Tournures de phrases
- Expressions

### Proverbes
- Proverbes français
- Proverbes créoles
- Interprétation
- Traduction
- Équivalence culturelle

### Français ↔ Créole
- Français vers créole
- Créole vers français
- Compréhension
- Traduction
- Expressions
- Proverbes

### Devinettes
- Devinettes classiques
- Devinettes de mots
- Devinettes logiques
- Devinettes à indices
- Charades
- Rébus

### Énigmes
- Logique
- Mathématique
- Raisonnement

### Sudoku
- Sudoku 4x4, 6x6, 9x9
- Difficultés: Débutant à Expert

## 📈 Progression

### Système de Points
- Points de base configurables
- Multiplicateurs par difficulté
- Bonus de rapidité
- Bonus de série (streak)
- Bonus de score parfait
- Pénalités pour indices

### Niveaux
- Formule: `niveau = 1 + floor(sqrt(xp / 100))`
- XP requis: `(niveau - 1)² * 100`

### Badges
- Première victoire
- Série de 5/10
- Score parfait
- Maître de catégorie
- Démon de vitesse
- Maître des puzzles

## 🔮 Évolutions Futures

### V2
- Génération de questions par IA (avec validation humaine)
- Mode multijoueur
- Classements en temps réel
- Plus de catégories (culture générale, histoire, etc.)

### V3
- Jeux supplémentaires (mots croisés, anagrammes, memory)
- IA avancée pour personnalisation
- Mode apprentissage adaptatif
- Statistiques détaillées

## 📝 Développement

### Ajouter une Nouvelle Catégorie

1. Ajouter la catégorie dans les types
2. Créer des questions de test
3. Mettre à jour les filtres admin
4. Ajouter les routes API si nécessaire

### Ajouter un Nouveau Type de Question

1. Ajouter l'enum dans `types/question.ts`
2. Mettre à jour le schéma Prisma si nécessaire
3. Adapter QuestionBankService
4. Créer les tests correspondants

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence propriétaire.

## 📞 Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.

---

**Version**: 1.0.0  
**Date**: Septembre 2026  
**Statut**: Initialisation complète ✅