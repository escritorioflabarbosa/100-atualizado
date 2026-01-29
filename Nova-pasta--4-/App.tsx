
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.tsx';
import Editor from './components/Editor.tsx';
import Login from './components/Login.tsx';
import Home from './components/Home.tsx';
import Finances from './components/Finances.tsx';
import Clients from './components/Clients.tsx';
import { ContractType, HistoryItem, User, Client } from './types.ts';
import { Scale, LogOut, Bell, LayoutGrid } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'HOME' | 'DASHBOARD_EDITOR' | 'EDITOR_SCREEN' | 'FINANCES' | 'CLIENTS'>('HOME');
  const [selectedType, setSelectedType] = useState<ContractType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Carregar sessão e histórico inicial do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('lawyer_editor_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedHistory = localStorage.getItem('lawyer_editor_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }

    const savedClients = localStorage.getItem('lawyer_editor_clients');
    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (e) {
        console.error("Erro ao carregar clientes", e);
      }
    }
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

  const handleSelectModule = (module: 'EDITOR' | 'FINANCES' | 'CLIENTS') => {
    if (module === 'EDITOR') setCurrentView('DASHBOARD_EDITOR');
    else if (module === 'CLIENTS') setCurrentView('CLIENTS');
    else setCurrentView('FINANCES');
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
    const updatedClients = [
      { ...newClient, paymentHistory: [] }, // Inicializa histórico de pagamento
      ...clients
    ];
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'CLIENTS') {
    return <Clients 
      user={user} 
      clients={clients} 
      history={history} 
      onBack={handleBackToHub} 
      onValidateClient={handleValidateClient}
      onRemoveClient={handleRemoveClient}
    />;
  }

  if (currentView === 'FINANCES') {
    return <Finances 
      user={user} 
      clients={clients} 
      onBack={handleBackToHub} 
      onUpdateClient={handleUpdateClient}
    />;
  }

  if (currentView === 'EDITOR_SCREEN' && selectedType) {
    return <Editor type={selectedType} onBack={() => setCurrentView('DASHBOARD_EDITOR')} onSaveToHistory={addToHistory} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToHub}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
             <Scale className="w-6 h-6 text-[#9c7d2c]" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Lawyer <span className="text-[#9c7d2c]">Pro</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          {currentView !== 'HOME' && (
            <button 
              onClick={handleBackToHub}
              className="text-gray-500 hover:text-black font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Início</span>
            </button>
          )}

          <div className="flex items-center space-x-3 pl-6 border-l">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">{user.user_metadata?.full_name || user.email.split('@')[0]}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                {user.role === 'ADVOGADO' ? 'Advogado Premium' : 'Colaborador'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100 shadow-inner">
              <img 
                src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {currentView === 'HOME' ? (
          <Home user={user} clients={clients} onSelectModule={handleSelectModule} />
        ) : (
          <Dashboard onStartContract={handleStartContract} history={history} />
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2024 Lawyer Pro • Legal Technology Solutions
      </footer>
    </div>
  );
};

export default App;
