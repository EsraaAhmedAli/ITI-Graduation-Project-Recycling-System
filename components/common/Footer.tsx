import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 px-6 py-8 mt-10 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Site Name / Logo */}
        <div>
          <h2 className="text-2xl font-bold text-green-600">XChange</h2>
          <p className="mt-2 text-sm">Recycle smarter, live cleaner.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link href="/" className="hover:underline hover:text-green-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline hover:text-green-600 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:underline hover:text-green-600 transition-colors">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact / Social Placeholder */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm">Email: recyclecrew7@gmail.com</p>
          <p className="text-sm">Phone: </p>
        </div>

      </div>

      {/* Bottom line */}
      <div className="border-t border-gray-300 mt-6 pt-4 text-sm text-center">
        &copy; {new Date().getFullYear()} XChange. All rights reserved.
      </div>
    </footer>
  )
}
