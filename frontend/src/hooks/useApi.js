import { useState, useCallback } from 'react';

/**
 * Reusable hook to handle API calls with loading and error states.
 * @param {Function} apiFunc An asynchronous API function
 * @returns {{ data: any, loading: boolean, error: string|null, execute: Function }}
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        // Check if backend returned ApiResponse wrapper { success, data, message }
        const result = response && response.data !== undefined ? response.data : response;
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err?.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute, setData };
};

export default useApi;
