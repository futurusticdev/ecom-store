import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const navigation = {
  shop: [
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Women", href: "/women" },
    { name: "Men", href: "/men" },
    { name: "Accessories", href: "/accessories" },
    { name: "Sale", href: "/sale" },
  ],
  help: [
    { name: "Customer Service", href: "/customer-service" },
    { name: "Shipping & Returns", href: "/shipping-returns" },
    { name: "Size Guide", href: "/size-guide" },
    { name: "FAQs", href: "/faqs" },
  ],
  contact: {
    address: "1234 Fashion Ave",
    city: "New York, NY 10001",
    email: "contact@luxe.com",
    phone: "+1 (555) 123-4567",
  },
  social: [
    {
      name: "Instagram",
      href: "https://instagram.com/luxe_fashion",
      icon: Instagram,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/luxe_fashion",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/luxe_fashion",
      icon: Twitter,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-4 lg:py-16">
          {/* Brand */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">LUXE</h3>
            <p className="text-sm leading-6">
              Luxury fashion for the modern individual. Quality, style, and
              sophistication in every piece.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {navigation.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Help</h3>
            <ul className="space-y-3">
              {navigation.help.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>{navigation.contact.address}</li>
              <li>{navigation.contact.city}</li>
              <li>
                <Link
                  href={`mailto:${navigation.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {navigation.contact.email}
                </Link>
              </li>
              <li>
                <Link
                  href={`tel:${navigation.contact.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {navigation.contact.phone}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm">© 2025 LUXE. All rights reserved.</p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
