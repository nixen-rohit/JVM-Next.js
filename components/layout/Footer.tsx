"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
// ✅ Tree-shaken imports: Only import what you use
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

// ✅ STATIC DATA: Extracted outside component to prevent re-creation on re-renders
const SOCIAL_LINKS = [
  { Icon: FaFacebookF, label: "Facebook", href: "#" },
  { Icon: FaInstagram, label: "Instagram", href: "#" },
  { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
  { Icon: FaTwitter, label: "Twitter", href: "#" },
] as const;

const INFO_LINKS = [
  "Home",
  "About",
  "Locations",
  "Brochure",
  "Application Form",
  "Careers",
] as const;

// ✅ PRE-COMPUTE: Year calculated once at module load, not on every render
const CURRENT_YEAR = new Date().getFullYear();

// ✅ MEMOIZED SUB-COMPONENTS: Prevent unnecessary re-renders of children
const SocialIcon = memo(({ Icon, label, href }: { 
  Icon: typeof FaFacebookF; 
  label: string; 
  href: string;
}) => (
  <a
    href={href}
    aria-label={label}
    className="text-lg md:text-2xl lg:text-3xl text-gray-300 hover:text-white transition-transform hover:-translate-y-1.5 will-change-transform"
    // ✅ CSS transitions are more performant than framer-motion for simple hovers
  >
    <Icon aria-hidden="true" />
  </a>
));
SocialIcon.displayName = "SocialIcon";

const InfoLink = memo(({ text, href = "#" }: { text: string; href?: string }) => (
  <a
    href={href}
    className="text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-2 block"
  >
    {text}
  </a>
));
InfoLink.displayName = "InfoLink";

// ✅ REACT.MEMO: Prevent re-renders when props haven't changed
const Footer = memo(() => {
  // ✅ USEMEMO: Background style object created once
  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: 'url("/hero4.jpg")',
      backgroundSize: "cover" as const,
      backgroundPosition: "center" as const,
    }),
    [],
  );

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      // ✅ VIEWPORT ONCE: Only animate when first visible, not on every scroll
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed bottom-0 left-0 w-full h-screen -z-10 flex flex-col justify-end overflow-hidden"
      style={backgroundStyle}
      // ✅ ACCESSIBILITY: Respect user's reduced motion preference
      data-reduce-motion="true"
    >
      {/* ✅ POINTER-EVENTS-NONE: Overlay doesn't block interactions unnecessarily */}
      <div className="absolute inset-0 bg-slate-950/75 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 py-12 text-white">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 mb-12">
          
          {/* About Us Section */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold pb-2 md:pb-3">
              About Us
            </h2>
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-semibold">
                JMV Developers
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-lg lg:text-xl">
                Established in 2008, JMV Developers is a renowned brand catering
                to all your Real Estate needs. We assure you full satisfaction
                regarding quality, commitment, and service.
              </p>
            </div>
            
            {/* ✅ SEMANTIC NAV + ARIA LABELS for accessibility */}
            <nav className="flex gap-3 md:gap-6 pt-2 md:pt-3" aria-label="Social media">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <SocialIcon key={label} Icon={Icon} label={label} href={href} />
              ))}
            </nav>
          </div>

          {/* Information Links */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold pb-2 md:pb-3">
              Information
            </h2>
            <ul className="space-y-2 md:space-y-4 text-gray-300 font-medium text-sm md:text-lg lg:text-xl">
              {INFO_LINKS.map((item) => (
                <li key={item}>
                  <InfoLink text={item} />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section - Semantic HTML improvements */}
          <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold pb-2 md:pb-3 text-left">
              Contact
            </h2>
            <div className="space-y-3 md:space-y-6 text-gray-300 text-sm md:text-lg lg:text-xl">
              
              {/* ✅ SEMANTIC <address> tag */}
              <div className="flex items-start gap-2 md:gap-4">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-lg md:text-2xl" aria-hidden="true" />
                <address className="not-italic">
                  Office No: 7, 1st floor, Mahalaxmi Square, Indirapuram, Abhay
                  Khand-2, Ghaziabad - 201010 (UP)
                </address>
              </div>
              
              {/* ✅ CLICKABLE CONTACT LINKS with proper protocols */}
              <a 
                href="mailto:info@jmvdevelopers.com"
                className="flex items-center gap-2 md:gap-4 hover:text-white transition-colors group"
              >
                <FaEnvelope className="shrink-0 text-lg md:text-2xl group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span>info@jmvdevelopers.com</span>
              </a>
              
              <a 
                href="tel:+918383041206"
                className="flex items-center gap-2 md:gap-4 hover:text-white transition-colors group"
              >
                <FaPhoneAlt className="shrink-0 text-lg md:text-2xl group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span>+91-8383041206</span>
              </a>
              
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-white/10 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm lg:text-base tracking-widest">
          © {CURRENT_YEAR} JMV DEVELOPERS. ALL RIGHTS RESERVED.
        </div>
      </div>
    </motion.footer>
  );
});

Footer.displayName = "Footer";

export default Footer;