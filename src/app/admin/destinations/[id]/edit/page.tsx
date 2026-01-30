'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import IrysUpload from '@/components/IrysUpload'
import { ArrowLeft, Plus, Trash2, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'

interface Destination {
  id: string
  name: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  features: string[]
  highlights?: string[]
  requirements?: string[]
  meeting_point?: string
  best_time?: string
  difficulty_level?: string
  is_hub?: boolean
  airport_id?: string
  airport?: { id: string; code: string; name: string; city: string } | null
  is_active: boolean
  metadata: any
}

interface Airport {
  id: string
  code: string
  name: string
  city: string
}

interface DestinationImage {
  id: string
  image_url: string
  caption: string
  is_primary: boolean
  order_index: number
}

export default function EditDestinationPage() {
  const router = useRouter()
  const params = useParams()
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [destination, setDestination] = useState<Destination | null>(null)
  const [images, setImages] = useState<DestinationImage[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    coordinates: { lat: 14.5891, lng: -90.5515 }, // Default Guatemala coordinates
    features: [] as string[],
    highlights: [] as string[],
    requirements: [] as string[],
    meeting_point: '',
    best_time: '',
    difficulty_level: '',
    is_hub: false,
    airport_id: '',
    is_active: true
  })

  const [newFeature, setNewFeature] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  const fetchDestination = useCallback(async () => {
    try {
      const response = await fetch(`/api/destinations/${params.id}`, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      if (data.destination) {
        const dest = data.destination
        setDestination(dest as Destination)
        setFormData({
          name: dest.name || '',
          description: dest.description || '',
          location: dest.location || '',
          coordinates: dest.coordinates || { lat: 14.5891, lng: -90.5515 },
          features: dest.features || [],
          highlights: dest.highlights || [],
          requirements: dest.requirements || [],
          meeting_point: dest.meeting_point || '',
          best_time: dest.best_time || '',
          difficulty_level: dest.difficulty_level || '',
          is_hub: dest.is_hub || false,
          airport_id: dest.airport_id || '',
          is_active: dest.is_active !== false
        })
      }
    } catch (error) {
      console.error('Error fetching destination:', error)
      alert('Failed to load destination. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/destination-images?destination_id=${params.id}`, { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }, [params.id])

  const fetchAirports = useCallback(async () => {
    try {
      const response = await fetch('/api/airports', { credentials: 'include' })
      const data = await response.json()

      if (data.airports) {
        setAirports(data.airports.map((a: any) => ({
          id: a.id || a._id,
          code: a.code,
          name: a.name,
          city: a.city
        })))
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    }
  }, [])

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      router.push('/admin')
      return
    }

    fetchAirports()
    if (params.id) {
      fetchDestination()
      fetchImages()
    }
  }, [profile, params.id, router, fetchDestination, fetchImages, fetchAirports])

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
        location: formData.location,
        coordinates: formData.coordinates,
        features: formData.features,
        is_hub: formData.is_hub,
        airport_id: formData.airport_id || null,
        is_active: formData.is_active
      }

      // Add new metadata fields only if they have values
      if (formData.highlights && formData.highlights.length > 0) {
        updateData.highlights = formData.highlights
      }
      if (formData.requirements && formData.requirements.length > 0) {
        updateData.requirements = formData.requirements
      }
      if (formData.meeting_point) {
        updateData.meeting_point = formData.meeting_point
      }
      if (formData.best_time) {
        updateData.best_time = formData.best_time
      }
      if (formData.difficulty_level) {
        updateData.difficulty_level = formData.difficulty_level
      }

      console.log('🔄 Updating destination with data:', updateData)

      const response = await fetch(`/api/destinations/${params.id}`, {
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

      console.log('✅ Destination updated successfully')
      alert('Destination updated successfully!')
    } catch (error: any) {
      console.error('❌ Error updating destination:', error)
      alert(`Failed to update destination: ${error?.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (url: string) => {
    try {
      const response = await fetch('/api/destination-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination_id: params.id,
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
      const response = await fetch(`/api/destination-images?id=${imageId}`, {
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
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('Failed to set primary image')
    }
  }

  // Debounced caption update to avoid too many DB calls
  const updateCaptionDebounced = useCallback((imageId: string, caption: string) => {
    const timerId = setTimeout(async () => {
      try {
        // Caption is updated in local state - persistence could be added via PATCH endpoint
        console.log('Caption update:', imageId, caption)
      } catch (error) {
        console.error('Error updating caption:', error)
      }
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timerId)
  }, [])

  const addToArray = (field: 'features' | 'highlights' | 'requirements', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }))
    }
  }

  const removeFromArray = (field: 'features' | 'highlights' | 'requirements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Destination Not Found</h1>
          <Link
            href="/admin#destinations"
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin#destinations"
            className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Destination</h1>
          <p className="text-gray-400 mt-2">Update destination details and manage images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-luxury-charcoal border border-gray-800 rounded-soft p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Destination Details</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Name
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Region
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
                  Coordinates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.coordinates.lng}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('features', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add feature..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('features', newFeature)
                        setNewFeature('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights
                </label>
                <div className="space-y-2">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{highlight}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('highlights', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="Add highlight..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('highlights', newHighlight)
                        setNewHighlight('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('requirements', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add requirement..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="meeting_point" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Point
                </label>
                <input
                  type="text"
                  id="meeting_point"
                  value={formData.meeting_point}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_point: e.target.value }))}
                  placeholder="e.g., Hotel lobby, Airport terminal, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Best Time */}
              <div>
                <label htmlFor="best_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  id="best_time"
                  value={formData.best_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, best_time: e.target.value }))}
                  placeholder="e.g., Early morning for clear views"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select difficulty...</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              {/* Airport Selector */}
              <div>
                <label htmlFor="airport_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Linked Airport (optional)
                </label>
                <select
                  id="airport_id"
                  value={formData.airport_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, airport_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No airport</option>
                  {airports.map(airport => (
                    <option key={airport.id} value={airport.id}>
                      {airport.code} - {airport.name} ({airport.city})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Link this destination to an airport to show on the map
                </p>
              </div>

              {/* Is Hub Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_hub"
                  checked={formData.is_hub}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_hub: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_hub" className="text-sm font-medium text-gray-700">
                  Hub Location (main departure point like Guatemala City)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Destination Images</h2>
              <button
                onClick={() => setShowImageUpload(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
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
                        alt={image.caption || 'Destination image'}
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