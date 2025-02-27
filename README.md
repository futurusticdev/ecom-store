# LUXE Fashion Store 🛍️

<div align="center">
  <img src="https://picsum.photos/id/237/200/200" alt="LUXE Fashion Store Logo" width="120" height="120" style="border-radius: 10px;"/>
  
  <h3>A modern, full-featured e-commerce platform built with Next.js</h3>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Environment Setup</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#admin-dashboard">Admin Dashboard</a> •
    <a href="#api-endpoints">API Endpoints</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
  
  <p>
    <a href="https://nextjs.org" target="_blank">
      <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org" target="_blank">
      <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com" target="_blank">
      <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    </a>
    <a href="https://www.prisma.io" target="_blank">
      <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
    </a>
  </p>
</div>

## ✨ Features

LUXE Fashion Store is a comprehensive e-commerce solution with features designed for both customers and store administrators:

### Customer Features

- 🔍 **Product Discovery** - Browse products with advanced filtering and search
- 🛒 **Shopping Cart** - Add products, adjust quantities, and checkout seamlessly
- 💳 **Secure Checkout** - Integrated payment processing with Stripe
- 👤 **User Accounts** - Register, login, and manage personal information
- ❤️ **Wishlist** - Save favorite products for later
- 📱 **Responsive Design** - Optimized for all devices from mobile to desktop

### Admin Features

- 📊 **Dashboard** - Overview of store performance and key metrics
- 📦 **Product Management** - Add, edit, and manage product inventory
- 🔄 **Order Processing** - View, update, and manage customer orders
- 🏷️ **Discount Management** - Create and manage promotional offers
- ⚙️ **Store Settings** - Configure store details, shipping, and payment options
- 👥 **Customer Management** - View and manage customer accounts

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payment Processing**: [Stripe](https://stripe.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/luxe-fashion-store.git
   cd luxe-fashion-store
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) section).

4. Set up the database:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/luxe_store"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Authentication Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Admin Credentials (for development)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="securepassword"
```

## 📁 Project Structure

```
luxe-fashion-store/
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── admin/            # Admin-specific components
│   └── shop/             # Shop-specific components
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Admin dashboard routes
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication routes
│   │   ├── cart/         # Shopping cart routes
│   │   ├── checkout/     # Checkout routes
│   │   └── products/     # Product routes
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── services/         # Service layer for API calls
│   ├── store/            # Zustand store
│   └── types/            # TypeScript type definitions
├── .env.example          # Example environment variables
├── .eslintrc.json        # ESLint configuration
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Admin Dashboard

The admin dashboard is accessible at `/admin` and requires authentication. For development, you can use the admin credentials defined in your environment variables.

### Admin Features:

- **Dashboard**: View key metrics and store performance
- **Products**: Manage product catalog, categories, and inventory
- **Orders**: Process and manage customer orders
- **Customers**: View and manage customer accounts
- **Discounts**: Create and manage promotional offers
- **Settings**: Configure store details, shipping, and payment options

## 📡 API Endpoints

The application provides a comprehensive API for interacting with the store:

### Products

- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (admin only)
- `PATCH /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Orders

- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id` - Update an order status (admin only)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `PATCH /api/users/:id` - Update a user

### Settings

- `GET /api/settings` - Get store settings
- `PATCH /api/settings` - Update store settings (admin only)

## 🌐 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

For other hosting providers, build the application with:

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Built with ❤️ by Martin</p>
  <p>
    <a href="https://github.com/yourusername">GitHub</a> •
    <a href="https://twitter.com/yourusername">Twitter</a> •
    <a href="https://linkedin.com/in/yourusername">LinkedIn</a>
  </p>
</div>
