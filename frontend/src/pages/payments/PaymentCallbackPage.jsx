import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import planService from '../../services/planService';

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUserData } = useUser();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); 
  const [verificationMessage, setVerificationMessage] = useState('Verifying your payment...');
  const hasRun = useRef(false); // Use ref to track if we've already processed

  useEffect(() => {
    // Only run once - check the ref to prevent multiple executions
    if (hasRun.current) return;
    hasRun.current = true;

    const processPayment = async () => {
      try {
        const status = searchParams.get('status');
        const pidx = searchParams.get('pidx');
        const transactionId = searchParams.get('transaction_id');
        const amount = searchParams.get('amount');

        console.log('Payment callback received:', {
          status,
          pidx,
          transactionId,
          amount
        });

        // Check if payment was successful
        if (status !== 'Completed') {
          setVerificationStatus('failed');
          setVerificationMessage(
            status === 'User canceled' 
              ? 'Payment was canceled by user' 
              : `Payment failed with status: ${status}`
          );
          
          toast.error('Payment not completed', {
            description: status === 'User canceled' ? 'You canceled the payment' : 'Payment was not successful'
          });

          // Redirect to settings after 3 seconds
          setTimeout(() => {
            navigate('/dashboard/settings?tab=billing');
          }, 3000);
          return;
        }

        // Verify payment with backend
        if (!pidx) {
          throw new Error('Missing payment identifier (pidx)');
        }

        setVerificationMessage('Verifying payment with server...');
        const response = await planService.verifyPlanUpgrade(pidx);

        if (response.success) {
          setVerificationStatus('success');
          setVerificationMessage('Payment verified successfully! Your plan has been upgraded.');
          
          toast.success('Plan upgraded successfully!', {
            description: `Welcome to your new ${response.planDetails?.toPlan || 'plan'}!`
          });

          // Refresh user data to reflect new plan
          await refreshUserData();

          // Redirect to settings billing tab after 2 seconds
          setTimeout(() => {
            navigate('/dashboard/settings?tab=billing');
          }, 2000);

        } else {
          setVerificationStatus('failed');
          setVerificationMessage('Payment verification failed. Please contact support.');
          
          toast.error('Payment verification failed', {
            description: response.message || 'Please contact support for assistance'
          });

          // Redirect to settings after 3 seconds
          setTimeout(() => {
            navigate('/dashboard/settings?tab=billing');
          }, 3000);
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        
        setVerificationStatus('failed');
        setVerificationMessage('An error occurred while verifying payment. Please contact support.');
        
        toast.error('Verification error', {
          description: error.message || 'Please contact support for assistance'
        });

        // Redirect to settings after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/settings?tab=billing');
        }, 3000);
      }
    };

    processPayment();
  }, []); // Empty dependency array, only run once on mount

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {verificationStatus === 'verifying' && 'Processing Payment'}
          {verificationStatus === 'success' && 'Payment Successful!'}
          {verificationStatus === 'failed' && 'Payment Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {verificationMessage}
        </p>
        
        {verificationStatus === 'verifying' && (
          <div className="text-sm text-gray-500">
            Please wait while we verify your payment...
          </div>
        )}
        
        {verificationStatus === 'success' && (
          <div className="text-sm text-gray-500">
            Redirecting you back to settings...
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/settings?tab=billing')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Settings
            </button>
            <div className="text-sm text-gray-500">
              If you believe this is an error, please contact support
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCallbackPage;
