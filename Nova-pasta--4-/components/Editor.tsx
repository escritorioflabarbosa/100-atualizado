
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, ZoomIn, ZoomOut, Building2, User, Edit3, ReceiptText, Eye } from 'lucide-react';
import PDFPreview from './PDFPreview.tsx';
import { FormDataPF, FormDataPJ, FormDataPartnership, ContractType, HistoryItem } from '../types.ts';

interface EditorProps {
  type: ContractType;
  onBack: () => void;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
}

const Editor: React.FC<EditorProps> = ({ type, onBack, onSaveToHistory }) => {
  const [zoom, setZoom] = useState(65); // Zoom inicial reduzido para 65% para visão panorâmica
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

  const parseValue = (val: string) => {
    if (!val) return 0;
    let clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const formatCurrencyInput = (val: string) => {
    if (!val) return '';
    let value = val.replace(/\D/g, '');
    if (!value) return '';
    return (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
      const formattedParcela = (remaining / installmentsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (type === 'PF_BUNDLE' && formDataPF.valorParcela !== formattedParcela) setFormDataPF(prev => ({ ...prev, valorParcela: formattedParcela }));
      if (type === 'PJ_BUNDLE' && formDataPJ.valorParcela !== formattedParcela) setFormDataPJ(prev => ({ ...prev, valorParcela: formattedParcela }));
    }
  }, [formDataPF.valorTotal, formDataPF.entrada, formDataPF.vezesParcelas, formDataPJ.valorTotal, formDataPJ.entrada, formDataPJ.vezesParcelas, formDataPF.formaPagamento, formDataPJ.formaPagamento, type]);

  const handleGeneratePDF = () => {
    onSaveToHistory({
      client: type === 'PF_BUNDLE' ? formDataPF.nome : formDataPJ.razaoSocial,
      document: type === 'PF_BUNDLE' ? formDataPF.cpf : formDataPJ.cnpj,
      type: 'Contrato Gerado',
      fullData: type === 'PF_BUNDLE' ? formDataPF : formDataPJ
    });
    window.print();
  };

  const inputStyle = "w-full p-2.5 border-2 border-gray-100 rounded-xl text-[11px] font-medium focus:border-[#9c7d2c] outline-none transition-colors shadow-sm focus:bg-white";
  const labelStyle = "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block";

  const renderFormPJ = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[10px] font-black text-[#9c7d2c] uppercase flex items-center tracking-widest mb-3"><Building2 className="w-4 h-4 mr-2" /> Empresa Outorgante</h3>
        <div className="space-y-2.5">
          <input type="text" placeholder="Razão Social" className={inputStyle} value={formDataPJ.razaoSocial} onChange={e => setFormDataPJ({...formDataPJ, razaoSocial: e.target.value})} />
          <input type="text" placeholder="CNPJ" className={inputStyle} value={formDataPJ.cnpj} onChange={e => setFormDataPJ({...formDataPJ, cnpj: e.target.value})} />
          <input type="text" placeholder="Endereço da Sede" className={inputStyle} value={formDataPJ.enderecoSede} onChange={e => setFormDataPJ({...formDataPJ, enderecoSede: e.target.value})} />
        </div>
      </div>
      <div className="pt-5 border-t border-gray-50">
        <h3 className="text-[10px] font-black text-[#9c7d2c] uppercase flex items-center tracking-widest mb-3"><User className="w-4 h-4 mr-2" /> Representante Legal</h3>
        <div className="space-y-2.5">
          <input type="text" placeholder="Nome do Representante" className={inputStyle} value={formDataPJ.nomeRepresentante} onChange={e => setFormDataPJ({...formDataPJ, nomeRepresentante: e.target.value})} />
          <div className="grid grid-cols-2 gap-2.5">
            <input type="text" placeholder="CPF" className={inputStyle} value={formDataPJ.cpfRep} onChange={e => setFormDataPJ({...formDataPJ, cpfRep: e.target.value})} />
            <input type="text" placeholder="Profissão" className={inputStyle} value={formDataPJ.profissaoRep} onChange={e => setFormDataPJ({...formDataPJ, profissaoRep: e.target.value})} />
          </div>
        </div>
      </div>
      <div className="pt-5 border-t border-gray-50">
        <h3 className="text-[10px] font-black text-[#9c7d2c] uppercase tracking-widest mb-3">Financeiro</h3>
        <input type="text" placeholder="Valor Total" className={`${inputStyle} text-xs font-black`} value={formDataPJ.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
      </div>
    </div>
  );

  const renderFormPF = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[10px] font-black text-[#9c7d2c] uppercase flex items-center tracking-widest mb-3"><User className="w-4 h-4 mr-2" /> Dados Pessoais</h3>
        <div className="space-y-2.5">
           <input type="text" placeholder="Nome Completo" className={inputStyle} value={formDataPF.nome} onChange={e => setFormDataPF({...formDataPF, nome: e.target.value})} />
           <div className="grid grid-cols-2 gap-2.5">
             <input type="text" placeholder="CPF" className={inputStyle} value={formDataPF.cpf} onChange={e => setFormDataPF({...formDataPF, cpf: e.target.value})} />
             <input type="text" placeholder="Profissão" className={inputStyle} value={formDataPF.profissao} onChange={e => setFormDataPF({...formDataPF, profissao: e.target.value})} />
           </div>
           <input type="text" placeholder="Endereço Residencial" className={inputStyle} value={formDataPF.rua} onChange={e => setFormDataPF({...formDataPF, rua: e.target.value})} />
           <div className="grid grid-cols-2 gap-2.5">
            <input type="text" placeholder="Bairro" className={inputStyle} value={formDataPF.complemento} onChange={e => setFormDataPF({...formDataPF, complemento: e.target.value})} />
            <input type="text" placeholder="CEP" className={inputStyle} value={formDataPF.cep} onChange={e => setFormDataPF({...formDataPF, cep: e.target.value})} />
           </div>
        </div>
      </div>
      <div className="pt-5 border-t border-gray-50">
        <h3 className="text-[10px] font-black text-[#9c7d2c] uppercase flex items-center tracking-widest mb-3"><ReceiptText className="w-4 h-4 mr-2" /> Honorários</h3>
        <div className="space-y-2.5">
          <div>
            <label className={labelStyle}>Valor Global</label>
            <input type="text" placeholder="R$ 0,00" className={`${inputStyle} text-xs font-black`} value={formDataPF.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
             <div>
               <label className={labelStyle}>Data Início</label>
               <input type="date" className={inputStyle} value={formDataPF.dataEntrada} onChange={e => setFormDataPF({...formDataPF, dataEntrada: e.target.value})} />
             </div>
             <div>
               <label className={labelStyle}>Entrada (Sinal)</label>
               <input type="text" className={inputStyle} value={formDataPF.entrada} onChange={e => handleCurrencyChange('entrada', e.target.value)} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelStyle}>Parcelas</label>
              <input type="number" className={inputStyle} value={formDataPF.vezesParcelas} onChange={e => setFormDataPF({...formDataPF, vezesParcelas: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Vencimento</label>
              <input type="text" placeholder="Dia" className={inputStyle} value={formDataPF.dataPagamentoParcelas} onChange={e => setFormDataPF({...formDataPF, dataPagamentoParcelas: e.target.value})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col pb-16 md:pb-0 font-sans overflow-hidden">
      <header className="bg-white border-b px-6 py-2 flex items-center justify-between sticky top-0 z-[60] print:hidden shadow-sm h-12">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-black" />
          </button>
          <div className="hidden md:flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button onClick={() => setZoom(Math.max(30, zoom - 5))} className="p-1.5 hover:bg-white rounded-md transition-all"><ZoomOut className="w-3.5 h-3.5 text-gray-500" /></button>
            <span className="px-2 text-[10px] font-black text-gray-600 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 5))} className="p-1.5 hover:bg-white rounded-md transition-all"><ZoomIn className="w-3.5 h-3.5 text-gray-500" /></button>
          </div>
        </div>
        <button onClick={handleGeneratePDF} className="bg-black text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg flex items-center hover:bg-gray-800 transition-all active:scale-95">
          <Download className="w-3.5 h-3.5 mr-2 text-[#9c7d2c]" /> Emitir Documento
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative print:overflow-visible h-[calc(100vh-3rem)]">
        <aside className={`${mobileView === 'FORM' ? 'block' : 'hidden'} md:block w-full md:w-[360px] border-r bg-white overflow-y-auto p-6 md:p-7 scrollbar-none shadow-xl z-10 shrink-0`}>
          {type === 'PF_BUNDLE' ? renderFormPF() : renderFormPJ()}
          <div className="md:hidden mt-10">
            <button onClick={() => setMobileView('PREVIEW')} className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center">
              <Eye className="w-4 h-4 mr-2" /> Visualizar Documento
            </button>
          </div>
        </aside>

        <main className={`${mobileView === 'PREVIEW' ? 'flex' : 'hidden md:flex'} flex-1 bg-gray-200/50 overflow-y-auto p-4 md:p-10 flex-col items-center print:bg-white print:p-0`}>
          <div className="mb-8 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-gray-100 flex items-center shadow-lg w-full max-w-sm overflow-x-auto shrink-0 sticky top-0 z-10">
            {['Honorários', 'Procuração', 'Hipo'].map((tab, idx) => (
              <button key={tab} onClick={() => setActiveTab(idx)} className={`flex-1 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all tracking-widest ${activeTab === idx ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full flex justify-center items-start pb-32">
             <PDFPreview 
                type={activeTab === 0 ? (type === 'PJ_BUNDLE' ? 'PJ_HONORARIOS' : 'PF_HONORARIOS') : activeTab === 1 ? (type === 'PJ_BUNDLE' ? 'PJ_PROCURACAO' : 'PF_PROCURACAO') : 'PF_HIPO'} 
                data={type === 'PF_BUNDLE' ? formDataPF : formDataPJ} 
                zoom={zoom} 
             />
          </div>
        </main>
      </div>

      {mobileView === 'PREVIEW' && (
        <button onClick={() => setMobileView('FORM')} className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-2xl z-[110] active:scale-95 transition-transform border-4 border-white">
          <Edit3 className="w-6 h-6 text-[#9c7d2c]" />
        </button>
      )}
    </div>
  );
};

export default Editor;
