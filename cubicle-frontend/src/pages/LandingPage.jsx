import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaChevronDown,
  FaGithub,
  FaLinkedin,
  FaStar,
  FaTwitter,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import TestimonialSection from "../components/TestimonialSection";

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      {/* Floating Navigation */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <motion.nav
          className={`w-4/5 rounded-full backdrop-blur-md border-2 border-gray-500 ${
            scrolled ? "bg-white/90 shadow-lg" : "bg-white/90"
          } transition-all duration-300`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className={`px-6 flex justify-between items-center ${
              scrolled ? "py-1" : "py-2"
            } transition-all duration-300`}
          >
            <div className="flex items-center space-x-2">
              {/* Logo */}
              {/* <div className="w-10 h-10 rounded-lg flex items-center justify-center"> */}
              {/* <span className="text-white font-bold text-lg">C</span> */}
              <img
                src="src/assets/logo.png"
                alt="Cubicle Logo"
                className="w-16 h-16 rounded-full"
              />
              {/* </div> */}
              <span className="text-3xl font-bold">Cubicle</span>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 focus:outline-none"
              >
                <motion.svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  )}
                </motion.svg>
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8 text-lg">
              <a
                href="#features"
                className="text-gray-900 hover:text-[#007991] hover:underline transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-900 hover:text-[#007991] hover:underline transition"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-900 hover:text-[#007991] hover:underline transition"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="text-gray-900 hover:text-[#007991] hover:underline transition"
              >
                FAQs
              </a>
              <Link
                to="/login"
                className="bg-[#007991]  text-white px-8 py-2 rounded-full text-md font-medium transition"
              >
                Login
              </Link>
            </div>
          </div>

          {/* /* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden bg-white border-t border-gray-100 rounded-b-xl overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-6 py-4 flex flex-col space-y-3">
                  <a
                    href="#features"
                    className="block py-2 text-gray-600 hover:text-[#007991] hover:underline transition"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="block py-2 text-gray-600 hover:text-[#007991] hover:underline transition"
                  >
                    Pricing
                  </a>
                  <a
                    href="#testimonials"
                    className="block py-2 text-gray-600 hover:text-[#007991]  transition"
                  >
                    Testimonials
                  </a>
                  <a
                    href="#faq"
                    className="block py-2 text-gray-600 hover:text-[#007991] hover: underline transition"
                  >
                    FAQ
                  </a>
                  <Link
                    to="/login"
                    className="block py-2 text-[#007991] font-medium hover:text-[#222E50] transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-[#007991] to-[#222E50] hover:from-[#006b82] hover:to-[#1b2540] text-white px-4 py-3 rounded-lg text-center text-sm font-medium transition"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* Hero Section with Animated Background */}
      <div className="relative pt-32 pb-24 md:pt-40 md:pb-40 overflow-hidden bg-[#181f2a] p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Existing animated dots pattern */}
          {[...Array(80)].map((_, index) => (
            <motion.div
              key={`dot-${index}`}
              className="absolute rounded-full bg-[#007991]/10"
              style={{
                width: Math.random() * 12 + 4,
                height: Math.random() * 12 + 4,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [
                  Math.random() * 20 - 10,
                  Math.random() * 20 - 10,
                  Math.random() * 20 - 10,
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 8 + 7,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}

          {/* New geometric shapes - squares */}
          {[...Array(15)].map((_, index) => (
            <motion.div
              key={`square-${index}`}
              className="absolute rounded-md"
              style={{
                width: Math.random() * 35 + 15,
                height: Math.random() * 35 + 15,
                background:
                  index % 2 === 0
                    ? "rgba(0, 121, 145, 0.15)"
                    : "rgba(191, 252, 255, 0.15)",
                boxShadow: "0 0 10px rgba(191, 252, 255, 0.1)",
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                rotate: Math.random() * 45,
                filter: "blur(1px)",
                zIndex: 1,
              }}
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Triangles */}
          {[...Array(8)].map((_, index) => {
            const size = Math.random() * 40 + 25; // Larger size
            return (
              <motion.div
                key={`triangle-${index}`}
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${size / 2}px solid transparent`,
                  borderRight: `${size / 2}px solid transparent`,
                  borderBottom: `${size}px solid ${
                    index % 2 === 0
                      ? "rgba(0, 121, 145, 0.15)"
                      : "rgba(191, 252, 255, 0.15)"
                  }`,
                  left: `${Math.random() * 90 + 5}%`,
                  top: `${Math.random() * 90 + 5}%`,
                  filter: "blur(1px)",
                  zIndex: 1,
                }}
                animate={{
                  y: [
                    Math.random() * 30 - 15,
                    Math.random() * 30 - 15,
                    Math.random() * 30 - 15,
                  ],
                  rotate: [0, 180, 360],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 25 + 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            );
          })}

          {/* Larger decorative circles */}
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={`large-circle-${index}`}
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${
                  index % 2 === 0
                    ? "rgba(0, 121, 145, 0.15)"
                    : "rgba(34, 46, 80, 0.15)"
                }, transparent)`,
                width: Math.random() * 300 + 200,
                height: Math.random() * 300 + 200,
                left: `${index * 30 + Math.random() * 40}%`,
                top: `${index * 30 + Math.random() * 40}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, Math.random() * 40 - 20, 0],
              }}
              transition={{
                duration: Math.random() * 30 + 40,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}

          {/* Animated curved lines */}
          <svg
            className="absolute w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,50 Q25,30 50,50 T100,50"
              stroke="rgba(0, 121, 145, 0.5)"
              strokeWidth="0.2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 0.3,
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M0,70 Q20,60 40,70 T100,70"
              stroke="rgba(191, 252, 255, 0.4)"
              strokeWidth="0.3"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 0.2,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Add new animated wavy paths with simpler animation */}
            <motion.path
              d="M0,30 Q15,40 30,30 Q45,20 60,30 Q75,40 90,30 L100,30"
              stroke="rgba(0, 121, 145, 0.3)"
              strokeWidth="0.2"
              fill="none"
              animate={{
                y: [0, 5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M0,80 Q20,70 40,80 Q60,90 80,80 L100,80"
              stroke="rgba(191, 252, 255, 0.2)"
              strokeWidth="0.3"
              fill="none"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          </svg>

          {/* Floating 3D-like cube effect in the corner */}
          <motion.div
            className="absolute right-[10%] top-[15%] hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="w-40 h-40 relative"
              animate={{
                rotateY: [0, 360],
                rotateX: [0, 180, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Cube faces with more prominent styling */}
              <div className="absolute inset-0 border-4 border-[#bffcff]/30 rounded-lg transform rotate-0 scale-110 opacity-80"></div>
              <div className="absolute inset-0 border-4 border-[#007991]/30 rounded-lg transform rotate-45 scale-90 opacity-70"></div>
              <div className="absolute inset-0 border-4 border-[#bffcff]/30 rounded-lg transform rotate-90 scale-100 opacity-60"></div>
              <div className="absolute inset-0 border-4 border-[#007991]/30 rounded-lg transform rotate-[135deg] opacity-50"></div>

              {/* Add a glowing center */}
              <div className="absolute inset-[25%] bg-gradient-to-br from-[#bffcff]/20 to-[#007991]/20 rounded-full blur-md"></div>
            </motion.div>
          </motion.div>

          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #00799144 0, transparent 70%), radial-gradient(circle at 50% 50%, #222E5077 0, #181f2a 100%)",
            }}
          />
        </div>

        {/* Center aligned content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="inline-block px-3 py-1 mb-6 bg-[#007991]/20 rounded-full"
              variants={fadeInUp}
            >
              <span className="text-[#bffcff] text-sm font-medium">
                Unleash your Productivity!
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
              variants={fadeInUp}
            >
              The Ultimate{" "}
              <span className="bg-gradient-to-r from-[#00eaff] to-[#bffcff] bg-clip-text text-transparent">
                Project Management and CRM
              </span>{" "}
              for Freelancers
            </motion.h1>

            <motion.p
              className="text-xl text-[#e0e6f7] mb-8 mx-auto max-w-2xl"
              variants={fadeInUp}
            >
              Streamline client management, project tracking, and payments in
              one platform designed for freelancers.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8 justify-center"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/signup"
                  className="block bg-gradient-to-r from-[#00eaff] to-[#bffcff] hover:from-[#00b6c7] hover:to-[#7fdfff] text-[#181f2a] px-8 py-3 rounded-lg text-lg font-medium shadow-lg shadow-[#00eaff]/20 transition"
                >
                  Start Free Trial
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="#demo"
                  className="block bg-[#222E50] border border-[#bffcff] hover:bg-[#222E50]/80 text-[#bffcff] px-8 py-3 rounded-lg text-lg font-medium shadow-sm transition"
                >
                  Watch Demo
                </a>
              </motion.div>
            </motion.div>

            {/* <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <svg
                className="w-12 h-12 text-[#bffcff]/30 mx-auto animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                ></path>
              </svg>
            </motion.div> */}
          </motion.div>
        </div>

        {/* Wave shape divider at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            className="w-full text-[#f8fafa]"
          >
            <path
              fill="currentColor"
              fillOpacity="1"
              d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* App Screenshots & Features */}
      <section className="py-5 bg-[#f8fafa]">
        <div className="container mx-auto px-16">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4 text-[#222E50]"
              variants={fadeInUp}
            >
              Features just for the Freelancers
            </motion.h2>
          </motion.div>
          {/* Feature 1 */}
          <motion.div
            className="flex flex-col lg:flex-row items-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12"
              variants={fadeInUp}
            >
              <div className="inline-block px-3 py-1 mb-4 bg-[#007991]/10 rounded-full">
                <span className="text-[#007991] text-sm font-medium">
                  Client Management
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#222E50]">
                Keep All Client Information in One Place
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Store contact details, communication history, and important
                documents for each client, making it easy to stay organized and
                professional.
              </p>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={1}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">
                    Centralized client profiles
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={2}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">
                    Message history & document storage
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={3}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">
                    Customizable fields & tags
                  </span>
                </motion.li>
              </ul>
              <motion.div
                className="mt-8"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              ></motion.div>
            </motion.div>
            <motion.div className="lg:w-1/2" variants={scaleIn}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#222E50]/10 to-[#3e8290] rounded-xl transform -rotate-3"></div>
                <motion.div
                  className="relative z-10 bg-white p-4 rounded-xl shadow-xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.img
                    src="src/assets/features/clients.png"
                    alt="Dashboard preview"
                    className="relative z-10 rounded-2xl shadow-2xl border-4 border-[#222E50]/50"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="flex flex-col lg:flex-row-reverse items-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="lg:w-1/2 mb-10 lg:mb-0 lg:pl-12"
              variants={fadeInUp}
            >
              <div className="inline-block px-3 py-1 mb-4 bg-[#222E50]/10 rounded-full">
                <span className="text-[#222E50] text-sm font-medium">
                  Project Tracking
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#222E50]">
                Visual Project Management
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Track all your projects with our intuitive Kanban board. Move
                tasks through customizable stages and never miss a deadline
                again.
              </p>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={1}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">
                    Drag-and-drop task management
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={2}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">
                    Deadline reminders & notifications
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={3}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">
                    Time tracking & progress reporting
                  </span>
                </motion.li>
              </ul>
            </motion.div>
            <motion.div className="lg:w-1/2" variants={scaleIn}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#222E50]/10 to-[#3e8290] rounded-xl transform -rotate-3"></div>
                <motion.div
                  className="relative z-10 bg-white p-4 rounded-xl shadow-xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Project Kanban Screenshot */}
                  <motion.img
                    src="src/assets/features/projects.png"
                    alt="Dashboard preview"
                    className="relative z-10 rounded-2xl shadow-2xl border-4 border-[#222E50]/50"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="flex flex-col lg:flex-row items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12"
              variants={fadeInUp}
            >
              <div className="inline-block px-3 py-1 mb-4 bg-[#007991]/10 rounded-full">
                <span className="text-[#007991] text-sm font-medium">
                  Task Management
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#222E50]">
                Efficient Task Management with Kanban Based Layout
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Manage backlogs and tasks with kanban board for tracking the
                status of different tasks.
              </p>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={1}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">
                    Drag and Drop Task Cards
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={2}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">
                    Manage Deadlines and Reminders
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={3}
                >
                  <div className="w-6 h-6 rounded-full bg-[#007991]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#007991]" />
                  </div>
                  <span className="text-gray-700">Import/Export Data</span>
                </motion.li>
              </ul>
            </motion.div>
            <motion.div className="lg:w-1/2" variants={scaleIn}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#222E50]/10 to-[#3e8290] rounded-xl transform -rotate-3"></div>
                <motion.div
                  className="relative z-10 bg-white p-4 rounded-xl shadow-xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.img
                    src="src/assets/features/kanban.png"
                    alt="Dashboard preview"
                    className="relative z-10 rounded-2xl shadow-2xl border-4 border-[#222E50]/50"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="flex flex-col lg:flex-row-reverse items-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="lg:w-1/2 mb-10 lg:mb-0 lg:pl-12"
              variants={fadeInUp}
            >
              <div className="inline-block px-3 py-1 mb-4 bg-[#222E50]/10 rounded-full">
                <span className="text-[#222E50] text-sm font-medium">
                  In-App Invoicing
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#222E50]">
                Generate and Send Invoices Directly
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                With our intergated invoice generator, create industry standard
                invoices and send them to the client directly via Email.
              </p>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={1}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">Invoice Generator</span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={2}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">
                    Client Portal with Payment Integration
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={fadeInUp}
                  custom={3}
                >
                  <div className="w-6 h-6 rounded-full bg-[#222E50]/20 flex items-center justify-center mr-3">
                    <FaCheck className="text-sm text-[#222E50]" />
                  </div>
                  <span className="text-gray-700">
                    Track Status and Revenue Generation
                  </span>
                </motion.li>
              </ul>
            </motion.div>
            <motion.div className="lg:w-1/2 mt-28" variants={scaleIn}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#222E50]/10 to-[#3e8290] rounded-xl transform -rotate-3"></div>
                <motion.div
                  className="relative z-10 bg-white p-4 rounded-xl shadow-xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.img
                    src="src/assets/features/invoicing.png"
                    alt="Dashboard preview"
                    className="relative z-10 rounded-2xl shadow-2xl border-4 border-[#222E50]/50"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <TestimonialSection />

      {/* Pricing Table */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-[#222E50]"
              variants={fadeInUp}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Choose the plan that works best for your freelance business. No
              hidden fees.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-8 lg:w-1/3"
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.01 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-[#222E50]">
                  Starter
                </h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-[#007991]">Rs. 0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Perfect for freelancers just starting out
                </p>
                <Link
                  to="/signup"
                  className="block w-full py-3 px-4 bg-white border border-[#007991] text-[#007991] hover:bg-[#007991]/5 rounded-lg text-center font-medium transition"
                >
                  Start Free
                </Link>
              </div>
              <div>
                <p className="font-medium mb-4 text-[#222E50]">
                  What's included:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">5 Clients</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Basic Project Tools</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Simple Invoicing</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Email Support</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-[#f8fafa] to-[#e6f0f2] rounded-2xl border-2 border-[#007991]/20 shadow-lg hover:shadow-xl transition p-8 lg:w-1/3 relative"
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-[#007991] to-[#222E50] text-white text-sm font-medium py-1 px-3 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-[#222E50]">Pro</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-[#007991]">Rs. 1000</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">
                  For growing freelance businesses
                </p>
                <Link
                  to="/signup"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-[#007991] to-[#222E50] hover:from-[#006b82] hover:to-[#1b2540] text-white rounded-lg text-center font-medium shadow-md hover:shadow-lg transition"
                >
                  Get Pro
                </Link>
              </div>
              <div>
                <p className="font-medium mb-4 text-[#222E50]">
                  Everything in Starter, plus:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">20 Clients</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">
                      Advanced Project Tracking
                    </span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Contract Templates</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Client Portal</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Priority Support</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-8 lg:w-1/3"
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-[#222E50]">
                  Enterprise
                </h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-[#007991]">Rs. 1900</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">
                  For established freelance businesses
                </p>
                <Link
                  to="/signup"
                  className="block w-full py-3 px-4 bg-white border border-[#222E50] text-[#222E50] hover:bg-[#222E50]/5 rounded-lg text-center font-medium transition"
                >
                  Go Enterprise
                </Link>
              </div>
              <div>
                <p className="font-medium mb-4 text-[#222E50]">
                  Everything in Pro, plus:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Unlimited Clients</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">
                      White-label Client Portal
                    </span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">Custom Features</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-3" />
                    <span className="text-gray-600">24/7 Priority Support</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#f8fafa]">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 text-[#222E50]"
              variants={fadeInUp}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p className="text-xl text-gray-600" variants={fadeInUp}>
              Everything you need to know about Cubicle.
            </motion.p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                question: "How does the 14-day free trial work?",
                answer:
                  "You can use all Pro features for 14 days without providing a credit card. At the end of your trial, you can choose to subscribe or downgrade to the free Starter plan.",
              },
              {
                question: "Can I change plans later?",
                answer:
                  "Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
              },
              {
                question: "Is there a contract or commitment?",
                answer:
                  "No, all plans are month-to-month with no long-term commitment. You can cancel at any time.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
              },
              {
                question: "Can I export my data if I decide to cancel?",
                answer:
                  "Yes, you can export all your client data, projects, and invoices at any time.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
                variants={fadeInUp}
                custom={index}
              >
                <motion.button
                  className="w-full px-6 py-4 text-left font-medium flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-[#222E50]">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#007991]" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      className="px-6 py-4 bg-[#f8fafa] text-gray-600"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#007991] to-[#222E50] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              variants={fadeInUp}
            >
              Ready to Transform Your Freelance Business?
            </motion.h2>
            <motion.p
              className="text-xl mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Join thousands of freelancers who use Cubicle to manage clients,
              track projects, and get paid faster.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/signup"
                  className="block bg-white text-[#007991] hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium shadow-lg transition"
                >
                  Start Your Free Trial
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222E50] text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#007991] to-[#222E50] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <p>© 2025 Cubicle. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaLinkedin />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
