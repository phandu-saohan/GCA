import React, { useState } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { AnalysisForm } from './components/AnalysisForm';
import { ResultDisplay } from './components/ResultDisplay';
import { PatientMetrics, AnalysisResult, ProcessingState, VolumeOption } from './types';
import { analyzePatient, generateSimulationImage } from './services/geminiService';

// Define simulation state structure
type SimulationData = {
  realistic: string | null;
  '3d-mesh': string | null;
};

type SimulationsState = {
  option1: SimulationData;
  option2: SimulationData;
};

const App: React.FC = () => {
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    stage: 'idle',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // State for simulation - now keyed by option
  const [currentMetrics, setCurrentMetrics] = useState<PatientMetrics | null>(null);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [currentImageMime, setCurrentImageMime] = useState<string>('');
  
  const [simulations, setSimulations] = useState<SimulationsState>({
    option1: { realistic: null, '3d-mesh': null },
    option2: { realistic: null, '3d-mesh': null },
  });
  
  const [isGeneratingSimulation, setIsGeneratingSimulation] = useState(false);

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
    // Reset simulations on new analysis
    setSimulations({
      option1: { realistic: null, '3d-mesh': null },
      option2: { realistic: null, '3d-mesh': null },
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
    style: 'realistic' | '3d-mesh' = 'realistic'
  ) => {
    if (!analysisResult || !currentMetrics || !currentImageBase64) return;

    setIsGeneratingSimulation(true);
    
    // Clear specific slot to indicate loading for that view
    setSimulations(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [style]: null
      }
    }));
    
    try {
      const simulatedImageBase64 = await generateSimulationImage(
        currentMetrics,
        selectedOption.volume,
        selectedOption.cupSize,
        currentImageBase64,
        currentImageMime,
        style
      );
      
      setSimulations(prev => ({
        ...prev,
        [optionKey]: {
          ...prev[optionKey],
          [style]: simulatedImageBase64
        }
      }));

    } catch (error: any) {
       console.error("Simulation Error:", error);
       alert("Hệ thống AI đang bận hoặc gặp lỗi xử lý ảnh. Vui lòng thử lại sau giây lát.");
    } finally {
      setIsGeneratingSimulation(false);
    }
  };

  const resetApp = () => {
    setAnalysisResult(null);
    setSimulations({
      option1: { realistic: null, '3d-mesh': null },
      option2: { realistic: null, '3d-mesh': null },
    });
    setProcessingState({ isLoading: false, error: null, stage: 'idle' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Aesthetica<span className="text-teal-600">.AI</span>
            </h1>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            BETA 1.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {!hasAgreedToDisclaimer && (
          <DisclaimerModal onAccept={() => setHasAgreedToDisclaimer(true)} />
        )}

        <div className="mb-10 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Tư vấn Vòng 1 <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">
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
          <ResultDisplay 
            result={analysisResult} 
            onReset={resetApp} 
            onGenerateSimulation={handleGenerateSimulation}
            isGeneratingSimulation={isGeneratingSimulation}
            simulations={simulations}
            originalImage={currentImageBase64}
            originalImageMime={currentImageMime}
          />
        ) : (
          <AnalysisForm onSubmit={handleAnalysisSubmit} isLoading={processingState.isLoading} />
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm py-8 px-4 border-t border-slate-200 mt-8">
        <p>© 2024 Aesthetica AI. Công cụ hỗ trợ tư vấn, không thay thế bác sĩ.</p>
      </footer>
    </div>
  );
};

export default App;