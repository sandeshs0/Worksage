import { AlertTriangle, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import mfaService from "../../services/mfaService";

const MFALoginModal = ({ isOpen, onClose, onComplete, userData }) => {
  const [token, setToken] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !token ||
      (!isBackupCode && token.length !== 6) ||
      (isBackupCode && token.length !== 8)
    ) {
      setError(
        `Please enter a valid ${
          isBackupCode ? "8-digit backup code" : "6-digit authenticator code"
        }`
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Complete MFA login
      const response = await mfaService.completeMFALogin(
        userData.userId,
        token,
        isBackupCode,
        userData.tempData
      );

      if (response.success) {
        // Store the access token
        localStorage.setItem("accessToken", response.data.accessToken);

        // Call completion callback
        onComplete(response.data);
      } else {
        setError(response.message || "Invalid verification code");
      }
    } catch (error) {
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBackupMode = () => {
    setIsBackupCode(!isBackupCode);
    setToken("");
    setError("");
    setShowBackupCode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Two-Factor Authentication
            </h2>
          </div>

          {/* Info */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">
                  Security verification required
                </p>
                <p className="text-sm text-blue-700">
                  Enter the verification code from your authenticator app to
                  complete login.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isBackupCode ? "Backup Code" : "Authenticator Code"}
              </label>

              {isBackupCode ? (
                <div className="relative">
                  <input
                    type={showBackupCode ? "text" : "password"}
                    maxLength="8"
                    value={token}
                    onChange={(e) =>
                      setToken(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="00000000"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBackupCode(!showBackupCode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showBackupCode ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  maxLength="6"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  autoComplete="off"
                />
              )}

              <p className="text-xs text-gray-500 mt-1">
                {isBackupCode
                  ? "Enter one of your 8-digit backup codes"
                  : "Enter the 6-digit code from your authenticator app"}
              </p>
            </div>

            {/* Toggle backup code mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleBackupMode}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isBackupCode
                  ? "Use authenticator app instead"
                  : "Lost your phone? Use a backup code"}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !token ||
                  (!isBackupCode && token.length !== 6) ||
                  (isBackupCode && token.length !== 8)
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MFALoginModal;
