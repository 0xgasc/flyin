'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, authenticatedRequest } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import IrysUpload from '@/components/IrysUpload'
import { ArrowLeft, Plus, Trash2, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'

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
  metadata: any
}

interface ExperienceImage {
  id: string
  image_url: string
  caption: string
  is_primary: boolean
  order_index: number
}

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
    meeting_point: ''
  })

  const [newInclude, setNewInclude] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  const fetchExperience = useCallback(async () => {
    try {
      const result = await authenticatedRequest(
        async () => supabase
          .from('experiences')
          .select('*')
          .eq('id', params.id)
          .single()
      )

      if (result.error) throw result.error

      if (result.data) {
        setExperience(result.data)
        setFormData({
          name: result.data.name || '',
          description: result.data.description || '',
          category: result.data.category || 'helitour',
          location: result.data.location || '',
          duration_hours: result.data.duration_hours || 1,
          duration_minutes: result.data.duration_minutes || 0,
          base_price: result.data.base_price || 100,
          max_passengers: result.data.max_passengers || 10,
          min_passengers: result.data.min_passengers || 1,
          is_active: result.data.is_active || true,
          includes: result.data.includes || [],
          highlights: result.data.highlights || [],
          requirements: result.data.requirements || [],
          meeting_point: result.data.meeting_point || ''
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
      const result = await authenticatedRequest(
        async () => supabase
          .from('experience_images')
          .select('*')
          .eq('experience_id', params.id)
          .order('order_index')
      )

      if (result.error) throw result.error
      if (result.data) setImages(result.data)
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
        includes: formData.includes,
        updated_at: new Date().toISOString()
      }

      // Add new metadata fields only if they have values (to handle missing columns gracefully)
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

      console.log('🔄 Updating experience with data:', updateData)

      // Use authenticatedRequest wrapper to handle session validation
      const result = await authenticatedRequest(
        async () => supabase
          .from('experiences')
          .update(updateData)
          .eq('id', params.id)
      )

      if (result.error) {
        console.error('❌ Database error:', result.error)
        throw result.error
      }

      console.log('✅ Experience updated successfully')
      alert('Experience updated successfully!')
      router.push('/admin')
    } catch (error: any) {
      console.error('❌ Error updating experience:', error)
      alert(`Failed to update experience: ${error?.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (url: string) => {
    try {
      const result = await authenticatedRequest(
        async () => supabase
          .from('experience_images')
          .insert({
            experience_id: params.id,
            image_url: url,
            caption: '',
            is_primary: images.length === 0, // First image is primary
            order_index: images.length
          })
          .select()
      )

      if (result.error) throw result.error
      if (result.data && result.data[0]) {
        setImages(prev => [...prev, result.data[0]])
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
      const result = await authenticatedRequest(
        async () => supabase
          .from('experience_images')
          .delete()
          .eq('id', imageId)
      )

      if (result.error) throw result.error
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      // First, set all images to not primary
      await authenticatedRequest(
        async () => supabase
          .from('experience_images')
          .update({ is_primary: false })
          .eq('experience_id', params.id)
      )

      // Then set the selected image as primary
      const result = await authenticatedRequest(
        async () => supabase
          .from('experience_images')
          .update({ is_primary: true })
          .eq('id', imageId)
      )

      if (result.error) throw result.error

      // Update local state
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
        await authenticatedRequest(
          async () => supabase
            .from('experience_images')
            .update({ caption })
            .eq('id', imageId)
        )
      } catch (error) {
        console.error('Error updating caption:', error)
      }
    }, 1000) // Wait 1 second after user stops typing

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Experience Not Found</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Experience</h1>
          <p className="text-gray-600 mt-2">Update experience details and manage images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Experience Details</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.base_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_passengers || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_passengers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_passengers}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_passengers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Includes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Includes
                </label>
                <div className="space-y-2">
                  {formData.includes.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray('includes', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInclude}
                      onChange={(e) => setNewInclude(e.target.value)}
                      placeholder="Add what's included..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('includes', newInclude)
                        setNewInclude('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                  {formData.highlights.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{item}</span>
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('highlights', newHighlight)
                        setNewHighlight('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{requirement}</span>
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addToArray('requirements', newRequirement)
                        setNewRequirement('')
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                  placeholder="e.g., La Aurora International Airport, Main Terminal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Experience Images</h2>
              <button
                onClick={() => setShowImageUpload(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
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
                  <div key={image.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'Experience image'}
                        className="w-24 h-24 object-cover rounded-lg"
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