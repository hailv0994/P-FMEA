/**
 * Tiêu chuẩn Mức độ nghiêm trọng (Severity) — Bảng-2 P FMEA (AIAG-VDA / Astemo).
 * Cột "Mức độ nghiêm trọng của ảnh hưởng đối với sản phẩm (ảnh hưởng đến khách hàng)".
 *
 * Khi phân tích xong ô Ảnh hưởng, người dùng ghép thêm một trong các câu chuẩn này;
 * điểm Mức NT (severity) được chấm tương ứng với cột "Cấp độ (rank)".
 */
export interface SeverityRule {
  rank: number; // 1-10
  /** "product" = ảnh hưởng đến sản phẩm/khách hàng; "process" = ảnh hưởng đến công đoạn (chế tạo/lắp ráp). */
  scope: "product" | "process";
  /** Nhóm ảnh hưởng (cột "Ảnh hưởng" trong bảng tiêu chuẩn). */
  category: string;
  /** Câu mô tả đầy đủ để ghép vào ô Ảnh hưởng. */
  text: string;
}

/** (1) Mức độ nghiêm trọng đối với SẢN PHẨM (ảnh hưởng đến khách hàng). */
export const SEVERITY_RULES_PRODUCT: SeverityRule[] = [
  {
    rank: 10,
    scope: "product",
    category: "An toàn / quy định",
    text: "Dạng hỏng hóc mang tính tiềm ẩn gây ảnh hưởng đến thao tác an toàn của xe, và/hoặc không phù hợp với quy định của chính phủ mà KHÔNG có dấu hiệu báo trước",
  },
  {
    rank: 9,
    scope: "product",
    category: "An toàn / quy định",
    text: "Dạng hỏng hóc mang tính tiềm ẩn gây ảnh hưởng đến thao tác an toàn của xe, và/hoặc không phù hợp với quy định của chính phủ CÓ dấu hiệu báo trước",
  },
  {
    rank: 8,
    scope: "product",
    category: "Mất chức năng chính",
    text: "Mất chức năng chính (không thể thao tác xe được, không ảnh hưởng đến thao tác an toàn của xe)",
  },
  {
    rank: 7,
    scope: "product",
    category: "Giảm chức năng chính",
    text: "Làm giảm chức năng chính (có thể thao tác xe, tuy nhiên, mức độ tính năng suy giảm)",
  },
  {
    rank: 6,
    scope: "product",
    category: "Mất chức năng thứ 2",
    text: "Làm mất chức năng thứ 2 (có thể thao tác xe, tuy nhiên, chức năng liên quan đến tính thoải mái/tiện lợi không hoạt động)",
  },
  {
    rank: 5,
    scope: "product",
    category: "Giảm chức năng thứ 2",
    text: "Suy giảm chức năng thứ 2 (có thể thao tác xe, tuy nhiên, mức độ tính năng liên quan đến tính thoải mái/tiện lợi bị giảm sút)",
  },
  {
    rank: 4,
    scope: "product",
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà hầu hết khách hàng (hơn 75%) nhận ra",
  },
  {
    rank: 3,
    scope: "product",
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà nhiều khách hàng (50%) nhận ra",
  },
  {
    rank: 2,
    scope: "product",
    category: "Ngoại quan / tiếng kêu",
    text: "Có lỗi mặt ngoài hoặc tiếng kêu, có thể thao tác xe được, có điểm không phù hợp mà những khách hàng có khả năng phân biệt (dưới 25%) mới nhận ra",
  },
  {
    rank: 1,
    scope: "product",
    category: "Không ảnh hưởng",
    text: "Không có ảnh hưởng mà có thể nhận thấy được",
  },
];

/** (2) Mức độ nghiêm trọng đối với CÔNG ĐOẠN (ảnh hưởng đến chế tạo/lắp ráp). */
export const SEVERITY_RULES_PROCESS: SeverityRule[] = [
  {
    rank: 10,
    scope: "process",
    category: "An toàn người thao tác",
    text: "Có nguy cơ gây nguy hiểm cho người thao tác (thao tác máy móc hoặc lắp ráp) mà KHÔNG có dấu hiệu báo trước",
  },
  {
    rank: 9,
    scope: "process",
    category: "An toàn người thao tác",
    text: "Có nguy cơ gây nguy hiểm cho người thao tác (thao tác máy móc hoặc lắp ráp) CÓ dấu hiệu báo trước",
  },
  {
    rank: 8,
    scope: "process",
    category: "Cản trở nghiêm trọng",
    text: "Phải hủy tất cả sản phẩm. Dừng thao tác của dây chuyền hoặc dừng xuất hàng",
  },
  {
    rank: 7,
    scope: "process",
    category: "Cản trở lớn",
    text: "Phải hủy một số sản phẩm sản xuất. Tách khỏi công đoạn chính (gồm giảm tốc độ dây chuyền và bổ sung thêm người)",
  },
  {
    rank: 6,
    scope: "process",
    category: "Cản trở trung bình",
    text: "Tất cả các sản phẩm sản xuất phải sửa ở ngoài dây chuyền, tuy nhiên có thể chấp nhận được",
  },
  {
    rank: 5,
    scope: "process",
    category: "Cản trở trung bình",
    text: "Một số sản phẩm sản xuất phải sửa ở ngoài dây chuyền, tuy nhiên có thể chấp nhận được",
  },
  {
    rank: 4,
    scope: "process",
    category: "Cản trở trung bình",
    text: "Tất cả sản phẩm sản xuất phải sửa tại hiện trường trước khi gia công",
  },
  {
    rank: 3,
    scope: "process",
    category: "Cản trở trung bình",
    text: "Một số sản phẩm sản xuất phải sửa tại hiện trường trước khi gia công",
  },
  {
    rank: 2,
    scope: "process",
    category: "Cản trở nhẹ",
    text: "Sự bất tiện nhỏ cho công đoạn, thao tác hoặc nhân viên thao tác",
  },
  {
    rank: 1,
    scope: "process",
    category: "Không ảnh hưởng",
    text: "Không có ảnh hưởng mà có thể nhận thấy được",
  },
];

/** Gộp cả 2 nhóm (giữ tương thích import cũ). */
export const SEVERITY_RULES: SeverityRule[] = [
  ...SEVERITY_RULES_PRODUCT,
  ...SEVERITY_RULES_PROCESS,
];
