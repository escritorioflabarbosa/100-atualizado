
import React, { useState, useEffect } from 'react';
import { Edit3, Wallet, ShieldAlert, ArrowRight, Star, Users, AlertTriangle, X } from 'lucide-react';
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
      return currentDay > dueDate && !hasPaidThisMonth;
    });

    if (overdue.length > 0) {
      setOverdueAlert({ count: overdue.length, clients: overdue.map(c => c.name) });
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [clients, isLawyer]);

  const modules = [
    { id: 'EDITOR', icon: Edit3, title: 'Lawyer Editor', desc: 'Gerador automatizado de contratos e procurações com IA.', sub: 'Módulo Ativo', color: 'bg-green-500' },
    { id: 'CLIENTS', icon: Users, title: 'Gestão de Clientes', desc: 'CRM consolidado e validação de documentos assinados.', sub: 'Lawyer Pro CRM', color: 'bg-blue-500' },
    { id: 'FINANCES', icon: Wallet, title: "Lawyer Finances", desc: 'Controle de honorários, faturamento e fluxo de caixa.', sub: isLawyer ? 'Acesso Total' : 'Restrito', color: isLawyer ? 'bg-green-500' : 'bg-amber-400' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
      {/* Alerta Compacto */}
      {showNotification && overdueAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4">
          <div className="bg-red-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border-2 border-white/10">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-xs font-bold">{overdueAlert.count} parcelas vencidas detectadas.</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center space-x-2 text-[#9c7d2c] mb-1">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-[9px] font-black uppercase tracking-widest">Painel de Operações</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Olá, <span className="text-[#9c7d2c]">{user.user_metadata?.full_name?.split(' ')[0]}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id as any)}
            className="group bg-white border border-gray-100 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:border-[#9c7d2c]/30 transition-all duration-300 flex flex-col min-h-[260px] relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
              <m.icon className="w-24 h-24" />
            </div>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#9c7d2c] transition-colors shadow-md">
              <m.icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{m.title}</h2>
            <p className="text-gray-500 text-[12px] leading-relaxed mb-6 flex-grow">{m.desc}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 ${m.color} rounded-full`}></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{m.sub}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
