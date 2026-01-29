
import React, { useState } from 'react';
// Fix: Added missing ReceiptText and Save imports from lucide-react
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, Filter, Calendar, ShieldAlert, Clock, CheckCircle2, CreditCard, X, ChevronRight, ListOrdered, ReceiptText, Save } from 'lucide-react';
import { User, Client, PaymentRecord } from '../types.ts';

interface FinancesProps {
  user: User;
  clients: Client[];
  onBack: () => void;
  onUpdateClient: (client: Client) => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Finances: React.FC<FinancesProps> = ({ user, clients, onBack, onUpdateClient }) => {
  const isLawyer = user.role === 'ADVOGADO';
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const currentYear = new Date().getFullYear();

  const totalReceivables = clients.reduce((acc, c) => {
    const val = parseFloat(c.paymentInfo?.totalValue.replace(/\./g, '').replace(',', '.') || '0');
    return acc + val;
  }, 0);

  const pendingPayments = clients.filter(c => c.paymentInfo && parseInt(c.paymentInfo.installmentsCount) > 0);

  const handleToggleMonth = (monthIndex: number) => {
    if (!selectedClientForPayment) return;

    const isPaid = selectedClientForPayment.paymentHistory.some(p => p.month === monthIndex && p.year === currentYear);
    
    let newHistory: PaymentRecord[];
    if (isPaid) {
      newHistory = selectedClientForPayment.paymentHistory.filter(p => !(p.month === monthIndex && p.year === currentYear));
    } else {
      newHistory = [
        ...selectedClientForPayment.paymentHistory,
        { month: monthIndex, year: currentYear, paidAt: new Date().toLocaleDateString('pt-BR') }
      ];
    }

    const updatedClient = { ...selectedClientForPayment, paymentHistory: newHistory };
    onUpdateClient(updatedClient);
    setSelectedClientForPayment(updatedClient);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#9c7d2c]" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Lawyer's <span className="text-[#9c7d2c]">Finances</span></h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Total em Carteira</p>
            <h3 className="text-2xl font-black text-gray-900">
              {isLawyer ? `R$ ${totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '***'}
            </h3>
            <div className="mt-4 flex items-center text-blue-500 space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">Consolidado Geral</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Contratos Ativos</p>
            <h3 className="text-2xl font-black text-gray-900">{pendingPayments.length}</h3>
            <div className="mt-4 flex items-center text-amber-500 space-x-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">Expectativa mensal</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Recebido (Mês)</p>
            <h3 className="text-2xl font-black text-green-600">
              {clients.filter(c => c.paymentHistory.some(p => p.month === new Date().getMonth() && p.year === currentYear)).length}
            </h3>
            <div className="mt-4 flex items-center text-green-500 space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">Fluxo positivo</span>
            </div>
          </div>

          <div className="bg-black p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <TrendingUp className="w-12 h-12" />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Receita Estimada</p>
             <h3 className="text-2xl font-black text-[#9c7d2c]">
               R$ {clients.reduce((acc, c) => acc + parseFloat(c.paymentInfo?.installmentValue.replace(/\./g, '').replace(',', '.') || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </h3>
             <p className="text-[9px] text-white/40 mt-4 uppercase font-bold italic tracking-tighter">Valor bruto por competência</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center mb-6">
            <CreditCard className="w-4 h-4 mr-2 text-indigo-500" />
            Gestão de Honorários por Cliente
          </h2>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase">Doador / Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase">Valor Parcela</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase">Vencimento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingPayments.length > 0 ? pendingPayments.map((client) => {
                  const isPaidThisMonth = client.paymentHistory.some(p => p.month === new Date().getMonth() && p.year === currentYear);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{client.name}</span>
                          <span className="text-[9px] text-[#9c7d2c] font-black uppercase tracking-widest">{client.paymentInfo?.method}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-gray-900">R$ {client.paymentInfo?.installmentValue}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-gray-600 italic">Todo dia {client.paymentInfo?.dueDate || '??'}</span>
                      </td>
                      <td className="px-8 py-5">
                        {isPaidThisMonth ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-xl">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> LIQUIDADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl">
                            <Clock className="w-3 h-3 mr-1.5" /> AGUARDANDO
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { setSelectedClientForPayment(client); setShowFullSchedule(false); }}
                          className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#9c7d2c] transition-all shadow-lg active:scale-95 flex items-center ml-auto"
                        >
                          <ReceiptText className="w-3.5 h-3.5 mr-2" /> Controle
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-sm">Nenhum contrato financeiro ativo detectado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Financial Control with Schedule */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-black p-10 text-white relative">
              <button onClick={() => setSelectedClientForPayment(null)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-[#9c7d2c] rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#9c7d2c] uppercase tracking-[0.3em] mb-1">Tesouraria Jurídica</p>
                  <h2 className="text-2xl font-black">{selectedClientForPayment.name}</h2>
                </div>
              </div>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Parcela</p>
                  <p className="text-lg font-black text-gray-900">R$ {selectedClientForPayment.paymentInfo?.installmentValue}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Vencimento</p>
                  <p className="text-lg font-black text-gray-900">Dia {selectedClientForPayment.paymentInfo?.dueDate}</p>
                </div>
                <div className="p-5 bg-black rounded-[2rem] text-white">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Contrato</p>
                  <p className="text-lg font-black text-[#9c7d2c]">R$ {selectedClientForPayment.paymentInfo?.totalValue}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle de Baixa ({currentYear})</h3>
                <button 
                  onClick={() => setShowFullSchedule(!showFullSchedule)}
                  className="text-[10px] font-black text-[#9c7d2c] uppercase flex items-center hover:underline"
                >
                  <ListOrdered className="w-3.5 h-3.5 mr-1" /> {showFullSchedule ? 'Ver Calendário' : 'Ver Lista Completa'}
                </button>
              </div>
              
              {!showFullSchedule ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {MONTHS.map((month, idx) => {
                    const isPaid = selectedClientForPayment.paymentHistory.some(p => p.month === idx && p.year === currentYear);
                    return (
                      <button
                        key={month}
                        onClick={() => handleToggleMonth(idx)}
                        className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-1.5 group ${
                          isPaid 
                          ? 'bg-green-50 border-green-500 text-green-700' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-[#9c7d2c] hover:text-[#9c7d2c]'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tighter">{month}</span>
                        {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 opacity-20 group-hover:opacity-100" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-[2rem] p-6 max-h-[250px] overflow-y-auto custom-scrollbar border border-gray-100">
                  <div className="space-y-3">
                    {selectedClientForPayment.paymentHistory.length > 0 ? selectedClientForPayment.paymentHistory.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-bold text-gray-700">{MONTHS[rec.month]} / {rec.year}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400">PAGO EM</p>
                          <p className="text-xs font-bold text-gray-900">{rec.paidAt}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-10 text-xs text-gray-400 font-medium">Nenhum pagamento registrado no histórico.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-col space-y-4">
                <button 
                  onClick={() => setSelectedClientForPayment(null)}
                  className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-3 active:scale-95"
                >
                  <Save className="w-5 h-5 text-[#9c7d2c]" />
                  <span>Sincronizar Dados Financeiros</span>
                </button>
                <p className="text-center text-[9px] text-gray-400 font-medium italic">As alterações são salvas localmente e persistidas no dossiê do cliente.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
