import { createApiInstance } from "./apiConfig";

const api = createApiInstance();

const planService = {
  // Get all available plans
  getPlans: async () => {
    try {
      const response = await api.get("/plans");
      return response.data;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  },

  // Get current user's plan
  getCurrentPlan: async () => {
    try {
      const response = await api.get("/plans/current");
      return response.data;
    } catch (error) {
      console.error("Error fetching current plan:", error);
      throw error;
    }
  },

  // Initiate plan upgrade
  initiatePlanUpgrade: async (targetPlan) => {
    try {
      const response = await api.post("/plans/initiate-upgrade", {
        targetPlan,
      });
      return response.data;
    } catch (error) {
      console.error("Error initiating plan upgrade:", error);
      throw error;
    }
  },

  // Verify payment and complete upgrade
  verifyPlanUpgrade: async (pidx) => {
    try {
      const response = await api.post("/plans/verify-payment", {
        pidx,
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying plan upgrade:", error);
      throw error;
    }
  },

  // Get plan upgrade history
  getPlanUpgradeHistory: async (page = 1, limit = 10, status = null) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const response = await api.get(`/plans/upgrade-history?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching plan upgrade history:", error);
      throw error;
    }
  },

  // Cancel pending plan upgrade
  cancelPlanUpgrade: async (upgradeId) => {
    try {
      const response = await api.delete(`/plans/upgrade/${upgradeId}`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling plan upgrade:", error);
      throw error;
    }
  },
};

export default planService;
