# 🌱 Karakeeb Web - Smart Recycling Platform

Transforming waste into wealth through intelligent recycling solutions

---

## 🎯 Overview

Karakeeb Web is a comprehensive web application that revolutionizes the recycling ecosystem by connecting customers, recyclers, buyers, and delivery personnel in a seamless digital marketplace. The platform gamifies recycling through a sophisticated points system while enabling users to buy and sell recyclable materials efficiently.

---

## ✨ Key Features

### 🔄 Multi-Role Ecosystem

- **Customers:** Sell recyclables, earn points, and track environmental impact
- **Buyers:** Purchase recycled materials with integrated inventory management
- **Delivery Partners:** Efficient pickup and delivery workflow management
- **Admin:**
  - Track and manage all order statuses in real time
  - Update order status (e.g., mark as completed, assign to courier)
  - Approve and onboard new delivery partners
  - Oversee inventory, users, and platform operations from a dedicated dashboard

### 🎮 Gamified Experience

- **Smart Points System:** Earn rewards for every recycling transaction
- **Achievement Tracking:** Monitor personal recycling milestones
- **Tier-based Rewards:** Unlock exclusive benefits as you progress

### 🛒 Intelligent Marketplace

- **Dynamic Inventory:** Real-time stock management and availability
- **Smart Categorization:** AI-powered material classification
- **Price Optimization:** Market-driven pricing algorithms

### 🌐 Modern Web Features

- **Real-time Notifications:** Live updates on orders and deliveries
- **Multi-language Support:** Arabic and English localization with RTL support
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Accessibility:** Inclusive UI for all users

### 🚚 Seamless Logistics

- **Smart Pickup Scheduling:** Optimized route planning for deliveries
- **Order Tracking:** Real-time status updates throughout the process
- **Digital Receipts:** Automated PDF report generation

---

## 🌍 Localization

Karakeeb Web supports multiple languages with full RTL (Right-to-Left) support:

- English (default)
- Arabic with RTL layout adaptation

To add or edit translations, see `messages/en.json` and `messages/ar.json`.

---

## 🛡️ Security & Privacy

- Secure Authentication with JWT tokens
- Data Encryption for sensitive information
- Privacy-first Design with minimal data collection
- GDPR Compliance ready architecture

---

## 🏗️ Technical Architecture

### Frontend Stack

- Next.js (App Router)
- React & TypeScript
- Tailwind CSS & Flowbite
- React Query for efficient data fetching and caching
  -OAuth for provider Authentechation

### State Management

- React Context API
- Custom Hooks

### UI/UX Excellence

- Custom Theme System with dark/light mode support
- Responsive Design using Tailwind utilities
- Smooth Animations
- Accessibility compliance for inclusive user experience

### Backend Integration

- RESTful API architecture (see `/api`)
- JWT Authentication with secure token management
- Real-time Updates through WebSocket connections

---

## � Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

Clone the repository

```bash
git clone https://github.com/EsraaAhmedAli/ITI-Graduation-Project-Recycling-System.git
cd ITI-Graduation-Project-Recycling-System
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Development Scripts

```bash
# Start development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## � Project Structure

```
ITI-Graduation-Project-Recycling-System/
├── app/            # Main Next.js app pages and routes
├── components/     # Reusable UI components
├── constants/      # Static data (cities, rewards, etc.)
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and API logic
├── models/         # TypeScript models
├── public/         # Static assets
├── services/       # API service logic
├── styles/         # Global and theme styles
├── utils/          # Helper functions
└── messages/       # Multi-language support
```

---

## 🔧 Configuration

- **Environment Variables:** See `.env.example` for required variables
- **Supported Browsers:** Chrome, Firefox, Safari, Edge
- **Minimum Requirements:** Modern browser, JavaScript enabled

---

## � Contributing

We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## � Acknowledgments

- Next.js & Vercel Team
- React Community
- Environmental Partners supporting our recycling mission

---

## � Support

- **Email:** recyclecrew7@gmail.com
- **Issues:** GitHub Issues

---

Made with ❤️ for a sustainable future

© 2025 Karakeeb. All rights reserved.
