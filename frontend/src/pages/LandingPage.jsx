import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ChevronDown,
  Database,
  Eye,
  FileText,
  Github,
  KanbanIcon,
  Key,
  Linkedin,
  Lock,
  Menu,
  Play,
  Rocket,
  Shield,
  Star,
  TrendingUp,
  Twitter,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  // Core features data
  const coreFeatures = [
    {
      icon: Users,
      title: "Client Management",
      description:
        "Comprehensive client profiles with contact management, project history, and communication tracking.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Project Tracking",
      description:
        "Advanced project management with milestone tracking, time logging, and progress visualization.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FileText,
      title: "Smart Invoicing",
      description:
        "Automated invoice generation, payment tracking, and integrated payment processing.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: KanbanIcon,
      title: "Kanban & Pomodoro",
      description:
        "Kanban boards for task management with Pomodoro timer integration for productivity.",
    },
  ];

  // Security features data
  const securityFeatures = [
    {
      icon: Shield,
      title: "Multi-Factor Authentication",
      description:
        "TOTP-based 2FA with backup codes and emergency access protocols.",
      details: [
        "Time-based OTP",
        "Backup recovery codes",
        "Works with Google/Microsoft Authenticators",
      ],
    },
    {
      icon: Lock,
      title: "Advanced XSS Protection",
      description:
        "Real-time content sanitization with DOMPurify and pattern detection.",
      details: [
        "Attack pattern detection",
        "DOM sanitization",
        "Content Security Policy",
      ],
    },
    {
      icon: Database,
      title: "NoSQL Injection Prevention",
      description: "Comprehensive input validation and query sanitization.",
      details: [
        "Input sanitization",
        "Query parameterization",
        "Real-time monitoring",
      ],
    },
    {
      icon: UserCheck,
      title: "Role-Based Access Control",
      description:
        "Granular permissions with activity logging and session management.",
      details: [
        "Granular permissions",
        "Activity monitoring",
        "Session tracking",
      ],
    },
    {
      icon: Key,
      title: "Password Security",
      description:
        "Advanced password policies with history tracking and complexity validation.",
      details: [
        "12+ character minimum",
        "Complexity validation",
        "History tracking",
      ],
    },
    {
      icon: Eye,
      title: "Real-time Security Monitoring",
      description:
        "Continuous threat detection with automated response systems.",
      details: [
        "Threat detection",
        "Automated responses",
        "Security analytics",
      ],
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "5 Clients",
        "10 Projects",
        "Basic invoicing",
        "Standard security",
        "Email support",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "Rs. 3000",
      description: "For growing freelancers",
      features: [
        "20 Clients",
        "Unlimited projects",
        "Advanced project tracking",
        "Enhanced security features",
        "AI-powered insights",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Vantage",
      price: "Rs. 6000",
      description: "For established agencies",
      features: [
        "Unlimited clients",
        "Team collaboration",
        "White-label solutions",
        "Enterprise security",
        "Custom integrations",
        "Dedicated support",
      ],
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "How secure is my data with WorkSage?",
      answer:
        "WorkSage implements enterprise-grade security including multi-factor authentication, XSS protection, NoSQL injection prevention, and continuous security monitoring. All data is encrypted in transit and at rest.",
    },
    {
      question: "Can I import my existing client data?",
      answer:
        "Yes, WorkSage supports data import from various formats including CSV, Excel, and direct integrations with popular CRM platforms. Our migration team can help with complex transfers.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support Khalti. For enterprise plans, we also offer invoicing and custom payment arrangements.",
    },
    {
      question: "Is there a mobile app available?",
      answer: "Soon. :)",
    },
    {
      question: "How does the AI assistance work?",
      answer:
        "Our AI features help with project time estimation, client communication suggestions, invoice optimization, and predictive analytics for better business decisions.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* Modern Floating Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <motion.nav
          className={`max-w-4xl w-full mx-4 rounded-2xl backdrop-blur-xl border ${
            scrolled
              ? "bg-white/95 shadow-xl border-gray-200/50"
              : "bg-white/90 border-gray-100/50"
          } transition-all duration-500`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                  <img src="/src/assets/logo.png" />
                </div>
                {/* <div className="absolute -top-1 -right-1 w-4 h-4 "></div> */}
              </div>
              <div>
                <span className="text-2xl font-bold">WorkSage</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#security"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Security
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Reviews
              </a>
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-100 px-8 py-6"
              >
                <div className="flex flex-col space-y-4">
                  <a
                    href="#features"
                    className="text-gray-700 hover:text-primary-600 py-2 transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#security"
                    className="text-gray-700 hover:text-primary-600 py-2 transition-colors"
                  >
                    Security
                  </a>
                  <a
                    href="#pricing"
                    className="text-gray-700 hover:text-primary-600 py-2 transition-colors"
                  >
                    Pricing
                  </a>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-center shadow-lg transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* Hero Section */}
<section className="relative pt-28 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Improved background with better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        
        {/* Enhanced animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-32 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400/15 to-pink-400/15 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Enhanced trust badge */}
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white/90">
                Secured SaaS based CRM
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Improved headline with better typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
              <span className="text-white">The</span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Secured SaaS based
              </span>{" "}
              <span className="text-white">CRM</span>
              <br />
              <span className="text-white">Built for</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Modern Freelancers
              </span>
            </h1>

            {/* Enhanced subtitle with social proof */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Secure client management with management tools and 
              
              Enterprise security meets intelligent automation.
            </p>

            {/* Improved CTA section */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-3xl hover:shadow-cyan-500/40 hover:-translate-y-1">
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Free </span>
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button 
                onClick={() => setVideoModalOpen(true)}
                className="group flex items-center space-x-3 text-white hover:text-cyan-400 font-semibold text-lg transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:border-cyan-400/50 group-hover:bg-white/20">
                  <Play className="w-5 h-5 text-cyan-400 ml-0.5" />
                </div>
                <span>Watch 2-min Demo</span>
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* Core Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Scale Your Business
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Comprehensive tools designed specifically for freelancers and
              small agencies
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section id="security" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 rounded-full px-6 py-3 mb-6"
              variants={fadeInUp}
            >
              <Shield className="text-red-600" />
              <span className="text-red-700 font-semibold">
                Enterprise Security
              </span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-red-600 to-primary-600 bg-clip-text text-transparent">
                Security Features
              </span>{" "}
              Implemented
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Your data is protected by multiple layers of security, including
              advanced threat detection, real-time monitoring, and
              industry-leading encryption standards.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-200 group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="flex items-center space-x-2 text-sm text-gray-500"
                    >
                      <CheckCircle className="text-green-500 text-xs" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Security Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="group">
              <div className="text-4xl font-bold text-primary-600 mb-2 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group">
              <div className="text-4xl font-bold text-red-600 mb-2 group-hover:scale-110 transition-transform">
                0
              </div>
              <div className="text-gray-600">Security Breaches</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group">
              <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                24/7
              </div>
              <div className="text-gray-600">Monitoring</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="group">
              <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                256-bit
              </div>
              <div className="text-gray-600">Encryption</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Choose the plan that fits your business needs. All plans include
              our core security features.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 border-2 relative ${
                  plan.highlighted
                    ? "border-primary-500 shadow-2xl shadow-primary-500/20 scale-105"
                    : "border-gray-100 hover:border-primary-200 hover:shadow-xl"
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: plan.highlighted ? 0 : -5 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    {plan.price !== "Free" && (
                      <span className="text-lg text-gray-500">/month</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block w-full text-center py-4 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Thousands
              </span>{" "}
              of Freelancers
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              See what our users say about WorkSage's security and functionality
            </motion.p>
          </motion.div>

          <TestimonialSection />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full bg-white rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-primary-200"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`text-primary-600 transition-transform ${
                        activeFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 text-gray-600 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Ready to Secure Your Freelance Business?
            </motion.h2>
            <motion.p className="text-xl mb-12 opacity-90" variants={fadeInUp}>
              Join thousands of freelancers who trust WorkSage with their most
              important business data.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={fadeInUp}
            >
              <Link
                to="/signup"
                className="bg-white hover:bg-gray-100 text-primary-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                Start Your Free Trial
              </Link>
              <Link
                to="/login"
                className="border-2 border-white/30 hover:border-white/50 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-gray-300">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center">
                  <Shield className="text-white" />
                </div>
                <span className="text-2xl font-bold text-white">WorkSage</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                The most secure freelance business management platform. Trusted
                by thousands of professionals worldwide.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Twitter />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Linkedin />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Github />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Press
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">
                Legal & Security
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Security Compliance
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    GDPR
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    SOC 2
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 WorkSage. All rights reserved. Built with security in mind.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="text-primary-400" />
                <span>Secured by WorkSage</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
