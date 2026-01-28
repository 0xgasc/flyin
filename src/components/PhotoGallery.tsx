'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface GalleryImage {
  id: string
  image_url: string
  caption: string | null
}

export function PhotoGallery() {
  const [allImages, setAllImages] = useState<GalleryImage[]>([])
  const [displayCount, setDisplayCount] = useState(8)
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const [expRes, destRes] = await Promise.all([
        fetch('/api/experience-images?limit=30').then(r => r.json()),
        fetch('/api/destination-images?limit=30').then(r => r.json())
      ])

      const images: GalleryImage[] = [
        ...(expRes.images || []),
        ...(destRes.images || [])
      ]

      // Shuffle for random display
      const shuffled = images.sort(() => Math.random() - 0.5)
      setAllImages(shuffled)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    } finally {
      setLoading(false)
    }
  }

  const shuffleImages = () => {
    setAllImages(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const showMore = () => {
    setDisplayCount(prev => Math.min(prev + 8, allImages.length))
  }

  const displayedImages = allImages.slice(0, displayCount)

  const openGallery = (index: number) => {
    setSelectedIndex(index)
  }

  const closeGallery = () => {
    setSelectedIndex(null)
  }

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % displayedImages.length)
    }
  }

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + displayedImages.length) % displayedImages.length)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') closeGallery()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex])

  if (loading) {
    return (
      <div className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (allImages.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto relative">
          {displayedImages.map((image, index) => (
            <div
              key={image.id}
              className={`aspect-square cursor-pointer relative transition-all duration-300 ${
                hoveredIndex !== null && hoveredIndex !== index
                  ? 'blur-sm scale-95 opacity-60'
                  : ''
              }`}
              onClick={() => openGallery(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={image.image_url}
                alt={image.caption || 'FlyInGuate experience'}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover preview - larger showing full image */}
              {hoveredIndex === index && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] max-w-[500px] bg-white dark:bg-luxury-charcoal rounded-none shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700">
                    <img
                      src={image.image_url}
                      alt={image.caption || 'FlyInGuate experience'}
                      className="w-full h-auto max-h-[400px] object-contain bg-gray-50 dark:bg-gray-900"
                    />
                    {image.caption && (
                      <p className="text-center text-gray-700 dark:text-gray-300 text-sm py-2 px-3 bg-white dark:bg-luxury-charcoal">
                        {image.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={shuffleImages}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-none transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Shuffle
          </button>

          {displayCount < allImages.length && (
            <button
              onClick={showMore}
              className="px-6 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700 transition-colors"
            >
              Show More ({allImages.length - displayCount} remaining)
            </button>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-3">
          Click any image to browse gallery
        </p>
      </div>

      {/* Full-screen Gallery Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="max-w-5xl max-h-[80vh] px-16">
            <img
              src={displayedImages[selectedIndex].image_url}
              alt={displayedImages[selectedIndex].caption || 'FlyInGuate experience'}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            {displayedImages[selectedIndex].caption && (
              <p className="text-white text-center mt-4 text-lg">
                {displayedImages[selectedIndex].caption}
              </p>
            )}
          </div>

          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {selectedIndex + 1} / {displayedImages.length}
          </div>
        </div>
      )}
    </>
  )
}
