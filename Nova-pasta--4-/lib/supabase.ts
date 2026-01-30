
// Este arquivo está pronto para ser conectado ao seu projeto Supabase.
// Substitua as variáveis abaixo pelas do seu painel Supabase (Settings > API)
// Ou configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY

const supabaseUrl = (window as any).env?.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'sua-chave-anonima';

export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseAnonKey
};

// Exemplo de como você usaria no futuro:
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock para desenvolvimento sem erro de runtime
export const mockAuth = {
  signIn: async (email: string) => {
    console.log("Mock sign in for:", email);
    return { user: { id: '1', email, user_metadata: { full_name: 'Flafson Barbosa' } }, error: null };
  },
  signOut: async () => {
    console.log("Mock sign out");
    return { error: null };
  }
};
