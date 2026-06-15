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
    category: "An toàn / quy định (không báo trước)",
    text: "Có thể gây nguy hiểm cho người vận hành máy (máy móc hoặc thiết bị lắp ráp) khi xảy ra dạng hỏng hóc, cản trở an toàn lao động hoặc không tuân thủ quy định của chính phủ — KHÔNG có dấu hiệu báo trước",
  },
  {
    rank: 9,
    category: "An toàn / quy định (có báo trước)",
    text: "Có thể gây nguy hiểm cho người vận hành máy (máy móc hoặc thiết bị lắp ráp) khi xảy ra dạng hỏng hóc, cản trở an toàn lao động hoặc không tuân thủ quy định của chính phủ — CÓ dấu hiệu báo trước",
  },
  {
    rank: 8,
    category: "Gián đoạn sản xuất nghiêm trọng",
    text: "Gián đoạn sản xuất nghiêm trọng — 100% sản phẩm phải loại bỏ (scrap), hoặc máy/thiết bị bị hỏng và mất nhiều thời gian sửa chữa",
  },
  {
    rank: 7,
    category: "Gián đoạn sản xuất lớn",
    text: "Gián đoạn sản xuất lớn — một phần sản phẩm bị loại bỏ (không cần phân loại), hoặc sản phẩm phải phân loại và một phần phải gia công lại",
  },
  {
    rank: 6,
    category: "Gián đoạn sản xuất vừa — 100% gia công lại",
    text: "Gián đoạn sản xuất vừa — 100% sản phẩm phải gia công lại (rework) hoặc sửa chữa ngoài dây chuyền",
  },
  {
    rank: 5,
    category: "Gián đoạn sản xuất vừa — một phần gia công lại",
    text: "Gián đoạn sản xuất vừa — một phần sản phẩm phải gia công lại (rework) hoặc sửa chữa ngoài dây chuyền (không cần phân loại)",
  },
  {
    rank: 4,
    category: "Gián đoạn nhỏ — 100% gia công lại",
    text: "Gián đoạn nhỏ — 100% sản phẩm phải gia công lại ngay tại chỗ trước khi đưa sang công đoạn tiếp theo",
  },
  {
    rank: 3,
    category: "Gián đoạn nhỏ — một phần gia công lại",
    text: "Gián đoạn nhỏ — một phần sản phẩm phải gia công lại ngay tại chỗ trước khi đưa sang công đoạn tiếp theo (không cần phân loại)",
  },
  {
    rank: 2,
    category: "Bất tiện nhỏ cho quá trình sản xuất",
    text: "Bất tiện nhỏ cho quá trình, thao tác hoặc người vận hành — ảnh hưởng không đáng kể đến sản xuất",
  },
  {
    rank: 1,
    category: "Không ảnh hưởng đến sản xuất",
    text: "Không có ảnh hưởng đến quá trình sản xuất mà có thể nhận thấy được",
  },
];
