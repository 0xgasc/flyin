'use client'

import { useState } from 'react'
import { Upload, X, Check, Loader2 } from 'lucide-react'

interface IrysUploadProps {
  onUpload?: (url: string) => void
  onUploadComplete?: (url: string) => void
  onClose?: () => void
}

export default function IrysUpload({ onUpload, onUploadComplete, onClose }: IrysUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (selectedFile.size > maxSize) {
        alert(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB.`)
        return
      }
      
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const uploadToIrys = async () => {
    if (!file) return

    setUploading(true)
    try {
      console.log('📤 Uploading to Irys via API route...')
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/irys', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.details || errorData.error || 'Upload failed'
          } catch {
            errorMessage = `Server error: ${response.status}`
          }
        } else {
          // If not JSON, try to get text error
          try {
            const errorText = await response.text()
            if (errorText.includes('Request Entity Too Large')) {
              errorMessage = 'File too large. Please use a smaller image (max 50MB)'
            } else if (errorText.includes('timeout')) {
              errorMessage = 'Upload timeout. Please try a smaller file'
            } else {
              errorMessage = `Server error: ${response.status}`
            }
          } catch {
            errorMessage = `Server error: ${response.status}`
          }
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      const imageUrl = result.url
      
      console.log('✅ Upload successful:', imageUrl)
      
      setUploadedUrl(imageUrl)
      if (onUpload) onUpload(imageUrl)
      if (onUploadComplete) onUploadComplete(imageUrl)
      
      // Auto close after successful upload
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (error) {
      console.error('Error uploading to Irys:', error)
      
      // Show error message but allow fallback to URL mode
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. You can use URL mode instead.`)
      setUseUrlMode(true)
    } finally {
      setUploading(false)
    }
  }

  // Fallback: Use a simple image URL input if Irys fails
  const [urlInput, setUrlInput] = useState('')
  const [useUrlMode, setUseUrlMode] = useState(false)

  const handleUrlSubmit = () => {
    if (urlInput) {
      if (onUpload) onUpload(urlInput)
      if (onUploadComplete) onUploadComplete(urlInput)
      if (onClose) onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Subir Imagen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!useUrlMode ? (
          <>
            {/* File Upload Mode */}
            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-600 mb-2">Click para seleccionar imagen</span>
                  <span className="text-xs text-gray-500">PNG, JPG, GIF hasta 50MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {uploadedUrl && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-90 rounded-lg flex items-center justify-center">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {uploadedUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">¡Imagen subida exitosamente!</p>
                    <p className="text-xs text-green-600 break-all">{uploadedUrl}</p>
                  </div>
                ) : (
                  <button
                    onClick={uploadToIrys}
                    disabled={uploading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Subir a Irys</span>
                      </>
                    )}
                  </button>
                )}

                {!uploadedUrl && (
                  <button
                    onClick={() => {
                      setPreview(null)
                      setFile(null)
                    }}
                    className="w-full text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cambiar imagen
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setUseUrlMode(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ¿Prefieres pegar una URL directamente?
              </button>
            </div>
          </>
        ) : (
          <>
            {/* URL Input Mode */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la imagen
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
              >
                Usar esta URL
              </button>

              <button
                onClick={() => setUseUrlMode(false)}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Volver a subir archivo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}