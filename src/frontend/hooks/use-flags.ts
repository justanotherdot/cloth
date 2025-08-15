import { useState, useEffect } from 'react';
import { 
  FlagListResponse, 
  FlagCreateRequest, 
  FlagCreateResponse,
  FlagUpdateRequest,
  FlagUpdateResponse,
  FlagDeleteResponse
} from '../../service/api';
import { Flag } from '../../core/flag';

export function useFlags() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/flag');
      
      if (!response.ok) {
        setError(`API error: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data: FlagListResponse = await response.json();
      
      if (data.success) {
        setFlags(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (request: FlagCreateRequest): Promise<Flag | null> => {
    try {
      const response = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data: FlagCreateResponse = await response.json();
      
      if (data.success) {
        setFlags(prev => [data.data, ...prev]);
        return data.data;
      } else {
        throw new Error(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateFlag = async (id: string, updates: Omit<FlagUpdateRequest, 'id'>): Promise<Flag | null> => {
    try {
      const response = await fetch(`/api/flag/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data: FlagUpdateResponse = await response.json();
      
      if (data.success) {
        setFlags(prev => prev.map(flag => flag.id === id ? data.data : flag));
        return data.data;
      } else {
        throw new Error(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const deleteFlag = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/flag/${id}`, {
        method: 'DELETE'
      });
      
      const data: FlagDeleteResponse = await response.json();
      
      if (data.success) {
        setFlags(prev => prev.filter(flag => flag.id !== id));
        return true;
      } else {
        throw new Error(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    loading,
    error,
    refetch: fetchFlags,
    createFlag,
    updateFlag,
    deleteFlag
  };
}