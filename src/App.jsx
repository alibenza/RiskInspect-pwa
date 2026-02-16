import InspectionForm from './components/InspectionForm';
import Dashboard from './components/Dashboard';
import GarantieSelector from './components/GarantieSelector';
import AIAnalysis from './components/AIAnalysis';
import { ClipboardList, LayoutDashboard, BrainCircuit, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('inspect');
  const [isStarted, setIsStarted] = useState(false);
  const { loadFromLocalStorage, selectedGaranties } = useInspectionStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const startAudit = () => {
    if (selectedGaranties.length > 0) setIsStarted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-md mx-auto px-6 pt-8">
        
        {/* ONGLET INSPECTION */}
        {activeTab === 'inspect' && (
          !isStarted ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <GarantieSelector />
              <button 
                onClick={startAudit}
                disabled={selectedGaranties.length === 0}
                className={`w-full py-5 rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest flex items-center justify-center space-x-2 ${
                  selectedGaranties.length > 0 ? 'bg-blue-600 text-white active:scale-95' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Shield size={20} />
                <span>Démarrer l'Expertise</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setIsStarted(false)} className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center">
                <span className="mr-1">←</span> Modifier les garanties
              </button>
              <InspectionForm />
            </div>
          )
        )}

        {/* ONGLET ANALYSE IA */}
        {activeTab === 'analysis' && <AIAnalysis />}

        {/* ONGLET DASHBOARD */}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>

      {/* NAVIGATION BASSE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-[100]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => {setActiveTab('inspect'); setIsStarted(false);}} className={`flex flex-col items-center space-y-1 ${activeTab === 'inspect' ? 'text-blue-600' : 'text-slate-300'}`}>
            <ClipboardList size={22} /><span className="text-[9px] font-black uppercase">Audit</span>
          </button>

          <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center space-y-1 ${activeTab === 'analysis' ? 'text-indigo-600' : 'text-slate-300'}`}>
            <BrainCircuit size={22} /><span className="text-[9px] font-black uppercase">IA Analyse</span>
          </button>

          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center space-y-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}>
            <LayoutDashboard size={22} /><span className="text-[9px] font-black uppercase">Stats</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
