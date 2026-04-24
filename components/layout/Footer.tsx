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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 mb-12">
          
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

            <div className="flex gap-4 pt-2">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-xl text-gray-300 hover:text-white transition"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold">Information</h2>
            <ul className="space-y-2 text-gray-300">
              {INFO_LINKS.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold">Contact</h2>

            <div className="space-y-4 text-gray-300 text-sm md:text-lg">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt />
                <address className="not-italic">
                  Office No: 7, 1st floor, Mahalaxmi Square, Indirapuram,
                  Ghaziabad - 201010 (UP)
                </address>
              </div>

              <a href="mailto:info@jmvdevelopers.com" className="flex gap-3 hover:text-white">
                <FaEnvelope />
                <span>info@jmvdevelopers.com</span>
              </a>

              <a href="tel:+918383041206" className="flex gap-3 hover:text-white">
                <FaPhoneAlt />
                <span>+91-8383041206</span>
              </a>
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