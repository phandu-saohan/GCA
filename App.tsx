
import React, { useState, useEffect } from 'react';
import { AnalysisForm } from './components/AnalysisForm';
import { ResultDisplay } from './components/ResultDisplay';
import { RecommendationHub } from './components/RecommendationHub';
import { AdminDashboard } from './components/AdminDashboard';
import { PatientMetrics, AnalysisResult, ProcessingState, VolumeOption, Product, Clinic, Doctor } from './types';
import { analyzePatient, generateSimulationImage } from './services/geminiService';
import { IMPLANT_PRODUCTS, REPUTABLE_CLINICS, REPUTABLE_DOCTORS } from './data/resources';

// Mock User Type
interface MockUser {
  uid: string;
  email: string;
}

// Define simulation state structure
type SimulationAngles = {
  front: string | null;
  'side-left': string | null;
  'side-right': string | null;
}

type SimulationData = {
  realistic: SimulationAngles;
  '3d-mesh': SimulationAngles;
};

type SimulationsState = {
  option1: SimulationData;
  option2: SimulationData;
};

const initialSimulationData: SimulationData = {
  realistic: { front: null, 'side-left': null, 'side-right': null },
  '3d-mesh': { front: null, 'side-left': null, 'side-right': null }
};

const App: React.FC = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    stage: 'idle',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // App Data State (Lifted up for Admin Management)
  const [products, setProducts] = useState<Product[]>(IMPLANT_PRODUCTS);
  const [clinics, setClinics] = useState<Clinic[]>(REPUTABLE_CLINICS);
  const [doctors, setDoctors] = useState<Doctor[]>(REPUTABLE_DOCTORS);
  
  // Auth & View State
  const [user, setUser] = useState<MockUser | null>(null);
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  
  // State for simulation - now keyed by option
  const [currentMetrics, setCurrentMetrics] = useState<PatientMetrics | null>(null);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [currentImageMime, setCurrentImageMime] = useState<string>('');
  
  const [simulations, setSimulations] = useState<SimulationsState>({
    option1: JSON.parse(JSON.stringify(initialSimulationData)),
    option2: JSON.parse(JSON.stringify(initialSimulationData)),
  });
  
  const [isGeneratingSimulation, setIsGeneratingSimulation] = useState(false);
  
  // New state to control recommendation visibility
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedVolumeForRec, setSelectedVolumeForRec] = useState<number | undefined>(undefined);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Listen for auth state changes (Mock)
  useEffect(() => {
    // Check local storage for persistent login session if needed
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setViewMode('admin');
    }
  }, []);

  // Helper to optimize image (resize & compress) to avoid payload limits/timeouts and 500 errors
  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_DIM = 1024; // Limit to 1024px for better API stability with Gemini 2.5 Flash Image
        let width = img.width;
        let height = img.height;

        // Resize logic
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Không thể xử lý hình ảnh"));
          return;
        }
        
        // Fill white background to handle potential transparency issues
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 0.85 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        // Remove data URL prefix
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
    });
  };

  const handleAnalysisSubmit = async (metrics: PatientMetrics, imageFile: File) => {
    setProcessingState({ isLoading: true, error: null, stage: 'analyzing' });
    setAnalysisResult(null);
    setShowRecommendations(false); // Reset recommendations on new analysis
    // Reset simulations on new analysis
    setSimulations({
      option1: JSON.parse(JSON.stringify(initialSimulationData)),
      option2: JSON.parse(JSON.stringify(initialSimulationData)),
    });

    try {
      // Use optimized image for API calls to prevent 500 Internal Errors
      const base64Image = await optimizeImage(imageFile);
      const mimeType = 'image/jpeg'; // Always JPEG after optimization

      // Store for later use in simulation
      setCurrentImageBase64(base64Image);
      setCurrentImageMime(mimeType);
      setCurrentMetrics(metrics);

      const result = await analyzePatient(metrics, base64Image, mimeType);
      
      setAnalysisResult(result);
      setProcessingState({ isLoading: false, error: null, stage: 'complete' });
      
      // Scroll to top to see results
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error("Analysis Error:", err);
      setProcessingState({ 
        isLoading: false, 
        error: err.message || "Đã xảy ra lỗi trong quá trình phân tích. Vui lòng thử lại.", 
        stage: 'idle' 
      });
    }
  };

  const handleGenerateSimulation = async (
    optionKey: 'option1' | 'option2',
    selectedOption: VolumeOption, 
    style: 'realistic' | '3d-mesh' = 'realistic',
    angle: 'front' | 'side-left' | 'side-right' = 'front'
  ) => {
    if (!analysisResult || !currentMetrics || !currentImageBase64) return;

    setIsGeneratingSimulation(true);
    
    // Clear specific slot to indicate loading for that view
    setSimulations(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [style]: {
           ...prev[optionKey][style],
           [angle]: null
        }
      }
    }));
    
    try {
      const simulatedImageBase64 = await generateSimulationImage(
        currentMetrics,
        selectedOption.volume,
        selectedOption.cupSize,
        currentImageBase64,
        currentImageMime,
        style,
        angle
      );
      
      setSimulations(prev => ({
        ...prev,
        [optionKey]: {
          ...prev[optionKey],
          [style]: {
            ...prev[optionKey][style],
            [angle]: simulatedImageBase64
          }
        }
      }));

    } catch (error: any) {
       console.error("Simulation Error:", error);
       alert("Hệ thống AI đang bận hoặc gặp lỗi xử lý ảnh. Vui lòng thử lại sau giây lát.");
    } finally {
      setIsGeneratingSimulation(false);
    }
  };

  const handleShowRecommendations = (volume: number) => {
    setSelectedVolumeForRec(volume);
    setShowRecommendations(true);
    // Smooth scroll to recommendation section after slight delay to ensure render
    setTimeout(() => {
      document.getElementById('recommendation-hub')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetApp = () => {
    setAnalysisResult(null);
    setShowRecommendations(false);
    setSimulations({
      option1: JSON.parse(JSON.stringify(initialSimulationData)),
      option2: JSON.parse(JSON.stringify(initialSimulationData)),
    });
    setProcessingState({ isLoading: false, error: null, stage: 'idle' });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Mock Login Logic
    setTimeout(() => {
      if (loginEmail === 'admin@impleo.com' && loginPassword === 'admin123') {
        const mockUser = { uid: 'mock-123', email: loginEmail };
        setUser(mockUser);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setViewMode('admin');
        setIsLoginModalOpen(false);
      } else {
        setLoginError('Email hoặc mật khẩu không chính xác (Thử: admin@impleo.com / admin123)');
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    setViewMode('client');
  };

  // Render Admin Dashboard
  if (viewMode === 'admin' && user) {
    return (
      <AdminDashboard
        products={products}
        clinics={clinics}
        doctors={doctors}
        onUpdateProducts={setProducts}
        onUpdateClinics={setClinics}
        onUpdateDoctors={setDoctors}
        onExit={handleLogout}
      />
    );
  }

  // Render Client App
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 text-orange-600 flex items-center justify-center">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fillOpacity="0" />
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" className="text-orange-600"/>
                  <path d="M15.5 8.5c-.8-.8-2-1.3-3.5-1.3-2.8 0-5 2.2-5 5s2.2 5 5 5c2.4 0 4.4-1.7 4.9-4h-2.1c-.4 1-1.5 2-2.8 2-1.7 0-3-1.3-3-3s1.3-3 3-3c.8 0 1.5.3 2 .8l1.5-1.5z" className="text-orange-600"/> 
               </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-none">
                IMPLEO<span className="text-xs align-top -mt-1 ml-0.5 text-slate-400 font-normal">™</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                By GC Aesthetics®
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-wider">
               AI Consultation Beta
             </div>
             {user ? (
               <button
                 onClick={() => setViewMode('admin')}
                 className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-lg"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                 </svg>
                 <span className="hidden sm:inline">Admin Dashboard</span>
               </button>
             ) : (
               <button
                 onClick={() => setIsLoginModalOpen(true)}
                 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                 </svg>
                 <span className="hidden sm:inline">Đăng nhập</span>
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="mb-10 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Tư vấn Vòng 1 <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Cá nhân hóa bởi AI
            </span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Tải lên hình ảnh và thông số của bạn. AI sẽ phân tích cấu trúc cơ thể để đưa ra 2 gợi ý phù hợp nhất.
          </p>
        </div>

        {processingState.error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold">Không thể phân tích</h3>
              <p className="text-red-600 text-sm mt-1">{processingState.error}</p>
            </div>
          </div>
        )}

        {analysisResult ? (
          <>
            <ResultDisplay 
              result={analysisResult} 
              onReset={resetApp} 
              onGenerateSimulation={handleGenerateSimulation}
              isGeneratingSimulation={isGeneratingSimulation}
              simulations={simulations}
              originalImage={currentImageBase64}
              originalImageMime={currentImageMime}
              onShowRecommendations={handleShowRecommendations}
            />
            
            {showRecommendations && (
              <RecommendationHub 
                selectedVolume={selectedVolumeForRec} 
                products={products}
                clinics={clinics}
                doctors={doctors}
              />
            )}
          </>
        ) : (
          <AnalysisForm onSubmit={handleAnalysisSubmit} isLoading={processingState.isLoading} />
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-8 px-4 border-t border-slate-200 mt-8">
        <p className="mb-2">© 2024 IMPLEO By GC Aesthetics. Công cụ hỗ trợ tư vấn, không thay thế bác sĩ.</p>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập Quản trị</h3>
                 <p className="text-sm text-slate-500 mb-6">Sử dụng tài khoản quản trị nội bộ.</p>
                 
                 <div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs text-blue-800 border border-blue-100">
                    <p><strong>Demo Account:</strong></p>
                    <p>Email: admin@impleo.com</p>
                    <p>Pass: admin123</p>
                 </div>
                 
                 <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                      <input 
                         type="email" 
                         value={loginEmail}
                         onChange={(e) => {
                           setLoginEmail(e.target.value);
                           setLoginError('');
                         }}
                         className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                         placeholder="admin@impleo.com"
                         autoFocus
                         required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Mật khẩu</label>
                      <input 
                         type="password" 
                         value={loginPassword}
                         onChange={(e) => {
                           setLoginPassword(e.target.value);
                           setLoginError('');
                         }}
                         className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                         placeholder="••••••••"
                         required
                      />
                      {loginError && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {loginError}
                      </p>}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                       <button 
                         type="button" 
                         onClick={() => {
                           setIsLoginModalOpen(false);
                           setLoginError('');
                           setLoginPassword('');
                           setLoginEmail('');
                         }}
                         className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                         disabled={isLoggingIn}
                       >
                         Hủy
                       </button>
                       <button 
                         type="submit" 
                         className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                         disabled={isLoggingIn}
                       >
                         {isLoggingIn && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                         Đăng nhập
                       </button>
                    </div>
                 </form>
              </div>
              <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                 <p className="text-xs text-slate-400">GC Aesthetics Secure System</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
