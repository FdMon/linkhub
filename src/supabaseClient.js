import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log environment variables (remove after fixing)
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING',
  allEnvKeys: Object.keys(import.meta.env)
})

// Validate before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    supabaseUrl: supabaseUrl || 'MISSING',
    supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING'
  })
  throw new Error('Supabase environment variables not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
