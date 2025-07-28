import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Shield, AlertTriangle, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import mfaService from '../../services/mfaService';

const MFASettings = () => {
  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState(0); // 0: disabled, 1: setup, 2: verify, 3: enabled
  const [qrCode, setQrCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      setLoading(true);
      console.log('Loading MFA status...');
      const response = await mfaService.getMFAStatus();
      console.log('MFA status response:', response);
      setMfaStatus(response.data);
      setSetupStep(response.data.enabled ? 3 : 0);
    } catch (error) {
      console.error('Error loading MFA status:', error);
      setError(error.message || 'Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  const startMFASetup = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      console.log('Starting MFA setup...');
      const response = await mfaService.setupMFA();
      console.log('MFA setup response:', response);
      console.log('TempSecret received:', response.tempSecret);
      console.log('Type of tempSecret:', typeof response.tempSecret);
      setQrCode(response.data.qrCode);
      setManualCode(response.data.manualEntryKey);
      setTempSecret(response.tempSecret);
      setSetupStep(1);
    } catch (error) {
      console.error('Error starting MFA setup:', error);
      setError(error.message || 'Failed to start MFA setup');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyMFASetup = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      if (!verificationToken || verificationToken.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      console.log('Verifying MFA setup with token:', verificationToken);
      console.log('TempSecret being sent:', tempSecret);
      console.log('Type of tempSecret being sent:', typeof tempSecret);
      const response = await mfaService.verifyMFASetup(verificationToken, tempSecret);
      console.log('MFA verification response:', response);
      setBackupCodes(response.data.backupCodes);
      setSetupStep(2);
      setSuccess('MFA setup completed successfully!');
    } catch (error) {
      console.error('Error verifying MFA setup:', error);
      setError(error.message || 'Failed to verify MFA setup');
    } finally {
      setActionLoading(false);
    }
  };

  const finishSetup = () => {
    setSetupStep(3);
    setMfaStatus({ ...mfaStatus, enabled: true });
    setQrCode('');
    setManualCode('');
    setTempSecret('');
    setVerificationToken('');
    setBackupCodes([]);
  };

  const disableMFA = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      if (!password) {
        setError('Password is required to disable MFA');
        return;
      }

      await mfaService.disableMFA(password);
      setMfaStatus({ ...mfaStatus, enabled: false });
      setSetupStep(0);
      setPassword('');
      setSuccess('MFA disabled successfully');
    } catch (error) {
      setError(error.message || 'Failed to disable MFA');
    } finally {
      setActionLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      if (!password) {
        setError('Password is required to regenerate backup codes');
        return;
      }

      const response = await mfaService.regenerateBackupCodes(password);
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setPassword('');
      setSuccess('Backup codes regenerated successfully');
    } catch (error) {
      setError(error.message || 'Failed to regenerate backup codes');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const copyAllBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    copyToClipboard(codesText);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Multi-Factor Authentication</h3>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* MFA Status */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {setupStep === 3 ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Enabled
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <XCircle className="h-4 w-4 mr-1" />
                Disabled
              </span>
            )}
          </div>
          {setupStep === 3 && (
            <span className="text-xs text-gray-500">
              Last used: {mfaStatus?.lastUsedAt ? new Date(mfaStatus.lastUsedAt).toLocaleDateString() : 'Never'}
            </span>
          )}
        </div>
      </div>

      {/* Setup Step 0: Disabled */}
      {setupStep === 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Your Account</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Add an extra layer of security to your account with two-factor authentication using your smartphone.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={startMFASetup}
            disabled={actionLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}

      {/* Setup Step 1: QR Code */}
      {setupStep === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-4">Step 1: Scan QR Code</h4>
            
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                </div>
                
                <div className="text-sm text-gray-600 max-w-md">
                  <p className="mb-2">
                    1. Open your authenticator app (Google Authenticator, Microsoft Authenticator, etc.)
                  </p>
                  <p className="mb-2">
                    2. Tap "Add Account" or "+"
                  </p>
                  <p>
                    3. Scan this QR code with your phone
                  </p>
                </div>

                <div className="border-t pt-4 w-full">
                  <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 text-center">
                      {manualCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(manualCode)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Enter the 6-digit code from your authenticator app:
            </label>
            <input
              type="text"
              maxLength="6"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setSetupStep(0)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={verifyMFASetup}
              disabled={actionLoading || verificationToken.length !== 6}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Setup Step 2: Backup Codes */}
      {setupStep === 2 && (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">Setup Complete!</h4>
            <p className="text-sm text-gray-600">
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-yellow-800">Backup Codes</h5>
              <button
                onClick={copyAllBackupCodes}
                className="text-yellow-700 hover:text-yellow-900 text-sm flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span>Copy All</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded border font-mono text-sm text-center">
                  {code}
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-700 mt-3">
              ⚠️ Each code can only be used once. Store them securely!
            </p>
          </div>

          <button
            onClick={finishSetup}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      )}

      {/* Setup Step 3: Enabled */}
      {setupStep === 3 && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Two-Factor Authentication Enabled</h4>
                <p className="text-sm text-green-700">
                  Your account is now protected with an additional security layer.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Manage MFA</h5>
            
            {/* Show backup codes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enter your password to regenerate backup codes:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <button
                onClick={regenerateBackupCodes}
                disabled={actionLoading || !password}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>{actionLoading ? 'Regenerating...' : 'Regenerate Backup Codes'}</span>
              </button>
            </div>

            {/* Show generated backup codes */}
            {showBackupCodes && backupCodes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-yellow-800">New Backup Codes</h5>
                  <button
                    onClick={copyAllBackupCodes}
                    className="text-yellow-700 hover:text-yellow-900 text-sm flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy All</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border font-mono text-sm text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  ⚠️ Your old backup codes are now invalid. Save these new ones!
                </p>
              </div>
            )}

            {/* Disable MFA */}
            <div className="border-t pt-4">
              <h6 className="font-medium text-gray-900 mb-3">Disable Two-Factor Authentication</h6>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password to disable MFA"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                <button
                  onClick={disableMFA}
                  disabled={actionLoading || !password}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MFASettings;
