import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Save, ArrowLeft } from 'lucide-react'
import { useInspectionStore } from '../hooks/useInspectionStore'
import { INSPECTION_CATEGORIES, ANSWER_TYPES } from '../utils/scoring'

/**
 * Formulaire d'Inspection Interactif
 * Permet de saisir les réponses aux questions de chaque catégorie
 */
function InspectionForm({ onComplete }) {
  const { 
    inspectionData, 
    setSiteInfo, 
    setAnswer, 
    saveToLocalStorage, 
    loadFromLocalStorage 
  } = useInspectionStore()
  
  const [expandedCategories, setExpandedCategories] = useState({})
  const [siteInfo, setSiteInfoLocal] = useState(inspectionData.siteInfo)
  const [saveMessage, setSaveMessage] = useState('')

  // Charger les données au montage
  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  // Initialiser les catégories ouvertes
  useEffect(() => {
    const initial = {}
    Object.keys(INSPECTION_CATEGORIES).forEach((key, index) => {
      initial[key] = index === 0 // Ouvrir la première catégorie
    })
    setExpandedCategories(initial)
  }, [])

  // Sauvegarder les informations du site
  const handleSiteInfoChange = (field, value) => {
    const newSiteInfo = { ...siteInfo, [field]: value }
    setSiteInfoLocal(newSiteInfo)
    setSiteInfo(newSiteInfo)
  }

  // Basculer l'expansion d'une catégorie
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  // Gérer le changement de réponse
  const handleAnswerChange = (categoryId, questionIndex, answer) => {
    setAnswer(categoryId, questionIndex, answer)
    showSaveMessage()
  }

  // Afficher un message de sauvegarde temporaire
  const showSaveMessage = () => {
    setSaveMessage('💾 Sauvegardé automatiquement')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  // Sauvegarder et retourner au dashboard
  const handleSubmit = () => {
    saveToLocalStorage()
    setSaveMessage('✅ Inspection sauvegardée!')
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => onComplete()}
          className="flex items-center space-x-2 text-primary hover:text-blue-700 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au tableau de bord</span>
        </button>
        <h2 className="text-3xl font-bold text-dark">Nouvelle Inspection</h2>
        <p className="text-secondary mt-2">
          Complétez les informations du site et répondez aux questions
        </p>
      </div>

      {/* Informations du site */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">📍 Informations du Site</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nom du site"
            value={siteInfo.siteName}
            onChange={(value) => handleSiteInfoChange('siteName', value)}
            placeholder="Ex: Bâtiment A"
          />
          <FormInput
            label="Localisation"
            value={siteInfo.location}
            onChange={(value) => handleSiteInfoChange('location', value)}
            placeholder="Ex: 123 Rue Principal, Ville"
          />
          <FormInput
            label="Inspecteur"
            value={siteInfo.inspector}
            disabled
          />
          <FormInput
            label="Date d'inspection"
            type="date"
            value={siteInfo.inspectionDate}
            onChange={(value) => handleSiteInfoChange('inspectionDate', value)}
          />
          <div className="md:col-span-2">
            <FormTextarea
              label="Description / Observations"
              value={siteInfo.description}
              onChange={(value) => handleSiteInfoChange('description', value)}
              placeholder="Commentaires supplémentaires..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Catégories d'inspection */}
      <div className="space-y-4 mb-8">
        {Object.entries(INSPECTION_CATEGORIES).map(([key, category]) => (
          <CategorySection
            key={key}
            categoryKey={key}
            category={category}
            expanded={expandedCategories[key]}
            onToggle={() => toggleCategory(key)}
            answers={inspectionData.answers[category.id] || []}
            onAnswerChange={handleAnswerChange}
          />
        ))}
      </div>

      {/* Message de sauvegarde */}
      {saveMessage && (
        <div className="fixed bottom-8 right-8 bg-primary text-white px-4 py-3 rounded-lg shadow-lg animate-bounce">
          {saveMessage}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center sticky bottom-0 bg-white p-4 rounded-t-lg shadow-lg">
        <button
          onClick={() => onComplete()}
          className="px-6 py-3 border-2 border-secondary text-secondary rounded-lg hover:bg-gray-100 transition font-medium"
        >
          ❌ Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg"
        >
          <Save className="w-5 h-5" />
          <span>Enregistrer l'Inspection</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Section de catégorie pliable
 */
function CategorySection({ 
  categoryKey, 
  category, 
  expanded, 
  onToggle, 
  answers, 
  onAnswerChange 
}) {
  const categoryColor = category === INSPECTION_CATEGORIES.FIRE_SAFETY ? '#dc2626' :
                       category === INSPECTION_CATEGORIES.ELECTRICAL ? '#ea580c' :
                       category === INSPECTION_CATEGORIES.SAFETY ? '#16a34a' : '#0891b2'

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4" 
         style={{ borderColor: categoryColor }}>
      {/* En-tête pliable */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.name.split(' ')[1]}</span>
          <h3 className="text-lg font-bold text-dark">{category.name}</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary" />
        )}
      </button>

      {/* Contenu plié */}
      {expanded && (
        <div className="px-6 py-4 bg-light space-y-4 border-t">
          {category.questions.map((question, index) => (
            <Question
              key={index}
              index={index}
              question={question}
              answer={answers[index]}
              onAnswerChange={(answer) => 
                onAnswerChange(category.id, index, answer)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Composant question unique
 */
function Question({ index, question, answer, onAnswerChange }) {
  return (
    <div className="space-y-3 pb-4 border-b last:border-b-0">
      <p className="font-semibold text-dark">
        {index + 1}. {question}
      </p>
      <div className="flex flex-wrap gap-2">
        <AnswerButton
          label="✅ Conforme"
          selected={answer === ANSWER_TYPES.COMPLIANT}
          onClick={() => onAnswerChange(ANSWER_TYPES.COMPLIANT)}
          className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
        />
        <AnswerButton
          label="❌ Non-conforme"
          selected={answer === ANSWER_TYPES.NON_COMPLIANT}
          onClick={() => onAnswerChange(ANSWER_TYPES.NON_COMPLIANT)}
          className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
        />
        <AnswerButton
          label="⊘ Non-applicable"
          selected={answer === ANSWER_TYPES.NOT_APPLICABLE}
          onClick={() => onAnswerChange(ANSWER_TYPES.NOT_APPLICABLE)}
          className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
        />
      </div>
    </div>
  )
}

/**
 * Bouton de réponse
 */
function AnswerButton({ label, selected, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
        selected
          ? `${className} border-current font-bold scale-105`
          : `${className}`
      }`}
    >
      {label}
    </button>
  )
}

/**
 * Composant input de formulaire réutilisable
 */
function FormInput({ label, value, onChange, disabled, type = 'text', placeholder }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-dark">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  )
}

/**
 * Composant textarea de formulaire réutilisable
 */
function FormTextarea({ label, value, onChange, placeholder, rows }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-dark">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition resize-none"
      />
    </div>
  )
}

export default InspectionForm
