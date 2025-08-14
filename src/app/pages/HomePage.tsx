import { useState, useEffect } from 'react';
import { Flag, ApiResponse } from '../data';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';
import { Plus, X, Settings, Trash2 } from 'lucide-react';

function HomePage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [newFlag, setNewFlag] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const response = await fetch('/api/flag');

      if (!response.ok) {
        setError(`API error: ${response.status} ${response.statusText}`);
        return;
      }

      const text = await response.text();
      if (!text.trim()) {
        setError('Empty response from API');
        return;
      }

      const result: ApiResponse<Flag[]> = JSON.parse(text);

      if (result.success && result.data) {
        setFlags(result.data);
      } else {
        setError(result.error || 'Failed to load flags');
      }
    } catch (err) {
      console.error('Load flags error:', err);
      setError(
        `Failed to load flags: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlag.key.trim() || !newFlag.name.trim()) return;

    try {
      const response = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlag),
      });

      const result: ApiResponse<Flag> = await response.json();

      if (result.success && result.data) {
        setFlags((prev) => [result.data!, ...prev]);
        setNewFlag({ key: '', name: '', description: '', enabled: false });
        setDialogOpen(false);
        showToast('Flag created successfully');
      } else {
        setError(result.error || 'Failed to create flag');
      }
    } catch (_err) {
      setError('Failed to create flag');
    }
  };

  const toggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/flag/${flagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        setError(`API error: ${response.status} ${response.statusText}`);
        return;
      }

      const text = await response.text();
      if (!text.trim()) {
        setError('Empty response from API');
        return;
      }

      const result: ApiResponse<Flag> = JSON.parse(text);

      if (result.success && result.data) {
        setFlags((prev) =>
          prev.map((f) => (f.id === flagId ? result.data! : f))
        );
        showToast(`Flag ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        setError(result.error || 'Failed to update flag');
      }
    } catch (err) {
      console.error('Toggle flag error:', err);
      setError(
        `Failed to update flag: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  const deleteFlag = async (flagId: string, flagName: string) => {
    if (!confirm(`Are you sure you want to delete "${flagName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/flag/${flagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError(`API error: ${response.status} ${response.statusText}`);
        return;
      }

      setFlags((prev) => prev.filter((f) => f.id !== flagId));
      showToast('Flag deleted successfully');
    } catch (err) {
      console.error('Delete flag error:', err);
      setError(
        `Failed to delete flag: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Toast.Provider>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feature flags</h2>
            <p className="text-gray-600 mt-1">
              Manage your application feature toggles
            </p>
          </div>

          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <Plus className="w-4 h-4 mr-2" />
                New flag
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Create new flag
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={createFlag} className="space-y-4">
                  <div>
                    <Label.Root className="block text-sm font-medium text-gray-700 mb-2">
                      Key *
                    </Label.Root>
                    <input
                      type="text"
                      value={newFlag.key}
                      onChange={(e) =>
                        setNewFlag((prev) => ({ ...prev, key: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="feature_key"
                      required
                    />
                  </div>

                  <div>
                    <Label.Root className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </Label.Root>
                    <input
                      type="text"
                      value={newFlag.name}
                      onChange={(e) =>
                        setNewFlag((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Feature Name"
                      required
                    />
                  </div>

                  <div>
                    <Label.Root className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </Label.Root>
                    <textarea
                      value={newFlag.description}
                      onChange={(e) =>
                        setNewFlag((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe what this flag controls"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch.Root
                      checked={newFlag.enabled}
                      onCheckedChange={(enabled) =>
                        setNewFlag((prev) => ({ ...prev, enabled }))
                      }
                      className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-blue-600 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 transform data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <Label.Root className="text-sm text-gray-700">
                      Start enabled
                    </Label.Root>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Create flag
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-700">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          {flags.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No feature flags yet</p>
              <p className="text-sm">Create your first flag to get started</p>
            </div>
          ) : (
            flags.map((flag) => (
              <div
                key={flag.id}
                className="p-6 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {flag.name}
                      </h3>
                      <code className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {flag.key}
                      </code>
                    </div>
                    {flag.description && (
                      <p className="text-gray-600 mb-4">{flag.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      Created: {new Date(flag.createdAt).toLocaleString()}
                      {flag.updatedAt !== flag.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(flag.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <span
                      className={`text-sm font-medium ${flag.enabled ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch.Root
                      checked={flag.enabled}
                      onCheckedChange={(enabled) =>
                        toggleFlag(flag.id, enabled)
                      }
                      className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-green-600 relative focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 transform data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <button
                      onClick={() => deleteFlag(flag.id, flag.name)}
                      className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
                      title="Delete flag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-96 max-w-[100vw] z-50" />

        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="bg-white border border-gray-200 rounded-md shadow-lg p-4"
        >
          <Toast.Title className="text-sm font-medium text-gray-900">
            {toastMessage}
          </Toast.Title>
          <Toast.Close asChild>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </Toast.Close>
        </Toast.Root>
      </div>
    </Toast.Provider>
  );
}

export default HomePage;
