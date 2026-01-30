'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import IrysUpload from '@/components/IrysUpload'
import { ArrowLeft, Plus, Trash2, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'

interface PricingTier {
  id: string
  min_passengers: number
  max_passengers: number
  price: number
}

interface Experience {
  id: string
  name: string
  description: string
  category: string
  location: string
  duration_hours: number
  duration_minutes?: number
  base_price: number
  max_passengers: number
  min_passengers?: number
  is_active: boolean
  includes: string[]
  highlights: string[]
  requirements: string[]
  meeting_point: string
  pricing_tiers?: PricingTier[]
  metadata: any
}

interface ExperienceImage {
  id: string
  image_url: string
  caption: string
  is_primary: boolean
  order_index: number
}

// Preset options
const INCLUDES_PRESETS = [
  'Round-trip helicopter transport',
  'Professional pilot and guide',
  'Safety equipment and briefing',
  'Bottled water and snacks',
  'Photography opportunities',
  'Aerial photography',
  'Hotel pickup and drop-off',
  'Champagne toast',
  'Gourmet lunch',
  'All taxes and fees'
]

const HIGHLIGHTS_PRESETS = [
  'Breathtaking aerial views',
  'Exclusive access to remote locations',
  'Expert commentary throughout',
  'Small group experience',
  'Weather-dependent flight paths',
  'Sunset/sunrise timing available',
  'VIP treatment',
  'Once-in-a-lifetime experience',
  'Perfect for special occasions',
  'Instagram-worthy moments'
]

const MEETING_POINT_PRESETS = [
  'La Aurora International Airport - Main Terminal',
  'La Aurora International Airport - Private Aviation Terminal',
  'Hotel pickup available',
  'Marina Puerto Quetzal',
  'Antigua Central Park',
  'Guatemala City Heliport',
  'Hotel lobby (specified at booking)',
  'Custom location (to be arranged)'
]

export default function EditExperiencePage() {
  const router = useRouter()
  const params = useParams()
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [images, setImages] = useState<ExperienceImage[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'helitour',
    location: '',
    duration_hours: 1,
    duration_minutes: 0,
    base_price: 100,
    max_passengers: 10,
    min_passengers: 1,
    is_active: true,
    includes: [] as string[],
    highlights: [] as string[],
    requirements: [] as string[],
    meeting_point: '',
    pricing_tiers: [] as PricingTier[]
  })

  const [newInclude, setNewInclude] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [newRequirement, setNewRequirement] = useState('')
  const [showIncludesDropdown, setShowIncludesDropdown] = useState(false)
  const [showHighlightsDropdown, setShowHighlightsDropdown] = useState(false)
  const [showMeetingPointDropdown, setShowMeetingPointDropdown] = useState(false)

  const fetchExperience = useCallback(async () => {
    try {
      const response = await fetch(`/api/experiences/${params.id}`, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      if (data.experience) {
        const exp = data.experience
        setExperience(exp as Experience)
        setFormData({
          name: exp.name || '',
          description: exp.description || '',
          category: exp.category || 'helitour',
          location: exp.location || '',
          duration_hours: exp.duration_hours || 1,
          duration_minutes: exp.duration_minutes || 0,
          base_price: exp.base_price || 100,
          max_passengers: exp.max_passengers || 10,
          min_passengers: exp.min_passengers || 1,
          is_active: exp.is_active !== false,
          includes: exp.includes || [],
          highlights: exp.highlights || [],
          requirements: exp.requirements || [],
          meeting_point: exp.meeting_point || '',
          pricing_tiers: exp.pricing_tiers || []
        })
      }
    } catch (error) {
      console.error('Error fetching experience:', error)
      alert('Failed to load experience. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/experience-images?experience_id=${params.id}`, { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }, [params.id])

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      router.push('/admin')
      return
    }

    if (params.id) {
      fetchExperience()
      fetchImages()
    }
  }, [profile, params.id, router, fetchExperience, fetchImages])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple simultaneous saves
    if (saving) return
    setSaving(true)

    try {
      // Only update core fields that definitely exist in the database schema
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        duration_hours: formData.duration_hours,
        base_price: formData.base_price,
        max_passengers: formData.max_passengers,
        is_active: formData.is_active,
        includes: formData.includes
      }

      // Add new metadata fields only if they have values
      if (formData.duration_minutes !== undefined && formData.duration_minutes > 0) {
        updateData.duration_minutes = formData.duration_minutes
      }
      if (formData.min_passengers !== undefined && formData.min_passengers > 0) {
        updateData.min_passengers = formData.min_passengers
      }
      if (formData.highlights && formData.highlights.length > 0) {
        updateData.highlights = formData.highlights
      }
      if (formData.requirements && formData.requirements.length > 0) {
        updateData.requirements = formData.requirements
      }
      if (formData.meeting_point) {
        updateData.meeting_point = formData.meeting_point
      }
      if (formData.pricing_tiers && formData.pricing_tiers.length > 0) {
        updateData.pricing_tiers = formData.pricing_tiers
      }

      console.log('🔄 Updating experience with data:', updateData)

      const response = await fetch(`/api/experiences/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result.error)
        throw new Error(result.error)
      }

      console.log('✅ Experience updated successfully')
      alert('Experience updated successfully!')
    } catch (error: any) {
      console.error('❌ Error updating experience:', error)
      alert(`Failed to update experience: ${error?.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (url: string) => {
    try {
      const response = await fetch('/api/experience-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          experience_id: params.id,
          image_url: url,
          caption: '',
          is_primary: images.length === 0,
          order_index: images.length
        })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)
      if (result.image) {
        setImages(prev => [...prev, result.image])
        setShowImageUpload(false)
      }
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Failed to save image')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/experience-images?id=${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Update local state optimistically
      setImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })))

      // Note: Setting primary would require an API endpoint update
      // For now, this just updates local state
      // TODO: Add endpoint to update image primary status
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('Failed to set primary image')
    }
  }

  // Debounced caption update
  const updateCaptionDebounced = useCallback((imageId: string, caption: string) => {
    const timerId = setTimeout(async () => {
      try {
        // Note: Caption update would require an API endpoint
        // For now just log it
        console.log('Caption update:', imageId, caption)
      } catch (error) {
        console.error('Error updating caption:', error)
      }
    }, 1000)

    return () => clearTimeout(timerId)
  }, [])

  const addToArray = (field: 'includes' | 'highlights' | 'requirements', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeFromArray = (field: 'includes' | 'highlights' | 'requirements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Pricing tier management
  const addPricingTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      min_passengers: 1,
      max_passengers: 2,
      price: formData.base_price
    }
    setFormData(prev => ({
      ...prev,
      pricing_tiers: [...prev.pricing_tiers, newTier]
    }))
  }

  const updatePricingTier = (id: string, field: keyof PricingTier, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.map(tier =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    }))
  }

  const removePricingTier = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.filter(tier => tier.id !== id)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Experience Not Found</h1>
          <Link
            href="/admin#experiences"
            className="text-gold-400 hover:text-gold-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin#experiences"
            className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          <h1 className="text-4xl font-bold text-white">
            Edit Experience
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Manage experience details, pricing, and media</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-luxury-charcoal rounded-soft shadow-lg border border-gray-800 p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Experience Details</h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="59"
                    value={formData.duration_minutes || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="border-2 border-blue-200 dark:border-gray-700 rounded p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                    Pricing Tiers
                  </h3>
                  <button
                    type="button"
                    onClick={addPricingTier}
                    className="flex items-center space-x-2 px-4 py-2 bg-navy-600 text-white rounded hover:bg-navy-700 transition-colors shadow-sm"
                    style={{ backgroundColor: '#1e40af' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Price Bracket</span>
                  </button>
                </div>

                {/* Base Price (always visible) */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-800 rounded">
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-2">
                    Base Price (Default)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Passengers</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.min_passengers || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_passengers: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Passengers</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_passengers}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_passengers: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Pricing Tiers */}
                {formData.pricing_tiers.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Price Brackets:</p>
                    {formData.pricing_tiers.map((tier) => (
                      <div key={tier.id} className="p-4 bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-700 rounded">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Pass.</label>
                            <input
                              type="number"
                              min="1"
                              value={tier.min_passengers}
                              onChange={(e) => updatePricingTier(tier.id, 'min_passengers', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Pass.</label>
                            <input
                              type="number"
                              min="1"
                              value={tier.max_passengers}
                              onChange={(e) => updatePricingTier(tier.id, 'max_passengers', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                            />
                          </div>
                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price ($)</label>
                              <input
                                type="number"
                                min="0"
                                value={tier.price}
                                onChange={(e) => updatePricingTier(tier.id, 'price', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePricingTier(tier.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Includes */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  What's Included
                </label>
                <div className="space-y-2">
                  {formData.includes.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-navy-800 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('includes', index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="relative">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newInclude}
                        onChange={(e) => setNewInclude(e.target.value)}
                        onFocus={() => setShowIncludesDropdown(true)}
                        placeholder="Type or select from presets..."
                        className="flex-1 px-4 py-3 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newInclude.trim()) {
                            addToArray('includes', newInclude)
                            setNewInclude('')
                            setShowIncludesDropdown(false)
                          }
                        }}
                        className="px-5 py-3 bg-navy-600 text-white rounded hover:bg-navy-700 transition-colors shadow-sm"
                        style={{ backgroundColor: '#1e40af' }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {showIncludesDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-luxury-charcoal border-2 border-navy-200 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                        {INCLUDES_PRESETS.filter(preset =>
                          !formData.includes.includes(preset) &&
                          preset.toLowerCase().includes(newInclude.toLowerCase())
                        ).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              addToArray('includes', preset)
                              setNewInclude('')
                              setShowIncludesDropdown(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-navy-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-100 dark:border-gray-700 dark:text-gray-200"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Experience Highlights
                </label>
                <div className="space-y-2">
                  {formData.highlights.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-navy-800 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('highlights', index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="relative">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onFocus={() => setShowHighlightsDropdown(true)}
                        placeholder="Type or select from presets..."
                        className="flex-1 px-4 py-3 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newHighlight.trim()) {
                            addToArray('highlights', newHighlight)
                            setNewHighlight('')
                            setShowHighlightsDropdown(false)
                          }
                        }}
                        className="px-5 py-3 bg-navy-600 text-white rounded hover:bg-navy-700 transition-colors shadow-sm"
                        style={{ backgroundColor: '#1e40af' }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {showHighlightsDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-luxury-charcoal border-2 border-navy-200 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                        {HIGHLIGHTS_PRESETS.filter(preset =>
                          !formData.highlights.includes(preset) &&
                          preset.toLowerCase().includes(newHighlight.toLowerCase())
                        ).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              addToArray('highlights', preset)
                              setNewHighlight('')
                              setShowHighlightsDropdown(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-navy-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-100 dark:border-gray-700 dark:text-gray-200"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 rounded">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('requirements', index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add requirement..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('requirements', newRequirement)
                        setNewRequirement('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Meeting Point */}
              <div>
                <label htmlFor="meeting_point" className="block text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Meeting Point
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="meeting_point"
                    value={formData.meeting_point}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_point: e.target.value }))}
                    onFocus={() => setShowMeetingPointDropdown(true)}
                    placeholder="Type or select from presets..."
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  {showMeetingPointDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-luxury-charcoal border-2 border-navy-200 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                      {MEETING_POINT_PRESETS.filter(preset =>
                        preset.toLowerCase().includes(formData.meeting_point.toLowerCase())
                      ).map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, meeting_point: preset }))
                            setShowMeetingPointDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-navy-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-100 dark:border-gray-700 dark:text-gray-200"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-gray-800 rounded">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-navy-600 focus:ring-navy-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-navy-900 dark:text-gray-200">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex space-x-4 pt-4 border-t-2 border-slate-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-navy-600 text-white py-4 px-6 rounded hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-50 font-semibold text-lg shadow-lg transition-all"
                  style={{ backgroundColor: '#1e40af' }}
                >
                  {saving ? 'Saving Changes...' : '💾 Save Experience'}
                </button>
              </div>
            </form>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-luxury-charcoal rounded shadow-lg border border-slate-200 dark:border-gray-800 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Experience Gallery</h2>
              <button
                onClick={() => setShowImageUpload(true)}
                className="bg-navy-600 text-white px-5 py-3 rounded hover:bg-navy-700 flex items-center space-x-2 shadow-sm transition-colors"
                style={{ backgroundColor: '#1e40af' }}
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add Image</span>
              </button>
            </div>

            <div className="space-y-4">
              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Click "Add Image" to upload your first image</p>
                </div>
              ) : (
                images.map((image) => (
                  <div key={image.id} className="border rounded p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'Experience image'}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {image.is_primary && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={image.caption || ''}
                          onChange={(e) => {
                            const newCaption = e.target.value
                            // Update local state immediately for responsive UI
                            setImages(prev => prev.map(img =>
                              img.id === image.id ? { ...img, caption: newCaption } : img
                            ))
                            // Debounce the database update
                            updateCaptionDebounced(image.id, newCaption)
                          }}
                          placeholder="Image caption..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex space-x-2 mt-2">
                          {!image.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(image.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && (
          <IrysUpload
            onUploadComplete={handleImageUpload}
            onClose={() => setShowImageUpload(false)}
          />
        )}
      </div>
    </div>
  )
}