let csrfToken = null;
let csrfTokenExpiry = null;

const getCSRFToken = async (api) => {
  if (csrfToken && csrfTokenExpiry && Date.now() < csrfTokenExpiry) {
    return csrfToken;
  }
  const response = await api.get("/csrf-token", { withCredentials: true });
  if (response.data.success) {
    csrfToken = response.data.csrfToken;
    csrfTokenExpiry = Date.now() + 50 * 60 * 1000; // 50 minutes
    return csrfToken;
  }
  throw new Error("Failed to fetch CSRF token");
};

const clearCSRFToken = () => {
  csrfToken = null;
  csrfTokenExpiry = null;
};

export default { getCSRFToken, clearCSRFToken };
