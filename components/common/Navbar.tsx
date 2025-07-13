import Link from "next/link";

export default function Navbar() {
  return (
    <nav className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' aria-label='Main Navigation'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between'>
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-accent-content to-primary bg-clip-text text-transparent">
            XChange
          </div>
        </Link>
        <div className="flex justify-between h-16 items-center">
          <div className='flex items-center space-x-8'>
            <Link href="/" className='text-gray-700 hover:text-primary transition-colors duration-200 font-extrabold'>Home</Link>
            <Link href="/app/user/dashboard" className='text-gray-700 hover:text-primary transition-colors duration-200 font-extrabold'>About</Link>
            <Link href="/app/auth/login" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-extrabold">
              Login
            </Link>
            <Link href="/app/auth/register" className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors duration-200">
              Start Recycling
            </Link>
          </div>
        </div>
      </div>
  </nav>
  )
}