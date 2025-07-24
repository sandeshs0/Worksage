import { useState } from 'react';
import { X, Loader, Mail, Server, User, Key } from 'lucide-react';
import { toast } from 'sonner';
import settingsService from '../../services/settingsService';

const EmailAccountModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    email: '',
    displayName: '',
    smtp: {
      host: '',
      port: 587,
      secure: false,
    },
    auth: {
      user: '',
      pass: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.displayName) newErrors.displayName = 'Display name is required';
    if (!formData.smtp.host) newErrors['smtp.host'] = 'SMTP host is required';
    if (!formData.smtp.port) newErrors['smtp.port'] = 'SMTP port is required';
    if (!formData.auth.user) newErrors['auth.user'] = 'Username is required';
    if (!formData.auth.pass) newErrors['auth.pass'] = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsLoading(true);
      await settingsService.addEmailAccount(formData);
      toast.success("Email account added successfully", {
        description: "Please check your email for verification instructions",
      });
      
      // Reset form
      setFormData({
        email: '',
        displayName: '',
        smtp: {
          host: '',
          port: 587,
          secure: false,
        },
        auth: {
          user: '',
          pass: '',
        },
      });
      
      // Call onSuccess to refresh the email list in parent
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Failed to add email account:", error);
      toast.error("Failed to add email account", {
        description: error.message || "Please check your settings and try again",
      });
      
      // If there's a server validation error, set field-specific errors
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form when modal is opened/closed
  const handleModalClose = () => {
    setFormData({
      email: '',
      displayName: '',
      smtp: {
        host: '',
        port: 587,
        secure: false,
      },
      auth: {
        user: '',
        pass: ''
      }
    });
    setErrors({});
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleModalClose}></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-medium text-xl text-gray-800">Add Email Account</h3>
            <button
              className="rounded-full p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              onClick={handleModalClose}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 p-2 border ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="john.doe@example.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className={`w-full pl-10 p-2 border ${
                          errors.displayName ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="John Doe"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.displayName && (
                      <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                    )}
                  </div>
                </div>
                
                {/* SMTP Settings */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-medium text-gray-700">SMTP Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Server
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Server size={16} />
                      </span>
                      <input
                        type="text"
                        name="smtp.host"
                        value={formData.smtp.host}
                        onChange={handleChange}
                        className={`w-full pl-10 p-2 border ${
                          errors['smtp.host'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="smtp.example.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors['smtp.host'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['smtp.host']}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        name="smtp.port"
                        value={formData.smtp.port}
                        onChange={handleChange}
                        className={`w-full p-2 border ${
                          errors['smtp.port'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="587"
                        disabled={isLoading}
                      />
                      {errors['smtp.port'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['smtp.port']}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center pt-6">
                      <input
                        id="secure"
                        type="checkbox"
                        name="smtp.secure"
                        checked={formData.smtp.secure}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#007991] focus:ring-[#007991] border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor="secure" className="ml-2 block text-sm font-medium text-gray-700">
                        Use SSL/TLS
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Authentication */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-medium text-gray-700">Authentication</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="auth.user"
                        value={formData.auth.user}
                        onChange={handleChange}
                        className={`w-full pl-10 p-2 border ${
                          errors['auth.user'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="Usually your email address"
                        disabled={isLoading}
                      />
                    </div>
                    {errors['auth.user'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['auth.user']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Key size={16} />
                      </span>
                      <input
                        type="password"
                        name="auth.pass"
                        value={formData.auth.pass}
                        onChange={handleChange}
                        className={`w-full pl-10 p-2 border ${
                          errors['auth.pass'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:ring-[#007991] focus:border-[#007991]`}
                        placeholder="Your password or app password"
                        disabled={isLoading}
                      />
                    </div>
                    {errors['auth.pass'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['auth.pass']}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      For Gmail, you may need to use an App Password. 
                      <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-[#007991] ml-1">
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={handleModalClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007991] text-white rounded-md hover:bg-[#006980] flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Email Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAccountModal;