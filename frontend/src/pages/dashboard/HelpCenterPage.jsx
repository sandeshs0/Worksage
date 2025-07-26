import React, { useState, useRef } from "react";
import { Plus, Minus, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "I cannot remember my password. How can I get access to my account?",
    answer: "Click on 'Forgot Password' on the login page and follow the instructions to reset your password.",
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to Settings > Profile and edit your details. Save to update.",
  },
  {
    question: "How can I add a new client?",
    answer: "Navigate to the Clients page and click on 'Add New Client'. Fill in the required details and submit.",
  },
  {
    question: "How do I contact support?",
    answer: "Click the 'Contact Support' button below to raise a ticket.",
  },
  {
    question: "Can I export my project data?",
    answer: "Yes, go to Projects, select the project, and click 'Export'.",
  },
  {
    question: "How do I change my subscription plan?",
    answer: "Go to Settings > Subscription to manage your plan.",
  },
];

function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [issue, setIssue] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const handleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the ticket to your backend
    setIssue("");
    setDesc("");
    setFiles([]);
    setShowSupport(false);
    alert("Support ticket submitted!");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[80vh] flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-[#18172a] text-center">Help Center</h2>
      <hr className="w-full border-gray-200 mb-2" />
      <h3 className="text-3xl font-bold text-center mb-8 mt-2" style={{fontFamily:'inherit'}}>Frequently Asked Questions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-8">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition hover:shadow-lg"
            onClick={() => handleAccordion(idx)}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 text-[#18cb96]">
                {openIndex === idx ? <Minus size={20}/> : <Plus size={20}/>} 
              </span>
              <div>
                <div className="font-semibold text-lg md:text-xl text-[#18172a]">{faq.question}</div>
                <AnimatePresence initial={false}>
                  {openIndex === idx && (
                    <motion.div
                      key="faq-answer"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 text-gray-700 text-base md:text-lg leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="flex items-center gap-2 bg-[#18cb96] hover:bg-[#14a085] text-white px-6 py-2 rounded-lg font-semibold shadow transition mb-8"
        onClick={() => setShowSupport(true)}
      >
        <UploadCloud size={20} /> Contact Support
      </button>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowSupport(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold text-center mb-6 text-[#18172a]">Contact Customer Support</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-medium mb-1">Issue Faced</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                  placeholder="Eg. Authentication, File Upload, UI issue"
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#18cb96]"
                  rows={4}
                  placeholder="Describe the exact situation of the issue you encountered."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block font-medium mb-1">Attach Screenshots</label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-400 cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  Drag and Drop or Upload Files
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {files.map((file, i) => (
                        <div key={i}>{file.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#18cb96] hover:bg-[#14a085] text-white py-2 rounded font-semibold transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpCenterPage;