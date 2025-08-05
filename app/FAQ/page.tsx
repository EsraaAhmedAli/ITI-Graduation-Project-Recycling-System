'use client'
import FAQAccordion from '@/components/FAQ'
import { useLanguage } from '@/context/LanguageContext'
import React from 'react'

export default function FAQ() {
  const {t} = useLanguage()
  return (
    <>
       {/* FAQ Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">{t('faq.title')}</h2>
              <p className="text-xl text-gray-600 text-center mb-12">
                {t('faq.slogan')}
              </p>
              <FAQAccordion />
            </div>
          </section>
    </>
  )
}
