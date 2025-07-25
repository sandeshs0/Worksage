import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

const FaStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "WorkSage has transformed how I manage my freelance business. The client management tools alone have saved me hours each week.",
    name: "Sarah Johnson",
    role: "Graphic Designer",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    rating: 5,
    text: "The invoicing system is a game-changer. I get paid faster, and my clients love the professional experience.",
    name: "Mark Williams",
    role: "Web Developer",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    rating: 5,
    text: "I was spending too much time on admin work before WorkSage. Now I can focus on what I love - creating content for my clients.",
    name: "Jessica Chen",
    role: "Content Writer",
    color: "from-emerald-500 to-teal-500",
  },
];

const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    animate={{
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

const TestimonialCard = ({ testimonial, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial={{
        opacity: 0,
        y: 100,
        rotateX: -15,
        scale: 0.8,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -20,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      {/* Floating background orb */}
      <motion.div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-r ${testimonial.color} opacity-20 blur-xl`}
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.3 : 0.2,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)`,
          }}
          animate={{
            backgroundPosition: isHovered ? "200% 0" : "0% 0",
          }}
          transition={{ duration: 1.5 }}
        />

        {/* Glowing corner accent */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${testimonial.color} opacity-10 rounded-bl-full`}
        />

        {/* Stars with animation */}
        <motion.div
          className="flex items-center mb-6 relative z-10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 + 0.3 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.2 + 0.4 + i * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.2, rotate: 180 }}
            >
              <FaStar className="text-yellow-400 mr-1" />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial text */}
        <motion.p
          className="text-gray-200 mb-8 text-lg leading-relaxed relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: index * 0.2 + 0.5 }}
        >
          "{testimonial.text}"
        </motion.p>

        {/* Author info */}
        <motion.div
          className="flex items-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 + 0.6 }}
        >
          <motion.div
            className={`w-14 h-14 rounded-full bg-gradient-to-r ${testimonial.color} mr-4 flex items-center justify-center text-white font-bold text-lg shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {testimonial.name.charAt(0)}
          </motion.div>
          <div>
            <h4 className="font-semibold text-white text-lg">
              {testimonial.name}
            </h4>
            <p className="text-gray-400">{testimonial.role}</p>
          </div>
        </motion.div>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
};

export default function TestimonialSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={4}>
          <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl" />
        </FloatingElement>
      </div>

      {/* Grid pattern overlay */}
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"%3E%3Cg fill-opacity=\"0.03\"%3E%3Cpath d=\"M0 0h60v60H0z\" fill=\"%23ffffff\"/%3E%3Cpath d=\"M0 0h30v30H0z\" fill=\"%23000000\"/%3E%3C/g%3E%3C/svg%3E')] opacity-20" /> */}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              Testimonials
            </div>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Loved by Freelancers
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Here's what freelancers like you have to say about WorkSage.
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-8 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          style={{ y }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Join Thousands of Happy Freelancers
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
