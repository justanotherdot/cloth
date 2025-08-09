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
    const apiUrl = 'https://cloth-api.justanotherdot.workers.dev';
    
    fetch(`${apiUrl}/api/flags`)
      .then(res => res.json())
      .then(data => {
        setFlags(data.flags || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load flags:', err);
        setError('Failed to load flags');
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