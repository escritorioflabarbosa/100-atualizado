
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Download, ZoomIn, ZoomOut, Sparkles, CheckCircle, Building2, User, Edit3, X, Save, RefreshCcw, Calendar, MapPin, ReceiptText } from 'lucide-react';
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
    const options = { minimumFractionDigits: 2 };
    const result = (Number(value) / 100).toLocaleString('pt-BR', options);
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

  const updateManualText = (text: string) => {
    setManualOverrides(prev => ({ ...prev, [activeTab]: text }));
  };

  const handleGeneratePDF = () => {
    let clientName = "Cliente Não Identificado";
    let document = "";
    let docType = "Documento Jurídico";

    if (type === 'PF_BUNDLE') {
      clientName = formDataPF.nome || "Novo Cliente PF";
      document = formDataPF.cpf;
      docType = ['Honorários PF', 'Procuração PF', 'Hipossuficiência PF'][activeTab];
    } else if (type === 'PJ_BUNDLE') {
      clientName = formDataPJ.razaoSocial || "Nova Empresa";
      document = formDataPJ.cnpj;
      docType = ['Honorários PJ', 'Procuração PJ', 'Hipossuficiência PJ'][activeTab];
    } else {
      clientName = formDataPartnership.gestor || "Nova Parceria";
      docType = "Contrato de Parceria";
    }

    onSaveToHistory({
      client: clientName,
      document: document,
      type: docType,
      fullData: type === 'PF_BUNDLE' ? formDataPF : type === 'PJ_BUNDLE' ? formDataPJ : formDataPartnership
    });

    window.print();
  };

  const renderPaymentSchedule = () => {
    const currentData = type === 'PF_BUNDLE' ? formDataPF : formDataPJ;
    const installments = parseInt(currentData.vezesParcelas) || 0;
    const installmentVal = currentData.valorParcela;
    const totalVal = currentData.valorTotal;
    const entryVal = currentData.entrada;
    const entryDate = currentData.dataEntrada;
    const dueDay = currentData.dataPagamentoParcelas || '??';

    if (!totalVal) return null;

    return (
      <div className="mt-6 p-4 bg-gray-900 rounded-2xl text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calendar className="w-12 h-12" />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9c7d2c] mb-4 flex items-center">
          <ReceiptText className="w-4 h-4 mr-2" /> Cronograma Financeiro Detalhado
        </h4>
        
        <div className="space-y-3">
          {entryVal && entryVal !== '0,00' && (
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Sinal/Entrada</span>
              <div className="text-right">
                <p className="text-xs font-black">R$ {entryVal}</p>
                <p className="text-[9px] text-white/40 italic">{entryDate ? new Date(entryDate).toLocaleDateString('pt-BR') : 'No ato'}</p>
              </div>
            </div>
          )}

          {installments > 0 && (
            <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {[...Array(installments)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-[10px] font-medium text-white/60">{i + 1}ª Parcela</span>
                  <div className="text-right">
                    <p className="text-xs font-bold">R$ {installmentVal}</p>
                    <p className="text-[9px] text-white/40 italic">Todo dia {dueDay}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-2 flex justify-between items-center text-[#9c7d2c] border-t border-[#9c7d2c]/30 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Valor Global do Contrato</span>
            <span className="text-sm font-black">R$ {totalVal}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFormPJ = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase flex items-center">
          <Building2 className="w-4 h-4 mr-1" /> Dados da Empresa
        </h3>
        <input type="text" placeholder="Razão Social" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.razaoSocial} onChange={e => setFormDataPJ({...formDataPJ, razaoSocial: e.target.value})} />
        <input type="text" placeholder="CNPJ" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.cnpj} onChange={e => setFormDataPJ({...formDataPJ, cnpj: e.target.value})} />
        
        <div className="space-y-2">
           <label className="text-[10px] font-black text-gray-400 uppercase flex items-center"><MapPin className="w-3 h-3 mr-1" /> Sede Social</label>
           <input type="text" placeholder="CEP Sede" className="w-full p-2.5 border rounded-xl text-sm bg-blue-50/30" value={formDataPJ.cepSede} onChange={e => setFormDataPJ({...formDataPJ, cepSede: e.target.value})} />
           <input type="text" placeholder="Endereço Completo" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.enderecoSede} onChange={e => setFormDataPJ({...formDataPJ, enderecoSede: e.target.value})} />
           <div className="grid grid-cols-2 gap-2">
             <input type="text" placeholder="Cidade" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.cidadeSede} onChange={e => setFormDataPJ({...formDataPJ, cidadeSede: e.target.value})} />
             <input type="text" placeholder="Bairro" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.bairroSede} onChange={e => setFormDataPJ({...formDataPJ, bairroSede: e.target.value})} />
           </div>
           <select className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.estadoSede} onChange={e => setFormDataPJ({...formDataPJ, estadoSede: e.target.value})}>
             <option value="">Estado Sede</option>
             {BRAZIL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase flex items-center">
          <User className="w-4 h-4 mr-1" /> Representante Legal
        </h3>
        <input type="text" placeholder="Nome Completo" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.nomeRepresentante} onChange={e => setFormDataPJ({...formDataPJ, nomeRepresentante: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="CPF" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.cpfRep} onChange={e => setFormDataPJ({...formDataPJ, cpfRep: e.target.value})} />
          <input type="text" placeholder="Profissão" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.profissaoRep} onChange={e => setFormDataPJ({...formDataPJ, profissaoRep: e.target.value})} />
        </div>
        <input type="text" placeholder="CEP Residencial" className="w-full p-2.5 border rounded-xl text-sm bg-blue-50/30" value={formDataPJ.cepRep} onChange={e => setFormDataPJ({...formDataPJ, cepRep: e.target.value})} />
        <input type="text" placeholder="Endereço Residencial" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.enderecoRep} onChange={e => setFormDataPJ({...formDataPJ, enderecoRep: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Cidade" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.cidadeRep} onChange={e => setFormDataPJ({...formDataPJ, cidadeRep: e.target.value})} />
          <select className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.estadoRep} onChange={e => setFormDataPJ({...formDataPJ, estadoRep: e.target.value})}>
            <option value="">Estado</option>
            {BRAZIL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase">Processo e Honorários</h3>
        <input type="text" placeholder="Nº do Processo" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.numProcesso} onChange={e => setFormDataPJ({...formDataPJ, numProcesso: e.target.value})} />
        <select className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.formaPagamento} onChange={e => setFormDataPJ({...formDataPJ, formaPagamento: e.target.value})}>
          <option value="BOLETO BANCÁRIO">BOLETO BANCÁRIO</option>
          <option value="À VISTA">À VISTA</option>
          <option value="CARTÃO DE CRÉDITO">CARTÃO DE CRÉDITO</option>
          <option value="PIX">PIX</option>
        </select>
        <div className="space-y-2">
          <input type="text" placeholder="Valor Total" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.dataEntrada} onChange={e => setFormDataPJ({...formDataPJ, dataEntrada: e.target.value})} />
            <input type="text" placeholder="Entrada" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.entrada} onChange={e => handleCurrencyChange('entrada', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
           <input type="number" placeholder="Parcelas" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.vezesParcelas} onChange={e => setFormDataPJ({...formDataPJ, vezesParcelas: e.target.value})} />
           <input type="text" placeholder="Dia Vencimento" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPJ.dataPagamentoParcelas} onChange={e => setFormDataPJ({...formDataPJ, dataPagamentoParcelas: e.target.value})} />
        </div>
      </div>
      
      {renderPaymentSchedule()}
    </div>
  );

  const renderFormPF = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase">Dados Pessoais</h3>
        <input type="text" placeholder="Nome Completo" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.nome} onChange={e => setFormDataPF({...formDataPF, nome: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="CPF" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.cpf} onChange={e => setFormDataPF({...formDataPF, cpf: e.target.value})} />
          <input type="text" placeholder="Profissão" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.profissao} onChange={e => setFormDataPF({...formDataPF, profissao: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Estado Civil" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.estadoCivil} onChange={e => setFormDataPF({...formDataPF, estadoCivil: e.target.value})} />
          <input type="text" placeholder="Nacionalidade" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.nacionalidade} onChange={e => setFormDataPF({...formDataPF, nacionalidade: e.target.value})} />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase flex items-center"><MapPin className="w-4 h-4 mr-1" /> Endereço</h3>
        <input type="text" placeholder="CEP" className="w-full p-2.5 border rounded-xl text-sm bg-blue-50/30" value={formDataPF.cep} onChange={e => setFormDataPF({...formDataPF, cep: e.target.value})} />
        <input type="text" placeholder="Rua, nº, Bairro" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.rua} onChange={e => setFormDataPF({...formDataPF, rua: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Cidade" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.cidade} onChange={e => setFormDataPF({...formDataPF, cidade: e.target.value})} />
          <select className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.estado} onChange={e => setFormDataPF({...formDataPF, estado: e.target.value})}>
            <option value="">Estado</option>
            {BRAZIL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="pt-4 border-t">
          <h3 className="text-xs font-bold text-[#9c7d2c] uppercase mb-2">Processo</h3>
          <input type="text" placeholder="Nº do Processo" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.numProcesso} onChange={e => setFormDataPF({...formDataPF, numProcesso: e.target.value})} />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h3 className="text-xs font-bold text-[#9c7d2c] uppercase">Honorários</h3>
        <select className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.formaPagamento} onChange={e => setFormDataPF({...formDataPF, formaPagamento: e.target.value})}>
          <option value="BOLETO BANCÁRIO">BOLETO BANCÁRIO</option>
          <option value="À VISTA">À VISTA</option>
          <option value="CARTÃO DE CRÉDITO">CARTÃO DE CRÉDITO</option>
          <option value="PIX">PIX</option>
        </select>
        <div className="space-y-2">
          <input type="text" placeholder="Valor Total" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.valorTotal} onChange={e => handleCurrencyChange('valorTotal', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.dataEntrada} onChange={e => setFormDataPF({...formDataPF, dataEntrada: e.target.value})} />
            <input type="text" placeholder="Entrada" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.entrada} onChange={e => handleCurrencyChange('entrada', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Parcelas" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.vezesParcelas} onChange={e => setFormDataPF({...formDataPF, vezesParcelas: e.target.value})} />
          <input type="text" placeholder="Dia Vencimento" className="w-full p-2.5 border rounded-xl text-sm" value={formDataPF.dataPagamentoParcelas} onChange={e => setFormDataPF({...formDataPF, dataPagamentoParcelas: e.target.value})} />
        </div>
      </div>

      {renderPaymentSchedule()}
    </div>
  );

  const renderFormPartnership = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Advogado Gestor</label>
          <input type="text" className="w-full p-2.5 border rounded-xl" value={formDataPartnership.gestor} onChange={e => setFormDataPartnership({...formDataPartnership, gestor: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Advogado Parceiro</label>
          <input type="text" className="w-full p-2.5 border rounded-xl" value={formDataPartnership.parceiro} onChange={e => setFormDataPartnership({...formDataPartnership, parceiro: e.target.value})} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold uppercase text-gray-500">Clientes</label>
          <button onClick={() => setFormDataPartnership({...formDataPartnership, clientes: [...formDataPartnership.clientes, { id: Date.now().toString(), nome: '', cpf: '' }]})} className="text-blue-600 text-sm flex items-center hover:underline"><Plus className="w-4 h-4 mr-1" /> Adicionar</button>
        </div>
        {formDataPartnership.clientes.map((cliente) => (
          <div key={cliente.id} className="flex gap-2 items-end p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex-grow space-y-2">
              <input type="text" placeholder="Nome" className="w-full p-2 border rounded-md text-sm" value={cliente.nome} onChange={e => setFormDataPartnership({...formDataPartnership, clientes: formDataPartnership.clientes.map(c => c.id === cliente.id ? {...c, nome: e.target.value} : c)})} />
              <input type="text" placeholder="CPF" className="w-full p-2 border rounded-md text-sm" value={cliente.cpf} onChange={e => setFormDataPartnership({...formDataPartnership, clientes: formDataPartnership.clientes.map(c => c.id === cliente.id ? {...c, cpf: e.target.value} : c)})} />
            </div>
            {formDataPartnership.clientes.length > 1 && (
              <button onClick={() => setFormDataPartnership({...formDataPartnership, clientes: formDataPartnership.clientes.filter(c => c.id !== cliente.id)})} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Ação</label>
        <select className="w-full p-2.5 border rounded-xl" value={formDataPartnership.tipoAcao} onChange={e => setFormDataPartnership({...formDataPartnership, tipoAcao: e.target.value})}>
          <option value="">Selecione</option>
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Percentual de Repasse</label>
        <select className="w-full p-2.5 border rounded-xl" value={formDataPartnership.percentual} onChange={e => setFormDataPartnership({...formDataPartnership, percentual: e.target.value})}>
          <option value="">Selecione</option>
          {PARTNER_PERCENTAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                <Edit3 className="w-6 h-6 text-[#9c7d2c]" />
             </div>
             <div>
               <h1 className="text-base font-black text-gray-900 leading-none">Editor de Documentos</h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lawyer Pro Intelligence</p>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-white rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
            <span className="px-3 text-xs font-black w-14 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-white rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setIsManualEditing(!isManualEditing)} className={`px-4 py-2.5 ${isManualEditing ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'} rounded-xl hover:opacity-80 font-bold text-xs uppercase tracking-widest flex items-center transition-all shadow-sm`}>
            {isManualEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            {isManualEditing ? 'Fechar Editor' : 'Edição Manual'}
          </button>
          <button onClick={handleGeneratePDF} className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center transition-all active:scale-95"><Download className="w-4 h-4 mr-2 text-[#9c7d2c]" /> Gerar Contrato</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible relative">
        <aside className="w-[450px] border-r bg-white overflow-y-auto p-8 scrollbar-thin shadow-2xl print:hidden relative z-10">
          {type === 'PF_BUNDLE' ? renderFormPF() : type === 'PJ_BUNDLE' ? renderFormPJ() : renderFormPartnership()}
          
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
             <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#9c7d2c] mt-0.5" />
                <div className="text-[10px] font-bold text-blue-900 leading-relaxed">
                  <h4 className="font-black text-black uppercase mb-1">Preenchimento Dinâmico</h4>
                  Insira os dados do cliente para que o cronograma e as cláusulas sejam geradas instantaneamente.
                </div>
             </div>
          </div>
        </aside>

        {isManualEditing && (
          <div className="absolute inset-y-0 left-[450px] w-[500px] bg-white border-r z-40 shadow-2xl p-8 flex flex-col print:hidden animate-in slide-in-from-left duration-300">
            <h2 className="font-black text-gray-900 uppercase text-sm mb-4 flex items-center tracking-widest">
              <Edit3 className="w-5 h-5 mr-2 text-[#9c7d2c]" /> Ajustes Finos
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 leading-relaxed">
              Altere o conteúdo do contrato manualmente caso precise de cláusulas específicas não listadas no formulário.
            </p>
            <textarea 
              className="flex-1 w-full p-6 border border-gray-100 rounded-[2rem] font-serif text-sm leading-relaxed focus:ring-4 focus:ring-amber-50 outline-none resize-none bg-amber-50/10"
              placeholder="Digite as alterações aqui..."
              value={manualOverrides[activeTab] || ''}
              onChange={(e) => updateManualText(e.target.value)}
            />
            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={() => updateManualText('')} 
                className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 flex items-center transition-colors"
              >
                <RefreshCcw className="w-3 h-3 mr-1" /> Restaurar Padrão
              </button>
              <button 
                onClick={() => setIsManualEditing(false)} 
                className="px-8 py-3 bg-black text-white font-black text-xs uppercase rounded-2xl shadow-xl hover:bg-gray-800 flex items-center transition-all active:scale-95"
              >
                <Save className="w-4 h-4 mr-2 text-[#9c7d2c]" /> Salvar Ajustes
              </button>
            </div>
          </div>
        )}

        <main className={`flex-1 bg-gray-100/50 overflow-y-auto p-12 flex flex-col items-center print:bg-white print:p-0 transition-all ${isManualEditing ? 'pl-[20px]' : ''}`}>
          {(type === 'PF_BUNDLE' || type === 'PJ_BUNDLE') && (
            <div className="mb-10 bg-white p-1 rounded-2xl border shadow-sm flex items-center tabs-container print:hidden">
              {['Honorários', 'Procuração', 'Hipossuficiência'].map((tab, idx) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(idx)} 
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            {type === 'PF_BUNDLE' ? (
               activeTab === 0 ? <PDFPreview type="PF_HONORARIOS" data={formDataPF} zoom={zoom} manualOverride={manualOverrides[0]} /> :
               activeTab === 1 ? <PDFPreview type="PF_PROCURACAO" data={formDataPF} zoom={zoom} manualOverride={manualOverrides[1]} /> :
               <PDFPreview type="PF_HIPO" data={formDataPF} zoom={zoom} manualOverride={manualOverrides[2]} />
            ) : type === 'PJ_BUNDLE' ? (
               activeTab === 0 ? <PDFPreview type="PJ_HONORARIOS" data={formDataPJ} zoom={zoom} manualOverride={manualOverrides[0]} /> :
               activeTab === 1 ? <PDFPreview type="PJ_PROCURACAO" data={formDataPJ} zoom={zoom} manualOverride={manualOverrides[1]} /> :
               <PDFPreview type="PF_HIPO" data={formDataPJ} zoom={zoom} manualOverride={manualOverrides[2]} />
            ) : (
               <PDFPreview type="PARTNERSHIP" data={formDataPartnership} zoom={zoom} manualOverride={manualOverrides[0]} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
