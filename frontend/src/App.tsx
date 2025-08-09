import { useState, useEffect } from 'react'

interface Flag {
  key: string
  name: string
  enabled: boolean
}

function App() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.PROD 
      ? 'https://cloth-api.justanotherdot.workers.dev'
      : '';
    
    fetch(`${apiUrl}/api/flags`)
      .then(res => res.json())
      .then(data => {
        setFlags(data.flags || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load flags:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading flags...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Cloth Feature Flags</h1>
      
      <div>
        <h2>Flags ({flags.length})</h2>
        
        {flags.length === 0 ? (
          <p>No flags configured yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Key</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {flags.map(flag => (
                <tr key={flag.key} data-testid="flag-row">
                  <td style={{ padding: '8px' }}>{flag.key}</td>
                  <td style={{ padding: '8px' }}>{flag.name}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: flag.enabled ? '#d4edda' : '#f8d7da',
                      color: flag.enabled ? '#155724' : '#721c24'
                    }}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <button 
            data-testid="create-flag-button"
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Create flag feature coming soon!')}
          >
            Create Flag
          </button>
        </div>
      </div>
    </div>
  )
}

export default App