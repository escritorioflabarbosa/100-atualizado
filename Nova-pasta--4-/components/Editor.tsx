
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Download, ZoomIn, ZoomOut, Sparkles, CheckCircle, Building2, User, Edit3, X, Save, RefreshCcw, Calendar, MapPin, ReceiptText, Eye } from 'lucide-react';
import PDFPreview from './PDFPreview.tsx';
import { FormDataPF, FormDataPJ, FormDataPartnership, ContractType, HistoryItem } from '../types.ts';
import { ACTION_TYPES, PARTNER_PERCENTAGES, BRAZIL_STATES } from '../constants.tsx';

interface EditorProps {
  type: ContractType;
  onBack: () => void;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
}

const Editor: React.FC<EditorProps> = ({ type, onBack, onSaveToHistory }) => {
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState(0); 
  const [mobileView, setMobileView] = useState<'FORM' | 'PREVIEW'>('FORM');

  const [formDataPF, setFormDataPF] = useState<FormDataPF>({
    nome: '', estadoCivil: '', profissao: '', nacionalidade: '', cpf: '', rua: '', complemento: '', cep: '',
    numProcesso: '', cidade: '', estado: '', data: new Date().toISOString().split('T')[0],
    valorTotal: '', entrada: '', dataEntrada: '', vezesParcelas: '', valorParcela: '', dataPagamentoParcelas: '',
    formaPagamento: 'BOLETO BANCÁRIO'
  });

  const [formDataPJ, setFormDataPJ] = useState<FormDataPJ>({
    razaoSocial: '', cnpj: '', enderecoSede: '', bairroSede: '', cidadeSede: '', estadoSede: '', cepSede: '',
    nomeRepresentante: '', nacionalidadeRep: '', profissaoRep: '', estadoCivilRep: '', cpfRep: '', 
    enderecoRep: '', cidadeRep: '', estadoRep: '', cepRep: '',
    numProcesso: '', valorTotal: '', entrada: '', dataEntrada: '', vezesParcelas: '', valorParcela: '', 
    dataPagamentoParcelas: '', formaPagamento: 'BOLETO BANCÁRIO', data: new Date().toISOString().split('T')[0]
  });

  const [formDataPartnership, setFormDataPartnership] = useState<FormDataPartnership>({
    gestor: '', parceiro: '', oabParceiro: '',
    clientes: [{ id: '1', nome: '', cpf: '' }],
    tipoAcao: '', percentual: '', estadoAssinatura: '', dataAssinatura: ''
  });

  const parseValue = (val: string) => {
    if (!val) return 0;
    let clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const formatCurrencyInput = (val: string) => {
    if (!val) return '';
    let value = val.replace(/\D/g, '');
    if (!value) return '';
    const result = (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return result;
  };

  const handleCurrencyChange = (field: string, rawValue: string) => {
    const formatted = formatCurrencyInput(rawValue);
    if (type === 'PF_BUNDLE') setFormDataPF(prev => ({ ...prev, [field]: formatted }));
    else if (type === 'PJ_BUNDLE') setFormDataPJ(prev => ({ ...prev, [field]: formatted }));
  };

  useEffect(() => {
    const currentData = type === 'PF_BUNDLE' ? formDataPF : formDataPJ;
    const total = parseValue(currentData.valorTotal);
    const entry = parseValue(currentData.entrada);
    const installmentsCount = parseInt(currentData.vezesParcelas);

    if (!isNaN(total) && !isNaN(entry) && !isNaN(installmentsCount) && installmentsCount > 0) {
      const remaining = currentData.formaPagamento === 'CARTÃO DE CRÉDITO' || currentData.formaPagamento === 'À VISTA' ? total : total - entry;
      const calculatedParcela = remaining / installmentsCount;
      const formattedParcela = calculatedParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      if (type === 'PF_BUNDLE' && formDataPF.valorParcela !== formattedParcela) setFormDataPF(prev => ({ ...prev, valorParcela: formattedParcela }));
      if (type === 'PJ_BUNDLE' && formDataPJ.valorParcela !== formattedParcela) setFormDataPJ(prev => ({ ...prev, valorParcela: formattedParcela }));
    }
  }, [formDataPF.valorTotal, formDataPF.entrada, formDataPF.vezesParcelas, formDataPJ.valorTotal, formDataPJ.entrada, formDataPJ.vezesParcelas, formDataPF.formaPagamento, formDataPJ.formaPagamento, type]);

  const handleGeneratePDF = () => {
    onSaveToHistory({
      client: type === 'PF_BUNDLE' ? formDataPF.nome : type === 'PJ_BUNDLE' ? formDataPJ.razaoSocial : formDataPartnership.gestor,
      document: type === 'PF_BUNDLE' ? formDataPF.cpf : type === 'PJ_BUNDLE' ? formDataPJ.cnpj : '',
      type: 'Contrato Gerado',
      fullData: type === 'PF_BUNDLE' ? formDataPF : type === 'PJ_BUNDLE' ? formDataPJ : formDataPartnership
    });
    window.print();
  };

  const renderFormPJ = () => (
    <div className="space-y-14">
      <div className="space-y-7">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase flex items-center tracking-widest"><Building2 className="w-5 h-5 mr-3" /> Empresa Outorgante</h3>
        <div className="space-y-5">
          <input type="text" placeholder="Razão Social" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.razaoSocial} onChange={e => setFormDataPJ({...formDataPJ, razaoSocial: e.target.value})} />
          <input type="text" placeholder="CNPJ" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.cnpj} onChange={e => setFormDataPJ({...formDataPJ, cnpj: e.target.value})} />
          <input type="text" placeholder="Endereço da Sede" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.enderecoSede} onChange={e => setFormDataPJ({...formDataPJ, enderecoSede: e.target.value})} />
        </div>
      </div>
      <div className="space-y-7 pt-10 border-t-2 border-gray-50">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase flex items-center tracking-widest"><User className="w-5 h-5 mr-3" /> Representante Legal</h3>
        <input type="text" placeholder="Nome do Representante" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.nomeRepresentante} onChange={e => setFormDataPJ({...formDataPJ, nomeRepresentante: e.target.value})} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="CPF" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.cpfRep} onChange={e => setFormDataPJ({...formDataPJ, cpfRep: e.target.value})} />
          <input type="text" placeholder="Profissão" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPJ.profissaoRep} onChange={e => setFormDataPJ({...formDataPJ, profissaoRep: e.target.value})} />
        </div>
      </div>
      <div className="space-y-7 pt-10 border-t-2 border-gray-50">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase tracking-widest">Financeiro</h3>
        <input type="text" placeholder="Valor Total" className="w-full p-5 border-2 border-gray-100 rounded-[1.5rem] text-base font-black" value={formDataPJ.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
      </div>
    </div>
  );

  const renderFormPF = () => (
    <div className="space-y-14">
      <div className="space-y-7">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase flex items-center tracking-widest"><User className="w-5 h-5 mr-3" /> Dados Pessoais</h3>
        <div className="space-y-5">
           <input type="text" placeholder="Nome Completo" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm shadow-sm" value={formDataPF.nome} onChange={e => setFormDataPF({...formDataPF, nome: e.target.value})} />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <input type="text" placeholder="CPF" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.cpf} onChange={e => setFormDataPF({...formDataPF, cpf: e.target.value})} />
             <input type="text" placeholder="Profissão" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.profissao} onChange={e => setFormDataPF({...formDataPF, profissao: e.target.value})} />
           </div>
           <input type="text" placeholder="Endereço Residencial" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.rua} onChange={e => setFormDataPF({...formDataPF, rua: e.target.value})} />
           <input type="text" placeholder="Complemento / Bairro" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.complemento} onChange={e => setFormDataPF({...formDataPF, complemento: e.target.value})} />
           <input type="text" placeholder="CEP" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.cep} onChange={e => setFormDataPF({...formDataPF, cep: e.target.value})} />
        </div>
      </div>
      <div className="space-y-7 pt-10 border-t-2 border-gray-50">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase flex items-center tracking-widest"><ReceiptText className="w-5 h-5 mr-3" /> Honorários</h3>
        <div className="space-y-6">
          <input type="text" placeholder="Valor Global (R$ 0,00)" className="w-full p-5 border-2 border-gray-200 rounded-[2rem] text-lg font-black" value={formDataPF.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
          <div className="grid grid-cols-2 gap-6">
             <input type="date" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.dataEntrada} onChange={e => setFormDataPF({...formDataPF, dataEntrada: e.target.value})} />
             <input type="text" placeholder="Valor Sinal" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.entrada} onChange={e => handleCurrencyChange('entrada', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <input type="number" placeholder="Nº de Parcelas" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.vezesParcelas} onChange={e => setFormDataPF({...formDataPF, vezesParcelas: e.target.value})} />
            <input type="text" placeholder="Dia Vencimento" className="w-full p-4.5 border-2 border-gray-100 rounded-[1.5rem] text-sm" value={formDataPF.dataPagamentoParcelas} onChange={e => setFormDataPF({...formDataPF, dataPagamentoParcelas: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32 md:pb-0 font-sans">
      <header className="bg-white border-b px-4 md:px-8 py-5 flex items-center justify-between sticky top-0 z-[60] print:hidden shadow-sm">
        <button onClick={onBack} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
        <button onClick={handleGeneratePDF} className="bg-black text-white px-8 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center hover:bg-gray-800 active:scale-95 transition-all">
          <Download className="w-4 h-4 mr-2 text-[#9c7d2c]" /> Gerar PDF
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
        <aside className={`${mobileView === 'FORM' ? 'block' : 'hidden'} md:block w-full md:w-[500px] border-r bg-white overflow-y-auto p-8 md:p-12 scrollbar-none shadow-2xl z-10`}>
          {type === 'PF_BUNDLE' ? renderFormPF() : type === 'PJ_BUNDLE' ? renderFormPJ() : <div className="p-10 text-center text-gray-400">Modelo indisponível</div>}
          <div className="md:hidden mt-16 pb-12">
            <button onClick={() => setMobileView('PREVIEW')} className="w-full py-5 bg-[#9c7d2c] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.1em] shadow-2xl flex items-center justify-center active:scale-95 transition-all">
              <Eye className="w-5 h-5 mr-3" /> Visualizar Contrato
            </button>
          </div>
        </aside>

        <main className={`${mobileView === 'PREVIEW' ? 'flex' : 'hidden md:flex'} flex-1 bg-gray-100/40 overflow-y-auto p-4 md:p-12 flex-col items-center print:bg-white print:p-0`}>
          <div className="md:hidden mb-10 flex justify-between w-full items-center">
             <button onClick={() => setMobileView('FORM')} className="flex items-center text-black font-black text-[10px] uppercase tracking-widest bg-white px-5 py-3 rounded-2xl shadow-xl border-2 border-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2 text-[#9c7d2c]" /> Editar Dados
             </button>
             <span className="font-black text-[9px] uppercase text-gray-400">Contrato • Pág. {activeTab + 1}/2</span>
          </div>
          <div className="mb-12 bg-white p-1.5 rounded-[2rem] border-2 border-gray-100 flex items-center shadow-xl w-full max-w-sm md:max-w-none overflow-x-auto print:hidden">
            {['Honorários', 'Procuração', 'Hipo'].map((tab, idx) => (
              <button key={tab} onClick={() => setActiveTab(idx)} className={`flex-1 min-w-[120px] px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === idx ? 'bg-black text-white shadow-2xl' : 'text-gray-400 hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full flex justify-center items-start pb-40 md:pb-12">
             <PDFPreview 
                type={activeTab === 0 ? (type === 'PJ_BUNDLE' ? 'PJ_HONORARIOS' : 'PF_HONORARIOS') : activeTab === 1 ? (type === 'PJ_BUNDLE' ? 'PJ_PROCURACAO' : 'PF_PROCURACAO') : 'PF_HIPO'} 
                data={type === 'PF_BUNDLE' ? formDataPF : formDataPJ} 
                zoom={zoom} 
             />
          </div>
        </main>
      </div>

      {mobileView === 'PREVIEW' && (
        <button onClick={() => setMobileView('FORM')} className="md:hidden fixed bottom-28 right-8 w-20 h-20 bg-black rounded-full flex items-center justify-center text-white shadow-[0_15px_50px_rgba(0,0,0,0.4)] z-[110] active:scale-95 transition-transform border-8 border-white">
          <Edit3 className="w-8 h-8 text-[#9c7d2c]" />
        </button>
      )}
    </div>
  );
};

export default Editor;
