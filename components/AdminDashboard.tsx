
import React, { useState, useRef } from 'react';
import { Product, Clinic, Doctor } from '../types';

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
  
  // State for Image Management
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleDelete = (id: string, type: 'products' | 'clinics' | 'doctors') => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này?")) return;

    if (type === 'products') {
      onUpdateProducts(products.filter(p => p.id !== id));
    } else if (type === 'clinics') {
      onUpdateClinics(clinics.filter(c => c.id !== id));
    } else {
      onUpdateDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Determine which field holds the image
    const img = activeTab === 'doctors' ? item.avatar : item.image;
    setPreviewImage(img);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setPreviewImage(null);
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const id = editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9);
    
    // Ensure we have an image (either new upload or existing)
    const finalImage = previewImage || ''; 
    if (!finalImage) {
        alert("Vui lòng chọn hình ảnh!");
        return;
    }

    if (activeTab === 'products') {
      const newItem: Product = {
        id,
        name: formData.get('name') as string,
        type: formData.get('type') as 'Round' | 'Anatomical',
        description: formData.get('description') as string,
        image: finalImage,
        features: (formData.get('features') as string).split('\n').filter(s => s.trim())
      };
      
      const newList = editingItem 
        ? products.map(p => p.id === id ? newItem : p) 
        : [...products, newItem];
      onUpdateProducts(newList);

    } else if (activeTab === 'clinics') {
      const newItem: Clinic = {
        id,
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        rating: Number(formData.get('rating')),
        image: finalImage,
        features: (formData.get('features') as string).split('\n').filter(s => s.trim())
      };

      const newList = editingItem 
        ? clinics.map(c => c.id === id ? newItem : c) 
        : [...clinics, newItem];
      onUpdateClinics(newList);

    } else {
      const newItem: Doctor = {
        id,
        name: formData.get('name') as string,
        title: formData.get('title') as string,
        hospital: formData.get('hospital') as string,
        experience: formData.get('experience') as string,
        rating: Number(formData.get('rating')),
        avatar: finalImage,
      };

      const newList = editingItem 
        ? doctors.map(d => d.id === id ? newItem : d) 
        : [...doctors, newItem];
      onUpdateDoctors(newList);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Trang Quản Trị Hệ Thống</h1>
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
           <div className="flex border-b border-slate-200 bg-slate-50/50">
             {['products', 'clinics', 'doctors'].map(tab => (
               <button
                 key={tab}
                 onClick={() => { setActiveTab(tab as any); setIsFormOpen(false); }}
                 className={`flex-1 py-4 font-bold capitalize transition-all relative ${
                   activeTab === tab 
                    ? 'text-orange-600 bg-white' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                 }`}
               >
                 {activeTab === tab && <span className="absolute top-0 left-0 right-0 h-1 bg-orange-500"></span>}
                 {tab === 'products' ? 'Túi ngực (Products)' : tab === 'clinics' ? 'Địa điểm (Clinics)' : 'Bác sĩ (Doctors)'}
               </button>
             ))}
           </div>

           {/* Toolbar */}
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
                      Chưa có dữ liệu nào. Nhấn "Thêm mới" để bắt đầu.
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
                       <div className="flex flex-col sm:flex-row gap-6 items-start">
                         {/* Preview Box */}
                         <div className={`relative flex-shrink-0 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 ${activeTab === 'doctors' ? 'w-32 h-32 rounded-full' : 'w-48 h-32'}`}>
                           {previewImage ? (
                             <img 
                               src={previewImage} 
                               alt="Preview" 
                               className={`w-full h-full ${activeTab === 'products' ? 'object-contain p-2' : 'object-cover'}`} 
                             />
                           ) : (
                             <span className="text-slate-400 text-xs text-center px-2">Chưa có ảnh</span>
                           )}
                         </div>

                         {/* Upload Button */}
                         <div className="flex-1">
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={handleImageUpload}
                             accept="image/*"
                             className="hidden"
                           />
                           <button 
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors mb-2"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                             </svg>
                             {previewImage ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                           </button>
                           <p className="text-xs text-slate-400">
                             Hỗ trợ JPG, PNG. Dung lượng tối đa 5MB. 
                             {activeTab === 'products' ? ' Khuyên dùng ảnh nền trong suốt.' : ''}
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
                        <button type="submit" className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all">
                          {editingItem ? 'Lưu thay đổi' : 'Thêm mới'}
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
