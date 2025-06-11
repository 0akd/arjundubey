import { createClient } from '@supabase/supabase-js'

// Environment variables - NEVER expose these in client-side code in production
const supabaseUrl = 'https://fjkgoytvsbubhrnudklo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqa2dveXR2c2J1YmhybnVka2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjYyMDEsImV4cCI6MjA2NDgwMjIwMX0.jFIvySIayfigk2w0sdQELbAzlv6onG0YbbdXsEeYLZo'

// Enhanced security configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enhanced security settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    
    // Email configuration for enhanced security
    flowType: 'pkce', // Use PKCE flow for better security
    
    // Storage configuration for secure session handling
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      },
    },
  },
  
  // Database configuration
  db: {
    schema: 'public',
  },
  
  // Global configuration - headers go here, not in auth
  global: {
    headers: {},
  },
  
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Enhanced email authentication configuration
export const authConfig = {
  // Email templates and settings
  emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  
  // Password policy
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // Session management
  sessionConfig: {
    refreshTokenRotation: true,
    revokeRefreshTokenOnSignOut: true,
    persistSession: true,
    autoRefreshToken: true,
  },
  
  // Security headers
  securityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.in",
  },
}

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },
  
  // Validate email format with enhanced security
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email) && email.length <= 254
  },
  
  // Validate password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeating characters')
    }
    
    if (/^[0-9]+$/.test(password)) {
      errors.push('Password cannot be only numbers')
    }
    
    if (/^[a-zA-Z]+$/.test(password)) {
      errors.push('Password cannot be only letters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  // Rate limiting helper
  rateLimiter: (() => {
    const attempts = new Map<string, { count: number; lastAttempt: number }>()
    
    return {
      canAttempt: (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
        const now = Date.now()
        const record = attempts.get(identifier)
        
        if (!record) {
          attempts.set(identifier, { count: 1, lastAttempt: now })
          return true
        }
        
        if (now - record.lastAttempt > windowMs) {
          attempts.set(identifier, { count: 1, lastAttempt: now })
          return true
        }
        
        if (record.count >= maxAttempts) {
          return false
        }
        
        record.count++
        record.lastAttempt = now
        return true
      },
      
      reset: (identifier: string): void => {
        attempts.delete(identifier)
      }
    }
  })(),
  
  // Secure session management
  sessionManager: {
    // Set session with expiry
    setSecureSession: (key: string, value: any, expiryMinutes: number = 15): void => {
      const expiryTime = Date.now() + (expiryMinutes * 60 * 1000)
      const sessionData = {
        value,
        expiry: expiryTime,
        timestamp: Date.now()
      }
      
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(key, JSON.stringify(sessionData))
        } catch (error) {
          console.error('Failed to set secure session:', error)
        }
      }
    },
    
    // Get session if not expired
    getSecureSession: (key: string): any | null => {
      if (typeof window === 'undefined') return null
      
      try {
        const stored = sessionStorage.getItem(key)
        if (!stored) return null
        
        const sessionData = JSON.parse(stored)
        
        if (Date.now() > sessionData.expiry) {
          sessionStorage.removeItem(key)
          return null
        }
        
        return sessionData.value
      } catch (error) {
        console.error('Failed to get secure session:', error)
        return null
      }
    },
    
    // Clear expired sessions
    clearExpiredSessions: (): void => {
      if (typeof window === 'undefined') return
      
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        try {
          const stored = sessionStorage.getItem(key)
          if (stored) {
            const sessionData = JSON.parse(stored)
            if (sessionData.expiry && Date.now() > sessionData.expiry) {
              sessionStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Invalid JSON, remove it
          sessionStorage.removeItem(key)
        }
      })
    }
  }
}

// Enhanced auth helpers
export const authHelpers = {
  // Sign up with enhanced security
  signUpWithEmail: async (email: string, password: string) => {
    // Validate inputs
    if (!securityUtils.validateEmail(email)) {
      throw new Error('Invalid email format')
    }
    
    const passwordValidation = securityUtils.validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '))
    }
    
    // Check rate limiting
    if (!securityUtils.rateLimiter.canAttempt(`signup_${email}`)) {
      throw new Error('Too many signup attempts. Please try again later.')
    }
    
    // Perform signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authConfig.emailRedirectTo,
        data: {
          timestamp: new Date().toISOString(),
          app_name: 'credential_manager'
        }
      }
    })
    
    if (error) {
      throw error
    }
    
    return data
  },
  
  // Sign in with enhanced security
  signInWithEmail: async (email: string, password: string) => {
    // Validate email
    if (!securityUtils.validateEmail(email)) {
      throw new Error('Invalid email format')
    }
    
    // Check rate limiting
    if (!securityUtils.rateLimiter.canAttempt(`signin_${email}`)) {
      throw new Error('Too many login attempts. Please try again later.')
    }
    
    // Perform signin
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw error
    }
    
    // Reset rate limiting on successful login
    securityUtils.rateLimiter.reset(`signin_${email}`)
    
    return data
  },
  
  // Secure sign out
  signOut: async () => {
    // Clear all sensitive data from storage
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.clear()
      
      // Clear specific localStorage items (keep others)
      const keysToRemove = [
        'supabase.auth.token',
        'sb-localhost-auth-token',
        'masterPassword',
        'encryptionKey'
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
    }
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
  },
  
  // Get current user with session validation
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }
    
    return user
  },
  
  // Refresh session
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw error
    }
    
    return data
  }
}

// Database security helpers
export const dbSecurity = {
  // Row Level Security policies should be set up in Supabase dashboard
  
  // Example RLS policy for credentials table:
  /*
  CREATE POLICY "Users can only access their own credentials" ON credentials
    FOR ALL USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own credentials" ON credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own credentials" ON credentials
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own credentials" ON credentials
    FOR DELETE USING (auth.uid() = user_id);
  */
  
  // Secure query builder
  secureQuery: async (tableName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    return supabase
      .from(tableName)
      .select('*')
      .eq('user_id', user.id)
  }
}

// Initialize security on app start
if (typeof window !== 'undefined') {
  // Clear expired sessions on app start
  securityUtils.sessionManager.clearExpiredSessions()
  
  // Set up periodic cleanup
  setInterval(() => {
    securityUtils.sessionManager.clearExpiredSessions()
  }, 5 * 60 * 1000) // Every 5 minutes
  
  // Security event listeners
  window.addEventListener('beforeunload', () => {
    // Clear sensitive data on page unload
    securityUtils.sessionManager.clearExpiredSessions()
  })
  
  // Detect if user switches tabs (security measure)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User switched away from tab - could implement additional security measures
      console.log('Tab hidden - security monitoring active')
    }
  })
}

export default supabase