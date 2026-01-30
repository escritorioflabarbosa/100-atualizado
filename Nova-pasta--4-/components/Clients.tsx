
import React, { useState, useRef } from 'react';
import { ArrowLeft, UserCheck, Users, Search, Filter, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Trash2, Upload, X, FileUp, ShieldCheck, Eye, Download, Lock } from 'lucide-react';
import { User, Client, HistoryItem, AttachedFile } from '../types.ts';

interface ClientsProps {
  user: User;
  clients: Client[];
  history: HistoryItem[];
  onBack: () => void;
  onValidateClient: (client: Client) => void;
  onRemoveClient: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ user, clients, history, onBack, onValidateClient, onRemoveClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [validatingItem, setValidatingItem] = useState<HistoryItem | null>(null);
  const [viewingClientDocs, setViewingClientDocs] = useState<Client | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isLawyer = user.role === 'ADVOGADO';

  const pendingClients = history.filter((h: HistoryItem) => 
    !clients.some((c: Client) => c.document === h.document) && 
    h.client !== "Novo Cliente PF" && 
    h.client !== "Nova Empresa"
  );

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

  const handleOpenValidation = (item: HistoryItem) => {
    setValidatingItem(item);
    setUploadedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type 'f' as 'File' to avoid 'unknown' type error when accessing 'type' property.
      const newFiles = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const confirmValidation = () => {
    if (!validatingItem || uploadedFiles.length === 0) return;

    const attachedMetas: AttachedFile[] = uploadedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      uploadDate: new Date().toLocaleDateString('pt-BR')
    }));

    const data = validatingItem.fullData;

    // Fix: Added missing 'paymentHistory' property to comply with Client interface
    const newClient: Client = {
      id: Date.now().toString(),
      name: validatingItem.client,
      document: validatingItem.document || '000.000.000-00',
      type: (validatingItem.type.includes('PJ') || (validatingItem.document?.replace(/\D/g, '').length || 0) > 11) ? 'PJ' : 'PF',
      status: 'ATIVO',
      lastContract: validatingItem.type,
      registrationDate: new Date().toLocaleDateString('pt-BR'),
      signedDocs: attachedMetas,
      paymentHistory: [],
      paymentInfo: data ? {
        totalValue: data.valorTotal || '0,00',
        installmentValue: data.valorParcela || '0,00',
        installmentsCount: data.vezesParcelas || '1',
        dueDate: data.dataPagamentoParcelas || 'A combinar',
        method: data.formaPagamento || 'Não informado'
      } : undefined
    };

    onValidateClient(newClient);
    setValidatingItem(null);
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#9c7d2c]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">Gestão de Clientes</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lawyer Pro CRM</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou CPF..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#9c7d2c]/20 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        {/* Pending Validations Section */}
        {pendingClients.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center mb-6">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
              Contratos Aguardando Validação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingClients.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <button 
                      onClick={() => handleOpenValidation(item)}
                      className="text-[10px] font-bold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all flex items-center"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Validar
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight">{item.client}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Client List */}
        <div className="mb-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center mb-6">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            Base de Clientes Ativos
          </h2>
          
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Documento</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Docs</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Financeiro</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Cadastro</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.length > 0 ? filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                          {client.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{client.document}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setViewingClientDocs(client)}
                        className="flex items-center space-x-1.5 text-blue-600 hover:underline"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{client.signedDocs.length} arq.</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900">R$ {client.paymentInfo?.totalValue || '0,00'}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{client.paymentInfo?.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{client.registrationDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isLawyer ? (
                          <button 
                            onClick={() => onRemoveClient(client.id)} 
                            className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                            title="Excluir Cliente (Apenas Advogados)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="p-2 text-gray-200" title="Apenas advogados podem excluir">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-sm">Nenhum cliente cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: View Documents */}
      {viewingClientDocs && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-black p-8 text-white flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Documentação Assinada</h2>
                  <p className="text-xs text-white/50">Dossiê de {viewingClientDocs.name}</p>
                </div>
              </div>
              <button onClick={() => setViewingClientDocs(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-3">
                {viewingClientDocs.signedDocs.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{file.uploadDate} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setViewingClientDocs(null)}
                className="w-full mt-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Fechar Dossiê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal (Anterior) */}
      {validatingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-black p-8 text-white relative">
              <button onClick={() => setValidatingItem(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#9c7d2c] rounded-2xl flex items-center justify-center"><Upload className="w-6 h-6 text-white" /></div>
                <div><h2 className="text-xl font-black">Validar Cliente</h2><p className="text-xs text-white/50 uppercase font-bold tracking-widest">Anexo Obrigatório de PDFs Assinados</p></div>
              </div>
            </div>
            <div className="p-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#9c7d2c] hover:bg-gray-50 transition-all group mb-6"
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileUp className="w-7 h-7 text-gray-400 group-hover:text-[#9c7d2c]" />
                </div>
                <p className="text-sm font-bold text-gray-700">Arraste o contrato assinado aqui</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mb-8">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center space-x-3"><FileText className="w-4 h-4 text-blue-500" /><span className="text-xs font-bold text-blue-900 truncate">{file.name}</span></div>
                    </div>
                  ))}
                </div>
              )}
              <button disabled={uploadedFiles.length === 0} onClick={confirmValidation} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all disabled:opacity-30">Finalizar Cadastro de Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
