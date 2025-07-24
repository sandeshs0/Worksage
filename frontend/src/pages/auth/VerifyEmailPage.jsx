import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, Loader } from 'lucide-react';
import settingsService from '../../services/settingsService';

function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    async function verifyEmail() {
      try {
        const response = await settingsService.verifyEmailAccount(token);
        setStatus('success');
        setMessage(response.message || 'Email account verified successfully! You can now use this email to send communications.');
      } catch (error) {
        console.error('Failed to verify email account:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email account. The link may be expired or invalid.');
      }
    }
    
    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex flex-col items-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader size={32} className="text-[#007991] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">Verifying Email</h1>
              <p className="text-center text-gray-600">
                Please wait while we verify your email account...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">Email Verified!</h1>
              <p className="text-center text-gray-600 mb-6">
                {message}
              </p>
              <Link 
                to="/dashboard/settings" 
                className="px-6 py-2 bg-[#007991] text-white rounded-md hover:bg-[#006980] transition-colors"
              >
                Go to Settings
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h1>
              <p className="text-center text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-2">
                <Link 
                  to="/dashboard/settings" 
                  className="block px-6 py-2 bg-[#007991] text-white rounded-md hover:bg-[#006980] transition-colors text-center"
                >
                  Return to Settings
                </Link>
                <p className="text-sm text-gray-500 text-center mt-4">
                  If you continue to experience issues, please contact support.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;