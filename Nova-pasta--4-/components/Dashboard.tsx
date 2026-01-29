
import React from 'react';
import { Plus, History, FileText, ChevronRight } from 'lucide-react';
import { CONTRACT_TEMPLATES } from '../constants.tsx';
import { ContractType, HistoryItem } from '../types.ts';

interface DashboardProps {
  onStartContract: (type: ContractType) => void;
  history: HistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onStartContract, history }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Novo Documento</h1>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Selecione um template para começar.</p>
        </div>
      </div>

      {/* Templates Grid - Mais Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {CONTRACT_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onStartContract(tpl.id as ContractType)}
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left flex items-start space-x-4"
          >
            <div className={`w-10 h-10 ${tpl.color} rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform`}>
              {/* Fix: Cast icon to React.ReactElement<any> to resolve TypeScript error regarding className in cloneElement */}
              {React.cloneElement(tpl.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">{tpl.title}</h3>
              <p className="text-[10px] text-gray-500 leading-tight">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Grid: History */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center">
            <History className="w-3.5 h-3.5 mr-2" />
            Histórico de Emissão
          </h2>
        </div>
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {history.length > 0 ? (
            history.map((c) => (
              <div key={c.id} className="px-6 py-3 hover:bg-gray-50 flex items-center justify-between group cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.client}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{c.type} • {c.date.split(',')[0]}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
              <FileText className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[11px] font-bold">Nenhum contrato recente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
