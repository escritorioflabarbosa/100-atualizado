
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
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [mobileView, setMobileView] = useState<'FORM' | 'PREVIEW'>('FORM');
  const [manualOverrides, setManualOverrides] = useState<Record<number, string>>({});

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
      type: 'Gerado via Mobile Editor',
      fullData: type === 'PF_BUNDLE' ? formDataPF : type === 'PJ_BUNDLE' ? formDataPJ : formDataPartnership
    });
    window.print();
  };

  const renderPaymentSchedule = () => {
    const currentData = type === 'PF_BUNDLE' ? formDataPF : formDataPJ;
    const installments = parseInt(currentData.vezesParcelas) || 0;
    if (!currentData.valorTotal) return null;

    return (
      <div className="mt-6 p-4 md:p-6 bg-gray-900 rounded-[2rem] text-white shadow-xl overflow-hidden relative">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9c7d2c] mb-4 flex items-center">
          <ReceiptText className="w-4 h-4 mr-2" /> Cronograma Financeiro
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Total</span>
            <span className="text-sm font-black text-[#9c7d2c]">R$ {currentData.valorTotal}</span>
          </div>
          {installments > 0 && <p className="text-[10px] text-white/50">{installments}x de R$ {currentData.valorParcela} todo dia {currentData.dataPagamentoParcelas || '??'}</p>}
        </div>
      </div>
    );
  };

  const renderFormPF = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase">Dados do Cliente</h3>
        <input type="text" placeholder="Nome Completo" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.nome} onChange={e => setFormDataPF({...formDataPF, nome: e.target.value})} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="CPF" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.cpf} onChange={e => setFormDataPF({...formDataPF, cpf: e.target.value})} />
          <input type="text" placeholder="Profissão" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.profissao} onChange={e => setFormDataPF({...formDataPF, profissao: e.target.value})} />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-xs font-black text-[#9c7d2c] uppercase">Financeiro</h3>
        <input type="text" placeholder="Valor Total" className="w-full p-3.5 border rounded-2xl text-sm font-bold" value={formDataPF.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.dataEntrada} onChange={e => setFormDataPF({...formDataPF, dataEntrada: e.target.value})} />
          <input type="text" placeholder="Entrada" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.entrada} onChange={e => handleCurrencyChange('entrada', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Nº Parcelas" className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.vezesParcelas} onChange={e => setFormDataPF({...formDataPF, vezesParcelas: e.target.value})} />
          <input type="text" placeholder="Dia Venc." className="w-full p-3.5 border rounded-2xl text-sm" value={formDataPF.dataPagamentoParcelas} onChange={e => setFormDataPF({...formDataPF, dataPagamentoParcelas: e.target.value})} />
        </div>
      </div>
      {renderPaymentSchedule()}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0">
      <header className="bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-[60] print:hidden">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        <div className="hidden md:flex items-center space-x-3 bg-gray-100 p-1 rounded-xl">
           <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-white rounded-lg"><ZoomOut className="w-4 h-4" /></button>
           <span className="text-xs font-black px-2">{zoom}%</span>
           <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 hover:bg-white rounded-lg"><ZoomIn className="w-4 h-4" /></button>
        </div>
        <button onClick={handleGeneratePDF} className="bg-black text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center">
          <Download className="w-4 h-4 mr-2 text-[#9c7d2c]" /> PDF
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
        {/* Sidebar / Form View */}
        <aside className={`${mobileView === 'FORM' ? 'block' : 'hidden'} md:block w-full md:w-[450px] border-r bg-white overflow-y-auto p-6 md:p-8 scrollbar-none shadow-xl z-10`}>
          {type === 'PF_BUNDLE' ? renderFormPF() : <div className="p-10 text-center text-gray-400">Modelo PJ em adaptação mobile</div>}
          
          <div className="md:hidden mt-10">
            <button onClick={() => setMobileView('PREVIEW')} className="w-full py-4 bg-[#9c7d2c] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center">
              <Eye className="w-5 h-5 mr-2" /> Ver Prévia do Contrato
            </button>
          </div>
        </aside>

        {/* Main Content / PDF Preview View */}
        <main className={`${mobileView === 'PREVIEW' ? 'block' : 'hidden'} md:flex flex-1 bg-gray-100/30 overflow-y-auto p-4 md:p-12 flex-col items-center print:bg-white print:p-0`}>
          <div className="md:hidden mb-6 flex justify-between w-full">
             <button onClick={() => setMobileView('FORM')} className="flex items-center text-[#9c7d2c] font-black text-[10px] uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-1" /> Editar Dados
             </button>
             <span className="font-black text-[10px] uppercase text-gray-400">Página {activeTab + 1} de 3</span>
          </div>

          {(type === 'PF_BUNDLE' || type === 'PJ_BUNDLE') && (
            <div className="mb-8 bg-white p-1 rounded-2xl border flex items-center shadow-sm w-full max-w-sm md:max-w-none overflow-x-auto">
              {['Honorários', 'Procuração', 'Hipo'].map((tab, idx) => (
                <button key={tab} onClick={() => setActiveTab(idx)} className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === idx ? 'bg-black text-white' : 'text-gray-400'}`}>
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className="w-full flex justify-center pb-20 md:pb-0">
             <PDFPreview 
                type={activeTab === 0 ? 'PF_HONORARIOS' : activeTab === 1 ? 'PF_PROCURACAO' : 'PF_HIPO'} 
                data={formDataPF} 
                zoom={zoom} 
             />
          </div>
        </main>
      </div>

      {/* Floating Mobile Action */}
      {mobileView === 'PREVIEW' && (
        <button onClick={() => setMobileView('FORM')} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-2xl z-[110] active:scale-95 transition-transform border-4 border-white">
          <Edit3 className="w-6 h-6 text-[#9c7d2c]" />
        </button>
      )}
    </div>
  );
};

export default Editor;
