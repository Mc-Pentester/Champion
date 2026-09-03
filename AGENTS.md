# CHAMPION V1 - Guide pour Développeurs

## 📋 Informations de Projet

**Nom**: CHAMPION  
**Version**: 1.0.0  
**Type**: Application de jeux de connaissances  
**Stack**: Next.js 14+, TypeScript, Prisma, SQLite/PostgreSQL

## 🚀 Commandes de Développement

### Installation et Démarrage
```bash
npm install              # Installer les dépendances
npm run dev             # Démarrer le serveur de développement
npm run build           # Construire pour production
npm start               # Démarrer le serveur de production
npm run seed            # Charger les données de démonstration
npm test                # Exécuter les tests
npm run lint            # Linter le code
```

### Base de Données
```bash
npx prisma generate     # Générer le client Prisma
npx prisma migrate dev   # Créer et appliquer les migrations
npx prisma studio        # Ouvrir Prisma Studio
npx prisma db push       # Synchroniser le schéma avec la DB
```

## 🏗️ Architecture du Projet

### Structure des Services

Les services sont organisés par domaine métier :

- **QuestionBankService**: Gestion complète des questions
- **QuestionSelectionService**: Sélection automatique intelligente
- **ScoringService**: Système de points configurable
- **GameService**: Moteur de jeu principal
- **RiddleService**: Module spécifique aux devinettes
- **SudokuService**: Moteur Sudoku indépendant

### Flux de Données Principal

```
ADMIN
  ↓
Créer question (DRAFT)
  ↓
Valider question (APPROVED)
  ↓
BANQUE DE QUESTIONS
  ↓
MOTEUR DE SÉLECTION
  ↓
QUIZ / JEU
  ↓
JOUEUR
  ↓
RÉPONSE
  ↓
SCORE → XP → NIVEAU
```

## 🔐 Sécurité

### Règles Importantes

1. **Jamais exposer les réponses correctes au client**
   - Utiliser `QuestionBankService.getQuestionById(id, false)` pour les requêtes publiques
   - Seul l'admin peut voir les réponses avec `includeAnswers = true`

2. **Validation serveur obligatoire**
   - Ne jamais faire confiance aux données du client
   - Valider tous les inputs dans les routes API
   - Vérifier les permissions avant chaque action

3. **Protection des routes admin**
   - Le middleware vérifie le rôle ADMIN
   - Toutes les routes admin doivent vérifier la session

4. **Protection des scores**
   - Les scores sont calculés côté serveur
   - Le client ne peut pas modifier son XP ou son niveau

## 📝 Conventions de Code

### TypeScript
- Utiliser les types définis dans `src/types/`
- Éviter `any` autant que possible
- Utiliser les enums pour les valeurs constantes

### Services
- Les services sont des classes statiques
- Les méthodes retournent des promesses
- Gestion d'erreurs avec try/catch
- Messages d'erreur explicites

### API Routes
- Vérifier l'authentification en premier
- Valider les données d'entrée
- Retourner des réponses JSON cohérentes
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)

### Tests
- Un test par fonctionnalité principale
- Nettoyage des données de test dans `afterEach`
- Tests isolés et indépendants
- Noms de tests descriptifs

## 🎯 Points d'Attention

### Questions
- Toujours vérifier le statut (APPROVED) avant utilisation publique
- Les options de réponse doivent avoir un ordre
- Le champ `isCorrect` ne doit jamais être exposé

### Jeux
- Une session de jeu doit toujours avoir un statut
- Les réponses doivent être liées à une session
- Le temps de réponse est en millisecondes

### Progression
- L'XP est cumulative, le niveau est calculé
- Les streaks se reset après une mauvaise réponse
- Les badges sont décernés manuellement pour l'instant

### Sudoku
- Les grilles sont stockées en JSON
- La validation se fait à chaque mouvement
- Le temps est en secondes

## 🐛 Débogage

### Problèmes Communs

**Question non trouvée**
- Vérifier le statut (doit être APPROVED)
- Vérifier que l'ID est correct
- Consulter Prisma Studio

**Authentification échoue**
- Vérifier NEXTAUTH_SECRET dans .env
- Vérifier que la session est bien créée
- Consulter les cookies du navigateur

**Score incorrect**
- Vérifier la configuration ScoringConfig
- Vérifier les multiplicateurs de difficulté
- Consulter les logs de ScoringService

**Sudoku invalide**
- Vérifier que la grille générée est valide
- Tester avec SudokuService.validateGrid()
- Vérifier les mouvements du joueur

## 📊 Surveillance

### Métriques à Suivre

- Nombre de questions par catégorie
- Taux de validation des questions
- Temps moyen de réponse
- Taux de réussite par catégorie
- Progression des utilisateurs
- Sessions de jeu abandonnées

## 🔧 Configuration

### Variables d'Environnement

```env
DATABASE_URL="file:./dev.db"           # SQLite
# DATABASE_URL="postgresql://..."     # PostgreSQL
NEXTAUTH_SECRET="votre-secret"         # Secret NextAuth
NEXTAUTH_URL="http://localhost:3000"   # URL de l'app
```

### Configuration des Points

Modifier via `ScoringService.updateConfig()` :
- `basePoints`: Points de base
- `difficultyMultiplier`: Multiplicateurs par difficulté
- `timeBonus`: Bonus pour réponses rapides
- `streakBonus`: Bonus pour séries
- `perfectBonus`: Bonus pour score parfait
- `hintPenalty`: Pénalité par indice utilisé

## 🚀 Déploiement

### Pré-production
```bash
npm run build
npm run seed
npm start
```

### Production
- Utiliser PostgreSQL au lieu de SQLite
- Configurer NEXTAUTH_SECRET avec une valeur forte
- Activer HTTPS
- Configurer les variables d'environnement
- Mettre en place des backups de base de données

## 📚 Ressources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- Tailwind: https://tailwindcss.com/docs

### Outils
- Prisma Studio: `npx prisma studio`
- TypeScript: Strict mode activé
- ESLint: Configuration Next.js

## 🎯 Objectifs V1 Atteints

✅ Architecture modulaire et extensible  
✅ Base de données normalisée  
✅ Système d'authentification sécurisé  
✅ Banque de questions avec validation  
✅ Moteur de sélection automatique  
✅ Système de points configurable  
✅ Progression (XP, niveau, streaks)  
✅ Module Devinettes avec indices  
✅ Moteur Sudoku indépendant  
✅ Interface admin fonctionnelle  
✅ Interface mobile-first  
✅ API sécurisées et validées  
✅ Données de démonstration  
✅ Tests unitaires  
✅ Documentation complète  

## 🔮 Préparations pour V2

L'architecture est prête pour :
- Génération de questions par IA (abstraction QuestionSource)
- Mode multijoueur (relations utilisateur existantes)
- Classements en temps réel (structure LeaderboardEntry)
- Nouveaux types de jeux (services modulaires)

---

**Dernière mise à jour**: Septembre 2026  
**Statut**: Prêt pour développement V2