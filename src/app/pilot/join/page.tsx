'use client'

import Link from 'next/link'
import { MobileNav } from '@/components/mobile-nav'
import { useTranslation } from '@/lib/i18n'
import {
  DollarSign, Calendar, Shield, Users, Clock,
  Star, CheckCircle, ArrowRight, MapPin, BarChart3
} from 'lucide-react'

export default function PilotJoinPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-luxury-black to-gray-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('pilot.title')}
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('pilot.subtitle')}
          </p>
          <div className="flex justify-center space-x-6 text-lg">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>$150-400/hour</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>{t('pilot.flexible_schedule')}</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-luxury-gold" />
              <span>{t('pilot.full_insurance')}</span>
            </div>
          </div>
          <Link href="/register" className="inline-block mt-8 btn-luxury text-lg px-8 py-4">
            {t('pilot.start_flying')}
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </Link>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-16 bg-white dark:bg-luxury-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('pilot.premium_earnings')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('pilot.earnings_subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card-luxury text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pilot.transport_flights')}</h3>
              <p className="text-3xl font-bold text-primary-900 dark:text-white mb-2">$150-250</p>
              <p className="text-gray-600 dark:text-gray-400">{t('pilot.per_hour_bonuses')}</p>
            </div>
            
            <div className="card-luxury text-center">
              <div className="bg-luxury-gold bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pilot.experience_tours')}</h3>
              <p className="text-3xl font-bold text-primary-900 dark:text-white mb-2">$250-400</p>
              <p className="text-gray-600 dark:text-gray-400">{t('pilot.per_hour_tips')}</p>
            </div>
            
            <div className="card-luxury text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pilot.peak_bonuses')}</h3>
              <p className="text-3xl font-bold text-primary-900 dark:text-white mb-2">+30%</p>
              <p className="text-gray-600 dark:text-gray-400">{t('pilot.during_high_demand')}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded p-8 mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">{t('pilot.real_earnings')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Miguel S. - 25 hours/week</span>
                <span className="font-bold text-green-600">$1,200/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Ana R. - 15 hours/week</span>
                <span className="font-bold text-green-600">$900/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Carlos D. - 35 hours/week</span>
                <span className="font-bold text-green-600">$2,100/week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-luxury-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('pilot.why_choose')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('pilot.why_choose_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-luxury">
              <Calendar className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.flexible_schedule')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.flexible_schedule_desc')}
              </p>
            </div>

            <div className="card-luxury">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.full_coverage')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.full_coverage_desc')}
              </p>
            </div>

            <div className="card-luxury">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.premium_clients')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.premium_clients_desc')}
              </p>
            </div>

            <div className="card-luxury">
              <MapPin className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.best_destinations')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.best_destinations_desc')}
              </p>
            </div>

            <div className="card-luxury">
              <Clock className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.quick_payments')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.quick_payments_desc')}
              </p>
            </div>

            <div className="card-luxury">
              <Star className="h-12 w-12 text-luxury-gold mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('pilot.build_brand')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pilot.build_brand_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white dark:bg-luxury-charcoal">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('pilot.simple_requirements')}</h2>
            <p className="text-xl text-gray-600">
              {t('pilot.requirements_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">{t('pilot.required_qualifications')}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.commercial_license')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.commercial_license_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.flight_hours')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.flight_hours_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.safety_record')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.safety_record_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.medical_cert')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.medical_cert_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">{t('pilot.preferred_experience')}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.tourism_exp')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.tourism_exp_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.local_knowledge')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.local_knowledge_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.customer_service')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.customer_service_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-luxury-gold mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{t('pilot.multi_language')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pilot.multi_language_desc')}</p>
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
          <h2 className="text-4xl font-bold mb-4">{t('pilot.ready_to_fly')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('pilot.ready_subtitle')}
          </p>
          <div className="space-y-4">
            <Link href="/register" className="inline-block btn-luxury text-lg px-8 py-4 mr-4">
              {t('pilot.apply_now')}
            </Link>
            <Link href="/pilot" className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded hover:bg-white hover:text-primary-900 transition-all">
              {t('pilot.view_portal')}
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