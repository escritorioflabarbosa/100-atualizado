
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.tsx';
import Editor from './components/Editor.tsx';
import Login from './components/Login.tsx';
import Home from './components/Home.tsx';
import Finances from './components/Finances.tsx';
import Clients from './components/Clients.tsx';
import { ContractType, HistoryItem, User, Client } from './types.ts';
import { Scale, LogOut, LayoutGrid, Users, Wallet, FileEdit } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD_EDITOR' | 'EDITOR_SCREEN' | 'FINANCES' | 'CLIENTS'>('HOME');
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('lawyer_editor_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedHistory = localStorage.getItem('lawyer_editor_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedClients = localStorage.getItem('lawyer_editor_clients');
    if (savedClients) setClients(JSON.parse(savedClients));
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('lawyer_editor_user', JSON.stringify(newUser));
    setCurrentView('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lawyer_editor_user');
    setCurrentView('HOME');
  };

  const handleStartContract = (type: ContractType) => {
    setSelectedType(type);
    setCurrentView('EDITOR_SCREEN');
  };

  const handleBackToHub = () => {
    setCurrentView('HOME');
    setSelectedType(null);
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'date'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updatedHistory = [newItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('lawyer_editor_history', JSON.stringify(updatedHistory));
  };

  const handleValidateClient = (newClient: Client) => {
    const updatedClients = [{ ...newClient, paymentHistory: [] }, ...clients];
    setClients(updatedClients);
    localStorage.setItem('lawyer_editor_clients', JSON.stringify(updatedClients));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    localStorage.setItem('lawyer_editor_clients', JSON.stringify(updatedClients));
  };

  const handleRemoveClient = (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    localStorage.setItem('lawyer_editor_clients', JSON.stringify(updatedClients));
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'CLIENTS': return <Clients user={user} clients={clients} history={history} onBack={handleBackToHub} onValidateClient={handleValidateClient} onRemoveClient={handleRemoveClient} />;
      case 'FINANCES': return <Finances user={user} clients={clients} onBack={handleBackToHub} onUpdateClient={handleUpdateClient} />;
      case 'EDITOR_SCREEN': return selectedType ? <Editor type={selectedType} onBack={() => setCurrentView('DASHBOARD_EDITOR')} onSaveToHistory={addToHistory} /> : null;
      case 'DASHBOARD_EDITOR': return <Dashboard onStartContract={handleStartContract} history={history} />;
      default: return <Home user={user} clients={clients} onSelectModule={(m) => {
        if (m === 'EDITOR') setCurrentView('DASHBOARD_EDITOR');
        else if (m === 'CLIENTS') setCurrentView('CLIENTS');
        else setCurrentView('FINANCES');
      }} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans pb-20 md:pb-0">
      {/* Desktop Top Nav */}
      <nav className="hidden md:flex bg-white border-b px-8 py-3 items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToHub}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
             <Scale className="w-6 h-6 text-[#9c7d2c]" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">Lawyer <span className="text-[#9c7d2c]">Pro</span></span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{user.user_metadata?.full_name || 'Usuário'}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-all"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      {/* Mobile Top Header (Condensed) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center space-x-2" onClick={handleBackToHub}>
          <Scale className="w-6 h-6 text-[#9c7d2c]" />
          <span className="font-black text-sm tracking-tight">Lawyer <span className="text-[#9c7d2c]">Pro</span></span>
        </div>
        <button onClick={handleLogout} className="text-gray-400"><LogOut className="w-5 h-5" /></button>
      </div>

      <main className="flex-1 overflow-y-auto">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 px-2 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setCurrentView('HOME')} className={`flex flex-col items-center flex-1 ${currentView === 'HOME' ? 'text-[#9c7d2c]' : 'text-gray-400'}`}>
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-1">Início</span>
        </button>
        <button onClick={() => setCurrentView('DASHBOARD_EDITOR')} className={`flex flex-col items-center flex-1 ${currentView === 'DASHBOARD_EDITOR' || currentView === 'EDITOR_SCREEN' ? 'text-[#9c7d2c]' : 'text-gray-400'}`}>
          <FileEdit className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-1">Editor</span>
        </button>
        <button onClick={() => setCurrentView('CLIENTS')} className={`flex flex-col items-center flex-1 ${currentView === 'CLIENTS' ? 'text-[#9c7d2c]' : 'text-gray-400'}`}>
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-1">Clientes</span>
        </button>
        <button onClick={() => setCurrentView('FINANCES')} className={`flex flex-col items-center flex-1 ${currentView === 'FINANCES' ? 'text-[#9c7d2c]' : 'text-gray-400'}`}>
          <Wallet className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase mt-1">Finanças</span>
        </button>
      </nav>

      <footer className="hidden md:block bg-white border-t py-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2024 Lawyer Pro • Legal Technology Solutions
      </footer>
    </div>
  );
};

export default App;
