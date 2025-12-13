import React, { useState } from 'react';
import { AnalysisResult, VolumeOption } from '../types';

interface SimulationAngles {
  front: string | null;
  'side-left': string | null;
  'side-right': string | null;
}

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  onGenerateSimulation: (key: 'option1' | 'option2', option: VolumeOption, style?: 'realistic' | '3d-mesh', angle?: 'front' | 'side-left' | 'side-right') => void;
  isGeneratingSimulation: boolean;
  simulations: {
    option1: { realistic: SimulationAngles; '3d-mesh': SimulationAngles };
    option2: { realistic: SimulationAngles; '3d-mesh': SimulationAngles };
  };
  originalImage: string | null;
  originalImageMime: string;
  onShowRecommendations: (volume: number) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  onReset, 
  onGenerateSimulation,
  isGeneratingSimulation,
  simulations,
  originalImage,
  originalImageMime,
  onShowRecommendations
}) => {
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | null>(null);
  const [viewMode, setViewMode] = useState<'realistic' | '3d-mesh'>('realistic');
  const [angleMode, setAngleMode] = useState<'front' | 'side-left' | 'side-right'>('front');
  const [show3DModal, setShow3DModal] = useState(false);
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  const selectedVolume = selectedOption === 'option1' ? result.option1 : result.option2;

  const handleGenerateClick = (mode: 'realistic' | '3d-mesh', angle: 'front' | 'side-left' | 'side-right') => {
    if (!selectedOption || !selectedVolume) return;
    onGenerateSimulation(selectedOption, selectedVolume, mode, angle);
  };

  // Trigger generation specifically for current view/angle
  const triggerGenerate = () => {
    handleGenerateClick(viewMode, angleMode);
  };
  
  // Handler for generating from within the modal (forces 3d-mesh, current angle)
  const triggerModalGenerate = () => {
    if (selectedOption && selectedVolume) {
      onGenerateSimulation(selectedOption, selectedVolume, '3d-mesh', angleMode);
    }
  };

  const handleShare = async () => {
    // In a real app, this would save the state to a database and generate a unique ID
    const dummyUrl = window.location.href.split('?')[0] + '?result_id=' + Math.random().toString(36).substring(7);
    
    const shareData = {
      title: 'Kết quả Tư vấn IMPLEO By GC Aesthetics',
      text: 'Xem kết quả phân tích và mô phỏng ngực của tôi trên IMPLEO By GC Aesthetics.',
      url: dummyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('User cancelled share');
      }
    } else {
      try {
        await navigator.clipboard.writeText(dummyUrl);
        alert('Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  // Get current images based on selection
  const currentSimulationImage = selectedOption 
    ? simulations[selectedOption][viewMode][angleMode]
    : null;

  const open3DModal = () => {
    if (!selectedOption) setSelectedOption('option1');
    setShow3DModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. Simulation & Selection Section (Moved to TOP) */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="border-b border-slate-100 px-6 py-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-white">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                 </svg>
               </span>
               Mô phỏng Kết quả 3D
             </h3>
             <p className="text-slate-500 text-sm mt-1 md:ml-11">
               Trực quan hóa sự thay đổi vóc dáng với các tùy chọn túi ngực.
             </p>
           </div>
           
           <div className="flex items-center gap-2">
             <button 
               onClick={handleShare}
               className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
               title="Chia sẻ kết quả"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
               </svg>
               <span className="hidden sm:inline">Chia sẻ</span>
             </button>

             <button 
               onClick={open3DModal}
               className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
               </svg>
               Xem Sơ đồ 3D
             </button>
           </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Option Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1 - Changed to Orange */}
            <div 
              onClick={() => setSelectedOption('option1')}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedOption === 'option1' 
                  ? 'border-orange-500 bg-orange-50/40 shadow-xl shadow-orange-100/50 scale-[1.01]' 
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${selectedOption === 'option1' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${selectedOption === 'option1' ? 'text-orange-700' : 'text-slate-500'}`}>
                    Option 1
                  </span>
                </div>
                {selectedOption === 'option1' && (
                  <span className="text-orange-600">
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
                <div className="text-lg text-orange-600 font-semibold">{result.option1.cupSize}</div>
                <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  <span className="font-medium text-slate-700">Style:</span> "{result.option1.style}"
                </p>
              </div>
            </div>

            {/* Option 2 - Kept Purple for contrast/differentiation */}
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

          {/* New Recommendation CTA (Visible when option is selected) */}
          {selectedOption && selectedVolume && (
            <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                    </svg>
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">Bạn hài lòng với Size {selectedVolume.volume}cc?</h4>
                   <p className="text-sm text-slate-500">Tìm kiếm địa điểm thực hiện uy tín ngay.</p>
                 </div>
              </div>
              <button 
                onClick={() => onShowRecommendations(selectedVolume.volume)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transform transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Tìm Bác sĩ & CSYT</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
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

               {/* Before Image - Depends on Angle */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between px-1">
                   <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Hình ảnh gốc</span>
                   <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">BEFORE</span>
                 </div>
                 <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                   {originalImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={`data:${originalImageMime};base64,${originalImage}`} 
                          alt="Before" 
                          className="w-full h-full object-contain"
                        />
                        {/* Overlay text if showing side angle but original is front */}
                        {angleMode !== 'front' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                             <p className="text-slate-500 text-xs text-center px-4">
                               Chưa có ảnh gốc {angleMode === 'side-left' ? 'nghiêng trái' : 'nghiêng phải'}.<br/>
                               Hiển thị so sánh dựa trên tái tạo AI.
                             </p>
                          </div>
                        )}
                      </div>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                   )}
                   <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
                 </div>
               </div>

               {/* After Image */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between px-1">
                   <span className={`text-xs font-bold uppercase tracking-wider ${selectedVolume ? 'text-orange-600' : 'text-slate-400'}`}>
                     Mô phỏng {selectedVolume ? `(${selectedVolume?.volume}cc)` : ''}
                   </span>
                   <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">AFTER</span>
                 </div>
                 
                 {/* Angle Tabs */}
                 <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-2">
                    <button
                      onClick={() => setAngleMode('side-left')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${angleMode === 'side-left' ? 'bg-white shadow text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       <span>←</span> Trái
                    </button>
                    <button
                      onClick={() => setAngleMode('front')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded ${angleMode === 'front' ? 'bg-white shadow text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       Chính diện
                    </button>
                    <button
                      onClick={() => setAngleMode('side-right')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${angleMode === 'side-right' ? 'bg-white shadow text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       Phải <span>→</span>
                    </button>
                 </div>

                 {/* Style Tabs */}
                 <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 mb-1 shadow-sm">
                    <button 
                      onClick={() => setViewMode('realistic')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'realistic' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      Ảnh thực tế
                    </button>
                    <button 
                      onClick={() => setViewMode('3d-mesh')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === '3d-mesh' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                      3D / Wireframe
                    </button>
                 </div>

                 <div className={`relative aspect-[3/4] bg-white rounded-xl overflow-hidden border shadow-sm flex items-center justify-center transition-all ${
                     currentSimulationImage
                     ? 'border-orange-500/30 ring-4 ring-orange-500/5' 
                     : 'border-slate-200 border-dashed bg-slate-50/50'
                   }`}>
                   
                   {currentSimulationImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={`data:image/png;base64,${currentSimulationImage}`} 
                          alt="Simulation" 
                          className="w-full h-full object-contain animate-fade-in"
                        />
                        {/* Regenerate Button Overlay */}
                        <div className="absolute bottom-3 right-3">
                           <button
                              onClick={triggerGenerate}
                              disabled={isGeneratingSimulation}
                              className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-lg hover:bg-orange-50 hover:text-orange-600 transition-all border border-slate-200"
                              title="Tạo lại ảnh này"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isGeneratingSimulation ? 'animate-spin' : ''}`}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                             </svg>
                           </button>
                        </div>
                        {/* Angle Indicator Label */}
                        <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">
                          {angleMode === 'front' ? 'FRONT VIEW' : angleMode === 'side-left' ? 'LEFT PROFILE' : 'RIGHT PROFILE'}
                        </div>
                      </div>
                   ) : (
                      <div className="text-center p-6 text-slate-400">
                        {isGeneratingSimulation ? (
                           <div className="flex flex-col items-center gap-3">
                             <div className={`animate-spin h-8 w-8 border-2 ${viewMode === '3d-mesh' ? 'border-cyan-500' : 'border-orange-600'} border-t-transparent rounded-full`}></div>
                             <p className={`text-sm font-medium ${viewMode === '3d-mesh' ? 'text-cyan-600' : 'text-orange-600'}`}>
                               Đang tạo góc {angleMode === 'front' ? 'chính diện' : angleMode === 'side-left' ? 'nghiêng trái' : 'nghiêng phải'}...
                             </p>
                           </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                             {selectedOption ? (
                               <>
                                 <div className={`${viewMode === '3d-mesh' ? 'bg-cyan-50 text-cyan-600' : 'bg-orange-50 text-orange-600'} p-3 rounded-full`}>
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                   </svg>
                                 </div>
                                 <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Chưa có ảnh góc {angleMode === 'side-left' ? 'nghiêng trái' : angleMode === 'side-right' ? 'nghiêng phải' : 'này'}
                                 </p>
                                 <button 
                                   onClick={triggerGenerate}
                                   className={`px-5 py-2.5 ${viewMode === '3d-mesh' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'} text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105`}
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
                   )}
                   
                 </div>
               </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. Analysis Report Card - Collapsible Bottom Block */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
        {/* Header - Clickable to Toggle - Changed to Orange */}
        <div 
           onClick={() => setIsReportExpanded(!isReportExpanded)}
           className="bg-[#c2410c] px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#9a3412] transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/90">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
            <h2 className="text-white font-bold text-lg tracking-wide">Báo cáo Phân tích AI</h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="bg-white/10 backdrop-blur-sm text-orange-50 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 hidden sm:inline-block">
               Bấm để xem chi tiết
             </span>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 text-white transition-transform duration-300 ${isReportExpanded ? 'rotate-180' : ''}`}>
               <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
             </svg>
          </div>
        </div>

        {/* Collapsible Content */}
        {isReportExpanded && (
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/30 animate-fade-in border-t border-slate-100">
               
               {/* Column 1 */}
               <div className="p-6 md:p-8 flex flex-col hover:bg-white transition-colors">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                   </div>
                   <h3 className="text-slate-700 text-xs font-bold uppercase tracking-widest">PHÂN TÍCH HÌNH THỂ</h3>
                 </div>
                 <p className="text-slate-600 text-sm leading-7 text-justify flex-grow">{result.bodyAnalysis}</p>
               </div>
               
               {/* Column 2 */}
               <div className="p-6 md:p-8 flex flex-col hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                   </div>
                   <h3 className="text-slate-700 text-xs font-bold uppercase tracking-widest">LÝ GIẢI Y KHOA</h3>
                 </div>
                  <p className="text-slate-600 text-sm leading-7 text-justify flex-grow">{result.reasoning}</p>
               </div>
               
               {/* Column 3 */}
               <div className="p-6 md:p-8 flex flex-col hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                   </div>
                   <h3 className="text-slate-700 text-xs font-bold uppercase tracking-widest">LOẠI TÚI GỢI Ý</h3>
                 </div>
                  <div className="text-slate-600 text-sm leading-7 text-justify flex-grow">
                     {result.implantsTypeSuggestion}
                  </div>
               </div>

          </div>
        )}
      </div>
      
      {/* 3D Diagram Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in" onClick={() => setShow3DModal(false)}>
           <div className="bg-slate-950 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                 <div className="flex items-center gap-3">
                   <div className="bg-cyan-500/10 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                      </svg>
                   </div>
                   <div>
                      <h2 className="text-white font-bold text-lg">Mô phỏng Cấu trúc Implant 3D</h2>
                      <p className="text-slate-400 text-xs">Visualize with Wireframe & Transparent Implant Layer</p>
                   </div>
                 </div>
                 <button onClick={() => setShow3DModal(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                 
                 {/* Sidebar Controls */}
                 <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-6 space-y-6 overflow-y-auto z-10">
                    <div>
                      <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">Tùy chọn Implant</h4>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setSelectedOption('option1')}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${selectedOption === 'option1' ? 'bg-cyan-950/30 border-cyan-500/50 ring-1 ring-cyan-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                        >
                           <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-slate-400 uppercase">Option 1</span>
                             {selectedOption === 'option1' && <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
                           </div>
                           <div className="text-xl font-bold text-white">{result.option1.volume} cc</div>
                           <div className="text-sm text-cyan-200/70">{result.option1.cupSize}</div>
                        </button>

                        <button 
                          onClick={() => setSelectedOption('option2')}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${selectedOption === 'option2' ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                        >
                           <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-slate-400 uppercase">Option 2</span>
                             {selectedOption === 'option2' && <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>}
                           </div>
                           <div className="text-xl font-bold text-white">{result.option2.volume} cc</div>
                           <div className="text-sm text-purple-200/70">{result.option2.cupSize}</div>
                        </button>
                      </div>
                    </div>

                    {/* NEW: Angle Selection for 3D Modal */}
                    <div>
                       <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">Góc nhìn (View)</h4>
                       <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setAngleMode('side-left')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all border ${angleMode === 'side-left' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                          >
                             Left
                          </button>
                          <button 
                            onClick={() => setAngleMode('front')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all border ${angleMode === 'front' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                          >
                             Front
                          </button>
                          <button 
                            onClick={() => setAngleMode('side-right')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all border ${angleMode === 'side-right' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                          >
                             Right
                          </button>
                       </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                       <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Chú giải sơ đồ</h4>
                       <ul className="space-y-3 text-sm">
                          <li className="flex items-center gap-3">
                             <span className="h-3 w-3 rounded-full border border-cyan-400 bg-cyan-400/20"></span>
                             <span className="text-slate-300">Lưới Wireframe (Contour)</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <span className="h-3 w-3 rounded-full border border-amber-400 bg-amber-400/20"></span>
                             <span className="text-slate-300">Thể tích Implant (Bán trong suốt)</span>
                          </li>
                       </ul>
                    </div>
                 </div>

                 {/* Main Viewer - Always uses current selected angle/style/option */}
                 <div className="flex-1 bg-black relative flex items-center justify-center p-4">
                    {/* Grid Background Effect */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* 3D Modal Specific Viewer Logic - Use selectedOption & angleMode */}
                    {selectedOption && simulations[selectedOption]['3d-mesh'][angleMode] ? (
                       <div className="relative w-full h-full flex items-center justify-center">
                         <img 
                            src={`data:image/png;base64,${simulations[selectedOption]['3d-mesh'][angleMode]}`} 
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl relative z-10" 
                            alt="3D Wireframe Simulation"
                         />
                         {/* Angle Indicator for Modal */}
                         <div className="absolute top-4 left-4 bg-black/50 backdrop-blur border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20">
                            {angleMode === 'front' ? 'FRONT VIEW' : angleMode === 'side-left' ? 'LEFT PROFILE' : 'RIGHT PROFILE'}
                         </div>
                       </div>
                    ) : (
                       <div className="text-center z-10 max-w-md">
                          {isGeneratingSimulation ? (
                             <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin h-10 w-10 border-2 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                                <p className="text-cyan-400 font-medium animate-pulse">Đang dựng hình ảnh 3D Mesh...</p>
                                <p className="text-slate-500 text-sm">Quá trình này phân tích cấu trúc giải phẫu và tạo lớp phủ wireframe.</p>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className="w-10 h-10 text-slate-500">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                                   </svg>
                                </div>
                                <h3 className="text-white font-bold text-xl">Chưa có dữ liệu 3D</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                  Góc nhìn: {angleMode === 'front' ? 'Chính diện' : angleMode === 'side-left' ? 'Nghiêng Trái' : 'Nghiêng Phải'}.<br/>
                                  Nhấn nút bên dưới để tạo mô phỏng giải phẫu 3D.
                                </p>
                                <button 
                                  onClick={triggerModalGenerate}
                                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all transform hover:scale-105"
                                >
                                  Tạo Sơ đồ 3D Ngay
                                </button>
                             </div>
                          )}
                       </div>
                    )}
                 </div>

              </div>
           </div>
        </div>
      )}

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