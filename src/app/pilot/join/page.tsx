'use client'

import Link from 'next/link'
import { 
  Plane, DollarSign, Calendar, Shield, Users, Clock, 
  Star, CheckCircle, ArrowRight, MapPin, BarChart3 
} from 'lucide-react'

export default function PilotJoinPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="space-x-6">
            <Link href="/login" className="hover:text-luxury-gold transition-colors">Login</Link>
            <Link href="/register" className="btn-luxury text-sm">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-luxury-black to-gray-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Fly with <span className="text-luxury-gold">FlyInGuate</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join Guatemala's premier helicopter pilot network. Earn premium rates while 
            showcasing the beauty of our country to travelers from around the world.
          </p>
          <div className="flex justify-center space-x-6 text-lg">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>$150-400/hour</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>Flexible Schedule</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>Full Insurance</span>
            </div>
          </div>
          <Link href="/register" className="inline-block mt-8 btn-luxury text-lg px-8 py-4">
            Start Flying Today
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </Link>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Premium Earnings</h2>
            <p className="text-xl text-gray-600">
              Earn more than traditional aviation jobs with flexible scheduling
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-luxury text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transport Flights</h3>
              <p className="text-3xl font-bold text-primary-900 mb-2">$150-250</p>
              <p className="text-gray-600">per hour + bonuses</p>
            </div>
            
            <div className="card-luxury text-center">
              <div className="bg-luxury-gold bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">Experience Tours</h3>
              <p className="text-3xl font-bold text-primary-900 mb-2">$250-400</p>
              <p className="text-gray-600">per hour + tips</p>
            </div>
            
            <div className="card-luxury text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Peak Bonuses</h3>
              <p className="text-3xl font-bold text-primary-900 mb-2">+30%</p>
              <p className="text-gray-600">during high demand</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-none p-8 mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">Real Pilot Earnings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Miguel S. - 25 hours/week</span>
                <span className="font-bold text-green-600">$1,200/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ana R. - 15 hours/week</span>
                <span className="font-bold text-green-600">$900/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Carlos D. - 35 hours/week</span>
                <span className="font-bold text-green-600">$2,100/week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Pilots Choose FlyInGuate</h2>
            <p className="text-xl text-gray-600">
              More than just flights - join a community of professional aviators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-luxury">
              <Calendar className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Flexible Schedule</h3>
              <p className="text-gray-600">
                Choose when you fly. Work around your schedule, not ours. Accept or decline 
                assignments with no penalties.
              </p>
            </div>

            <div className="card-luxury">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Full Coverage</h3>
              <p className="text-gray-600">
                Comprehensive insurance coverage, aircraft maintenance, and legal protection 
                for every flight you take.
              </p>
            </div>

            <div className="card-luxury">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Premium Clients</h3>
              <p className="text-gray-600">
                Fly VIP clients, tourists, and business travelers. Professional, respectful 
                passengers who appreciate quality service.
              </p>
            </div>

            <div className="card-luxury">
              <MapPin className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Best Destinations</h3>
              <p className="text-gray-600">
                Showcase Guatemala's beauty - Antigua, Lake Atitlán, Tikal, Pacific Coast. 
                Every flight is a scenic adventure.
              </p>
            </div>

            <div className="card-luxury">
              <Clock className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Quick Payments</h3>
              <p className="text-gray-600">
                Get paid within 24 hours of completed flights. No waiting weeks for your 
                earnings - immediate direct deposit.
              </p>
            </div>

            <div className="card-luxury">
              <Star className="h-12 w-12 text-luxury-gold mb-4" />
              <h3 className="text-xl font-bold mb-3">Build Your Brand</h3>
              <p className="text-gray-600">
                Develop a following of repeat clients. Top-rated pilots get priority 
                assignments and premium tour requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple Requirements</h2>
            <p className="text-xl text-gray-600">
              We welcome experienced pilots ready to provide exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Required Qualifications</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Commercial Helicopter License</p>
                    <p className="text-gray-600 text-sm">Valid Guatemalan or recognized international license</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">500+ Flight Hours</p>
                    <p className="text-gray-600 text-sm">Minimum total flight time requirement</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Clean Safety Record</p>
                    <p className="text-gray-600 text-sm">No major incidents or violations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Current Medical Certificate</p>
                    <p className="text-gray-600 text-sm">Valid aviation medical certification</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Preferred Experience</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Tourism Flight Experience</p>
                    <p className="text-gray-600 text-sm">Previous scenic or charter flight experience</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Local Area Knowledge</p>
                    <p className="text-gray-600 text-sm">Familiarity with Guatemala's landmarks and airspace</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Customer Service Skills</p>
                    <p className="text-gray-600 text-sm">Professional communication with passengers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Multi-language Ability</p>
                    <p className="text-gray-600 text-sm">Spanish and English preferred</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Flight?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of pilots already earning premium rates with FlyInGuate. 
            Complete verification takes just 48 hours.
          </p>
          <div className="space-y-4">
            <Link href="/register" className="inline-block btn-luxury text-lg px-8 py-4 mr-4">
              Apply Now
            </Link>
            <Link href="/pilot" className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-none hover:bg-white hover:text-primary-900 transition-all">
              View Pilot Portal
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-80">
            Questions? Contact us at pilots@flyinguate.com
          </p>
        </div>
      </section>
    </div>
  )
}