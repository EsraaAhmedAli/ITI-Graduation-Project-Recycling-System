'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

export default function FAQAccordion() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: t('faq.materialExchange.question'),
      answer: t('faq.materialExchange.answer')
    },
    {
      question: t('faq.acceptedMaterials.question'),
      answer: t('faq.acceptedMaterials.answer')
    },
    {
      question: t('faq.notAcceptedMaterials.question'),
      items: [
        {
          src: "/images/foodwaste.jpg",
          desc: t('faq.notAcceptedMaterials.items.foodWaste')
        },
        {
          src: "/images/battery.avif",
          desc: t('faq.notAcceptedMaterials.items.electronics')
        },
        {
          src: "/images/needels.webp",
          desc: t('faq.notAcceptedMaterials.items.medical')
        },
        {
          src: "/images/diaper.png",
          desc: t('faq.notAcceptedMaterials.items.diapers')
        }
      ]
    },
    {
      question: t('faq.qualityHygiene.question'),
      answer: t('faq.qualityHygiene.answer')
    },
    {
      question: t('faq.deliveryAreas.question'),
      answer: t('faq.deliveryAreas.answer')
    },
    {
      question: t('faq.earnings.question'),
      answer: t('faq.earnings.answer')
    },
    {
      question: t('faq.buyerCost.question'),
      answer: t('faq.buyerCost.answer')
    }
  ]

  const toggleAccordion = (index ) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button
            className="w-full px-6 py-4 text-left bg-gradient-to-r from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 transition-colors duration-200 flex justify-between items-center"
            onClick={() => toggleAccordion(index)}
            style={{ backgroundColor: 'var(--color-base-100)' }}
          >
            <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
            <ChevronDown 
              className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-white border-t border-gray-100">
              {faq.answer && (
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              )}
              {faq.items && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  {faq.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Image
                        src={item.src}
                        alt={t('faq.notAcceptedMaterials.imageAlt', { index: i + 1 })}
                        width={80}
                        height={80}
                        className="rounded-md border w-20 h-20 object-cover shrink-0"
                      />
                      <p className="text-gray-700 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}