import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function OtpVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  // Focus on first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // If value is entered and not the last box, move to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Navigate through inputs with arrow keys
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    // If backspace is pressed and current input is empty, focus previous input
    else if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedData[i];
        }
      }
      setOtp(newOtp);

      // Set focus to appropriate input after paste
      if (pastedData.length < 6 && inputRefs.current[pastedData.length]) {
        inputRefs.current[pastedData.length].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    //console.log("Submitting OTP:", otp.join(""));
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      //console.log("Verifying OTP:", otpValue);
      await authService.verifyEmail({
        email,
        otp: otpValue,
      });
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    // Implement OTP resend functionality here
    // This would typically call the register endpoint again with a resend flag
    //console.log("Resend OTP for:", email);
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

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      <motion.div
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex justify-center mb-6"
          variants={itemVariants}
        >
          <div className="w-16 h-16 rounded-lg flex items-center justify-center">
            <img
              src="src/assets/logo.png"
              alt="WorkSage Logo"
              className="w-16 h-16"
            />
          </div>
        </motion.div>

        <motion.h1
          className="text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-2"
          variants={itemVariants}
        >
          Verify Your Email
        </motion.h1>

        <motion.p
          className="text-gray-600 text-center mb-8"
          variants={itemVariants}
        >
          We've sent a verification code to{" "}
          <span className="font-medium">{email}</span>
        </motion.p>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            variants={itemVariants}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            className="flex justify-between gap-2 mb-8"
            variants={itemVariants}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={otp[index]}
                maxLength={1}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : null}
                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-[#18cb96] focus:border-[#18cb96] outline-none"
              />
            ))}
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-[#18cb96] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#14a085] transition-colors duration-200 flex justify-center items-center"
            disabled={loading}
            variants={itemVariants}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </motion.button>
        </form>

        <motion.div className="text-center mt-6" variants={itemVariants}>
          <p className="text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOtp}
              className="text-[#18cb96] hover:text-[#14a085] font-medium"
            >
              Resend OTP
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default OtpVerificationPage;
