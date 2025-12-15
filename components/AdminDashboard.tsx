
import React, { useState, useRef } from 'react';
import { Product, Clinic, Doctor } from '../types';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  products: Product[];
  clinics: Clinic[];
  doctors: Doctor[];
  onUpdateProducts: (data: Product[]) => void;
  onUpdateClinics: (data: Clinic[]) => void;
  onUpdateDoctors: (data: Doctor[]) => void;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  clinics,
  doctors,
  onUpdateProducts,
  onUpdateClinics,
  onUpdateDoctors,
  onExit
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'clinics' | 'doctors'>('products');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for Image Management
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleDelete = async (id: string, type: 'products' | 'clinics' | 'doctors') => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này? Dữ liệu sẽ bị xóa khỏi Supabase.")) return;

    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;

      // Update local state UI
      if (type === 'products') {
        onUpdateProducts(products.filter(p => p.id !== id));
      } else if (type === 'clinics') {
        onUpdateClinics(clinics.filter(c => c.id !== id));
      } else {
        onUpdateDoctors(doctors.filter(d => d.id !== id));
      }
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Determine which field holds the image
    const img = activeTab === 'doctors' ? item.avatar : item.image;
    setPreviewImage(img);
    setSelectedFile(null); // Reset new file selection
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setPreviewImage(null);
    setSelectedFile(null);
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    // Tổ chức file vào thư mục theo loại (products/clinics/doctors)
    const filePath = `${activeTab}/${fileName}`;

    // 1. Thử upload trực tiếp
    let { error: uploadError } = await supabase.storage
      .from('resources') 
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    // Handle specific errors
    if (uploadError) {
       const errMsg = uploadError.message.toLowerCase();
       
       // Case 1: Bucket chưa có
       if (errMsg.includes('bucket not found') || (uploadError as any).error === 'Bucket not found') {
          console.warn("Bucket 'resources' missing. Attempting to create...");
          const { error: createError } = await supabase.storage.createBucket('resources', {
             public: true,
             fileSizeLimit: 10485760, 
             allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
          });

          if (createError) {
             throw new Error("Lỗi: Bucket 'resources' chưa tồn tại. Hãy chạy SQL Script trong file services/supabase.ts để tạo.");
          }

          // Retry upload
          const { error: retryError } = await supabase.storage.from('resources').upload(filePath, file, { upsert: true });
          if (retryError) throw retryError;
       } 
       // Case 2: Lỗi quyền (RLS Policy) - Phổ biến nhất
       else if (errMsg.includes('violates row-level security') || errMsg.includes('policy') || (uploadError as any).statusCode === '403') {
          throw new Error("LỖI QUYỀN (RLS): Bạn chưa cấu hình Policy cho phép Upload. Hãy copy đoạn SQL trong file `services/supabase.ts` và chạy trong Supabase SQL Editor.");
       }
       // Other errors
       else {
          throw uploadError;
       }
    }

    const { data } = supabase.storage.from('resources').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const id = editingItem ? editingItem.id : crypto.randomUUID();
    
    try {
      // 1. Handle Image
      let finalImageUrl = previewImage || '';
      
      if (selectedFile) {
        // Upload new image to Supabase Storage
        try {
           finalImageUrl = await uploadImageToSupabase(selectedFile);
        } catch (uploadErr: any) {
           console.error("Upload error", uploadErr);
           alert(uploadErr.message || "Lỗi upload ảnh. Vui lòng kiểm tra Storage Bucket.");
           setIsSaving(false);
           return;
        }
      }

      if (!finalImageUrl) {
          alert("Vui lòng chọn hình ảnh!");
          setIsSaving(false);
          return;
      }

      // 2. Prepare Data & Upsert to DB
      if (activeTab === 'products') {
        const newItem: Product = {
          id,
          name: formData.get('name') as string,
          type: formData.get('type') as 'Round' | 'Anatomical',
          description: formData.get('description') as string,
          image: finalImageUrl,
          features: (formData.get('features') as string).split('\n').filter(s => s.trim())
        };
        
        const { error } = await supabase.from('products').upsert(newItem);
        if (error) throw error;

        const newList = editingItem ? products.map(p => p.id === id ? newItem : p) : [...products, newItem];
        onUpdateProducts(newList);

      } else if (activeTab === 'clinics') {
        const newItem: Clinic = {
          id,
          name: formData.get('name') as string,
          address: formData.get('address') as string,
          rating: Number(formData.get('rating')),
          image: finalImageUrl,
          features: (formData.get('features') as string).split('\n').filter(s => s.trim())
        };

        const { error } = await supabase.from('clinics').upsert(newItem);
        if (error) throw error;

        const newList = editingItem ? clinics.map(c => c.id === id ? newItem : c) : [...clinics, newItem];
        onUpdateClinics(newList);

      } else if (activeTab === 'doctors') {
        const newItem: Doctor = {
          id,
          name: formData.get('name') as string,
          title: formData.get('title') as string,
          hospital: formData.get('hospital') as string,
          experience: formData.get('experience') as string,
          rating: Number(formData.get('rating')),
          avatar: finalImageUrl,
        };

        const { error } = await supabase.from('doctors').upsert(newItem);
        if (error) throw error;

        const newList = editingItem ? doctors.map(d => d.id === id ? newItem : d) : [...doctors, newItem];
        onUpdateDoctors(newList);
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(`Lỗi khi lưu dữ liệu: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Trang Quản Trị (Supabase)</h1>
             <p className="text-slate-500">Quản lý dữ liệu sản phẩm, địa điểm và bác sĩ.</p>
           </div>
           <button 
             onClick={onExit}
             className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-colors shadow-sm"
           >
             Thoát về Trang chủ
           </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
           {/* Tabs */}
           <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
             {['products', 'clinics', 'doctors'].map(tab => (
               <button
                 key={tab}
                 onClick={() => { setActiveTab(tab as any); setIsFormOpen(false); }}
                 className={`flex-1 py-4 px-4 font-bold capitalize transition-all relative whitespace-nowrap ${
                   activeTab === tab 
                    ? 'text-orange-600 bg-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                 }`}
               >
                 {activeTab === tab && <span className="absolute top-0 left-0 right-0 h-1 bg-orange-500"></span>}
                 {tab === 'products' ? 'Túi ngực (Products)' : 
                  tab === 'clinics' ? 'Địa điểm (Clinics)' : 
                  'Bác sĩ (Doctors)'}
               </button>
             ))}
           </div>

           {/* Toolbar (Only show if form closed) */}
           {!isFormOpen && (
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <div className="font-semibold text-slate-700 pl-2">
                 Danh sách {activeTab === 'products' ? 'Sản phẩm' : activeTab === 'clinics' ? 'Phòng khám' : 'Bác sĩ'} ({
                   activeTab === 'products' ? products.length : activeTab === 'clinics' ? clinics.length : doctors.length
                 })
               </div>
               <button 
                 onClick={handleAddNew}
                 className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 flex items-center gap-2 shadow-lg shadow-orange-200 transition-all hover:scale-105"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                 </svg>
                 Thêm mới
               </button>
             </div>
           )}

           {/* List View */}
           <div className="p-0">
             {!isFormOpen ? (
               <div className="divide-y divide-slate-100">
                 {/* Product List */}
                 {activeTab === 'products' && products.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                     <div className="flex items-center gap-5">
                       <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-2 flex-shrink-0">
                         <img src={item.image} alt="" className="w-full h-full object-contain" />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                         <div className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded font-semibold border border-orange-100">{item.type}</div>
                         <p className="text-sm text-slate-500 line-clamp-1 mt-1 max-w-md">{item.description}</p>
                       </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-blue-100">Sửa</button>
                       <button onClick={() => handleDelete(item.id, 'products')} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-red-100">Xóa</button>
                     </div>
                   </div>
                 ))}

                 {/* Clinic List */}
                 {activeTab === 'clinics' && clinics.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                     <div className="flex items-center gap-5">
                       <div className="w-24 h-16 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                         <img src={item.image} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                         <div className="text-sm text-slate-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {item.address}
                         </div>
                         <div className="text-xs text-yellow-600 font-bold mt-1 bg-yellow-50 inline-block px-2 py-0.5 rounded">⭐ {item.rating} / 5.0</div>
                       </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-blue-100">Sửa</button>
                       <button onClick={() => handleDelete(item.id, 'clinics')} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-red-100">Xóa</button>
                     </div>
                   </div>
                 ))}

                 {/* Doctor List */}
                 {activeTab === 'doctors' && doctors.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                     <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                         <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                         <div className="text-sm text-slate-500">{item.title}</div>
                         <div className="text-xs text-slate-400 mt-0.5">{item.hospital}</div>
                       </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-blue-100">Sửa</button>
                       <button onClick={() => handleDelete(item.id, 'doctors')} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium border border-transparent hover:border-red-100">Xóa</button>
                     </div>
                   </div>
                 ))}
                 
                 {/* Empty State */}
                 {((activeTab === 'products' && products.length === 0) || 
                   (activeTab === 'clinics' && clinics.length === 0) || 
                   (activeTab === 'doctors' && doctors.length === 0)) && (
                    <div className="p-10 text-center text-slate-400">
                      Chưa có dữ liệu nào từ Supabase. Nhấn "Thêm mới" để bắt đầu.
                    </div>
                 )}
               </div>
             ) : (
               /* Edit Form */
               <div className="p-6 md:p-8 bg-slate-50/50">
                 <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                     <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                       {editingItem ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg> 
                       : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
                     </span>
                     {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'products' ? 'Sản phẩm' : activeTab === 'clinics' ? 'Địa điểm' : 'Bác sĩ'}
                   </h3>
                   
                   <form onSubmit={handleSave} className="space-y-6">
                     
                     {/* Image Upload Area */}
                     <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700">
                         {activeTab === 'doctors' ? 'Ảnh đại diện (Avatar)' : 'Hình ảnh mô tả'}
                       </label>
                       
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="flex flex-col sm:flex-row gap-6 items-center p-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-orange-300 transition-all group"
                       >
                         {/* Preview Box */}
                         <div className={`relative flex-shrink-0 bg-white shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center ${activeTab === 'doctors' ? 'w-32 h-32 rounded-full' : 'w-48 h-32 rounded-xl'}`}>
                           {previewImage ? (
                             <img 
                               src={previewImage} 
                               alt="Preview" 
                               className={`w-full h-full ${activeTab === 'products' ? 'object-contain p-2' : 'object-cover'}`} 
                             />
                           ) : (
                             <div className="text-slate-300 flex flex-col items-center">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-1">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H2.25A2.25 2.25 0 0 0 0 6v12a2.25 2.25 0 0 0 2.25 2.25Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                               </svg>
                             </div>
                           )}
                           
                           {/* Hover Overlay */}
                           <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-700">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                              </div>
                           </div>
                         </div>

                         {/* Upload Instructions */}
                         <div className="flex-1 text-center sm:text-left">
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={handleImageUpload}
                             accept="image/*"
                             className="hidden"
                           />
                           <h4 className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                             {previewImage ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                           </h4>
                           <p className="text-sm text-slate-500 mt-1">
                             Nhấn vào đây để chọn file từ thiết bị.
                           </p>
                           <p className="text-xs text-slate-400 mt-1">
                             Hỗ trợ JPG, PNG (Max 5MB).
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {activeTab === 'products' && (
                         <>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên sản phẩm</label>
                             <input name="name" defaultValue={editingItem?.name} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="VD: IMPLEO™ Smooth" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại túi</label>
                             <select name="type" defaultValue={editingItem?.type || 'Round'} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                                <option value="Round">Round (Tròn)</option>
                                <option value="Anatomical">Anatomical (Giọt nước)</option>
                             </select>
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả ngắn</label>
                             <textarea name="description" defaultValue={editingItem?.description} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-20" placeholder="Mô tả ngắn gọn về sản phẩm..." />
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Tính năng nổi bật (Mỗi dòng một ý)</label>
                             <textarea name="features" defaultValue={editingItem?.features?.join('\n')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-32 font-mono text-sm" placeholder="- Tính năng 1&#10;- Tính năng 2" />
                           </div>
                         </>
                       )}

                       {activeTab === 'clinics' && (
                         <>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên cơ sở</label>
                             <input name="name" defaultValue={editingItem?.name} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ</label>
                             <input name="address" defaultValue={editingItem?.address} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Đánh giá (1-5)</label>
                             <input type="number" step="0.1" max="5" name="rating" defaultValue={editingItem?.rating || 5} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Đặc điểm nổi bật (Mỗi dòng một ý)</label>
                             <textarea name="features" defaultValue={editingItem?.features?.join('\n')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-32 font-mono text-sm" />
                           </div>
                         </>
                       )}

                       {activeTab === 'doctors' && (
                         <>
                           <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên Bác sĩ</label>
                             <input name="name" defaultValue={editingItem?.name} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Chức danh</label>
                             <input name="title" defaultValue={editingItem?.title} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="VD: Giám đốc chuyên môn" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Bệnh viện / Nơi công tác</label>
                             <input name="hospital" defaultValue={editingItem?.hospital} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Kinh nghiệm</label>
                             <input name="experience" defaultValue={editingItem?.experience} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="VD: 15 năm kinh nghiệm" />
                           </div>
                           <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1.5">Đánh giá (1-5)</label>
                             <input type="number" step="0.1" max="5" name="rating" defaultValue={editingItem?.rating || 5} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                           </div>
                         </>
                       )}
                     </div>

                     <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button 
                          type="submit" 
                          disabled={isSaving}
                          className={`flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                        >
                          {isSaving ? 'Đang lưu...' : (editingItem ? 'Lưu thay đổi' : 'Thêm mới')}
                        </button>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                          Hủy bỏ
                        </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
