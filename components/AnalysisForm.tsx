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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold appearance-none"
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

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500">Hình ảnh phân tích (Thân trên)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                previewUrl ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="relative h-48 w-full">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full">Thay đổi</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="mx-auto h-12 w-12 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">Nhấn để tải ảnh hoặc chụp ảnh</p>
                  <p className="text-xs text-slate-400">JPG, PNG (Tối đa 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 ${
              !selectedFile || isLoading
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-orange-600 hover:bg-orange-500'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang phân tích AI...</span>
              </span>
            ) : (
              'Bắt đầu Phân tích'
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