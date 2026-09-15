import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { 
  QuestionSource, 
  QuestionStatus, 
  QuestionType, 
  Difficulty, 
  Language,
  SudokuSize
} from '../src/types/question'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@champion.com' },
    update: {},
    create: {
      email: 'admin@champion.com',
      name: 'Administrateur',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created')

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@champion.com' },
    update: {},
    create: {
      email: 'user@champion.com',
      name: 'Utilisateur Test',
      password: userPassword,
      role: 'PLAYER'
    }
  })
  console.log('✅ Test user created')

  // Ensure progression exists for users
  await prisma.progression.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, xp: 1000, level: 5, streak: 3 }
  })

  await prisma.progression.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, xp: 500, level: 3, streak: 1 }
  })

  // Create French grammar questions
  const grammarQuestions = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'FRANCAIS',
      subcategory: 'GRAMMAIRE',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionText: 'Quel est le pluriel de "cheval"?',
      explanation: 'Le pluriel de cheval est chevaux. Les mots en -al prennent généralement un -x au pluriel.',
      points: 10,
      options: [
        { text: 'Chevals', isCorrect: false, order: 1 },
        { text: 'Chevaux', isCorrect: true, order: 2 },
        { text: 'Chevaus', isCorrect: false, order: 3 },
        { text: 'Chevals', isCorrect: false, order: 4 }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'FRANCAIS',
      subcategory: 'GRAMMAIRE',
      difficulty: Difficulty.MEDIUM,
      language: Language.FR,
      questionText: 'Complétez: "Il ___ manger quand je suis arrivé."',
      explanation: 'L\'imparfait est utilisé pour une action en cours de déroulement quand une autre action survient.',
      points: 15,
      options: [
        { text: 'mangeait', isCorrect: true, order: 1 },
        { text: 'mange', isCorrect: false, order: 2 },
        { text: 'mangera', isCorrect: false, order: 3 },
        { text: 'a mangé', isCorrect: false, order: 4 }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'FRANCAIS',
      subcategory: 'ORTHOGRAPHE',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionText: 'Comment écrit-on "les chaises"?',
      explanation: 'Le mot "chaise" est un nom féminin, son pluriel est "chaises" avec un "s".',
      points: 10,
      options: [
        { text: 'Les chaises', isCorrect: true, order: 1 },
        { text: 'Les chais', isCorrect: false, order: 2 },
        { text: 'Les chaise', isCorrect: false, order: 3 },
        { text: 'Les châises', isCorrect: false, order: 4 }
      ]
    }
  ]

  for (const q of grammarQuestions) {
    await prisma.question.create({
      data: {
        source: QuestionSource.MANUAL,
        status: QuestionStatus.APPROVED,
        type: q.type,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
        language: q.language,
        questionText: q.questionText,
        explanation: q.explanation,
        points: q.points,
        createdBy: admin.id,
        validatedBy: admin.id,
        validatedAt: new Date(),
        options: {
          create: q.options
        }
      }
    })
  }
  console.log('✅ French grammar questions created')

  // Create proverb questions
  const proverbQuestions = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'PROVERBES',
      subcategory: 'PROVERBES_FRANCAIS',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionText: 'Complétez le proverbe: "Qui dort ____"',
      explanation: 'Le proverbe complet est "Qui dort dîne". Cela signifie que si tu dors au lieu de travailler, tu n\'auras pas à manger.',
      points: 10,
      options: [
        { text: 'mange', isCorrect: false, order: 1 },
        { text: 'dîne', isCorrect: true, order: 2 },
        { text: 'travaille', isCorrect: false, order: 3 },
        { text: 'prie', isCorrect: false, order: 4 }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'PROVERBES',
      subcategory: 'PROVERBES_FRANCAIS',
      difficulty: Difficulty.MEDIUM,
      language: Language.FR,
      questionText: '"L\'habit ne fait pas le ____"',
      explanation: 'Ce proverbe signifie que l\'apparence ne définit pas la valeur d\'une personne.',
      points: 15,
      options: [
        { text: 'moine', isCorrect: true, order: 1 },
        { text: 'prêtre', isCorrect: false, order: 2 },
        { text: 'roi', isCorrect: false, order: 3 },
        { text: 'saint', isCorrect: false, order: 4 }
      ]
    }
  ]

  for (const q of proverbQuestions) {
    await prisma.question.create({
      data: {
        source: QuestionSource.MANUAL,
        status: QuestionStatus.APPROVED,
        type: q.type,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
        language: q.language,
        questionText: q.questionText,
        explanation: q.explanation,
        points: q.points,
        createdBy: admin.id,
        validatedBy: admin.id,
        validatedAt: new Date(),
        options: {
          create: q.options
        }
      }
    })
  }
  console.log('✅ Proverb questions created')

  // Create French-Creole translation questions
  const translationQuestions = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'FRANCAIS ↔ CREOLE',
      subcategory: 'FRANCAIS_VERS_CREOLE',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionText: 'Comment dit-on "Bonjour" en créole haïtien?',
      explanation: '"Bonjour" se dit "Bonjou" en créole haïtien.',
      points: 10,
      options: [
        { text: 'Bonjou', isCorrect: true, order: 1 },
        { text: 'Bonjour', isCorrect: false, order: 2 },
        { text: 'Sak pase', isCorrect: false, order: 3 },
        { text: 'Ki sa ou ye', isCorrect: false, order: 4 }
      ]
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'FRANCAIS ↔ CREOLE',
      subcategory: 'CREOLE_VERS_FRANCAIS',
      difficulty: Difficulty.EASY,
      language: Language.HT,
      questionText: 'Comment dit-on "Mèsi" en français?',
      explanation: '"Mèsi" signifie "Merci" en français.',
      points: 10,
      options: [
        { text: 'Merci', isCorrect: true, order: 1 },
        { text: 'S\'il vous plaît', isCorrect: false, order: 2 },
        { text: 'Bonjour', isCorrect: false, order: 3 },
        { text: 'Au revoir', isCorrect: false, order: 4 }
      ]
    }
  ]

  for (const q of translationQuestions) {
    await prisma.question.create({
      data: {
        source: QuestionSource.MANUAL,
        status: QuestionStatus.APPROVED,
        type: q.type,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
        language: q.language,
        questionText: q.questionText,
        explanation: q.explanation,
        points: q.points,
        createdBy: admin.id,
        validatedBy: admin.id,
        validatedAt: new Date(),
        options: {
          create: q.options
        }
      }
    })
  }
  console.log('✅ Translation questions created')

  // Create riddles
  const riddleBase = await prisma.question.create({
    data: {
      source: QuestionSource.MANUAL,
      status: QuestionStatus.APPROVED,
      type: QuestionType.RIDDLE,
      category: 'DEVINETTES',
      subcategory: 'DEVINETTES_CLASSIQUES',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionText: 'Je suis plus fort que le dieu, plus méchant que le diable. Les pauvres m\'ont, les riches en ont besoin. Si tu me manges, tu meurs. Qui suis-je?',
      explanation: 'La réponse est "Rien". Rien n\'est plus fort que Dieu, rien n\'est plus méchant que le diable, les pauvres n\'ont rien, les riches n\'ont besoin de rien, et si tu manges rien, tu meurs.',
      points: 20,
      timeLimit: 60,
      createdBy: admin.id,
      validatedBy: admin.id,
      validatedAt: new Date()
    }
  })

  await prisma.riddle.create({
    data: {
      questionId: riddleBase.id,
      riddleText: riddleBase.questionText,
      answer: 'rien',
      hints: JSON.stringify([
        { text: 'Je suis un concept abstrait', penalty: 5 },
        { text: 'Je commence par R', penalty: 5 },
        { text: 'Je suis l\'absence de tout', penalty: 5 }
      ]),
      difficulty: Difficulty.EASY,
      timeLimit: 60
    }
  })
  console.log('✅ Riddle created')

  // Create Sudoku puzzles
  for (let i = 0; i < 3; i++) {
    await prisma.sudoku.create({
      data: {
        size: SudokuSize.SUDOKU_9X9,
        difficulty: Difficulty.MEDIUM,
        puzzle: JSON.stringify(Array(9).fill(null).map(() => Array(9).fill(0))),
        solution: JSON.stringify(Array(9).fill(null).map(() => Array(9).fill(0)))
      }
    })
  }
  console.log('✅ Sudoku puzzles created')

  // Create a quiz
  await prisma.quiz.create({
    data: {
      title: 'Quiz Français - Débutant',
      description: 'Testez vos connaissances en français',
      category: 'FRANCAIS',
      difficulty: Difficulty.EASY,
      language: Language.FR,
      questionCount: 3,
      timeLimit: 300,
      isPublished: true,
      createdBy: admin.id
    }
  })
  console.log('✅ Quiz created')

  // Create badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'Première Victoire',
        description: 'Gagnez votre première partie',
        type: 'FIRST_WIN',
        icon: '🏆',
        criteria: JSON.stringify({ type: 'first_win' })
      },
      {
        name: 'Série de 5',
        description: 'Obtenez une série de 5 réponses correctes',
        type: 'STREAK_5',
        icon: '🔥',
        criteria: JSON.stringify({ type: 'streak', count: 5 })
      },
      {
        name: 'Score Parfait',
        description: 'Obtenez 100% dans un quiz',
        type: 'PERFECT_SCORE',
        icon: '⭐',
        criteria: JSON.stringify({ type: 'perfect_score' })
      }
    ]
  })
  console.log('✅ Badges created')

  // Create scoring config
  await prisma.scoringConfig.create({
    data: {
      basePoints: 10,
      difficultyMultiplier: JSON.stringify({
        BEGINNER: 1.0,
        EASY: 1.2,
        MEDIUM: 1.5,
        HARD: 2.0,
        EXPERT: 2.5,
        MASTER: 3.0,
        LEGEND: 4.0
      }),
      timeBonus: 5,
      streakBonus: 10,
      perfectBonus: 20,
      hintPenalty: 5
    }
  })
  console.log('✅ Scoring config created')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })