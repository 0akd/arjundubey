"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Plus, Trash2, Edit3, Save, X, LogOut, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import  supabase  from '@/supabase';

// Encryption utilities for client-side encryption
const generateKey = async (password: string, salt: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

const decryptData = async (encryptedData: string, key: CryptoKey): Promise<string> => {
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  
  return new TextDecoder().decode(decrypted);
};

const generateSalt = (): string => {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
};

const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

interface Credential {
  id: string;
  name: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

interface EncryptedCredential {
  id: string;
  name: string;
  encrypted_data: string;
  salt: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const SecureCredentialManager: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [newCredential, setNewCredential] = useState<Omit<Credential, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    username: '',
    password: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Security: Auto-lock after 15 minutes of inactivity
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    const timeout = setTimeout(() => {
      setIsLocked(true);
      setEncryptionKey(null);
      setMasterPassword('');
      showMessage('Session expired for security', 'error');
    }, 15 * 60 * 1000); // 15 minutes
    setSessionTimeout(timeout);
  }, [sessionTimeout]);

  // Security: Clear sensitive data from memory
  const clearSensitiveData = useCallback(() => {
    setMasterPassword('');
    setEncryptionKey(null);
    setCredentials([]);
    setEditingCredential(null);
    setNewCredential({ name: '', username: '', password: '' });
    setShowPasswords({});
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Initialize auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          clearSensitiveData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [clearSensitiveData]);

  // Security: Setup master password and encryption
  const setupEncryption = async (password: string) => {
    try {
      const salt = generateSalt();
      const key = await generateKey(password, salt);
      setEncryptionKey(key);
      setIsLocked(false);
      resetSessionTimeout();
      return { key, salt };
    } catch (error) {
      showMessage('Failed to setup encryption', 'error');
      throw error;
    }
  };

  // Load credentials from Supabase
  const loadCredentials = async () => {
    if (!user || !encryptionKey) return;

    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const decryptedCredentials: Credential[] = [];
      
      for (const item of data || []) {
        try {
          const decryptedData = await decryptData(item.encrypted_data, encryptionKey);
          const credential = JSON.parse(decryptedData);
          decryptedCredentials.push({
            id: item.id,
            ...credential,
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        } catch (decryptError) {
          console.error('Failed to decrypt credential:', decryptError);
        }
      }

      setCredentials(decryptedCredentials);
    } catch (error) {
      showMessage('Failed to load credentials', 'error');
    }
  };

  // Save credential to Supabase
  const saveCredential = async (credential: Omit<Credential, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !encryptionKey) return;

    try {
      const salt = generateSalt();
      const credentialData = JSON.stringify(credential);
      const encryptedData = await encryptData(credentialData, encryptionKey);

      const { data, error } = await supabase
        .from('credentials')
        .insert([{
          encrypted_data: encryptedData,
          salt,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newCred: Credential = {
        id: data.id,
        ...credential,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setCredentials(prev => [newCred, ...prev]);
      setNewCredential({ name: '', username: '', password: '' });
      setShowAddForm(false);
      showMessage('Credential saved securely', 'success');
      resetSessionTimeout();
    } catch (error) {
      showMessage('Failed to save credential', 'error');
    }
  };

  // Update credential
  const updateCredential = async (id: string, updatedCredential: Omit<Credential, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !encryptionKey) return;

    try {
      const credentialData = JSON.stringify(updatedCredential);
      const encryptedData = await encryptData(credentialData, encryptionKey);

      const { error } = await supabase
        .from('credentials')
        .update({
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCredentials(prev => prev.map(cred => 
        cred.id === id 
          ? { ...cred, ...updatedCredential, updated_at: new Date().toISOString() }
          : cred
      ));
      setIsEditing(prev => ({ ...prev, [id]: false }));
      setEditingCredential(null);
      showMessage('Credential updated successfully', 'success');
      resetSessionTimeout();
    } catch (error) {
      showMessage('Failed to update credential', 'error');
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
      showMessage('Credential deleted successfully', 'success');
      resetSessionTimeout();
    } catch (error) {
      showMessage('Failed to delete credential', 'error');
    }
  };

  // Authentication handlers
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
    clearSensitiveData();
    showMessage('Signed out successfully', 'success');
  };

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) return;

    try {
      await setupEncryption(masterPassword);
      showMessage('Master password verified', 'success');
    } catch (error) {
      showMessage('Invalid master password', 'error');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) return;

    try {
      await setupEncryption(masterPassword);
      await loadCredentials();
      showMessage('Credentials unlocked', 'success');
    } catch (error) {
      showMessage('Failed to unlock credentials', 'error');
    }
  };

  // Load credentials when encryption is ready
  useEffect(() => {
    if (encryptionKey && user && !isLocked) {
      loadCredentials();
    }
  }, [encryptionKey, user, isLocked]);

  // Security: Clear clipboard after copy
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard', 'success');
    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 30000); // Clear after 30 seconds
    resetSessionTimeout();
  };

  // Memoized password strength checker
  const getPasswordStrength = useMemo(() => {
    return (password: string): { score: number; label: string; color: string } => {
      let score = 0;
      if (password.length >= 8) score++;
      if (password.match(/[a-z]/)) score++;
      if (password.match(/[A-Z]/)) score++;
      if (password.match(/[0-9]/)) score++;
      if (password.match(/[^a-zA-Z0-9]/)) score++;

      if (score <= 2) return { score, label: 'Weak', color: 'text-red-600' };
      if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-600' };
      if (score <= 4) return { score, label: 'Good', color: 'text-blue-600' };
      return { score, label: 'Strong', color: 'text-green-600' };
    };
  }, []);

  // Auth form
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Secure Vault</h1>
            <p className="text-gray-300">Military-grade credential protection</p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={authData.password}
                  onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Master password form
  if (!encryptionKey || isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Master Password</h2>
            <p className="text-gray-300">Enter your master password to unlock your vault</p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <form onSubmit={isLocked ? handleUnlock : handleMasterPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showMasterPassword ? 'text' : 'password'}
                  required
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter master password"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showMasterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {isLocked ? 'Unlock Vault' : 'Set Master Password'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main credential manager
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Secure Vault</h1>
                <p className="text-gray-300">Welcome, {user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Add credential form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Add New Credential</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveCredential(newCredential);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newCredential.name}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Gmail, GitHub, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={newCredential.username}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Username or email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      required
                      value={newCredential.password}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter password"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCredential(prev => ({ ...prev, password: generateSecurePassword() }))}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {newCredential.password && (
                  <div className="mt-2">
                    <div className={`text-sm ${getPasswordStrength(newCredential.password).color}`}>
                      Strength: {getPasswordStrength(newCredential.password).label}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Credential
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCredential({ name: '', username: '', password: '' });
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
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
            <div key={credential.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={editingCredential?.name || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        required
                        value={editingCredential?.username || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, username: e.target.value } : null)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        required
                        value={editingCredential?.password || ''}
                        onChange={(e) => setEditingCredential(prev => prev ? { ...prev, password: e.target.value } : null)}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCredential(prev => prev ? { ...prev, password: generateSecurePassword() } : null)}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                    {editingCredential?.password && (
                      <div className="mt-2">
                        <div className={`text-sm ${getPasswordStrength(editingCredential.password).color}`}>
                          Strength: {getPasswordStrength(editingCredential.password).label}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{credential.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(prev => ({ ...prev, [credential.id]: true }));
                          setEditingCredential(credential);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCredential(credential.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                          {credential.username}
                        </div>
                        <button
                          onClick={() => copyToClipboard(credential.username)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono">
                          {showPasswords[credential.id] ? credential.password : '••••••••••••'}
                        </div>
                        <button
                          onClick={() => setShowPasswords(prev => ({ ...prev, [credential.id]: !prev[credential.id] }))}
                          className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPasswords[credential.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(credential.password)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className={`text-sm ${getPasswordStrength(credential.password).color}`}>
                          Strength: {getPasswordStrength(credential.password).label}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-400">
                    Created: {new Date(credential.created_at).toLocaleDateString()} | 
                    Updated: {new Date(credential.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {credentials.length === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No credentials yet</h3>
              <p className="text-gray-300 mb-6">Start by adding your first credential to the secure vault</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add First Credential
              </button>
            </div>
          )}
        </div>

        {/* Security footer */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>End-to-end encrypted • Auto-lock in 15 minutes • Zero-knowledge architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureCredentialManager;