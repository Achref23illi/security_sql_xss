// client/src/components/SecurityToggle.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function SecurityToggle() {
  const [isSecured, setIsSecured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const response = await api.security.getStatus();
        setIsSecured(response.isSecured);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching security status:', error);
        setIsLoading(false);
      }
    };

    fetchSecurityStatus();
  }, []);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isSecured;
      await api.security.toggleSecurity(newStatus);
      setIsSecured(newStatus);
      setIsLoading(false);
    } catch (error) {
      console.error('Error toggling security:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">Security Mode</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isSecured 
              ? "Protected against SQL Injection & XSS attacks" 
              : "Vulnerable to SQL Injection & XSS attacks (demo mode)"}
          </p>
        </div>
        <div className="flex items-center">
          <span className={`mr-3 font-medium ${isSecured ? 'text-green-600' : 'text-red-600'}`}>
            {isLoading ? 'Loading...' : (isSecured ? 'Secured' : 'Unsecured')}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isSecured}
              onChange={handleToggle}
              disabled={isLoading}
            />
            <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
              ${isSecured 
                ? 'peer-focus:ring-green-300 dark:peer-focus:ring-green-800' 
                : 'peer-focus:ring-red-300 dark:peer-focus:ring-red-800'} 
              rounded-full peer 
              ${isSecured 
                ? 'peer-checked:bg-green-600 dark:peer-checked:bg-green-500' 
                : 'dark:bg-red-600'} 
              peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-0.5 after:left-[4px] 
              after:bg-white after:border-gray-300 after:border after:rounded-full 
              after:h-6 after:w-6 after:transition-all dark:border-gray-600`}></div>
          </label>
        </div>
      </div>
      
      {!isSecured && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-red-700 dark:text-red-400">
              Warning: In unsecured mode, the application is intentionally vulnerable to SQL injection and XSS attacks for educational purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}