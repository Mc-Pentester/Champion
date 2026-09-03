import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AdminQuestionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">❓ Gestion des Questions</h1>
              <p className="text-gray-600">Créer, modifier et valider les questions</p>
            </div>
            <a href="/admin" className="text-indigo-600 hover:text-indigo-800">
              ← Retour
            </a>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Toutes</option>
                <option value="FRANCAIS">Français</option>
                <option value="PROVERBES">Proverbes</option>
                <option value="DEVINETTES">Devinettes</option>
                <option value="SUDOKU">Sudoku</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Toutes</option>
                <option value="BEGINNER">Débutant</option>
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HARD">Difficile</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Tous</option>
                <option value="DRAFT">Brouillon</option>
                <option value="APPROVED">Approuvé</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Question Button */}
        <div className="mb-6">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            + Créer une question
          </button>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Questions</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Aucune question pour le moment</p>
            <p className="text-sm mt-2">Utilisez le bouton ci-dessus pour créer la première question</p>
          </div>
        </div>
      </div>
    </div>
  )
}