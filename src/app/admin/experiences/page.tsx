'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Edit, Trash2, MapPin, Eye, Search, Upload,
  Image as ImageIcon, DollarSign, Clock, Users, X
} from 'lucide-react'
import IrysUpload from '@/components/IrysUpload'

interface Experience {
  id: string
  created_at: string
  updated_at?: string
  name: string
  description: string
  duration_hours: number
  base_price: number
  max_passengers: number
  includes: string[]
  location: string
  image_url?: string
  is_active: boolean
  category?: string
  highlights?: string[]
  requirements?: string[]
  meeting_point?: string
  metadata?: any
}

interface ExperienceImage {
  id: string
  experience_id: string
  image_url: string
  caption?: string
  is_primary: boolean
  order_index: number
}

export default function ExperiencesPage() {
  const router = useRouter()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experiences?include_inactive=true', { credentials: 'include' })
      const data = await response.json()

      if (data.success && data.experiences) {
        setExperiences(data.experiences)
      }
    } catch (error) {
      console.error('Error fetching experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await fetchExperiences()
    } catch (error: any) {
      console.error('Error deleting experience:', error)
      alert('Failed to delete experience: ' + error.message)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await fetchExperiences()
    } catch (error) {
      console.error('Error updating experience status:', error)
    }
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'helitour', 'sobrevuelo', 'day-flight', 'traslado', 'evento-especial']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Experience Management</h1>
              <p className="text-gray-600">Manage helitours and experiences</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/experiences/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Experience</span>
              </Link>
              <Link
                href="/admin/experiences/import"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Bulk Import</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Experiences</p>
                <p className="text-2xl font-bold text-gray-900">{experiences.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experiences.filter(e => e.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${experiences.length > 0 
                    ? Math.round(experiences.reduce((sum, e) => sum + (e.base_price || 0), 0) / experiences.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experiences.reduce((sum, e) => sum + (e.max_passengers || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Experiences Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading experiences...
                  </td>
                </tr>
              ) : filteredExperiences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No experiences found
                  </td>
                </tr>
              ) : (
                filteredExperiences.map((experience) => (
                  <tr key={experience.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {experience.image_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={experience.image_url}
                            alt={experience.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{experience.name}</div>
                          <div className="text-sm text-gray-500">{experience.category || 'helitour'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {experience.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {experience.duration_hours}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${experience.base_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(experience.id, experience.is_active)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          experience.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {experience.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedExperienceId(experience.id)
                            setShowImageUpload(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/experiences/${experience.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(experience.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && selectedExperienceId && (
        <IrysUpload
          onUploadComplete={async (url) => {
            try {
              // Update the experience with the new image
              await fetch(`/api/experiences/${selectedExperienceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ image_url: url })
              })

              // Also add to experience_images table
              await fetch('/api/experience-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  experience_id: selectedExperienceId,
                  image_url: url,
                  is_primary: true,
                  order_index: 0
                })
              })

              await fetchExperiences()
              setShowImageUpload(false)
              setSelectedExperienceId(null)
            } catch (error) {
              console.error('Error updating image:', error)
            }
          }}
          onClose={() => {
            setShowImageUpload(false)
            setSelectedExperienceId(null)
          }}
        />
      )}
    </div>
  )
}