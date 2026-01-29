
import React, { useState, useEffect } from 'react';
import { Edit3, Wallet, ShieldAlert, ArrowRight, ChevronRight, LayoutGrid, Clock, Star, Users, AlertTriangle, X } from 'lucide-react';
import { User, Client } from '../types.ts';

interface HomeProps {
  user: User;
  clients: Client[];
  onSelectModule: (module: 'EDITOR' | 'FINANCES' | 'CLIENTS') => void;
}

const Home: React.FC<HomeProps> = ({ user, clients, onSelectModule }) => {
  const isLawyer = user.role === 'ADVOGADO';
  const [overdueAlert, setOverdueAlert] = useState<{ count: number; clients: string[] } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!isLawyer) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    const overdue = clients.filter(c => {
      if (!c.paymentInfo?.dueDate) return false;
      const dueDate = parseInt(c.paymentInfo.dueDate);
      const hasPaidThisMonth = c.paymentHistory.some(p => p.month === currentMonth && p.year === currentYear);
      
      // Se passou do dia de vencimento e não pagou este mês
      return currentDay > dueDate && !hasPaidThisMonth;
    });

    if (overdue.length > 0) {
      setOverdueAlert({
        count: overdue.length,
        clients: overdue.map(c => c.name)
      });
      setShowNotification(true);

      // Timer de 5 segundos para sumir a notificação
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [clients, isLawyer]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative">
      {/* Dynamic Overdue Notification */}
      {showNotification && overdueAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl animate-in slide-in-from-top-4 duration-500">
          <div className="bg-red-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border-4 border-white/20 backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Alerta de Inadimplência</p>
                <p className="text-sm font-bold opacity-90">
                  {overdueAlert.count} cliente(s) com parcelas vencidas detectadas.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-12">
        <div className="flex items-center space-x-2 text-[#9c7d2c] mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Painel de Controle Elite</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Bem-vindo, <span className="text-[#9c7d2c]">{user.user_metadata?.full_name?.split(' ')[0] || 'Doutor'}</span>.
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Selecione o módulo que deseja operar hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card: Lawyer Editor */}
        <button
          onClick={() => onSelectModule('EDITOR')}
          className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-2xl hover:border-[#9c7d2c]/30 transition-all duration-500 flex flex-col min-h-[340px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
            <Edit3 className="w-32 h-32" />
          </div>
          
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9c7d2c] transition-colors duration-500 shadow-lg">
            <Edit3 className="w-7 h-7 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3">Lawyer Editor</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Geração automatizada de contratos, procurações e documentos jurídicos com inteligência artificial e preview em tempo real.
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Módulo Ativo</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card: Client Management */}
        <button
          onClick={() => onSelectModule('CLIENTS')}
          className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-2xl hover:border-[#9c7d2c]/30 transition-all duration-500 flex flex-col min-h-[340px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
            <Users className="w-32 h-32" />
          </div>
          
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9c7d2c] transition-colors duration-500 shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3">Gestão de Clientes</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Base consolidada de clientes. Valide contratos assinados e transforme-os automaticamente em clientes recorrentes.
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lawyer Pro CRM</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Card: Lawyer's Finances */}
        <button
          onClick={() => onSelectModule('FINANCES')}
          className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-2xl hover:border-[#9c7d2c]/30 transition-all duration-500 flex flex-col min-h-[340px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
            <Wallet className="w-32 h-32" />
          </div>

          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#9c7d2c] transition-colors duration-500 shadow-lg">
            <Wallet className="w-7 h-7 text-white" />
          </div>

          <div className="flex items-start justify-between mb-3">
            <h2 className="text-2xl font-black text-gray-900">Lawyer's Finances</h2>
            {!isLawyer && (
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full flex items-center space-x-1 border border-amber-100">
                <ShieldAlert className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Restrito</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
            Controle financeiro completo: fluxo de caixa, honorários, faturamento e gestão de despesas do escritório.
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 ${isLawyer ? 'bg-green-500' : 'bg-amber-400'} rounded-full`}></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isLawyer ? 'Acesso Total' : 'Acesso Limitado'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
