import { useState, useEffect } from 'react';

interface UseDebounceParams {
  value: any;
  delay: number;
}

const useDebounce = ({ value, delay }: UseDebounceParams) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
