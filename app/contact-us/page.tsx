import { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us | EcoCycle - Get in Touch for Environmental Solutions",
  description: "Contact EcoCycle for inquiries, partnerships, or support. Join us in building a greener, more sustainable future through innovative recycling solutions.",
  keywords: [
    "contact EcoCycle",
    "environmental support",
    "recycling partnerships",
    "sustainability inquiries",
    "green technology",
    "eco-friendly solutions"
  ],
  authors: [{ name: "EcoCycle Team" }],
  creator: "EcoCycle",
  publisher: "EcoCycle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com/contact",
    siteName: "EcoCycle",
    title: "Contact Us | EcoCycle",
    description: "Get in touch with EcoCycle for environmental solutions, partnerships, and support in building a sustainable future.",
    images: [
      {
        url: "/images/contact-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact EcoCycle - Environmental Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | EcoCycle",
    description: "Get in touch with EcoCycle for environmental solutions and partnerships.",
    images: ["/images/contact-twitter-image.jpg"],
    creator: "@ecocycle",
  },
  alternates: {
    canonical: "https://your-domain.com/contact",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "EcoCycle Contact Page",
  "description": "Contact EcoCycle for environmental solutions, partnerships, and support.",
  "url": "https://your-domain.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "EcoCycle",
    "url": "https://your-domain.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": "English"
    }
  }
};

// Server Component (for SSG)
export default function ContactPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <section className="min-h-screen bg-base-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page header with semantic HTML */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
            <p className="text-base-content text-lg">
              Whether you have questions, ideas, or feedback, we would love to hear
              from you. Let us make the planet greener together.
            </p>
          </header>

          {/* Client component for the form */}
          <main>
            <ContactForm />
          </main>
        </div>
      </section>
    </>
  );
}