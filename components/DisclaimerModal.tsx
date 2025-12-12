import React from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center space-x-3 mb-4 text-rose-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900">Khuyến cáo Y khoa & Quyền riêng tư</h2>
        </div>
        
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            <strong>1. Không phải lời khuyên y tế:</strong> Ứng dụng này sử dụng Trí tuệ nhân tạo (AI) để đưa ra gợi ý thẩm mỹ mang tính tham khảo. Kết quả <strong>không</strong> thay thế cho việc thăm khám trực tiếp bởi bác sĩ chuyên khoa.
          </p>
          <p>
            <strong>2. Dữ liệu hình ảnh:</strong> Hình ảnh bạn tải lên sẽ được xử lý bởi Google Gemini AI để phân tích. Vui lòng không tải lên hình ảnh nhạy cảm không cần thiết hoặc hình ảnh của người khác khi chưa được phép.
          </p>
          <p>
            <strong>3. Độ chính xác:</strong> Kết quả phụ thuộc vào chất lượng hình ảnh và thông tin bạn cung cấp.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onAccept}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full sm:w-auto"
          >
            Tôi hiểu và Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};
