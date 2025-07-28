import { createApiInstance } from './apiConfig';

// Use shared API instance with consistent token handling
const api = createApiInstance();

class MFAService {
  // Setup MFA - Generate QR code and secret
  async setupMFA() {
    try {
      const response = await api.post('/mfa/setup');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to setup MFA' };
    }
  }

  // Verify MFA setup with TOTP token
  async verifyMFASetup(token, tempSecret) {
    try {
      console.log('Frontend - sending tempSecret:', tempSecret);
      console.log('Frontend - typeof tempSecret:', typeof tempSecret);
      const response = await api.post('/mfa/verify-setup', { token, tempSecret });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify MFA setup' };
    }
  }

  // Disable MFA
  async disableMFA(password) {
    try {
      const response = await api.post('/mfa/disable', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to disable MFA' };
    }
  }

  // Get MFA status
  async getMFAStatus() {
    try {
      const response = await api.get('/mfa/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get MFA status' };
    }
  }

  // Regenerate backup codes
  async regenerateBackupCodes(password) {
    try {
      const response = await api.post('/mfa/regenerate-backup-codes', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to regenerate backup codes' };
    }
  }

  // Verify MFA token during login
  async verifyMFA(token, isBackupCode = false) {
    try {
      const response = await api.post('/mfa/verify', { token, isBackupCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify MFA token' };
    }
  }

  // Complete MFA login
  async completeMFALogin(userId, mfaToken, isBackupCode, tempData) {
    try {
      const response = await api.post('/auth/mfa-login', {
        userId,
        mfaToken,
        isBackupCode,
        tempData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete MFA login' };
    }
  }
}

export default new MFAService();
