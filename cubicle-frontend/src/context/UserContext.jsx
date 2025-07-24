import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      const profileData = await authService.getUserProfile();
      setUser(profileData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Handle unauthorized errors
      if (error.response && error.response.status === 401) {
        authService.logout();
        window.location.href = "/login";
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch of user data
  useEffect(() => {
    refreshUserData();
  }, []);
  
  const value = {
    user,
    isLoading,
    refreshUserData,
    setUser
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}