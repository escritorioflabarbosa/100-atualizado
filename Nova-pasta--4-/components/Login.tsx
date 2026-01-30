
import React, { useState } from 'react';
import { Scale, Mail, Lock, Chrome, ArrowRight, Shield, Briefcase, Users } from 'lucide-react';
import { User, UserRole } from '../types.ts';
import { mockAuth } from '../lib/supabase.ts';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('ADVOGADO');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de login preparado para Supabase incluindo o Role selecionado
    setTimeout(async () => {
      const { user } = await mockAuth.signIn(email);
      if (user) {
        onLogin({ 
          ...user, 
          role,
          user_metadata: { 
            ...user.user_metadata,
            full_name: role === 'ADVOGADO' ? user.user_metadata?.full_name : 'Colaborador Administrativo'
          }
        } as User);
      }
      setLoading(false);
    }, 1000);
  };

  const handleSocialLogin = () => {
    console.log(`Iniciando login com Google para perfil ${role}...`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Scale className="w-10 h-10 text-[#9c7d2c]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            Lawyer <span className="text-[#9c7d2c]">Pro</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2 text-center">Solução Completa para a Advocacia Moderna</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Role Selector Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setRole('ADVOGADO')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${role === 'ADVOGADO' ? 'text-black bg-white border-b-2 border-[#9c7d2c]' : 'text-gray-400 bg-gray-50 hover:text-gray-600'}`}
            >
              <Briefcase className={`w-4 h-4 ${role === 'ADVOGADO' ? 'text-[#9c7d2c]' : 'text-gray-300'}`} />
              <span>Login Advogado</span>
            </button>
            <button 
              onClick={() => setRole('COLABORADOR')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${role === 'COLABORADOR' ? 'text-black bg-white border-b-2 border-[#9c7d2c]' : 'text-gray-400 bg-gray-50 hover:text-gray-600'}`}
            >
              <Users className={`w-4 h-4 ${role === 'COLABORADOR' ? 'text-[#9c7d2c]' : 'text-gray-300'}`} />
              <span>Login Colaborador</span>
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-sm font-medium text-gray-500 mb-6 text-center">
              {isSignUp ? 'Preencha os dados abaixo para criar sua conta' : `Área de acesso restrita para ${role.toLowerCase()}s.`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="exemplo@lawyerpro.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#9c7d2c]/20 focus:border-[#9c7d2c] outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Senha</label>
                  {!isSignUp && (
                    <button type="button" className="text-[10px] font-bold text-[#9c7d2c] hover:underline uppercase transition-colors">Esqueceu a senha?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#9c7d2c]/20 focus:border-[#9c7d2c] outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Validando Credenciais...' : (
                  <>
                    <span>{isSignUp ? 'Registrar Perfil' : `Entrar como ${role.charAt(0) + role.slice(1).toLowerCase()}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Logins */}
            {!isSignUp && (
              <div className="mt-8">
                <div className="relative flex items-center mb-6">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase">Acesso Rápido</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button 
                  onClick={handleSocialLogin}
                  className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
                >
                  <Chrome className="w-5 h-5 text-[#4285F4]" />
                  <span className="text-sm font-bold text-gray-600">Entrar com Google</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-center items-center">
            <p className="text-xs text-gray-500 font-medium">
              {isSignUp ? 'Já possui uma conta?' : 'Deseja cadastrar novo perfil?'}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 font-bold text-[#9c7d2c] hover:underline transition-colors"
              >
                {isSignUp ? 'Fazer login' : 'Comece agora'}
              </button>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center space-x-4 opacity-40">
           <div className="flex items-center space-x-1">
             <Shield className="w-3 h-3" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Servidor Seguro</span>
           </div>
           <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
           <div className="text-[10px] font-bold uppercase tracking-wider">Conformidade LGPD</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
