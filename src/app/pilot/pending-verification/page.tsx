'use client'

import { useAuthStore } from '@/lib/auth-store'
import { AlertCircle, MapPin, Clock, FileText } from 'lucide-react'

export default function PendingVerificationPage() {
  const { profile } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card-luxury text-center">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            KYC Verification Required
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Welcome {profile?.fullName}! To start accepting flight assignments, you need to complete 
            our in-person verification process.
          </p>

          <div className="bg-gray-50 rounded p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">What to bring:</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Pilot License</p>
                  <p className="text-sm text-gray-600">Valid helicopter pilot license</p>
                </div>
              </div>
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Government ID</p>
                  <p className="text-sm text-gray-600">DPI or passport</p>
                </div>
              </div>
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Medical Certificate</p>
                  <p className="text-sm text-gray-600">Current aviation medical certificate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Visit our office:</h3>
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              La Aurora International Airport, Hangar 7
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Monday - Friday, 9:00 AM - 5:00 PM
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Once verified, you'll start receiving flight assignments immediately
          </p>
        </div>
      </div>
    </div>
  )
}