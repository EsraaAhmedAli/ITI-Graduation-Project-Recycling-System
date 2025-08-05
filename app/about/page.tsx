import { Metadata } from 'next'
import Image from 'next/image'

// Static generation metadata
export const metadata: Metadata = {
  title: 'About Us - EcoExchange | Sustainable Recycling & Material Exchange',
  description: 'Learn about EcoExchange - your trusted partner in sustainable living. We help people exchange old items instead of throwing them away, connecting sellers with buyers for high-quality recycled materials delivered to your door.',
  keywords: 'recycling, sustainable living, material exchange, eco-friendly, waste reduction, second-hand materials, environmental protection',
  openGraph: {
    title: 'About Us - EcoExchange | Sustainable Recycling & Material Exchange',
    description: 'Discover how EcoExchange is revolutionizing waste management by connecting people who want to exchange old items with buyers seeking quality recycled materials.',
    type: 'website',
    images: [
      {
        url: '/images/about-us-og.jpg',
        width: 1200,
        height: 630,
        alt: 'EcoExchange - Sustainable Material Exchange Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - EcoExchange | Sustainable Recycling & Material Exchange',
    description: 'Join the sustainable revolution with EcoExchange - where old items find new life.',
  },
}

// Main About Us Page Component
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span style={{ color: 'var(--color-primary)' }}>EcoExchange</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforming waste into opportunity by connecting people who want to give their items a second life 
              with those seeking quality, affordable materials.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We believe that every item deserves a second chance. Instead of letting valuable materials 
                end up in landfills, we have created a platform that breathes new life into pre-loved items, 
                connecting conscious sellers with smart buyers.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is to reduce waste, promote sustainability, and make quality second-hand 
                materials accessible to everyone while ensuring the highest standards of cleanliness and quality.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-lime-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>3k+</div>
                  <div className="text-gray-600">Items Exchanged</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>1k+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>95%</div>
                  <div className="text-gray-600">Quality Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>10+</div>
                  <div className="text-gray-600">Cities Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

 
{/* How You Can Help Section */}
<section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-50">
  <div className="max-w-7xl mx-auto text-center mb-12">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
      How you can help eliminate the idea of waste
    </h2>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
    {/* Card 1 */}
 <div className="bg-white rounded-2xl shadow-md overflow-hidden">
  {/* Image section */}
  <div className="relative w-full h-64">
    <Image
      src="/images/recycle.jpeg"
      alt="Recycling"
      fill
      className="object-cover"
    />
  </div>

  {/* Text section */}
  <div className="p-6 text-left">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Recycling</h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      Our easy-to-use <span className="font-semibold text-green-700">free and paid solutions</span> help everyone – including offices, schools, and facilities – #RecycleEverything.
    </p>
  </div>
</div>
 <div className="bg-white rounded-2xl shadow-md overflow-hidden">
  {/* Image section */}
  <div className="relative w-full h-64">
    <Image
      src="/images/newPro.webp"
      alt="Recycling"
      fill
      className="object-cover"
    />
  </div>

  {/* Text section */}
  <div className="p-6 text-left">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Recycled Content</h3>
  <p className="text-gray-600 text-sm leading-relaxed">
          The trash we recycle together becomes raw materials used to create new products.
        </p>
  </div>
</div>




  
  </div>
</section>

   


    </div>
  )
}

// For static generation
export async function generateStaticParams() {
  return []
}