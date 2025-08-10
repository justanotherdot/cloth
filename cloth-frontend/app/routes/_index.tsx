import { useState, useEffect } from "react";

interface Flag {
  key: string;
  name: string;
  enabled: boolean;
}

export default function Index() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use environment-specific API URL
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8787'
      : 'https://cloth-api.justanotherdot.workers.dev';
    
    // Get stored credentials
    const username = localStorage.getItem('cloth_username') || 'admin';
    const password = localStorage.getItem('cloth_password') || '';
    
    if (!password) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    const credentials = btoa(`${username}:${password}`);
    
    fetch(`${apiUrl}/api/flags`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Authentication failed');
        }
        return res.json();
      })
      .then(data => {
        setFlags(data.flags || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flags:', err);
        setError(err.message || 'Failed to load flags');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading flags...</div>
      </div>
    );
  }

  if (error === 'Authentication required' || error === 'Authentication failed') {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Cloth Control Plane</h2>
        <p className="text-gray-600 mb-6 text-center">Enter credentials to access flag management</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const password = formData.get('password') as string;
          localStorage.setItem('cloth_password', password);
          window.location.reload();
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input 
              type="text" 
              value="admin" 
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
          {error === 'Authentication failed' && (
            <p className="mt-4 text-red-600 text-sm text-center">Invalid credentials. Please try again.</p>
          )}
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2>Flags ({flags.length})</h2>
        <a 
          href="/admin/flags/new"
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          Create Flag
        </a>
      </div>
      
      {flags.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e1e8ed'
        }}>
          <p style={{ margin: 0, color: '#657786' }}>
            No flags configured yet.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e1e8ed',
          overflow: 'hidden'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e8ed',
                  fontWeight: 600
                }}>
                  Key
                </th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e8ed',
                  fontWeight: 600
                }}>
                  Name
                </th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e8ed',
                  fontWeight: 600
                }}>
                  Status
                </th>
                <th style={{ 
                  textAlign: 'center', 
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e8ed',
                  fontWeight: 600
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {flags.map(flag => (
                <tr key={flag.key} data-testid="flag-row">
                  <td style={{ 
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f3f4'
                  }}>
                    <code style={{
                      backgroundColor: '#f8f9fa',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}>
                      {flag.key}
                    </code>
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f3f4'
                  }}>
                    {flag.name}
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f3f4'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: flag.enabled ? '#d4edda' : '#f8d7da',
                      color: flag.enabled ? '#155724' : '#721c24'
                    }}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f3f4',
                    textAlign: 'center'
                  }}>
                    <a 
                      href={`/admin/flags/${flag.key}`}
                      style={{
                        color: '#3498db',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}