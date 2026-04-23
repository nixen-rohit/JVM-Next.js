"use client";

import React from "react";
import Image from "next/image";
import { motion, MotionProps } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";

const fadeUp: MotionProps = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" },
};

// 🔐 Security: Input sanitization to prevent XSS and injection attacks
const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim()
    .slice(0, 1000); // Limit input length to prevent DoS
};

// 🔐 Security: Email validation regex
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 🔐 Security: Phone validation (optional field, but validate format if provided)
const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true;
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.\/0-9]*$/;
  return re.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

const ContactPage = () => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Sanitize on change for basic client-side protection
    setForm({ ...form, [name]: sanitizeInput(value) });
    // Clear error when user starts typing again
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 🔐 Security: Client-side validation
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (form.phone && !validatePhone(form.phone)) {
      setError("Please enter a valid phone number");
      return;
    }
    if (!form.message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    // 🤖 Security: Honeypot check (bots often fill hidden fields)
    const formElement = e.target as HTMLFormElement;
    const honeypot = formElement.querySelector<HTMLInputElement>(
      'input[name="website"]',
    )?.value;
    if (honeypot) {
      // Silently succeed for bots to avoid revealing detection
      setSuccess(true);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // 🔐 Security: Sanitize all fields immediately before sending
      const sanitizedForm = {
        name: sanitizeInput(form.name),
        email: sanitizeInput(form.email),
        phone: sanitizeInput(form.phone),
        message: sanitizeInput(form.message),
      };

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedForm),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Contact error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide success message & restore button after 4 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000); // ⏱️ 4000ms = 4 seconds
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <main className="min-h-screen bg-white">
      {/* --- HERO --- */}
      <section className="relative h-screen w-full overflow-hidden bg-zinc-900">
        <Image
          src="/hero1.jpg"
          alt="Luxury Resort"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/30 z-10" />

        <div className="absolute inset-0 z-20 flex items-center justify-end px-6 md:px-20 lg:px-40">
          <motion.h1
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-7xl md:text-[10rem] font-light text-white font-serif tracking-tight"
          >
            Contact Us
          </motion.h1>
        </div>
      </section>

      {/* --- FORM SECTION --- */}
      <section className="relative z-30 px-6 md:px-16 lg:px-32 pb-24">
        <motion.div
          {...fadeUp}
          className="max-w-9xl mx-auto bg-[#E9F1F2] -mt-60 p-10 md:p-16 lg:p-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* LEFT */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-serif text-[#1A2B33] leading-tight">
                  A new level of luxury living awaits
                </h2>
                <p className="text-gray-600 text-[15px] max-w-md">
                  Whether you&apos;re exploring luxury property opportunities or
                  seeking expert guidance, our team is here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest border-b pb-2">
                    Contact
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <HiOutlineMail />
                    <span>info@example.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <HiOutlinePhone />
                    <span>+91 9999999999</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest border-b pb-2">
                    Address
                  </h3>
                  <div className="flex items-start gap-3 text-sm">
                    <HiOutlineLocationMarker />
                    <p>Delhi, India</p>
                  </div>
                </div>
              </div>

              {/* MAP */}
             <div className="h-44 w-full rounded overflow-hidden border">
  <iframe
    className="w-full h-full border-0"
    src="https://www.google.com/maps?q=JMV+DEVELOPERS+M-16+SF+2+Pratap+Vihar+Near+DAV+Public+School+Ghaziabad+201009&output=embed"
    title="Location Map"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>
            </div>

            {/* RIGHT FORM */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 🤖 Security: Honeypot field - hidden from users, catches bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="p-4 bg-white"
                  required
                  maxLength={100}
                  pattern="^[a-zA-Z\s'-]+$"
                  title="Please enter a valid name"
                />

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="p-4 bg-white"
                  maxLength={20}
                  pattern="^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.\/0-9]*$"
                  title="Please enter a valid phone number"
                />
              </div>

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="p-4 bg-white w-full"
                required
                type="email"
                maxLength={254}
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Message"
                rows={5}
                className="p-4 bg-white w-full"
                required
                maxLength={1000}
              />

              {/* ✅ UI Change: Replace button with success message after submit */}
              {/* ... previous form fields (name, phone, email, message) ... */}

              {/* ✅ Centered Button/Success Message Container */}
              <div className="flex justify-center">
                {!success ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 border rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                ) : (
                  <p className="text-green-600 font-medium text-center">
                    Your response is submitted
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default ContactPage;
