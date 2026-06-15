/**
 * Tiêu chuẩn Mức độ nghiêm trọng (Severity) — Bảng-2 P FMEA (AIAG-VDA / Astemo).
 * Hai cột tiêu chí:
 *   1. SEVERITY_RULES       — Ảnh hưởng đối với sản phẩm (ảnh hưởng đến khách hàng)
 *   2. SEVERITY_RULES_PROCESS — Ảnh hưởng đối với công đoạn (chế tạo/lắp ráp)
 *
 * Người dùng chọn một câu chuẩn từ dropdown; điểm S được chấm theo "Cấp độ (rank)".
 */
export interface SeverityRule {
  rank: number; // 1-10
  /** Nhóm ảnh hưởng (cột "Ảnh hưởng" trong bảng tiêu chuẩn). */
  category: string;
  /** Câu mô tả đầy đủ để ghép vào ô Ảnh hưởng. */
  text: string;
}

export const SEVERITY_RULES: SeverityRule[] = [
  {
    rank: 10,
    category: "An toàn / quy định",
    text: "Dạng hỏng hóc mang tính tiềm ẩn gây ảnh hưởng đến thao tác an toàn của xe, và/hoặc không phù hợp với quy định của chính phủ mà KHÔNG có dấu hiệu báo trước",
  },
  {
    rank: 9,
    category: "An toàn / quy định",
    text: "Dạng hỏng hóc mang tính tiềm ẩn gây ảnh hưởng đến thao tác an toàn của xe, và/hoặc không phù hợp với quy định của chính phủ CÓ dấu hiệu báo trước",
  },
  {
    rank: 8,
    category: "Mất chức năng chính",
    text: "Mất chức năng chính (không thể thao tác xe được, không ảnh hưởng đến thao tác an toàn của xe)",
  },
  {
    rank: 7,
    category: "Giảm chức năng chính",
    text: "Làm giảm chức năng chính (có thể thao tác xe, tuy nhiên, mức độ tính năng suy giảm)",
  },
  {
    rank: 6,
    category: "Mất chức năng thứ 2",
    text: "Làm mất chức năng thứ 2 (có thể thao tác xe, tuy nhiên, chức năng liên quan đến tính thoải mái/tiện lợi không hoạt động)",
  },
  {
    rank: 5,
    category: "Giảm chức năng thứ 2",
    text: "Suy giảm chức năng thứ 2 (có thể thao tác xe, tuy nhiên, mức độ tính năng liên quan đến tính thoải mái/tiện lợi bị giảm sút)",
  },
  {
    rank: 4,
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà hầu hết khách hàng (hơn 75%) nhận ra",
  },
  {
    rank: 3,
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà nhiều khách hàng (50%) nhận ra",
  },
  {
    rank: 2,
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà những khách hàng có khả năng phân biệt (dưới 25%) mới nhận ra",
  },
  {
    rank: 1,
    category: "Không ảnh hưởng",
    text: "Không có ảnh hưởng mà có thể nhận thấy được",
  },
];

/**
 * Tiêu chuẩn Mức độ nghiêm trọng của ảnh hưởng đối với công đoạn
 * (Ảnh hưởng đến chế tạo / lắp ráp) — AIAG-VDA PFMEA Bảng-2.
 */
export const SEVERITY_RULES_PROCESS: SeverityRule[] = [
  {
    rank: 10,
    category: "Không thỏa mãn yêu cầu an toàn/quy định",
    text: "Có nguy cơ gây nguy hiểm cho người thao tác (thao tác máy móc hoặc lắp ráp) mà không có dấu hiệu báo trước",
  },
  {
    rank: 9,
    category: "Không thỏa mãn yêu cầu an toàn/quy định",
    text: "Có nguy cơ gây nguy hiểm cho người thao tác (thao tác máy móc hoặc lắp ráp) có dấu hiệu báo trước",
  },
  {
    rank: 8,
    category: "Cản trở nghiêm trọng",
    text: "Phải hủy tất cả sản phẩm. Dừng thao tác của dây chuyền hoặc dừng xuất hàng",
  },
  {
    rank: 7,
    category: "Cản trở lớn",
    text: "Phải hủy một số sản phẩm sản xuất. Tách khỏi công đoạn chính. Bao gồm việc giảm tốc độ của dây chuyền và bổ sung thêm người",
  },
  {
    rank: 6,
    category: "Cản trở trung bình",
    text: "Tất cả các sản phẩm sản xuất phải sửa ở ngoài dây chuyền, tuy nhiên có thể chấp nhận được",
  },
  {
    rank: 5,
    category: "Cản trở trung bình",
    text: "Một số sản phẩm sản xuất phải sửa ở ngoài dây chuyền, tuy nhiên có thể chấp nhận được",
  },
  {
    rank: 4,
    category: "Cản trở trung bình",
    text: "Tất cả sản phẩm sản xuất phải sửa tại hiện trường trước khi gia công",
  },
  {
    rank: 3,
    category: "Cản trở nhẹ",
    text: "Một số sản phẩm sản xuất phải sửa tại hiện trường trước khi gia công",
  },
  {
    rank: 2,
    category: "Cản trở nhẹ",
    text: "Sự bất tiện nhỏ cho công đoạn, thao tác hoặc nhân viên thao tác",
  },
  {
    rank: 1,
    category: "Không ảnh hưởng",
    text: "Không có ảnh hưởng mà có thể nhận thấy được",
  },
];
