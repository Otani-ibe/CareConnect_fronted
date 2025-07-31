import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const request = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showToast?: boolean;
    }
  ) => {
    setLoading(true);
    try {
      const response = await api[method](url, data);
      
      if (options?.showToast !== false && options?.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || options?.errorMessage || 'An error occurred';
      
      if (options?.showToast !== false) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { request, loading };
};