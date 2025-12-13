
import React, { useState } from 'react';
import { Product, Clinic, Doctor } from '../types';

interface RecommendationHubProps {
  selectedVolume?: number;
  products: Product[];
  clinics: Clinic[];
  doctors: Doctor[];
}

export const RecommendationHub: React.FC<RecommendationHubProps> = ({ 
  selectedVolume,
  products,
  clinics,
  doctors
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'clinics' | 'doctors'>('products');

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up mt-8" id="recommendation-hub">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Hệ sinh thái IMPLEO</h2>
        <p className="text-slate-300">
          Kết nối với các giải pháp túi ngực hàng đầu và mạng lưới y khoa uy tín.
          {selectedVolume && <span className="block mt-1 text-orange-400 font-semibold">Gợi ý cho size {selectedVolume}cc của bạn.</span>}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Túi ngực IMPLEO
        </button>
        <button
          onClick={() => setActiveTab('clinics')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all border-b-2 ${
            activeTab === 'clinics'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Địa điểm Uy tín
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all border-b-2 ${
            activeTab === 'doctors'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Bác sĩ Chuyên khoa
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 bg-slate-50 min-h-[400px]">
        
        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                   <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{product.type}</span>
                </div>
                <p className="text-slate-500 text-sm mb-4 flex-grow">{product.description}</p>
                <div className="space-y-2 mb-4">
                  {product.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feat}
                    </div>
                  ))}
                </div>
                <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                  Chi tiết sản phẩm
                </button>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-3 text-center py-10 text-slate-400">Chưa có dữ liệu sản phẩm.</div>
            )}
          </div>
        )}

        {/* CLINICS TAB */}
        {activeTab === 'clinics' && (
          <div className="space-y-4 animate-fade-in">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 hover:border-orange-200 transition-all flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-56 h-40 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                  <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900">{clinic.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                      <span className="text-yellow-600 font-bold text-sm">{clinic.rating}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {clinic.address}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {clinic.features.map((feat, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <button className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors whitespace-nowrap">
                    Đặt lịch hẹn
                  </button>
                  <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                    Xem bản đồ
                  </button>
                </div>
              </div>
            ))}
            {clinics.length === 0 && (
              <div className="text-center py-10 text-slate-400">Chưa có dữ liệu phòng khám.</div>
            )}
          </div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             {doctors.map((doc) => (
               <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center hover:border-orange-300 transition-all group">
                 <div className="relative w-28 h-28 mx-auto mb-4">
                   <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-sm" />
                   <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Online"></div>
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{doc.name}</h3>
                 <p className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-1">{doc.title}</p>
                 <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden">{doc.hospital}</p>
                 
                 <div className="flex justify-center items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 py-2 rounded-lg">
                    <div>
                      <span className="block font-bold text-slate-900">{doc.experience.split(' ')[0]}</span>
                      <span className="text-xs">Năm KN</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <span className="block font-bold text-slate-900">{doc.rating}</span>
                      <span className="text-xs">Đánh giá</span>
                    </div>
                 </div>

                 <button 
                   onClick={() => alert(`Đã gửi yêu cầu tư vấn đến BS. ${doc.name}`)}
                   className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 shadow-md hover:shadow-orange-200 transition-all"
                 >
                   Tư vấn trực tiếp
                 </button>
               </div>
             ))}
             {doctors.length === 0 && (
               <div className="col-span-3 text-center py-10 text-slate-400">Chưa có dữ liệu bác sĩ.</div>
             )}
          </div>
        )}

      </div>
      
      <div className="bg-orange-50 p-4 text-center border-t border-orange-100">
        <p className="text-orange-800 text-xs font-medium">
          * Dữ liệu được cung cấp bởi hệ thống đối tác chính hãng của GC Aesthetics.
        </p>
      </div>
    </div>
  );
};
