
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
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans pb-16 md:pb-0 overflow-hidden">
      {/* Desktop Top Nav - Compact */}
      <nav className="hidden md:flex bg-white border-b px-6 py-2.5 items-center justify-between sticky top-0 z-50 shadow-sm h-14">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToHub}>
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
             <Scale className="w-5 h-5 text-[#9c7d2c]" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">Lawyer <span className="text-[#9c7d2c]">Pro</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800 leading-none">{user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-gray-300 hover:text-red-500 transition-all"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white border-b sticky top-0 z-50 h-12">
        <div className="flex items-center space-x-2" onClick={handleBackToHub}>
          <Scale className="w-5 h-5 text-[#9c7d2c]" />
          <span className="font-black text-xs tracking-tight">Lawyer <span className="text-[#9c7d2c]">Pro</span></span>
        </div>
        <button onClick={handleLogout} className="text-gray-400"><LogOut className="w-4 h-4" /></button>
      </div>

      <main className="flex-1 overflow-y-auto">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation - Compact */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14 px-1 z-[100] shadow-lg">
        {[
          { icon: LayoutGrid, label: 'Início', view: 'HOME' },
          { icon: FileEdit, label: 'Editor', view: 'DASHBOARD_EDITOR' },
          { icon: Users, label: 'Clientes', view: 'CLIENTS' },
          { icon: Wallet, label: 'Finanças', view: 'FINANCES' }
        ].map((item) => (
          <button 
            key={item.view}
            onClick={() => setCurrentView(item.view as any)} 
            className={`flex flex-col items-center flex-1 py-1 ${currentView === item.view || (item.view === 'DASHBOARD_EDITOR' && currentView === 'EDITOR_SCREEN') ? 'text-[#9c7d2c]' : 'text-gray-400'}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="hidden md:block bg-white border-t py-3 text-center text-gray-400 text-[8px] font-bold uppercase tracking-[0.2em]">
        &copy; 2024 Lawyer Pro • Legal Technology Solutions
      </footer>
    </div>
  );
};

export default App;
