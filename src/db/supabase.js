import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement manquantes : SUPABASE_URL et SUPABASE_ANON_KEY sont requis.\n' +
    'Copiez .env.example en .env et remplissez vos identifiants Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
