"use client"
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Plus, Trash2, Edit3, Save, X, LogOut } from 'lucide-react';
import supabase from '@/supabase';

const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

interface Credential {
  id: string;
  name: string;
  username: string;
  password: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const CredentialManager: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [newCredential, setNewCredential] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Initialize auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          setCredentials([]);
        } else if (event === 'SIGNED_IN' && session?.user) {
          loadCredentials();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load credentials when user is authenticated
  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  // Load credentials
  const loadCredentials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCredentials(data || []);
    } catch (error) {
      showMessage('Failed to load credentials', 'error');
      console.error('Load credentials error:', error);
    }
  };

  // Save credential
  const saveCredential = async (credential: typeof newCredential) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credentials')
        .insert([{
          name: credential.name,
          username: credential.username,
          password: credential.password,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setCredentials(prev => [data, ...prev]);
      setNewCredential({ name: '', username: '', password: '' });
      setShowAddForm(false);
      showMessage('Credential saved', 'success');
    } catch (error) {
      showMessage('Failed to save credential', 'error');
      console.error('Save credential error:', error);
    }
  };

  // Update credential
  const updateCredential = async (id: string, updatedCredential: typeof newCredential) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credentials')
        .update({
          name: updatedCredential.name,
          username: updatedCredential.username,
          password: updatedCredential.password,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCredentials(prev => prev.map(cred => 
        cred.id === id ? data : cred
      ));
      setIsEditing(prev => ({ ...prev, [id]: false }));
      setEditingCredential(null);
      showMessage('Credential updated', 'success');
    } catch (error) {
      showMessage('Failed to update credential', 'error');
      console.error('Update credential error:', error);
    }
  };

  // Delete credential
  const deleteCredential = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCredentials(prev => prev.filter(cred => cred.id !== id));
      showMessage('Credential deleted', 'success');
    } catch (error) {
      showMessage('Failed to delete credential', 'error');
      console.error('Delete credential error:', error);
    }
  };

  // Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password
        });
        if (error) throw error;
        showMessage('Logged in successfully', 'success');
      } else {
        const { error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password
        });
        if (error) throw error;
        showMessage('Account created successfully', 'success');
      }
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showMessage('Signed out successfully', 'success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard', 'success');
  };

  // Auth form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="border rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Credential Manager</h1>

          {message && (
            <div className={`mb-4 p-3 rounded border ${
              message.type === 'success' ? 'border-green-200' : 'border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={authData.email}
                onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium"
            >
              {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main credential manager
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Credential Manager</h1>
              <p className="text-gray-600">Welcome, {user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded border ${
            message.type === 'success' ? 'border-green-200' : 'border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add credential form */}
        {showAddForm && (
          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Credential</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveCredential(newCredential);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newCredential.name}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Gmail, GitHub"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newCredential.username}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username or email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    value={newCredential.password}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCredential(prev => ({ ...prev, password: generateSecurePassword() }))}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                >
                  Save Credential
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCredential({ name: '', username: '', password: '' });
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Credentials list */}
        <div className="space-y-4">
          {credentials.map((credential) => (
            <div key={credential.id} className="border rounded-lg p-6">
              {isEditing[credential.id] ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingCredential) {
                    updateCredential(credential.id, {
                      name: editingCredential.name,
                      username: editingCredential.username,
                      password: editingCredential.password
                    });
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={editingCredential?.name || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={editingCredential?.username || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, username: e.target.value } : null)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        required
                        value={editingCredential?.password || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, password: e.target.value } : null)}
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCredential(prev => prev ? { ...prev, password: generateSecurePassword() } : null)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(prev => ({ ...prev, [credential.id]: false }));
                        setEditingCredential(null);
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{credential.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(prev => ({ ...prev, [credential.id]: true }));
                          setEditingCredential(credential);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCredential(credential.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 border rounded bg-gray-50">
                          {credential.username}
                        </div>
                        <button
                          onClick={() => copyToClipboard(credential.username)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 border rounded bg-gray-50 font-mono">
                          {showPasswords[credential.id] ? credential.password : '••••••••••••'}
                        </div>
                        <button
                          onClick={() => setShowPasswords(prev => ({ ...prev, [credential.id]: !prev[credential.id] }))}
                          className="p-2 text-gray-600 hover:text-gray-800"
                        >
                          {showPasswords[credential.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(credential.password)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Created: {new Date(credential.created_at).toLocaleDateString()} | 
                    Updated: {new Date(credential.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {credentials.length === 0 && (
            <div className="border rounded-lg p-12 text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No credentials yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first credential</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add First Credential
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialManager;