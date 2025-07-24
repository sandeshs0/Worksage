import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import authService from "../services/authService";

function OnboardingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "designer",
      title: "Designer",
      icon: "🎨",
      description: "UI/UX design, graphic design, illustrations",
    },
    {
      id: "developer",
      title: "Developer",
      icon: "💻",
      description: "Frontend, backend, mobile or full-stack development",
    },
    {
      id: "writer",
      title: "Writer",
      icon: "✍️",
      description: "Content writing, copywriting, technical writing",
    },
    {
      id: "project_manager",
      title: "Project Manager",
      icon: "📊",
      description: "Plan, execute, and oversee projects from start to finish",
    },
    {
      id: "freelancer",
      title: "Freelancer",
      icon: "🚀",
      description: "Work on multiple projects across different disciplines",
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select your role to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.updateUserRole({ role: selectedRole });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update role. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 300 },
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      <motion.div
        className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col items-center mb-8"
          variants={itemVariants}
        >
          <img
            src="src/assets/logo.png"
            alt="Cubicle Logo"
            className="w-16 h-16 mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Tell us about yourself
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Help us personalize your experience on Cubicle
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            variants={itemVariants}
          >
            {error}
          </motion.div>
        )}

        <motion.div className="mb-8" variants={itemVariants}>
          <h2 className="text-lg font-medium mb-4">What's your role?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                variants={cardVariants}
                whileHover="hover"
                onClick={() => setSelectedRole(role.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-5 transition-all ${
                  selectedRole === role.id
                    ? "border-[#007991] bg-[#f0f9ff]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedRole === role.id && (
                  <div className="absolute top-3 right-3 text-[#007991]">
                    <CheckCircle size={20} fill="currentColor" />
                  </div>
                )}
                <div className="text-3xl mb-3">{role.icon}</div>
                <h3 className="font-medium text-lg mb-1">{role.title}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex flex-col space-y-3" variants={itemVariants}>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="bg-[#007991] hover:bg-[#005f73] text-white font-medium rounded-lg py-3 px-4 transition-colors duration-200"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
          
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors duration-200"
          >
            Skip for now
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingPage;