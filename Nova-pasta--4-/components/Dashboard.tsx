
import React from 'react';
import { Plus, History, FileText, ChevronRight, Scale, ShieldCheck } from 'lucide-react';
import { CONTRACT_TEMPLATES } from '../constants.tsx';
import { ContractType, HistoryItem } from '../types.ts';

interface DashboardProps {
  onStartContract: (type: ContractType) => void;
  history: HistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onStartContract, history }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero / Welcome */}
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Editor Jurídico Profissional</h1>
        <p className="text-gray-500">Gere documentos jurídicos com perfeição visual e segurança jurídica.</p>
      </div>

      {/* Quick Actions / Templates */}
      <div className="mb-16">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Gerar Novo Contrato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTRACT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onStartContract(tpl.id as ContractType)}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-left flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {tpl.icon}
              </div>
              <div className={`w-12 h-12 ${tpl.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {tpl.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{tpl.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{tpl.description}</p>
              <div className="mt-auto flex items-center text-blue-600 font-bold text-sm">
                Começar agora <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          ))}
          
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl flex flex-col items-center justify-center text-gray-400 group cursor-not-allowed">
            <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Customizar Modelo</p>
            <span className="text-[10px] uppercase font-bold text-gray-300 mt-2">Em Breve</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: History and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[300px]">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center">
              <History className="w-4 h-4 mr-2" />
              Histórico Recente
            </h2>
          </div>
          <div className="divide-y">
            {history.length > 0 ? (
              history.map((c) => (
                <div key={c.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.client}</p>
                      <p className="text-xs text-gray-500">{c.type} • Gerado em {c.date}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Nenhum contrato gerado recentemente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats / Info */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <ShieldCheck className="w-6 h-6 mr-2 opacity-80" />
                <h3 className="font-bold">Segurança Máxima</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Todos os seus documentos são gerados localmente e criptografados antes de qualquer armazenamento. 100% em conformidade com a LGPD.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
             <div className="flex items-center text-gray-700 mb-2">
               <Scale className="w-5 h-5 mr-2 text-amber-500" />
               <h4 className="font-bold text-sm">Prontidão Jurídica</h4>
             </div>
             <p className="text-xs text-gray-500 mb-4">
               Documentos atualizados conforme as normas mais recentes da OAB e tribunais.
             </p>
             <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[100%] h-full bg-blue-500"></div>
             </div>
             <div className="flex justify-between mt-2">
               <span className="text-[10px] text-gray-400">Status do Sistema</span>
               <span className="text-[10px] font-bold text-gray-600">Online</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
