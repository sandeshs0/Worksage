import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  Bold,
  CheckCircle,
  Clock,
  File,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Underline,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { toast } from "sonner";
import {
  checkEmailAccount,
  getEmails,
  getEmailStats,
  rewriteEmailWithAI,
  sendEmail,
} from "../../services/emailService";
import StatCard from "./StatCard";
import "./tiptap.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ActivityTab = ({ activities = [], client = {}, project = {} }) => {
  console.log("ActivityTab rendered with client:", client);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("history"); // New state for tab switching
  const [emailStats, setEmailStats] = useState(null);

  // New state variables for email modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // New state for attachments
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Add these new state variables near your other useState declarations
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // New state variable for email account info
  const [emailAccountInfo, setEmailAccountInfo] = useState({
    hasCustomEmail: false,
    email: "comm@cubicle.app",
    displayName: "Cubicle",
  });
  const [isLoadingEmailAccount, setIsLoadingEmailAccount] = useState(false);

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: message,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setMessage(html);
      if (errors.message) setErrors({ ...errors, message: null });
    },
  });

  // Initialize editor content when mounting/unmounting
  useEffect(() => {
    if (editor && !message) {
      editor.commands.setContent("");
    }
  }, [editor, message]);

  // Add useEffect to check email account when component mounts
  useEffect(() => {
    const getEmailAccountInfo = async () => {
      try {
        console.log("Checking email account info...");
        setIsLoadingEmailAccount(true);
        const data = await checkEmailAccount();
        console.log("Email account data received:", data);
        setEmailAccountInfo(data);
      } catch (error) {
        console.error("Failed to fetch email account info:", error);
        // Set default values in case of error
        setEmailAccountInfo({
          hasCustomEmail: false,
          systemEmail: "comm@cubicle.app",
          displayName: "Cubicle",
        });
      } finally {
        setIsLoadingEmailAccount(false);
      }
    };

    // Immediately invoke the function
    getEmailAccountInfo();
  }, []); // Keep empty dependency array to run only on mount

  // Clean up editor on component unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Add client email to recipients when available
  useEffect(() => {
    console.log("useEffect for client email running with:", {
      clientEmail: client?.email,
      recipientsLength: recipients.length,
    });

    if (client?.email && recipients.length === 0) {
      console.log("Adding client email to recipients:", client.email);
      setRecipients([
        {
          id: "client-" + Date.now(),
          name: client.name || "Client",
          email: client.email,
          isClient: true,
        },
      ]);
    } else {
      console.log("Not adding client email because:", {
        hasClientEmail: !!client?.email,
        recipientsEmpty: recipients.length === 0,
      });
    }
  }, [client?.email, recipients.length]);

  // Fetch email history when component mounts
  useEffect(() => {
    // Call fetchEmailHistory immediately when the component renders
    fetchEmailHistory();
    // Also fetch email statistics when insights tab is available
    fetchEmailStats();

    // Set up interval to refresh email history periodically (optional)
    // const intervalId = setInterval(() => {
    //   if (document.visibilityState === "visible") {
    //     fetchEmailHistory();
    //   }
    // }, 30000); // Refresh every 30 seconds when tab is visible

    // return () => clearInterval(intervalId);
  }, []); // Empty dependency array to ensure it runs only on mount

  // Fetch email history from API
  const fetchEmailHistory = async () => {
    try {
      setIsLoadingEmails(true);

      // Build query params - include projectId only if available
      const queryParams = {
        page: 1,
        limit: 20,
      };

      // Only add projectId if it exists
      if (project?.id) {
        queryParams.projectId = project.id;
      }

      console.log("Fetching emails with params:", queryParams);
      const response = await getEmails(queryParams);

      console.log("Email history retrieved:", response);

      // Update this line to match the API response structure
      if (response && response.data) {
        // Transform emails to include a type property
        const transformedEmails = response.data.map((email) => ({
          ...email,
          type: "email",
          id: email._id || email.id,
          to: email.recipients,
          createdAt: email.sentAt || email.createdAt,
        }));

        setEmailHistory(transformedEmails);
      } else {
        setEmailHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch email history:", error);
      setEmailHistory([]);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Function to fetch email statistics
  const fetchEmailStats = async () => {
    try {
      const stats = await getEmailStats();
      setEmailStats(stats);
    } catch (error) {
      console.error("Failed to fetch email stats:", error);
      setEmailStats(null);
    }
  };

  const toggleEmailForm = () => {
    console.log("toggleEmailForm called with:", {
      showEmailForm,
      clientEmail: client?.email,
      recipients,
    });

    // When opening the form
    if (!showEmailForm && client?.email) {
      // Check if client email is already in recipients
      const hasClientEmail = recipients.some((r) => r.email === client.email);
      console.log("Has client email already:", hasClientEmail);

      if (!hasClientEmail) {
        // Add client email if not already in the list
        console.log("Adding client email in toggle:", client.email);
        setRecipients([
          ...recipients,
          {
            id: "client-" + Date.now(),
            name: client.name || "Client",
            email: client.email,
            isClient: true,
          },
        ]);
      }
    }

    setShowEmailForm(!showEmailForm);
    setErrors({});
  };

  const handleAddRecipient = () => {
    if (!newRecipient) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      setErrors({ ...errors, recipient: "Please enter a valid email address" });
      return;
    }

    setRecipients([
      ...recipients,
      {
        id: Date.now().toString(),
        email: newRecipient,
        isClient: false,
      },
    ]);
    setNewRecipient("");
    setErrors({ ...errors, recipient: null });
  };

  const handleRemoveRecipient = (id) => {
    setRecipients(recipients.filter((recipient) => recipient.id !== id));
  };

  const handleRecipientInput = (e) => {
    setNewRecipient(e.target.value);
    if (errors.recipient) {
      setErrors({ ...errors, recipient: null });
    }
  };

  const handleRecipientKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (recipients.length === 0) {
      newErrors.recipient = "At least one recipient is required";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!message.trim() || message === "<p></p>") {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format recipients for API
    const to = recipients.map((r) => ({
      email: r.email,
      name: r.name || r.email.split("@")[0],
    }));

    try {
      setIsSendingEmail(true);

      // Create FormData for uploading files
      const formData = new FormData();

      // Add email data
      formData.append("to", JSON.stringify(to));
      formData.append("subject", subject);
      formData.append("body", message);

      if (project?.id) formData.append("projectId", project.id);
      if (client?.id) formData.append("clientId", client.id);

      // Add attachments
      attachments.forEach((attachment) => {
        formData.append("attachments", attachment.file);
      });

      // Send the email with attachments
      await sendEmail(formData);

      // Show success message
      setEmailSentSuccess(true);
      setTimeout(() => setEmailSentSuccess(false), 3000);

      // Reset the form
      setShowEmailForm(false);
      if (!client?.email) setRecipients([]);
      setSubject("");
      setMessage("");
      setAttachments([]);

      // Refresh email history
      fetchEmailHistory();
    } catch (error) {
      console.error("Failed to send email:", error);
      setErrors({
        ...errors,
        submit:
          error.response?.data?.message ||
          "Failed to send email. Please try again.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Functions to handle opening/closing the email modal
  const openEmailModal = (email) => {
    setSelectedEmail(email);
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
  };

  // Add these functions to your component
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);

    // Process each file and add to attachments
    const newAttachments = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    // Add to existing attachments
    setAttachments((prev) => [...prev, ...newAttachments]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsUploading(false);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      // Find the attachment to revoke its object URL
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      // Remove the attachment
      return prev.filter((a) => a.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteSuccess, setRewriteSuccess] = useState(false);

  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  // Add this function to generate random sparkles
  const createSparkles = (count = 8) => {
    const sparkles = [];
    for (let i = 0; i < count; i++) {
      sparkles.push({
        id: `sparkle-${i}`,
        size: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`,
        style: {
          "--tx": `${Math.random() * 100 - 50}px`,
          "--ty": `${Math.random() * -100 - 20}px`,
          "--r": `${Math.random() * 360}deg`,
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
        },
      });
    }
    return sparkles;
  };

  const [sparkles, setSparkles] = useState([]);

  const handleRewriteWithAI = async () => {
    try {
      setIsRewriting(true);
      const plainText = editor.getText();

      if (!plainText.trim()) {
        setErrors({
          ...errors,
          message: "Please add content before rewriting",
        });
        return;
      }

      const response = await rewriteEmailWithAI({
        text: plainText,
        tone: "professional",
        length: "similar",
      });

      // Store original content to restore if needed
      const originalContent = editor.getHTML();

      // Clear the editor
      editor.commands.setContent("");

      // Start typewriter effect
      setIsTyping(true);
      setTypingText("");

      const rewrittenText = response.rewrittenText;

      // Make sure rewrittenText exists and has content
      if (!rewrittenText || rewrittenText.length === 0) {
        console.error("Received empty rewritten text");
        return;
      }

      console.log("Starting to type:", rewrittenText.charAt(0)); // Debug log

      let currentText = "";
      let i = 0;

      // Type each character with a small delay
      const typeInterval = setInterval(() => {
        if (i < rewrittenText.length) {
          currentText += rewrittenText.charAt(i);
          setTypingText(currentText); // Set the entire text each time
          i++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);

          // Show sparkle animation when typing completes
          setShowSparkle(true);
          setSparkles(createSparkles(12));
          setTimeout(() => setShowSparkle(false), 2000);

          // Set rewriteSuccess for the notification
          setRewriteSuccess(true);
          setTimeout(() => setRewriteSuccess(false), 3000);
        }
      }, 30); // Adjust typing speed here (lower = faster)

      toast.success("Content Rewritten by CubicleAI.");
    } catch (err) {
      console.error("Rewrite error:", err);
      setErrors({
        ...errors,
        message: "Failed to rewrite email. Please try again.",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  // Add this useEffect to synchronize editor content when typing completes
  useEffect(() => {
    if (!isTyping && typingText && editor) {
      editor.commands.setContent(`<div>${typingText}</div>`);
      setMessage(`<div>${typingText}</div>`);
    }
  }, [isTyping, typingText, editor]);

  // Add this function at the top of your ActivityTab component

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  return (
    <div className="p-6">
      {/* Success Toast Message */}
      {emailSentSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg z-50">
          <svg
            className="fill-current h-6 w-6 text-green-500 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-5l-2-2 1.5-1.5L9 12l5-5L15.5 8.5 9 15z" />
          </svg>
          <span>Email sent successfully!</span>
        </div>
      )}

      {/* Header with Send Email button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-gray-700">Email Communication</h2>
        <div className="flex gap-2">
          <button
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            onClick={fetchEmailHistory}
            disabled={isLoadingEmails}
            title="Refresh emails"
          >
            {isLoadingEmails ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
          <button
            className="bg-[#007991] text-white px-4 py-2 rounded-md shadow flex items-center"
            onClick={toggleEmailForm}
          >
            <Mail size={16} className="mr-2" />
            Send Email
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-white text-[#007991] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <Mail size={16} className="mr-2" />
          Email History
        </button>
        <button
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "insights"
              ? "bg-white text-[#007991] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          <BarChart3 size={16} className="mr-2" />
          Email Insights
        </button>
      </div>

      {/* Email Form - shown directly when active */}
      {showEmailForm ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-medium text-lg text-gray-700">Send Email</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleEmailForm}
              disabled={isSendingEmail}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="p-4">
            <div className="space-y-4">
              {/* To field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To:
                </label>
                <div className="flex flex-wrap items-center border border-gray-300 rounded-md p-1 bg-white">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center bg-gray-100 rounded-full py-1 px-2 mr-1 mb-1"
                    >
                      <span className="flex items-center justify-center w-5 h-5 bg-gray-300 rounded-full text-xs font-medium text-gray-700 mr-1">
                        {recipient.name
                          ? recipient.name.charAt(0)
                          : recipient.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm">
                        {recipient.name || recipient.email}
                      </span>
                      {!recipient.isClient && (
                        <button
                          type="button"
                          className="ml-1 text-gray-400 hover:text-gray-600"
                          onClick={() => handleRemoveRecipient(recipient.id)}
                          disabled={isSendingEmail}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex-grow flex items-center">
                    <input
                      type="text"
                      className="flex-grow outline-none text-sm ml-1 p-1"
                      placeholder="Add recipient email..."
                      value={newRecipient}
                      onChange={handleRecipientInput}
                      onKeyPress={handleRecipientKeyPress}
                      disabled={isSendingEmail}
                    />
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={handleAddRecipient}
                      disabled={isSendingEmail}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                {errors.recipient && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.recipient}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or click + to add more recipients
                </p>
              </div>

              {/* Add this after the recipients section and before the subject field */}
              <div className="mt-2 mb-2 flex items-start gap-1 bg-yellow-50 p-3 rounded-md text-sm">
                <div className="text-yellow-500 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div className="text-yellow-700">
                  {isLoadingEmailAccount ? (
                    "Checking email configuration..."
                  ) : emailAccountInfo.hasCustomEmail ? (
                    <>
                      The email will be sent from{" "}
                      <strong className="text-underline">
                        '{emailAccountInfo.email}'
                      </strong>{" "}
                      ({emailAccountInfo.displayName}).
                    </>
                  ) : (
                    <>
                      The email will be sent from{" "}
                      <strong className="text-underline">
                        '{emailAccountInfo.systemEmail || "comm@cubicle.app"}'
                      </strong>
                      . You can change the sender email address in Settings.
                      <button
                        type="button"
                        onClick={() => setShowTutorialModal(true)}
                        className="text-yellow-600 hover:text-yellow-800 font-medium ml-1 underline"
                      >
                        Learn More
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Subject field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${
                    errors.subject ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-[#007991]`}
                  placeholder="Write a Subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors({ ...errors, subject: null });
                  }}
                  disabled={isSendingEmail}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Message body with TipTap editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div
                  className={`border ${
                    errors.message ? "border-red-300" : "border-gray-300"
                  } rounded-md p-1`}
                >
                  {/* Editor Toolbar */}
                  <div className="border-b p-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-1 rounded ${
                        editor?.isActive("bold") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      className={`p-1 rounded ${
                        editor?.isActive("italic") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                      }
                      className={`p-1 rounded ${
                        editor?.isActive("underline") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <Underline size={16} />
                    </button>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      className={`p-1 rounded ${
                        editor?.isActive("bulletList") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      className={`p-1 rounded ${
                        editor?.isActive("orderedList") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <ListOrdered size={16} />
                    </button>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt("URL:");
                        if (url) {
                          editor?.chain().focus().setLink({ href: url }).run();
                        }
                      }}
                      className={`p-1 rounded ${
                        editor?.isActive("link") ? "bg-gray-200" : ""
                      }`}
                      disabled={isSendingEmail}
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt("Image URL:");
                        if (url) {
                          editor?.chain().focus().setImage({ src: url }).run();
                        }
                      }}
                      className="p-1 rounded"
                      disabled={isSendingEmail}
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>

                  {/* Editor Content */}
                  <div
                    className={`min-h-[150px] p-2 prose max-w-none ${
                      isSendingEmail ? "opacity-70 pointer-events-none" : ""
                    }`}
                  >
                    {isTyping ? (
                      <div className="min-h-[150px] focus:outline-none relative">
                        <div className="typewriter">
                          {typingText}
                          <span className="cursor">|</span>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        className="relative rounded-md"
                        animate={
                          showSparkle
                            ? {
                                scale: [1, 1.01, 1],
                                transition: { duration: 0.5 },
                              }
                            : {}
                        }
                      >
                        <EditorContent
                          editor={editor}
                          className="min-h-[150px] focus:outline-none"
                        />

                        {/* Sparkle effect */}
                        {showSparkle && (
                          <div className="sparkle-container">
                            {sparkles.map((sparkle) => (
                              <motion.div
                                key={sparkle.id}
                                className="sparkle"
                                style={sparkle.style}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                }}
                                transition={{ duration: 2 }}
                              >
                                <svg
                                  width={sparkle.size}
                                  height={sparkle.size}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"
                                    fill={sparkle.color}
                                  />
                                </svg>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              {/* Attachments section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Attachments
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                    disabled={isSendingEmail}
                  >
                    <Paperclip size={16} className="mr-1" />
                    Add File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSendingEmail}
                  />
                </div>

                {/* Display attachments */}
                {attachments.length > 0 && (
                  <div className="border border-gray-200 rounded-md p-2 mt-1 bg-gray-50">
                    <ul className="divide-y divide-gray-200">
                      {attachments.map((file) => (
                        <li
                          key={file.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <File size={16} className="text-gray-500 mr-2" />
                            <div>
                              <p
                                className="text-sm font-medium text-gray-800 truncate"
                                style={{ maxWidth: "280px" }}
                              >
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(file.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isSendingEmail}
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="flex justify-between mt-8 pt-3 border-t border-gray-200">
                {/* Rewrite with AI button */}
                <button
                  type="button"
                  className="flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50"
                  disabled={isSendingEmail}
                  onClick={handleRewriteWithAI}
                >
                  {isRewriting ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2 text-yellow-600" />
                      Rewrite with AI
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-3">
                  {/* Attachment button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    disabled={isSendingEmail}
                    title="Add attachment"
                  >
                    <Paperclip size={18} />
                  </button>

                  {/* Send button with arrow icon */}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#007991] text-white rounded-md hover:bg-[#006980] transition-colors flex items-center shadow-sm disabled:opacity-70"
                    disabled={isSendingEmail}
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send
                        <Send size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {/* Tab Content */}
      {activeTab === "history" && (
        /* Email History */
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h3 className="font-medium text-lg text-gray-700">Email History</h3>
          </div>
          {/* Email list - show loader or emails */}
          <div className="p-4">
            {isLoadingEmails ? (
              <div className="flex items-center justify-center py-6">
                <Loader size={24} className="animate-spin text-gray-500" />
              </div>
            ) : (
              <>
                {emailHistory.length > 0 ? (
                  <div className="space-y-2">
                    {emailHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-md transition-all cursor-pointer ${
                          item.type === "email"
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-blue-50 hover:bg-blue-100"
                        } border ${
                          item.type === "email"
                            ? "border-gray-100"
                            : "border-blue-100"
                        }`}
                      >
                        {item.type === "email" ? (
                          <div
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => openEmailModal(item)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start flex-1">
                                <Mail
                                  size={16}
                                  className={
                                    item.status === "failed"
                                      ? "text-red-500 mr-2 mt-0.5"
                                      : "text-blue-500 mr-2 mt-0.5"
                                  }
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {item.subject}
                                    </span>

                                    {/* Email Status Badges */}
                                    <div className="flex items-center gap-1">
                                      {item.status === "failed" && (
                                        <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                                          Failed to send
                                        </span>
                                      )}

                                      {item.status === "sent" && (
                                        <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                                          Sent
                                        </span>
                                      )}

                                      {/* Read Status Badge */}
                                      {item.opened ? (
                                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center">
                                          <svg
                                            className="w-3 h-3 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                              fillRule="evenodd"
                                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          Read
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                                          Unread
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-sm text-gray-600 mb-2">
                                    To:{" "}
                                    {item.recipients
                                      ?.map((r) => r.name || r.email)
                                      .join(", ")}
                                  </div>

                                  {/* Timestamps */}
                                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                                    <div className="flex items-center gap-4">
                                      <span>
                                        Sent:{" "}
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleString()}
                                      </span>

                                      {item.opened && item.openedAt && (
                                        <span className="text-blue-600">
                                          Opened:{" "}
                                          {new Date(
                                            item.openedAt
                                          ).toLocaleString()}
                                        </span>
                                      )}
                                    </div>

                                    {/* Time since opened */}
                                    {item.opened && item.openedAt && (
                                      <span className="text-blue-500 text-xs">
                                        Read {getTimeAgo(item.openedAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>{item.content}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center">
                    <div className="text-center">
                      <img
                        src="/img/empty-box.png"
                        alt="Empty box"
                        className="w-24 h-24 mx-auto mb-4 opacity-60"
                        onError={(e) => {
                          e.target.outerHTML = `<div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center text-gray-300">
                          <img src="/src/assets/nothing.png" alt="No activities" class="w-24 h-24" />
                        </div>`;
                        }}
                      />
                      <h3 className="text-lg text-gray-600 font-medium">
                        Nothing to see here!
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Start by sending an update to your client.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        /* Email Insights */
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h3 className="font-medium text-lg text-gray-700">
              Email Insights
            </h3>
          </div>
          <div className="p-4">
            {emailStats ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Emails"
                    value={emailStats.data.totalEmails?.toString() || "0"}
                    icon={Mail}
                  />
                  <StatCard
                    title="Sent Emails"
                    value={emailStats.data.sentEmails?.toString() || "0"}
                    subtitle={`${
                      Math.round(
                        (emailStats.data.sentEmails /
                          emailStats.data.totalEmails) *
                          100
                      ) || 0
                    }% of total`}
                    icon={CheckCircle}
                  />
                  <StatCard
                    title="Failed Emails"
                    value={emailStats.data.failedEmails?.toString() || "0"}
                    subtitle={`${
                      Math.round(
                        (emailStats.data.failedEmails /
                          emailStats.data.totalEmails) *
                          100
                      ) || 0
                    }% failure rate`}
                    icon={XCircle}
                  />
                  <StatCard
                    title="Draft Emails"
                    value={emailStats.data.draftEmails?.toString() || "0"}
                    subtitle="Pending to send"
                    icon={Clock}
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Email Status Doughnut Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Email Status Distribution
                    </h4>
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: ["Sent", "Failed", "Draft", "Scheduled"],
                          datasets: [
                            {
                              data: [
                                emailStats.data.sentEmails || 0,
                                emailStats.data.failedEmails || 0,
                                emailStats.data.draftEmails || 0,
                                emailStats.data.scheduledEmails || 0,
                              ],
                              backgroundColor: [
                                "#10B981", // Green for sent
                                "#EF4444", // Red for failed
                                "#F59E0B", // Yellow for draft
                                "#8B5CF6", // Purple for scheduled
                              ],
                              borderWidth: 2,
                              borderColor: "#ffffff",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const label = context.label || "";
                                  const value = context.parsed;
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                  );
                                  const percentage = Math.round(
                                    (value / total) * 100
                                  );
                                  return `${label}: ${value} (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Email Performance Bar Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Email Performance
                    </h4>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: ["Sent", "Opened", "Failed"],
                          datasets: [
                            {
                              label: "Emails",
                              data: [
                                emailStats.data.sentEmails || 0,
                                emailStats.data.openedEmails || 0,
                                emailStats.data.failedEmails || 0,
                              ],
                              backgroundColor: [
                                "#007991",
                                "#10B981",
                                "#EF4444",
                              ],
                              borderColor: ["#005f73", "#059669", "#DC2626"],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  return `${context.label}: ${context.parsed.y} emails`;
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Performance Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    Performance Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Success Rate
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(
                              (emailStats.data.sentEmails /
                                emailStats.data.totalEmails) *
                                100
                            ) || 0}
                            %
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Open Rate
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {emailStats.data.sentEmails > 0
                              ? Math.round(
                                  (emailStats.data.openedEmails /
                                    emailStats.data.sentEmails) *
                                    100
                                )
                              : 0}
                            %
                          </p>
                        </div>
                        <Mail className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Failure Rate
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {Math.round(
                              (emailStats.data.failedEmails /
                                emailStats.data.totalEmails) *
                                100
                            ) || 0}
                            %
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    Quick Stats
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {emailStats.data.totalEmails}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sent</p>
                        <p className="text-lg font-semibold text-green-600">
                          {emailStats.data.sentEmails}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Failed</p>
                        <p className="text-lg font-semibold text-red-600">
                          {emailStats.data.failedEmails}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Drafts</p>
                        <p className="text-lg font-semibold text-yellow-600">
                          {emailStats.data.draftEmails}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader
                    size={24}
                    className="animate-spin text-gray-500 mx-auto mb-2"
                  />
                  <p className="text-gray-500">Loading email insights...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Detail Modal - shown when an email is clicked */}
      {isEmailModalOpen && selectedEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Dimmed background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeEmailModal}
            aria-hidden="true"
          ></div>

          {/* Modal content */}
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg shadow-xl max-w-xl w-full mx-auto overflow-hidden transform transition-all">
              {/* Header */}
              <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-xl text-gray-800">
                    {selectedEmail.subject}
                  </h3>

                  {/* Read status in modal */}
                  {selectedEmail.opened ? (
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Read
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                      Unread
                    </span>
                  )}
                </div>

                <button
                  className="rounded-full hover:bg-gray-200 p-2 transition-colors"
                  onClick={closeEmailModal}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Email details */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between flex-wrap">
                  <div className="mb-2 mr-4">
                    <div className="text-sm font-medium text-gray-500">To:</div>
                    <div className="font-medium">
                      {selectedEmail.recipients
                        ?.map((r) => r.name || r.email)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-500">
                      Sent:
                    </div>
                    <div className="text-gray-700">
                      {new Date(selectedEmail.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Add read timestamp */}
                {selectedEmail.opened && selectedEmail.openedAt && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex items-center text-sm text-blue-700">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <strong>Email was read</strong>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Opened on{" "}
                      {new Date(selectedEmail.openedAt).toLocaleString()}
                    </div>
                  </div>
                )}

                {selectedEmail.status === "failed" && (
                  <div className="mt-2 bg-red-50 text-red-600 text-sm py-1 px-3 rounded-md inline-block border border-red-100">
                    Failed to send
                  </div>
                )}
              </div>

              {/* Email body with scroll for long content */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  onClick={closeEmailModal}
                >
                  Close
                </button>
              </div>

              {/* Show attachments if present */}
              {selectedEmail.attachments?.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </h4>
                  <ul className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <li key={index} className="flex items-center">
                        <File size={16} className="text-gray-500 mr-2" />
                        <a
                          href={attachment.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {attachment.filename || attachment.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Dimmed background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowTutorialModal(false)}
            aria-hidden="true"
          ></div>

          {/* Modal content */}
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto overflow-hidden transform transition-all">
              {/* Header */}
              <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50">
                <h3 className="font-medium text-xl text-gray-800">
                  How to Change Your Sender Email
                </h3>
                <button
                  className="rounded-full hover:bg-gray-200 p-2 transition-colors"
                  onClick={() => setShowTutorialModal(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video container */}
              <div className="p-5">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    className="w-full h-[400px]"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="How to Change Your Sender Email"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="mt-4 text-gray-600">
                  <p>
                    To Change Sender Email : Go to Settings &gt; Email
                    Configuration &gt; Add Email and App Password.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  onClick={() => setShowTutorialModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add this after the editor component */}
      <AnimatePresence>
        {rewriteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-200"
          >
            <svg
              className="w-4 h-4 mr-1.5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Email professionally rewritten
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityTab;
