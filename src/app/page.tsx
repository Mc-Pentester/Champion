import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">🏆 CHAMPION</h1>
            <p className="text-indigo-700">Jeux de connaissances, de langue et de réflexion</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-8">
            <p className="text-center text-gray-600 mb-6">
              Bienvenue sur CHAMPION V1! Connectez-vous pour commencer à jouer.
            </p>
            <div className="space-y-4">
              <a href="/auth/signin" className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center font-semibold">
                Se connecter
              </a>
              <a href="/auth/signup" className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center font-semibold">
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">🏆 CHAMPION</h1>
          <p className="text-indigo-700">Jeux de connaissances, de langue et de réflexion</p>
        </header>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Bienvenue, {session.user?.name || session.user?.email}!</p>
              <p className="text-sm text-gray-600">Niveau: 1 | XP: 0 | Série: 0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Rôle: {(session.user as any).role}</p>
            </div>
          </div>
        </div>

        {/* Game Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <button className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🎮</div>
            <div className="font-semibold">Jouer</div>
            <div className="text-sm opacity-90">Quiz rapide</div>
          </button>

          <button className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📅</div>
            <div className="font-semibold">Défi du jour</div>
            <div className="text-sm opacity-90">Question quotidienne</div>
          </button>

          <button className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🤔</div>
            <div className="font-semibold">Devinettes</div>
            <div className="text-sm opacity-90">Énigmes fun</div>
          </button>

          <button className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📚</div>
            <div className="font-semibold">Français</div>
            <div className="text-sm opacity-90">Grammaire, vocabulaire</div>
          </button>

          <button className="bg-gradient-to-br from-pink-400 to-pink-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">💬</div>
            <div className="font-semibold">Proverbes</div>
            <div className="text-sm opacity-90">Expressions populaires</div>
          </button>

          <button className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🌍</div>
            <div className="font-semibold">Français ↔ Créole</div>
            <div className="text-sm opacity-90">Traduction</div>
          </button>

          <button className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-semibold">Sudoku</div>
            <div className="text-sm opacity-90">Logique</div>
          </button>

          <button className="bg-gradient-to-br from-red-400 to-red-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🔮</div>
            <div className="font-semibold">Énigmes</div>
            <div className="text-sm opacity-90">Raisonnement</div>
          </button>

          <button className="bg-gradient-to-br from-amber-400 to-amber-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🏅</div>
            <div className="font-semibold">Classement</div>
            <div className="text-sm opacity-90">Meilleurs scores</div>
          </button>
        </div>

        {/* Admin Link */}
        {(session.user as any).role === "ADMIN" && (
          <div className="bg-gray-800 text-white p-4 rounded-lg">
            <a href="/admin" className="block text-center">
              <div className="text-xl mb-1">⚙️</div>
              <div className="font-semibold">Administration</div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}