import React, { useState } from 'react';
import { AnalysisResult, VolumeOption } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  onGenerateSimulation: (key: 'option1' | 'option2', option: VolumeOption, style?: 'realistic' | '3d-mesh') => void;
  isGeneratingSimulation: boolean;
  simulations: {
    option1: { realistic: string | null; '3d-mesh': string | null };
    option2: { realistic: string | null; '3d-mesh': string | null };
  };
  originalImage: string | null;
  originalImageMime: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  onReset, 
  onGenerateSimulation,
  isGeneratingSimulation,
  simulations,
  originalImage,
  originalImageMime
}) => {
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | null>(null);
  const [viewMode, setViewMode] = useState<'realistic' | '3d-mesh'>('realistic');

  const selectedVolume = selectedOption === 'option1' ? result.option1 : result.option2;

  const handleGenerateClick = (mode: 'realistic' | '3d-mesh') => {
    if (!selectedOption || !selectedVolume) return;
    onGenerateSimulation(selectedOption, selectedVolume, mode);
  };

  // Auto-switch view mode if user explicitly generates one type
  const triggerGenerate = (mode: 'realistic' | '3d-mesh') => {
    setViewMode(mode);
    handleGenerateClick(mode);
  };

  // Get current images based on selection
  const currentSimulationImage = selectedOption 
    ? simulations[selectedOption].realistic 
    : null;
    
  const current3DImage = selectedOption 
    ? simulations[selectedOption]['3d-mesh']
    : null;

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* 1. Analysis Report Card - Professional Horizontal Layout */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#0f766e] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/90">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
            <h2 className="text-white font-bold text-lg tracking-wide">Báo cáo Phân tích AI</h2>
          </div>
          <span className="bg-white/10 backdrop-blur-sm text-teal-50 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
            Gemini Medical AI
          </span>
        </div>

        {/* 3-Column Content */}
        <div className="p-6 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Column 1 */}
             <div className="bg-slate-50/80 rounded-2xl p-6 h-full flex flex-col border border-slate-100">
               <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">PHÂN TÍCH HÌNH THỂ</h3>
               <p className="text-slate-600 text-sm leading-7 text-justify flex-grow">{result.bodyAnalysis}</p>
             </div>
             
             {/* Column 2 */}
             <div className="bg-slate-50/80 rounded-2xl p-6 h-full flex flex-col border border-slate-100">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">LÝ GIẢI Y KHOA</h3>
                <p className="text-slate-600 text-sm leading-7 text-justify flex-grow">{result.reasoning}</p>
             </div>
             
             {/* Column 3 */}
             <div className="bg-slate-50/80 rounded-2xl p-6 h-full flex flex-col border border-slate-100">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">LOẠI TÚI GỢI Ý</h3>
                <div className="text-slate-600 text-sm leading-7 text-justify flex-grow">
                   {result.implantsTypeSuggestion}
                </div>
             </div>

           </div>
        </div>
      </div>

      {/* 2. Simulation & Selection Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="border-b border-slate-100 px-6 py-5 bg-white">
           <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-white">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
               </svg>
             </span>
             Mô phỏng Kết quả 3D
           </h3>
           <p className="text-slate-500 text-sm mt-1 ml-11">
             Trực quan hóa sự thay đổi vóc dáng với các tùy chọn túi ngực.
           </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Option Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1 */}
            <div 
              onClick={() => setSelectedOption('option1')}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedOption === 'option1' 
                  ? 'border-teal-500 bg-teal-50/40 shadow-xl shadow-teal-100/50 scale-[1.01]' 
                  : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${selectedOption === 'option1' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${selectedOption === 'option1' ? 'text-teal-700' : 'text-slate-500'}`}>
                    Option 1
                  </span>
                </div>
                {selectedOption === 'option1' && (
                  <span className="text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-slate-800 tracking-tight">
                  {result.option1.volume} <span className="text-xl font-medium text-slate-400">cc</span>
                </div>
                <div className="text-lg text-teal-600 font-semibold">{result.option1.cupSize}</div>
                <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  <span className="font-medium text-slate-700">Style:</span> "{result.option1.style}"
                </p>
              </div>
            </div>

            {/* Option 2 */}
            <div 
              onClick={() => setSelectedOption('option2')}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedOption === 'option2' 
                  ? 'border-purple-500 bg-purple-50/40 shadow-xl shadow-purple-100/50 scale-[1.01]' 
                  : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${selectedOption === 'option2' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${selectedOption === 'option2' ? 'text-purple-700' : 'text-slate-500'}`}>
                    Option 2
                  </span>
                </div>
                {selectedOption === 'option2' && (
                  <span className="text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-slate-800 tracking-tight">
                  {result.option2.volume} <span className="text-xl font-medium text-slate-400">cc</span>
                </div>
                <div className="text-lg text-purple-600 font-semibold">{result.option2.cupSize}</div>
                <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  <span className="font-medium text-slate-700">Style:</span> "{result.option2.style}"
                </p>
              </div>
            </div>
          </div>

          {/* Action Button for Initial Generation */}
          {!selectedOption && (
            <div className="flex justify-center py-2">
               <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full">
                 <span>👆</span> Vui lòng chọn một phương án ở trên để bắt đầu mô phỏng
               </div>
            </div>
          )}

          {/* Visual Comparison Area */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
               
               {/* Decorative Arrow on Desktop */}
               <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                  </svg>
               </div>

               {/* Before Image */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between px-1">
                   <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Hình ảnh gốc</span>
                   <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">BEFORE</span>
                 </div>
                 <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                   {originalImage ? (
                      <img 
                        src={`data:${originalImageMime};base64,${originalImage}`} 
                        alt="Before" 
                        className="w-full h-full object-contain"
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                   )}
                   <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
                 </div>
               </div>

               {/* After Image */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between px-1">
                   <span className={`text-xs font-bold uppercase tracking-wider ${selectedVolume ? 'text-indigo-600' : 'text-slate-400'}`}>
                     Mô phỏng {selectedVolume ? `(${selectedVolume?.volume}cc)` : ''}
                   </span>
                   <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">AFTER</span>
                 </div>
                 
                 {/* 3D Tabs */}
                 <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 mb-1 shadow-sm">
                    <button 
                      onClick={() => setViewMode('realistic')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'realistic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      Ảnh thực tế
                    </button>
                    <button 
                      onClick={() => setViewMode('3d-mesh')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === '3d-mesh' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      3D / Wireframe
                    </button>
                 </div>

                 <div className={`relative aspect-[3/4] bg-white rounded-xl overflow-hidden border shadow-sm flex items-center justify-center transition-all ${
                     (viewMode === 'realistic' ? currentSimulationImage : current3DImage) 
                     ? 'border-indigo-500/30 ring-4 ring-indigo-500/5' 
                     : 'border-slate-200 border-dashed bg-slate-50/50'
                   }`}>
                   
                   {/* Realistic View Logic */}
                   {viewMode === 'realistic' && (
                     currentSimulationImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={`data:image/png;base64,${currentSimulationImage}`} 
                            alt="Simulation Realistic" 
                            className="w-full h-full object-contain animate-fade-in"
                          />
                          {/* Regenerate Button Overlay */}
                          <div className="absolute bottom-3 right-3">
                             <button
                                onClick={() => triggerGenerate('realistic')}
                                disabled={isGeneratingSimulation}
                                className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                                title="Tạo lại ảnh này"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isGeneratingSimulation ? 'animate-spin' : ''}`}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                               </svg>
                             </button>
                          </div>
                        </div>
                     ) : (
                        <div className="text-center p-6 text-slate-400">
                          {isGeneratingSimulation ? (
                             <div className="flex flex-col items-center gap-3">
                               <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                               <p className="text-sm font-medium text-indigo-600">Đang xử lý hình ảnh...</p>
                             </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                               {selectedOption ? (
                                 <>
                                   <div className="bg-indigo-50 p-3 rounded-full">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                     </svg>
                                   </div>
                                   <button 
                                     onClick={() => triggerGenerate('realistic')}
                                     className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                                   >
                                     Tạo ảnh mô phỏng
                                   </button>
                                 </>
                               ) : (
                                 <p className="text-xs text-slate-400">Chọn size túi để xem</p>
                               )}
                            </div>
                          )}
                        </div>
                     )
                   )}

                   {/* 3D Mesh View Logic */}
                   {viewMode === '3d-mesh' && (
                     current3DImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={`data:image/png;base64,${current3DImage}`} 
                            alt="Simulation 3D" 
                            className="w-full h-full object-contain animate-fade-in"
                          />
                           {/* Regenerate Button Overlay */}
                           <div className="absolute bottom-3 right-3">
                             <button
                                onClick={() => triggerGenerate('3d-mesh')}
                                disabled={isGeneratingSimulation}
                                className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-lg hover:bg-cyan-50 hover:text-cyan-600 transition-all border border-slate-200"
                                title="Tạo lại ảnh 3D này"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isGeneratingSimulation ? 'animate-spin' : ''}`}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                               </svg>
                             </button>
                          </div>
                        </div>
                     ) : (
                        <div className="text-center p-6 text-slate-400">
                          {isGeneratingSimulation ? (
                             <div className="flex flex-col items-center gap-3">
                               <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                               <p className="text-sm font-medium text-cyan-600">Đang dựng lưới 3D...</p>
                             </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                               <div className="bg-cyan-50 p-3 rounded-full">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-cyan-600">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                                 </svg>
                               </div>
                               {selectedOption ? (
                                 <button 
                                   onClick={() => triggerGenerate('3d-mesh')}
                                   className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-200 transition-all hover:scale-105"
                                 >
                                   Tạo mô phỏng 3D
                                 </button>
                               ) : (
                                 <p className="text-xs text-slate-400">Chọn size túi để xem</p>
                               )}
                            </div>
                          )}
                        </div>
                     )
                   )}
                   
                 </div>
               </div>

            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="text-slate-500 hover:text-slate-800 font-semibold py-3 px-6 flex items-center gap-2 transition-colors hover:bg-slate-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Thực hiện phân tích mới
        </button>
      </div>
    </div>
  );
};