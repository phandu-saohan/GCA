
import React, { useState } from 'react';
import { Product, Clinic, Doctor } from '../types';

interface RecommendationHubProps {
  selectedVolume?: number;
  products: Product[];
  clinics: Clinic[];
  doctors: Doctor[];
}

type DetailType = 'product' | 'clinic' | 'doctor';

export const RecommendationHub: React.FC<RecommendationHubProps> = ({ 
  selectedVolume,
  products,
  clinics,
  doctors
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'clinics' | 'doctors'>('products');
  
  // State for Modal Detail
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<DetailType | null>(null);

  const openDetail = (item: any, type: DetailType) => {
    setSelectedDetailItem(item);
    setDetailType(type);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeDetail = () => {
    setSelectedDetailItem(null);
    setDetailType(null);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };

  const switchToClinics = () => {
    closeDetail();
    setActiveTab('clinics');
  };

  return (
    <>
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up mt-8" id="recommendation-hub">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
           </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">Hệ sinh thái IMPLEO</h2>
        <p className="text-slate-300 relative z-10">
          Kết nối với các giải pháp túi ngực hàng đầu và mạng lưới y khoa uy tín.
          {selectedVolume && <span className="block mt-1 text-orange-400 font-semibold">Gợi ý cho size {selectedVolume}cc của bạn.</span>}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 min-w-[140px] py-4 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Túi ngực IMPLEO
        </button>
        <button
          onClick={() => setActiveTab('clinics')}
          className={`flex-1 min-w-[140px] py-4 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'clinics'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Địa điểm Uy tín
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 min-w-[140px] py-4 text-sm md:text-base font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Bác sĩ Chuyên khoa
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-8 bg-slate-50 min-h-[400px]">
        
        {/* PRODUCTS TAB (Horizontal Layout) */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => openDetail(product, 'product')}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 cursor-pointer group"
              >
                {/* Image Section - Match Clinic Style */}
                <div className="w-full md:w-56 h-48 md:h-40 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 p-4 flex items-center justify-center relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm opacity-80">
                     {product.type}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col">
                   <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors mb-1">
                        {product.name}
                      </h3>
                   </div>
                   
                   <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                   
                   {/* Features as Chips */}
                   <div className="flex flex-wrap gap-2 mt-auto">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 group-hover:border-orange-100 group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          {feat}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                  <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md group-hover:bg-orange-600 group-hover:shadow-orange-200 transition-all whitespace-nowrap">
                    Chi tiết sản phẩm
                  </button>
                  <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">
                    Xem thông số
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-3 text-center py-10 text-slate-400">Chưa có dữ liệu sản phẩm.</div>
            )}
          </div>
        )}

        {/* CLINICS TAB (Existing Horizontal Layout) */}
        {activeTab === 'clinics' && (
          <div className="space-y-4 animate-fade-in">
            {clinics.map((clinic) => (
              <div 
                 key={clinic.id} 
                 onClick={() => openDetail(clinic, 'clinic')}
                 className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 cursor-pointer group"
              >
                <div className="w-full md:w-56 h-48 md:h-40 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative">
                  <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  {clinic.isPartner && (
                     <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                       ĐỐI TÁC CHÍNH THỨC
                     </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{clinic.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 flex-shrink-0 ml-2">
                      <span className="text-yellow-600 font-bold text-sm">{clinic.rating}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {clinic.address}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {clinic.features.map((feat, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                  <button className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors whitespace-nowrap">
                    Đặt lịch hẹn
                  </button>
                  <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
            {clinics.length === 0 && (
              <div className="text-center py-10 text-slate-400">Chưa có dữ liệu phòng khám.</div>
            )}
          </div>
        )}

        {/* DOCTORS TAB (Horizontal Layout) */}
        {activeTab === 'doctors' && (
          <div className="space-y-4 animate-fade-in">
             {doctors.map((doc) => (
               <div 
                 key={doc.id} 
                 onClick={() => openDetail(doc, 'doctor')}
                 className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 cursor-pointer group"
               >
                 {/* Image Section */}
                 <div className="w-full md:w-56 h-56 md:h-40 relative flex-shrink-0">
                   <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-xl border border-slate-100 group-hover:border-orange-100 transition-colors shadow-sm" />
                   <div className="absolute bottom-2 right-2 bg-green-500 w-3 h-3 rounded-full border-2 border-white animate-pulse" title="Online"></div>
                 </div>

                 {/* Content Section */}
                 <div className="flex-1">
                     <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{doc.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 ml-2 flex-shrink-0">
                           <span className="text-yellow-600 font-bold text-sm">{doc.rating}</span>
                           <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                     </div>
                     <p className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-2">{doc.title}</p>
                     
                     <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                        {doc.hospital}
                     </div>

                     {/* Stats / Specialties */}
                     <div className="flex flex-wrap gap-2 mt-auto">
                        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 font-semibold">
                           {doc.experience.split(' ')[0]} Năm Kinh nghiệm
                        </span>
                        {doc.specialties?.slice(0, 2).map((spec, i) => (
                           <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                              {spec}
                           </span>
                        ))}
                     </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-col justify-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                   <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md group-hover:bg-orange-600 group-hover:shadow-orange-200 transition-all whitespace-nowrap">
                     Hồ sơ bác sĩ
                   </button>
                   <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">
                     Đặt lịch ngay
                   </button>
                 </div>
               </div>
             ))}
             {doctors.length === 0 && (
               <div className="text-center py-10 text-slate-400">Chưa có dữ liệu bác sĩ.</div>
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

    {/* ======================= */}
    {/* DETAIL OVERLAY MODAL */}
    {/* ======================= */}
    {selectedDetailItem && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={closeDetail}>
          <div 
             className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-hide" 
             onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button */}
             <button 
                onClick={closeDetail}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>

             {/* ==================== PRODUCT DETAIL ==================== */}
             {detailType === 'product' && (
                <div className="flex flex-col md:flex-row">
                   <div className="w-full md:w-1/2 bg-slate-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
                      <img src={selectedDetailItem.image} alt={selectedDetailItem.name} className="max-w-full max-h-[400px] object-contain drop-shadow-xl" />
                   </div>
                   <div className="w-full md:w-1/2 p-8">
                      <div className="mb-6">
                         <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {selectedDetailItem.type} Implant
                         </span>
                         <h2 className="text-3xl font-bold text-slate-900 mt-3 mb-2">{selectedDetailItem.name}</h2>
                         <p className="text-slate-600 leading-relaxed text-sm">
                            {selectedDetailItem.fullDescription || selectedDetailItem.description}
                         </p>
                      </div>

                      <div className="space-y-6">
                         <div>
                            <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Đặc điểm nổi bật</h4>
                            <ul className="grid grid-cols-1 gap-2">
                               {selectedDetailItem.features.map((feat: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                     <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                     {feat}
                                  </li>
                               ))}
                            </ul>
                         </div>

                         {selectedDetailItem.technology && (
                            <div>
                               <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Công nghệ cốt lõi</h4>
                               <div className="flex flex-wrap gap-2">
                                  {selectedDetailItem.technology.map((tech: string, idx: number) => (
                                     <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                                        {tech}
                                     </span>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100">
                         <button 
                            onClick={switchToClinics}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
                         >
                            <span>Tìm nơi thực hiện</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                         </button>
                      </div>
                   </div>
                </div>
             )}

             {/* ==================== CLINIC DETAIL ==================== */}
             {detailType === 'clinic' && (
                <div>
                   {/* Banner Image */}
                   <div className="relative h-64 md:h-80 w-full">
                      <img src={selectedDetailItem.image} alt={selectedDetailItem.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 md:left-8 text-white">
                         {selectedDetailItem.isPartner && (
                            <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                               ĐỐI TÁC CHÍNH THỨC
                            </span>
                         )}
                         <h2 className="text-3xl md:text-4xl font-bold mb-1">{selectedDetailItem.name}</h2>
                         <p className="flex items-center gap-2 text-white/90 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {selectedDetailItem.address}
                         </p>
                      </div>
                      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                         <span className="text-yellow-400 font-bold text-2xl">{selectedDetailItem.rating}</span>
                         <div className="text-white text-xs">
                            <div className="flex text-yellow-400">★★★★★</div>
                            <span>Trên Google Maps</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="md:col-span-2 space-y-6">
                            <div>
                               <h3 className="text-xl font-bold text-slate-900 mb-3">Giới thiệu chung</h3>
                               <p className="text-slate-600 leading-relaxed text-sm text-justify">
                                  {selectedDetailItem.introduction || "Thông tin giới thiệu đang được cập nhật..."}
                               </p>
                            </div>

                            <div>
                               <h3 className="text-xl font-bold text-slate-900 mb-3">Tiện ích & Dịch vụ</h3>
                               <div className="flex flex-wrap gap-2">
                                  {selectedDetailItem.features.map((feat: string, idx: number) => (
                                     <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                        {feat}
                                     </span>
                                  ))}
                               </div>
                            </div>
                         </div>

                         {/* Sidebar Info */}
                         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
                            <h4 className="font-bold text-slate-800 mb-4">Thông tin liên hệ</h4>
                            <div className="space-y-4 text-sm">
                               <div className="flex items-center gap-3 text-slate-600">
                                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                                  </div>
                                  <span className="font-semibold">Hotline: 1900 xxxx</span>
                               </div>
                               <div className="flex items-center gap-3 text-slate-600">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                  </div>
                                  <span>08:00 - 18:00 (T2 - CN)</span>
                               </div>
                            </div>
                            <button className="w-full mt-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-md transition-colors">
                               Liên hệ tư vấn ngay
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* ==================== DOCTOR DETAIL ==================== */}
             {detailType === 'doctor' && (
                <div className="flex flex-col md:flex-row">
                   <div className="w-full md:w-1/3 bg-slate-50 p-6 md:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-100 text-center">
                      <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
                         <img src={selectedDetailItem.avatar} alt={selectedDetailItem.name} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedDetailItem.name}</h2>
                      <p className="text-orange-600 font-bold text-sm uppercase mb-2">{selectedDetailItem.title}</p>
                      <p className="text-slate-500 text-sm mb-6">{selectedDetailItem.hospital}</p>
                      
                      <div className="flex gap-4 w-full justify-center">
                         <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1">
                            <div className="text-2xl font-bold text-slate-800">{selectedDetailItem.experience.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Năm KN</div>
                         </div>
                         <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1">
                            <div className="text-2xl font-bold text-slate-800">{selectedDetailItem.rating}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Đánh giá</div>
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-2/3 p-6 md:p-8">
                      <div className="mb-8">
                         <h3 className="text-xl font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Tiểu sử & Kinh nghiệm</h3>
                         <p className="text-slate-600 leading-relaxed text-sm text-justify">
                            {selectedDetailItem.bio || "Thông tin đang cập nhật..."}
                         </p>
                      </div>

                      <div className="mb-8">
                         <h3 className="text-xl font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Chuyên môn sâu</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedDetailItem.specialties?.map((spec: string, idx: number) => (
                               <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">{spec}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-slate-100">
                         <button className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-colors">
                            Đặt lịch tư vấn
                         </button>
                         <button className="px-6 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                            Gửi câu hỏi
                         </button>
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
    )}
    </>
  );
};
