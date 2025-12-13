
import { Doctor, Clinic, Product } from '../types';

export const IMPLANT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'IMPLEO™ Smooth',
    type: 'Round',
    description: 'Túi ngực tròn vỏ trơn thế hệ mới, mang lại cảm giác mềm mại tự nhiên và độ nhô linh hoạt.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2022-02/Impleo_0.png', 
    features: ['Vỏ trơn (Smooth)', 'Gel mềm Soft Touch™', 'Đầy cực trên', 'Bảo hành trọn đời']
  },
  {
    id: 'p2',
    name: 'THE PERLE™',
    type: 'Round',
    description: 'Dòng túi ngực cao cấp với bề mặt BioQ™ - công nghệ vỏ nano tối ưu hóa tương thích sinh học.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2021-03/The%20Perle.png',
    features: ['Bề mặt BioQ™', 'Gel kết dính cao', 'An toàn tối đa', 'Định hình form chuẩn']
  },
  {
    id: 'p3',
    name: 'COHESIVE™',
    type: 'Anatomical',
    description: 'Túi ngực hình giọt nước, giải pháp hoàn hảo cho dáng ngực tự nhiên như thật.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2022-02/Cohesive.png',
    features: ['Dáng giọt nước', 'Form ổn định', 'Phù hợp ngực mỏng', 'Tự nhiên nhất']
  }
];

export const REPUTABLE_CLINICS: Clinic[] = [
  {
    id: 'c1',
    name: 'Bệnh viện Thẩm mỹ Kangnam',
    address: '666 Cách Mạng Tháng 8, P.5, Q.Tân Bình, TP.HCM',
    image: 'https://benhvienthammykangnam.vn/wp-content/uploads/2019/10/toan-canh-benh-vien-tham-my-kangnam-han-quoc.jpg',
    rating: 4.9,
    features: ['Chuẩn y khoa 5 sao', 'Công nghệ 3D Vectra', 'Hậu phẫu VIP']
  },
  {
    id: 'c2',
    name: 'Bệnh viện JW Hàn Quốc',
    address: '44 - 46 - 48 - 50 Tôn Thất Tùng, P.Bến Thành, Q.1, TP.HCM',
    image: 'https://benhvienjw.vn/wp-content/uploads/2020/07/benh-vien-tham-my-jw-han-quoc-1.jpg',
    rating: 4.8,
    features: ['Đối tác chính thức GCA', 'Bác sĩ Hàn Quốc', 'Chuyên sâu nâng ngực']
  },
  {
    id: 'c3',
    name: 'Bệnh viện Thẩm mỹ Thu Cúc',
    address: '218 Điện Biên Phủ, Q.3, TP.HCM',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sJ5D9yq_E5o_E2q_E5o_E2q_E5o_E2q_Ew&s', // Placeholder
    rating: 4.8,
    features: ['Hệ thống lớn nhất MB', 'An toàn tuyệt đối', 'Bảo hành dài hạn']
  }
];

export const REPUTABLE_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'TS. BS. Richard Huy',
    title: 'Giám đốc chuyên môn',
    experience: '20 năm kinh nghiệm',
    hospital: 'Hệ thống Kangnam',
    rating: 5.0,
    avatar: 'https://benhvienthammykangnam.vn/wp-content/uploads/2022/11/dr-richard-huy-kangnam.jpg'
  },
  {
    id: 'd2',
    name: 'TS. BS. Nguyễn Phan Tú Dung',
    title: 'Tổng Giám đốc',
    experience: '25 năm kinh nghiệm',
    hospital: 'Bệnh viện JW',
    rating: 5.0,
    avatar: 'https://benhvienjw.vn/wp-content/uploads/2019/04/bac-si-tu-dung.jpg'
  },
  {
    id: 'd3',
    name: 'BS. CKII. Nguyễn Thanh Vân',
    title: 'Trưởng khoa Phẫu thuật',
    experience: '18 năm kinh nghiệm',
    hospital: 'Bệnh viện Thanh Vân',
    rating: 4.9,
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6sJ5D9yq_E5o_E2q_E5o_E2q_E5o_E2q_Ew&s' // Placeholder
  }
];
