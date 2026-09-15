import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions as any)

  if (!session || (session as any).user?.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Administration</h1>
          <p className="text-gray-600">Gestion des questions et du contenu</p>
        </header>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link href="/admin/questions" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">❓</div>
            <div className="font-semibold text-gray-800">Gestion des Questions</div>
            <div className="text-sm text-gray-600">Créer, modifier, valider</div>
          </Link>

          <Link href="/admin/statistics" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-gray-800">Statistiques</div>
            <div className="text-sm text-gray-600">Vue d&apos;ensemble du contenu</div>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-gray-800">Utilisateurs</div>
            <div className="text-sm text-gray-600">Gestion des comptes</div>
          </Link>

          <Link href="/admin/quizzes" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-gray-800">Quiz</div>
            <div className="text-sm text-gray-600">Créer des quiz</div>
          </Link>

          <Link href="/admin/riddles" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🤔</div>
            <div className="font-semibold text-gray-800">Devinettes</div>
            <div className="text-sm text-gray-600">Gérer les devinettes</div>
          </Link>

          <Link href="/admin/sudoku" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-semibold text-gray-800">Sudoku</div>
            <div className="text-sm text-gray-600">Gérer les grilles</div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Statistiques Rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Questions totales</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Questions approuvées</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Rejetées</div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}