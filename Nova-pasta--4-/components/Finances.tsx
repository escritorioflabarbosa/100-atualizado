
import React, { useState } from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, CheckCircle2, CreditCard, X, ListOrdered, ReceiptText, Save, ChevronRight } from 'lucide-react';
import { User, Client, PaymentRecord } from '../types.ts';

interface FinancesProps {
  user: User;
  clients: Client[];
  onBack: () => void;
  onUpdateClient: (client: Client) => void;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Finances: React.FC<FinancesProps> = ({ user, clients, onBack, onUpdateClient }) => {
  const isLawyer = user.role === 'ADVOGADO';
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | null>(null);
  const currentYear = new Date().getFullYear();

  const totalReceivables = clients.reduce((acc, c) => acc + parseFloat(c.paymentInfo?.totalValue.replace(/\./g, '').replace(',', '.') || '0'), 0);
  const pendingPayments = clients.filter(c => c.paymentInfo && parseInt(c.paymentInfo.installmentsCount) > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="md:hidden p-2"><ArrowLeft className="w-5 h-5" /></button>
          <Wallet className="w-6 h-6 text-[#9c7d2c]" />
          <h1 className="text-xl font-black">Finanças</h1>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black p-6 rounded-[2rem] text-white">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expectativa Total</p>
            <h3 className="text-2xl font-black text-[#9c7d2c]">R$ {totalReceivables.toLocaleString('pt-BR')}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contratos Ativos</p>
            <h3 className="text-2xl font-black">{pendingPayments.length}</h3>
          </div>
        </div>

        {/* Client Cards (Mobile Friendly) */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle de Honorários</h2>
          {pendingPayments.map(client => (
            <div key={client.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-gray-900">{client.name}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{client.paymentInfo?.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600">R$ {client.paymentInfo?.installmentValue}</p>
                  <p className="text-[9px] font-bold text-gray-400">Todo dia {client.paymentInfo?.dueDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientForPayment(client)}
                className="w-full py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center"
              >
                Gerenciar Pagamentos <ChevronRight className="w-4 h-4 ml-1 text-[#9c7d2c]" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Payment Modal */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-end md:items-center justify-center p-0 md:p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black">{selectedClientForPayment.name}</h2>
                 <button onClick={() => setSelectedClientForPayment(null)} className="p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                 {MONTHS.map((m, i) => (
                    <button key={m} className="p-3 border rounded-xl flex flex-col items-center justify-center space-y-1">
                       <span className="text-[9px] font-black uppercase">{m}</span>
                       <Clock className="w-4 h-4 text-gray-300" />
                    </button>
                 ))}
              </div>
              <button onClick={() => setSelectedClientForPayment(null)} className="w-full mt-8 py-4 bg-black text-white rounded-3xl font-black uppercase text-xs">Salvar Alterações</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
