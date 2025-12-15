
import React, { useState, useRef } from 'react';
import { PatientMetrics, DesiredLook } from '../types';

interface AnalysisFormProps {
  onSubmit: (metrics: PatientMetrics, imageFile: File) => void;
  isLoading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [metrics, setMetrics] = useState<PatientMetrics>({
    height: 160,
    weight: 50,
    breastWidth: 11.5,
    currentSize: 'Cup A',
    desiredLook: DesiredLook.NATURAL,
    age: 25,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên file hình ảnh (JPG, PNG).');
      return;
    }
    // Limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onSubmit(metrics, selectedFile);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin chỉ số</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Height, Weight & Age Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Chiều cao (cm)</label>
              <div className="relative">
                <input
                  type="number"
                  min="140"
                  max="200"
                  value={metrics.height}
                  onChange={(e) => setMetrics({ ...metrics, height: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Cân nặng (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  min="35"
                  max="120"
                  value={metrics.weight}
                  onChange={(e) => setMetrics({ ...metrics, weight: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Tuổi</label>
              <input
                type="number"
                min="18"
                max="70"
                value={metrics.age}
                onChange={(e) => setMetrics({ ...metrics, age: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold transition-all"
              />
            </div>
          </div>

          {/* Breast Width & Current Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-500">Bề rộng chân ngực (cm)</label>
                <button 
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="text-xs text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Hướng dẫn đo
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="8"
                  max="20"
                  step="0.5"
                  value={metrics.breastWidth}
                  onChange={(e) => setMetrics({ ...metrics, breastWidth: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold transition-all"
                  placeholder="VD: 11.5"
                />
              </div>
              <p className="text-xs text-slate-400">Đo chiều ngang bầu ngực (BW)</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Hiện tại (Ước lượng)</label>
              <select
                value={metrics.currentSize}
                onChange={(e) => setMetrics({ ...metrics, currentSize: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold appearance-none transition-all"
              >
                <option>Phẳng / Lép</option>
                <option>Cup A (Nhỏ)</option>
                <option>Cup B (Vừa)</option>
                <option>Cup C (Đầy)</option>
                <option>Không đều</option>
                <option>Sa trễ</option>
              </select>
            </div>
          </div>

          {/* Desired Look */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-500">Mong muốn thẩm mỹ</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(DesiredLook).map((look) => (
                <button
                  key={look}
                  type="button"
                  onClick={() => setMetrics({ ...metrics, desiredLook: look })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                    metrics.desiredLook === look
                      ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {look.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 flex justify-between">
               <span>Hình ảnh phân tích (Thân trên)</span>
               <span className="text-orange-600 text-xs font-bold">* Bắt buộc</span>
            </label>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 overflow-hidden ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50 scale-[1.01] shadow-lg' 
                  : previewUrl 
                    ? 'border-slate-300 bg-white' 
                    : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'
              }`}
            >
              {/* Inputs */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment" // Force rear camera on mobile
                className="hidden"
                ref={cameraInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="relative w-full h-64 md:h-80 bg-slate-100 rounded-xl overflow-hidden group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  
                  {/* Remove Button */}
                  <button 
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-slate-900/70 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors shadow-md z-10"
                    title="Xóa ảnh"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                    {isDragging ? (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 animate-bounce">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                       </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H2.25A2.25 2.25 0 000 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                       </svg>
                    )}
                  </div>
                  
                  {/* Dual Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                    >
                       Chọn ảnh từ máy
                    </button>
                    <button 
                       type="button"
                       onClick={() => cameraInputRef.current?.click()}
                       className="flex-1 py-2 px-4 bg-orange-100 border border-orange-200 rounded-lg text-orange-700 font-semibold hover:bg-orange-200 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                         <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm8 9a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM8 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
                       </svg>
                       Chụp ảnh ngay
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-3">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              !selectedFile || isLoading
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AI đang phân tích...</span>
              </>
            ) : (
              <>
                <span>Bắt đầu Phân tích AI</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Measurement Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">Cách đo Bề rộng chân ngực (BW)</h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600">
              <p>Chỉ số BW (Breast Width) giúp xác định <strong>đường kính túi ngực</strong> phù hợp nhất với khung xương của bạn, tránh tình trạng lộ túi hoặc túi quá bè.</p>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-center items-center">
                {/* Visual illustration */}
                <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Body outline */}
                  <path d="M50 110 C 50 40, 50 20, 100 20 C 150 20, 150 40, 150 110" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
                  {/* Breast outline */}
                  <path d="M60 110 C 60 60, 140 60, 140 110" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4"/>
                  {/* Measurement line */}
                  <path d="M60 100 L 140 100" stroke="#ea580c" strokeWidth="3" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)"/>
                  <path d="M60 105 L 60 95" stroke="#ea580c" strokeWidth="2"/>
                  <path d="M140 105 L 140 95" stroke="#ea580c" strokeWidth="2"/>
                  {/* Text */}
                  <text x="100" y="85" textAnchor="middle" fill="#c2410c" fontSize="14" fontWeight="bold">BW</text>
                  <text x="100" y="115" textAnchor="middle" fill="#64748b" fontSize="10">Chân ngực</text>
                </svg>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                 <h4 className="font-semibold text-orange-800 mb-1">Các bước đo:</h4>
                 <ul className="list-decimal pl-5 space-y-1 text-orange-700">
                    <li>Đứng thẳng, thả lỏng cơ thể.</li>
                    <li>Dùng thước đo khoảng cách ngang chân ngực.</li>
                    <li>Điểm đầu: Chân ngực trong (cạnh xương ức).</li>
                    <li>Điểm cuối: Chân ngực ngoài (phía nách).</li>
                    <li>Đo theo đường thẳng, không vòng qua bầu ngực.</li>
                 </ul>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
