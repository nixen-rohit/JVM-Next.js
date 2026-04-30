"use client";

import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const SOCIAL_LINKS = [
  { Icon: FaFacebookF, label: "Facebook", href: "#" },
  { Icon: FaInstagram, label: "Instagram", href: "#" },
  { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
  { Icon: FaTwitter, label: "Twitter", href: "#" },
];

const INFO_LINKS = [
  "Home",
  "About",
  "Locations",
  "Brochure",
  "Application Form",
  "Careers",
];

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="fixed bottom-0 left-0 w-full h-screen -z-10 flex flex-col justify-end overflow-hidden"
      style={{
        backgroundImage: 'url("/hero4.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/75" />

      <div className="relative z-10 container mx-auto px-6 py-12 text-white">
  {/* Changed grid-cols-2 to grid-cols-1 for mobile, added md:grid-cols-2 for tablets */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
    
    {/* About */}
    <div className="space-y-4">
      <h2 className="text-2xl md:text-4xl font-bold">About Us</h2>
      <div>
        <h3 className="text-lg md:text-2xl font-semibold">
          JMV Developers
        </h3>
        <p className="text-gray-300 text-sm md:text-lg">
          Established in 2008, JMV Developers is a renowned brand catering
          to all your Real Estate needs. We assure quality, commitment, and service.
        </p>
      </div>
    </div>

    {/* Contact */}
    {/* Removed col-span-2 on mobile so it stacks naturally; md:col-span-1 keeps it tidy on larger screens */}
    <div className="space-y-4">
      <h2 className="text-2xl md:text-4xl font-bold">Contact</h2>

      <div className="space-y-4 text-gray-300 text-sm md:text-lg">
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
          <address className="not-italic">
            Office No: 7, 1st floor, Mahalaxmi Square, Indirapuram,
            Ghaziabad - 201010 (UP)
          </address>
        </div>

        <a href="mailto:info@jmvdevelopers.com" className="flex items-center gap-3 hover:text-white transition">
          <FaEnvelope className="flex-shrink-0" />
          <span>info@jmvdevelopers.com</span>
        </a>

        <a href="tel:+918383041206" className="flex items-center gap-3 hover:text-white transition">
          <FaPhoneAlt className="flex-shrink-0" />
          <span>+91-8383041206</span>
        </a>
      </div>
    </div>

    {/* Socials */}
    <div className="space-y-4">
      <h2 className="text-2xl md:text-4xl font-bold">Socials</h2>
      <div className="flex gap-4 pt-2">
        {SOCIAL_LINKS.map(({ Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="text-2xl text-gray-300 hover:text-white transition-colors"
          >
            <Icon />
          </a>
        ))}
      </div>
    </div>

  </div>

  <div className="border-t border-white/10 pt-6 text-center text-gray-400 text-sm">
    © {CURRENT_YEAR} JMV DEVELOPERS. ALL RIGHTS RESERVED.
  </div>
</div>

    </motion.footer>
  );
}