'use client';

import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Recycle, 
  Mail, 
  Phone, 
 
  MapPin
} from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('footer.title')}</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('footer.slogan')}
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {t('footer.Eco-Friendly Platform')}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: t('footer.home') },
                { href: '/about', label: t('footer.about') },
                { href: '/category', label: t("navbar.categories") },
                { href: '/cart', label: t('footer.cart') }
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
      
        
              <li>
                <Link href="/contact-us" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm">
                {
                  t('footer.ContactUs')
                }
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a 
                  href="mailto:recyclecrew7@gmail.com" 
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  recyclecrew7@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">+20 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Cairo, Egypt</span>
              </div>
            </div>
            
        
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Recycle className="w-4 h-4 text-green-500" />
              <span>&copy; {new Date().getFullYear()} XChange. {t('footer.rights')}</span>
            </div>
            <div className="text-sm text-gray-400">
              Made with 💚 for a greener future
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}