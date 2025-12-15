
import { Doctor, Clinic, Product } from '../types';

export const IMPLANT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'IMPLEO™ Smooth',
    type: 'Round',
    description: 'Túi ngực tròn vỏ trơn thế hệ mới, mang lại cảm giác mềm mại tự nhiên và độ nhô linh hoạt.',
    fullDescription: 'IMPLEO™ là dòng túi ngực thế hệ thứ 6 của GC Aesthetics, được thiết kế để đáp ứng nhu cầu ngày càng cao về độ mềm mại và tính ổn định form dáng. Với công nghệ vỏ trơn tiên tiến, IMPLEO™ giảm thiểu tối đa tình trạng lộ túi và bao xơ, đồng thời mang lại cảm giác chạm thực tế nhất.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2022-02/Impleo_0.png', 
    features: ['Vỏ trơn (Smooth)', 'Gel mềm Soft Touch™', 'Đầy cực trên', 'Bảo hành trọn đời'],
    technology: ['Silicone Gel thế hệ 6', 'Vỏ đa lớp (Barrier Layer)', 'Độ đàn hồi > 450%', 'Tiệt trùng khô']
  },
  {
    id: 'p2',
    name: 'THE PERLE™',
    type: 'Round',
    description: 'Dòng túi ngực cao cấp với bề mặt BioQ™ - công nghệ vỏ nano tối ưu hóa tương thích sinh học.',
    fullDescription: 'The Perle™ đại diện cho sự kết hợp hoàn hảo giữa nghệ thuật và khoa học. Bề mặt BioQ™ độc quyền giúp giảm ma sát mô, tăng cường khả năng bám dính nhưng vẫn giữ được độ mềm mại. Đây là lựa chọn hàng đầu cho các ca phẫu thuật yêu cầu độ an toàn tuyệt đối và thẩm mỹ cao.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2021-03/The%20Perle.png',
    features: ['Bề mặt BioQ™', 'Gel kết dính cao', 'An toàn tối đa', 'Định hình form chuẩn'],
    technology: ['Bề mặt Nano BioQ™', 'Emunomic™ Breast Tissue Dynamic Gel', 'Màng chắn 360 độ', 'Công nghệ RTV']
  },
  {
    id: 'p3',
    name: 'COHESIVE™',
    type: 'Anatomical',
    description: 'Túi ngực hình giọt nước, giải pháp hoàn hảo cho dáng ngực tự nhiên như thật.',
    fullDescription: 'Dòng túi Cohesive™ hình giọt nước được thiết kế đặc biệt cho những phụ nữ mong muốn vẻ đẹp kín đáo, tự nhiên. Với cực dưới đầy đặn và cực trên thoai thoải, túi tạo ra đường cong hoàn hảo, đặc biệt phù hợp với người có mô tuyến vú mỏng hoặc tái tạo ngực.',
    image: 'https://www.gcaesthetics.com/sites/default/files/2022-02/Cohesive.png',
    features: ['Dáng giọt nước', 'Form ổn định', 'Phù hợp ngực mỏng', 'Tự nhiên nhất'],
    technology: ['Gel định hình Form-Stable', 'Kết cấu bề mặt nhám', 'Thiết kế theo giải phẫu học', 'Độ bền cơ học cao']
  }
];

export const REPUTABLE_CLINICS: Clinic[] = [
  {
    id: 'c1',
    name: 'Bệnh viện Thẩm mỹ Kangnam',
    address: '666 Cách Mạng Tháng 8, P.5, Q.Tân Bình, TP.HCM',
    image: 'https://benhvienthammykangnam.vn/wp-content/uploads/2019/10/toan-canh-benh-vien-tham-my-kangnam-han-quoc.jpg',
    rating: 4.9,
    features: ['Chuẩn y khoa 5 sao', 'Công nghệ 3D Vectra', 'Hậu phẫu VIP'],
    introduction: 'Bệnh viện Thẩm mỹ Kangnam là đơn vị tiên phong trong việc ứng dụng các công nghệ thẩm mỹ Hàn Quốc tại Việt Nam. Với hệ thống cơ sở vật chất đạt chuẩn 5 sao và quy trình phẫu thuật khép kín, Kangnam cam kết mang lại kết quả thẩm mỹ hoàn hảo và an toàn tuyệt đối.',
    isPartner: true,
    gallery: [
       'https://benhvienthammykangnam.vn/wp-content/uploads/2019/10/phong-mo-vo-khuan-mot-chieu.jpg',
       'https://benhvienthammykangnam.vn/wp-content/uploads/2019/10/phong-hau-phau-kangnam.jpg'
    ]
  },
  {
    id: 'c2',
    name: 'Bệnh viện JW Hàn Quốc',
    address: '44 - 46 - 48 - 50 Tôn Thất Tùng, P.Bến Thành, Q.1, TP.HCM',
    image: 'https://benhvienjw.vn/wp-content/uploads/2020/07/benh-vien-tham-my-jw-han-quoc-1.jpg',
    rating: 4.8,
    features: ['Đối tác chính thức GCA', 'Bác sĩ Hàn Quốc', 'Chuyên sâu nâng ngực'],
    introduction: 'Bệnh viện JW Hàn Quốc hoạt động theo phương thức nhượng quyền thương hiệu từ Bệnh viện Jeong Won (Top 5 Hàn Quốc). JW nổi tiếng với đội ngũ bác sĩ tu nghiệp chuyên sâu và công nghệ nâng ngực nội soi tiên tiến.',
    isPartner: true
  },
  {
    id: 'c3',
    name: 'Bệnh viện Thẩm mỹ Thu Cúc',
    address: '218 Điện Biên Phủ, Q.3, TP.HCM',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sJ5D9yq_E5o_E2q_E5o_E2q_E5o_E2q_Ew&s', // Placeholder
    rating: 4.8,
    features: ['Hệ thống lớn nhất MB', 'An toàn tuyệt đối', 'Bảo hành dài hạn'],
    introduction: 'Với hơn 25 năm kinh nghiệm, Thu Cúc là cái tên bảo chứng cho chất lượng và uy tín. Đơn vị sở hữu quy trình quản lý chất lượng khắt khe và chế độ bảo hành dài hạn cho khách hàng.',
    isPartner: true
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
    avatar: 'https://benhvienthammykangnam.vn/wp-content/uploads/2022/11/dr-richard-huy-kangnam.jpg',
    bio: 'TS. BS. Richard Huy (Dr. Huy) là một trong những chuyên gia hàng đầu về phẫu thuật tạo hình tại Việt Nam. Ông là người trực tiếp thực hiện hàng ngàn ca phẫu thuật thành công và là thành viên của Hiệp hội Phẫu thuật Thẩm mỹ Quốc tế.',
    specialties: ['Nâng ngực nội soi', 'Tạo hình thành bụng', 'Nâng mũi cấu trúc', 'Tái phẫu thuật ngực hỏng']
  },
  {
    id: 'd2',
    name: 'TS. BS. Nguyễn Phan Tú Dung',
    title: 'Tổng Giám đốc',
    experience: '25 năm kinh nghiệm',
    hospital: 'Bệnh viện JW',
    rating: 5.0,
    avatar: 'https://benhvienjw.vn/wp-content/uploads/2019/04/bac-si-tu-dung.jpg',
    bio: 'Bác sĩ Tú Dung là người tiên phong đưa công nghệ thẩm mỹ Hàn Quốc về Việt Nam. Ông nổi tiếng với các ca phẫu thuật hàm mặt và nâng ngực phức tạp, thường xuyên được mời báo cáo tại các hội nghị quốc tế.',
    specialties: ['Nâng ngực Nano Chip', 'Phẫu thuật hàm mặt', 'Hút mỡ công nghệ cao']
  },
  {
    id: 'd3',
    name: 'BS. CKII. Nguyễn Thanh Vân',
    title: 'Trưởng khoa Phẫu thuật',
    experience: '18 năm kinh nghiệm',
    hospital: 'Bệnh viện Thanh Vân',
    rating: 4.9,
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6sJ5D9yq_E5o_E2q_E5o_E2q_E5o_E2q_Ew&s',
    bio: 'Với bề dày kinh nghiệm và đôi bàn tay khéo léo, Bác sĩ Thanh Vân luôn đề cao vẻ đẹp tự nhiên và sự an toàn cho khách hàng. Ông là chuyên gia trong lĩnh vực đặt túi ngực đường nách.',
    specialties: ['Nâng ngực đường nách', 'Treo sa trễ', 'Thẩm mỹ mắt']
  }
];
