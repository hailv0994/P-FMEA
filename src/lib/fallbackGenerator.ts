import type { GeneratedRow } from "../types";

/**
 * Bộ sinh PFMEA ngoại tuyến theo luật (kiểu AIAG-VDA).
 *
 * Nguyên tắc: mỗi công đoạn có 1 chức năng và NHIỀU hạng mục yêu cầu. Mỗi hạng
 * mục yêu cầu ứng với ĐÚNG MỘT dạng hỏng hóc (là phủ định của yêu cầu đó). Nhờ đó
 * số dạng hỏng hóc = số yêu cầu. App vẫn dùng được khi chưa cấu hình Gemini API
 * key. Toàn bộ nội dung bằng tiếng Việt.
 */

// Mỗi "mode" giờ tự mang theo hạng mục yêu cầu mà nó phủ định.
type Mode = Omit<GeneratedRow, "processStep" | "function">;

interface Archetype {
  keywords: RegExp;
  fn: string;
  modes: Mode[];
}

const A: Archetype[] = [
  {
    keywords: /\b(load|place|position|locate|pick|feed)\b|đưa|định vị|gá/i,
    fn: "Đưa / định vị chi tiết vào đồ gá cho công đoạn tiếp theo",
    modes: [
      {
        requirement: "Chi tiết được đặt đúng hướng theo hướng dẫn công việc",
        failureMode: "Đặt chi tiết sai hướng",
        effect: "Công đoạn sau gia công sai vị trí; phải sửa hoặc loại bỏ",
        cause: "Chi tiết đối xứng, đồ gá không có cơ cấu chống nhầm",
        classification: "",
        controlPrevention: "Thiết kế chốt định vị bất đối xứng trên đồ gá",
        controlDetection: "Công nhân kiểm tra bằng mắt theo hướng dẫn công việc",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Thêm cơ cấu chống nhầm hướng / chốt định vị bất đối xứng",
      },
      {
        requirement: "Chi tiết ngồi khít hoàn toàn vào đồ gá",
        failureMode: "Chi tiết chưa ngồi khít vào đồ gá",
        effect: "Lệch khi lắp ráp sau; lỗi kích thước",
        cause: "Phoi/bụi trên mặt định vị; mặt chuẩn bị mòn",
        classification: "",
        controlPrevention: "Quy định vệ sinh đồ gá & kiểm tra mặt chuẩn định kỳ",
        controlDetection: "Cảm biến xác nhận ngồi khít trên đồ gá (nếu có)",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Lắp cảm biến xác nhận ngồi khít có khóa liên động",
      },
    ],
  },
  {
    keywords: /\b(install|assemble|insert|mount|fit|attach|join|mate)\b|lắp|ráp/i,
    fn: "Lắp / ráp linh kiện vào chi tiết nền",
    modes: [
      {
        requirement: "Đầy đủ linh kiện theo cấu hình",
        failureMode: "Thiếu linh kiện",
        effect: "Sản phẩm không hoạt động đến tay khách hàng; lỗi hiện trường",
        cause: "Công nhân bỏ sót bước; thùng rỗng không được phát hiện",
        classification: "S",
        controlPrevention: "Lắp theo đèn báo (pick-to-light)",
        controlDetection: "Kiểm tra chức năng cuối chuyền",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Thêm kiểm tra hình ảnh xác nhận có linh kiện, dừng chuyền khi thiếu",
      },
      {
        requirement: "Đúng phiên bản linh kiện theo lệnh sản xuất",
        failureMode: "Lắp nhầm phiên bản linh kiện",
        effect: "Giao sai cấu hình; bị trả bảo hành",
        cause: "Các phiên bản giống nhau để cạnh nhau; không quét mã xác nhận",
        classification: "",
        controlPrevention: "Phân loại thùng linh kiện theo phiên bản, dán nhãn",
        controlDetection: "Công nhân đọc mã số trên nhãn",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Quét mã vạch linh kiện và đối chiếu lệnh sản xuất",
      },
      {
        requirement: "Linh kiện không hư hại khi lắp, ngồi khít",
        failureMode: "Linh kiện hư hại khi lắp",
        effect: "Lỗi tiềm ẩn; hỏng sớm khi sử dụng",
        cause: "Lực lắp quá lớn; mặt ghép bị lệch",
        classification: "",
        controlPrevention: "Đồ gá dẫn hướng khi lắp; đào tạo công nhân",
        controlDetection: "Giám sát lực ép khi lắp (nếu có)",
        severity: 6,
        occurrence: 4,
        detection: 6,
        recommendedAction: "Dùng đồ gá ép có giám sát lực / dẫn hướng khi lắp",
      },
    ],
  },
  {
    keywords: /\b(tighten|screw|fasten|torque|bolt|nut|rivet|clamp)\b|siết|vít|bu.?lông/i,
    fn: "Siết chặt mối ghép đến mô-men quy định",
    modes: [
      {
        requirement: "Siết đúng mô-men quy định (Nm)",
        failureMode: "Mô-men siết thiếu / thừa",
        effect: "Mối ghép lỏng khi vận hành hoặc tuôn ren; rủi ro an toàn",
        cause: "Dụng cụ tay không kiểm soát mô-men; công nhân mệt mỏi",
        classification: "S",
        controlPrevention: "Súng siết điện cài đặt chương trình đúng mô-men",
        controlDetection: "Kiểm tra mô-men định kỳ bằng cờ-lê lực",
        severity: 8,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Dùng súng siết DC giám sát mô-men/góc và chống nhầm",
      },
      {
        requirement: "Bắt ren thẳng, không lệch / cháy ren",
        failureMode: "Siết lệch ren / cháy ren",
        effect: "Mối ghép yếu, có đường rò, phải sửa taro lại",
        cause: "Bắt vít lệch; không có dẫn hướng đầu ren",
        classification: "",
        controlPrevention: "Dẫn hướng đầu ren / vát mép dẫn vào",
        controlDetection: "Giám sát góc vặn trên bộ điều khiển súng",
        severity: 6,
        occurrence: 3,
        detection: 6,
        recommendedAction: "Thêm giám sát góc vặn để phát hiện lệch ren",
      },
      {
        requirement: "Đủ số lượng bu-lông theo bản vẽ",
        failureMode: "Thiếu bu-lông",
        effect: "Lắp ráp lỏng; nguy cơ tách rời ngoài hiện trường",
        cause: "Công nhân bỏ sót vị trí trong cụm nhiều bu-lông",
        classification: "S",
        controlPrevention: "Trình tự siết cố định kèm hướng dẫn trực quan",
        controlDetection: "Đếm số chu kỳ siết trên bộ điều khiển súng",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Chống nhầm số lượng bu-lông qua bộ điều khiển súng",
      },
    ],
  },
  {
    keywords: /\b(inspect|check|verify|measure|gauge|test|audit|qc|quality)\b|kiểm tra|đo|dò/i,
    fn: "Kiểm tra / xác nhận chi tiết đạt yêu cầu kỹ thuật",
    modes: [
      {
        requirement: "Phát hiện 100% sản phẩm lỗi (không lọt lỗi)",
        failureMode: "Bỏ sót lỗi (lọt lỗi)",
        effect: "Sản phẩm lỗi đến tay khách hàng; khiếu nại / thu hồi",
        cause: "Tiêu chí kiểm tra chưa rõ; mỏi mắt khi kiểm tra thủ công",
        classification: "S",
        controlPrevention: "Mẫu giới hạn & đào tạo người kiểm",
        controlDetection: "Kiểm tra bằng mắt",
        severity: 8,
        occurrence: 4,
        detection: 6,
        recommendedAction: "Triển khai kiểm tra hình ảnh/đo tự động có ghi nhận đạt-không đạt",
      },
      {
        requirement: "Không loại nhầm sản phẩm đạt",
        failureMode: "Loại nhầm (sản phẩm tốt bị bỏ)",
        effect: "Giảm hiệu suất, tăng chi phí",
        cause: "Sai số đo (Gauge R&R) lớn; dung sai chặt hơn năng lực quá trình",
        classification: "",
        controlPrevention: "Hiệu chuẩn dụng cụ; điều chỉnh ngưỡng chấp nhận",
        controlDetection: "Tổ trưởng kiểm tra lại",
        severity: 3,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Thực hiện nghiên cứu Gauge R&R; hiệu chuẩn lại ngưỡng",
      },
    ],
  },
  {
    keywords: /\b(weld|braze|spot.?weld)\b|hàn(?!\s*thiếc)/i,
    fn: "Hàn mối ghép theo bảng thông số hàn",
    modes: [
      {
        requirement: "Độ bền & độ ngấu mối hàn đạt yêu cầu; không lỗi",
        failureMode: "Độ bền / độ ngấu mối hàn không đạt",
        effect: "Mối ghép hỏng khi chịu tải; lỗi kết cấu / an toàn",
        cause: "Dòng hàn thấp; bề mặt bẩn; điện cực mòn",
        classification: "S",
        controlPrevention: "Thông số hàn được phê duyệt; lịch sửa điện cực",
        controlDetection: "Thử phá hủy mối hàn định kỳ; thiết bị giám sát hàn",
        severity: 9,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Thêm giám sát hàn (dòng/năng lượng) tự động loại NG",
      },
      {
        requirement: "Bề mặt mối hàn không bắn tóe / cháy thủng",
        failureMode: "Bắn tóe / cháy thủng mối hàn",
        effect: "Lỗi ngoại quan; có thể hư hại vùng lân cận",
        cause: "Dòng hàn quá lớn; khe lắp ghép kém",
        classification: "",
        controlPrevention: "Tối ưu thông số; đồ gá kiểm soát khe lắp ghép",
        controlDetection: "Kiểm tra bằng mắt theo tần suất",
        severity: 5,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Tối ưu thông số hàn; kiểm soát khe lắp ghép bằng đồ gá",
      },
    ],
  },
  {
    keywords: /\b(press|press.?fit|stake|crimp|swage)\b|ép|đột/i,
    fn: "Ép chi tiết đến độ sâu / lực yêu cầu",
    modes: [
      {
        requirement: "Lực ép & độ sâu cuối nằm trong vùng đường đặc tính",
        failureMode: "Lực / độ sâu ép sai",
        effect: "Lắp lỏng hoặc hư hại; lỗi độ tin cậy",
        cause: "Dụng cụ mòn; biến động kích thước chi tiết",
        classification: "",
        controlPrevention: "Bảo trì dụng cụ; SPC chi tiết đầu vào",
        controlDetection: "Giám sát đường lực / quãng đường ép",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Áp dụng cửa sổ lực-quãng đường, tự động loại NG",
      },
    ],
  },
  {
    keywords: /\b(solder|reflow|wave.?solder)\b|hàn thiếc/i,
    fn: "Hàn thiếc mối nối điện",
    modes: [
      {
        requirement: "Mối hàn thiếc đủ thiếc, đạt cấp IPC; không hở",
        failureMode: "Mối hàn nguội / thiếu thiếc",
        effect: "Lỗi điện chập chờn ngoài hiện trường",
        cause: "Nhiệt profile thấp; oxy hóa; nhựa thông kém",
        classification: "",
        controlPrevention: "Profile reflow được phê duyệt; kiểm soát nhựa thông",
        controlDetection: "Kiểm tra AOI / bằng mắt",
        severity: 8,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Phê duyệt profile reflow; thêm AOI phân loại mối hàn",
      },
      {
        requirement: "Không cầu thiếc / chập giữa các chân",
        failureMode: "Cầu thiếc / chập",
        effect: "Chập mạch; sản phẩm không hoạt động",
        cause: "Dư kem thiếc; lệch khuôn in",
        classification: "",
        controlPrevention: "Tối ưu lỗ khuôn & lượng kem thiếc",
        controlDetection: "SPI trước reflow; AOI sau reflow",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Tinh chỉnh lỗ khuôn; thêm SPI trước reflow",
      },
    ],
  },
  {
    keywords: /\b(apply|dispense|glue|adhesive|seal|grease|lubricate|paint|coat|spray)\b|bôi|phủ|keo|sơn|bịt kín/i,
    fn: "Bôi vật liệu (keo / chất bịt kín / lớp phủ) lên chi tiết",
    modes: [
      {
        requirement: "Đường keo liên tục, đúng lượng, đúng vị trí",
        failureMode: "Thiếu / không có vật liệu",
        effect: "Rò rỉ, bong kết dính, hoặc ăn mòn khi sử dụng",
        cause: "Nghẹt vòi; lượng bơm sai",
        classification: "",
        controlPrevention: "Kiểm soát lượng bơm vòng kín; bảo trì vòi",
        controlDetection: "Công nhân kiểm tra đường keo bằng mắt",
        severity: 7,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Thêm kiểm tra hình ảnh đường keo + xác nhận lượng bơm",
      },
    ],
  },
  {
    keywords: /\b(machine|drill|mill|turn|cut|grind|deburr|tap)\b|gia công|khoan|taro|phay|tiện|mài/i,
    fn: "Gia công chi tiết đạt kích thước bản vẽ",
    modes: [
      {
        requirement: "Kích thước trong dung sai bản vẽ",
        failureMode: "Kích thước ngoài dung sai",
        effect: "Chi tiết không lắp / khít được; loại bỏ hoặc sửa",
        cause: "Dao mòn; trôi nhiệt; sai offset",
        classification: "",
        controlPrevention: "Quản lý tuổi thọ dao; bù offset",
        controlDetection: "Kiểm tra hàng đầu + SPC định kỳ",
        severity: 6,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Thêm đo trong quá trình với tự bù offset dao",
      },
      {
        requirement: "Không bavia, bề mặt đạt yêu cầu",
        failureMode: "Bavia / lỗi bề mặt",
        effect: "Vướng khi lắp; nguy cơ thương tích; lỗi làm kín",
        cause: "Dao cùn; thiếu bước gỡ bavia",
        classification: "",
        controlPrevention: "Giám sát tuổi thọ dao; bước gỡ bavia rõ ràng",
        controlDetection: "Kiểm tra bằng mắt / sờ tay",
        severity: 4,
        occurrence: 5,
        detection: 4,
        recommendedAction: "Thêm gỡ bavia tự động và giám sát tuổi thọ dao",
      },
    ],
  },
  {
    keywords: /\b(pack|package|label|box|palletize|ship)\b|đóng gói|dán nhãn|đóng thùng/i,
    fn: "Đóng gói / dán nhãn sản phẩm hoàn thiện để giao hàng",
    modes: [
      {
        requirement: "Đúng & đủ nhãn theo SKU / lệnh sản xuất",
        failureMode: "Nhãn sai / thiếu nhãn",
        effect: "Giao nhầm; mất truy xuất; khách từ chối",
        cause: "Chọn nhãn thủ công; không quét xác nhận",
        classification: "",
        controlPrevention: "In-và-dán nhãn gắn theo lệnh",
        controlDetection: "Quét xác nhận nhãn theo lệnh",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Quét xác nhận nhãn kèm kiểm tra OCR hình ảnh",
      },
      {
        requirement: "Bao bì bảo vệ đúng quy cách SKU",
        failureMode: "Bao bì bảo vệ không đủ",
        effect: "Hư hại khi vận chuyển; khách trả hàng",
        cause: "Sai quy cách bao bì; đóng gói vội",
        classification: "",
        controlPrevention: "Chuẩn hóa bộ bao bì theo SKU",
        controlDetection: "Kiểm tra khối lượng kiện đóng",
        severity: 5,
        occurrence: 3,
        detection: 5,
        recommendedAction: "Chuẩn hóa bộ bao bì; thêm kiểm tra khối lượng kiện",
      },
    ],
  },
];

/**
 * Kho kiến thức riêng cho sản phẩm PRO2 — Astemo Hà Nội (giảm xóc xe máy):
 * Fork Pipe, Rod, Damper Case Comp. Được khớp TRƯỚC các khuôn mẫu chung để AI
 * gợi ý bám sát sản phẩm thực tế. Nội dung dựa trên PFMEA hàn Damper thực tế.
 */
const COMPANY: Archetype[] = [
  {
    // Hàn cụm Damper Case (spot/project/condenser/seam/MAG) — ưu tiên trước "hàn" chung
    keywords: /damper|case|\bcap\b|spot|project|condenser|seam|\bmag\b/i,
    fn: "Hàn cụm Damper Case (spot/project/condenser/seam/MAG) — liên kết & kín dầu",
    modes: [
      {
        requirement: "Độ bền mối hàn đạt bản vẽ (mối hàn không bung)",
        failureMode: "Độ bền mối hàn không đạt (mối hàn bung → tuột cụm giảm xóc)",
        effect: "Tuột cụm giảm xóc → mất chức năng chính, rủi ro an toàn",
        cause: "Biến động quá trình hàn; cài sai điện áp/gia áp; điện cực mòn",
        classification: "S",
        controlPrevention: "Thiết lập điểm kiểm soát bắt buộc; weld checker giám sát dòng hàn",
        controlDetection: "Kiểm tra độ bền bằng máy chuyên dụng theo tần suất; thử phá hủy",
        severity: 9,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Giám sát hàn bằng weld checker + lịch thay/sửa điện cực",
      },
      {
        requirement: "Mối hàn kín dầu, không rò chảy",
        failureMode: "Mối hàn không hàn kín (chảy dầu)",
        effect: "Rò / chảy dầu → mất chức năng giảm chấn",
        cause: "Biến động quá trình hàn; khe hở lắp ghép không đạt",
        classification: "S",
        controlPrevention: "Điểm kiểm soát bắt buộc; đồ gá kiểm soát khe lắp ghép",
        controlDetection: "Kiểm tra kín (dò khí/dầu) hoặc bằng mắt theo tần suất",
        severity: 8,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Thêm kiểm tra kín (dò khí) sau hàn",
      },
      {
        requirement: "Kích thước chiều cao tổng & độ lệch 2 bên đạt bản vẽ",
        failureMode: "Kích thước chiều cao tổng / lệch 2 bên giảm xóc không đạt",
        effect: "Giảm xóc bị lệch → suy giảm chức năng",
        cause: "Cài đặt điện áp/độ nhún sai; độ nhô mainpipe chưa đúng",
        classification: "",
        controlPrevention: "Quy định cài đặt theo control plan; đào tạo nhân viên cài đặt",
        controlDetection: "Đo kích thước/độ lệch theo tần suất; weld checker",
        severity: 5,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Chuẩn hóa cài đặt & kiểm tra kích thước đầu chuyền",
      },
      {
        requirement: "Độ vuông góc & đường kính vùng trượt đạt bản vẽ",
        failureMode: "Độ vuông góc / đường kính vùng trượt không đạt",
        effect: "Giảm xóc nghiêng hoặc bị kẹt → suy giảm/mất chức năng",
        cause: "Điện cực, đồ gá hàn va đập, nứt vỡ; xylanh điện cực dưới bị kẹt",
        classification: "",
        controlPrevention: "Bảo quản & kiểm tra điện cực/đồ gá; bảo trì xylanh định kỳ",
        controlDetection: "Kiểm tra điện cực/đồ gá bằng mắt trước SX; đo độ vuông góc",
        severity: 6,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Lịch kiểm tra điện cực/đồ gá & bảo trì xylanh điện cực",
      },
      {
        requirement: "Bề mặt ngoài không xước, xỉ hàn, bavia, va đập",
        failureMode: "Mặt ngoài: xước, xỉ hàn, bavia, va đập",
        effect: "Lỗi ngoại quan; có thể gây tiếng kêu",
        cause: "Xỉ hàn bắn vào sản phẩm",
        classification: "",
        controlPrevention: "Lắp hệ thống xì khí; che chắn vùng hàn",
        controlDetection: "Kiểm tra bề mặt mối hàn bằng mắt theo tần suất",
        severity: 4,
        occurrence: 2,
        detection: 4,
        recommendedAction: "Lắp xì khí tự động; chuẩn hóa kiểm tra ngoại quan",
      },
    ],
  },
  {
    // Khoan lỗ thoát dầu (Fork Pipe) — ưu tiên trước "khoan/gia công" chung
    keywords: /lỗ thoát dầu|khoan lỗ|oil.?hole/i,
    fn: "Khoan lỗ thoát dầu trên Fork Pipe đúng vị trí & kích thước",
    modes: [
      {
        requirement: "Đủ lỗ & đúng vị trí lỗ thoát dầu theo bản vẽ",
        failureMode: "Sai vị trí / thiếu lỗ thoát dầu",
        effect: "Dầu không thoát đúng → đặc tính giảm chấn sai, lỗi chức năng",
        cause: "Gá đặt sai; bỏ sót lỗ trong cụm nhiều lỗ",
        classification: "S",
        controlPrevention: "Đồ gá định vị chống nhầm; trình tự khoan cố định",
        controlDetection: "Kiểm tra vị trí/đủ lỗ bằng đồ gá kiểm hoặc đếm lỗ",
        severity: 8,
        occurrence: 2,
        detection: 4,
        recommendedAction: "Chống nhầm vị trí bằng đồ gá + cảm biến đếm lỗ",
      },
      {
        requirement: "Đường kính lỗ đạt bản vẽ, không bavia trong lỗ",
        failureMode: "Đường kính lỗ sai / bavia trong lỗ",
        effect: "Lưu lượng dầu sai → đặc tính giảm chấn lệch; bavia gây kẹt",
        cause: "Mũi khoan mòn; thiếu bước gỡ bavia",
        classification: "",
        controlPrevention: "Quản lý tuổi thọ mũi khoan; bước gỡ bavia",
        controlDetection: "Kiểm tra đường kính bằng calip thông/chặn",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Giám sát tuổi thọ mũi khoan; thêm gỡ bavia & kiểm bavia",
      },
    ],
  },
  {
    // Mạ Ni-Cr cứng / Cr trang trí (Fork Pipe, Rod)
    keywords: /mạ|ni.?cr|chrom|chrome|plating/i,
    fn: "Mạ Ni-Cr cứng / Cr trang trí lên bề mặt trượt",
    modes: [
      {
        requirement: "Chiều dày lớp mạ đạt yêu cầu",
        failureMode: "Chiều dày lớp mạ không đạt",
        effect: "Mòn nhanh / gỉ sét → rò dầu, giảm tuổi thọ giảm xóc",
        cause: "Mật độ dòng/thời gian mạ sai; nồng độ bể mạ lệch",
        classification: "",
        controlPrevention: "Kiểm soát thông số bể mạ & dòng điện theo control plan",
        controlDetection: "Đo chiều dày lớp mạ theo tần suất",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Định kỳ phân tích bể mạ; đo chiều dày tự động",
      },
      {
        requirement: "Lớp mạ bám dính tốt, không bong tróc",
        failureMode: "Bong tróc / kém bám dính lớp mạ",
        effect: "Lớp mạ bong → xước phớt, rò dầu",
        cause: "Tiền xử lý/tẩy dầu kém; bề mặt nền bẩn",
        classification: "S",
        controlPrevention: "Quy trình tiền xử lý/tẩy rửa được kiểm soát",
        controlDetection: "Thử bám dính (bẻ/uốn) định kỳ",
        severity: 8,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Kiểm soát tiền xử lý; thêm thử bám dính định kỳ",
      },
      {
        requirement: "Bề mặt mạ không rỗ, cháy, vết",
        failureMode: "Lỗi bề mặt mạ (rỗ, cháy, vết)",
        effect: "Lỗi ngoại quan; điểm tập trung ăn mòn",
        cause: "Bể bẩn; dòng phân bố không đều; treo hàng sai",
        classification: "",
        controlPrevention: "Lọc bể mạ; bố trí treo hàng & anode hợp lý",
        controlDetection: "Kiểm tra ngoại quan 100% hoặc theo mẫu",
        severity: 5,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Bảo trì bể mạ & cải thiện cách treo hàng",
      },
    ],
  },
  {
    // Cán ren (Rod)
    keywords: /cán ren|lăn ren|thread.?roll|\bren\b/i,
    fn: "Cán ren trên Rod đạt biên dạng & dung sai ren",
    modes: [
      {
        requirement: "Biên dạng, đường kính & bước ren đạt bản vẽ (calip ren qua/chặn đạt)",
        failureMode: "Ren không đạt dung sai (calip ren không qua/chặn)",
        effect: "Lắp ghép ren lỏng/chặt → mối ghép yếu, rủi ro tuột",
        cause: "Bánh cán mòn; điều chỉnh sai; phôi sai kích thước trước cán",
        classification: "S",
        controlPrevention: "Quản lý tuổi thọ bánh cán; chuẩn phôi trước cán",
        controlDetection: "Kiểm tra bằng calip ren qua/chặn theo tần suất",
        severity: 8,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Giám sát tuổi thọ bánh cán; kiểm calip ren định kỳ",
      },
      {
        requirement: "Chân ren không tróc/nứt, đủ độ bền mỏi",
        failureMode: "Tróc / nứt chân ren",
        effect: "Giảm độ bền mỏi → gãy ren khi chịu tải",
        cause: "Lực cán quá lớn; vật liệu/độ cứng phôi lệch",
        classification: "S",
        controlPrevention: "Kiểm soát lực cán & độ cứng phôi đầu vào",
        controlDetection: "Kiểm tra ngoại quan chân ren; thử mỏi định kỳ",
        severity: 8,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Kiểm soát lực cán; kiểm tra độ cứng phôi đầu vào",
      },
    ],
  },
  {
    // Tiện (Fork Pipe, Rod)
    keywords: /tiện|turning|lathe/i,
    fn: "Tiện chi tiết (Fork Pipe / Rod) đạt kích thước & độ đồng tâm",
    modes: [
      {
        requirement: "Đường kính ngoài đạt dung sai bản vẽ",
        failureMode: "Đường kính ngoài ngoài dung sai",
        effect: "Không lắp khít với phớt/bạc → rò dầu, suy giảm chức năng giảm xóc",
        cause: "Dao tiện mòn; sai offset; trôi nhiệt",
        classification: "",
        controlPrevention: "Quản lý tuổi thọ dao; bù offset tự động",
        controlDetection: "Đo đường kính bằng panme/calip theo tần suất",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Lắp đo trong quá trình, tự bù offset dao",
      },
      {
        requirement: "Độ đồng tâm / độ đảo đạt bản vẽ",
        failureMode: "Độ đồng tâm / độ đảo không đạt",
        effect: "Rung, mòn phớt sớm, giảm xóc phát ra tiếng kêu",
        cause: "Gá kẹp không đồng tâm; mũi chống tâm mòn",
        classification: "",
        controlPrevention: "Kiểm tra/bảo dưỡng chấu kẹp & mũi chống tâm",
        controlDetection: "Đo độ đảo bằng đồng hồ so",
        severity: 6,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Định kỳ rà chấu kẹp; thêm kiểm tra độ đảo đầu chuyền",
      },
      {
        requirement: "Độ nhám bề mặt trượt đạt bản vẽ",
        failureMode: "Độ nhám bề mặt trượt không đạt",
        effect: "Bề mặt trượt kém → mòn phớt, rò dầu",
        cause: "Dao mòn; thông số cắt sai; rung",
        classification: "",
        controlPrevention: "Quy định thông số cắt & chu kỳ thay dao",
        controlDetection: "Đo độ nhám Ra theo tần suất",
        severity: 6,
        occurrence: 4,
        detection: 5,
        recommendedAction: "Tối ưu thông số cắt; giám sát tuổi thọ dao",
      },
    ],
  },
  {
    // Mài (Fork Pipe)
    keywords: /mài|grind/i,
    fn: "Mài bề mặt trượt đạt kích thước & độ nhám",
    modes: [
      {
        requirement: "Đường kính sau mài đạt dung sai bản vẽ",
        failureMode: "Đường kính sau mài ngoài dung sai",
        effect: "Lắp không khít với phớt → rò dầu",
        cause: "Đá mài mòn; bù sai; nhiệt",
        classification: "",
        controlPrevention: "Sửa đá định kỳ; bù kích thước",
        controlDetection: "Đo đường kính tự động/panme",
        severity: 7,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Đo trong quá trình có bù tự động",
      },
      {
        requirement: "Không cháy bề mặt khi mài (đảm bảo độ bền mỏi)",
        failureMode: "Cháy bề mặt do mài (grinding burn)",
        effect: "Giảm độ bền mỏi → nứt trục khi sử dụng",
        cause: "Lượng ăn dao lớn; thiếu dung dịch làm mát",
        classification: "S",
        controlPrevention: "Quy định lượng ăn dao & lưu lượng làm mát",
        controlDetection: "Kiểm tra cháy mài (nital etch) định kỳ",
        severity: 8,
        occurrence: 2,
        detection: 5,
        recommendedAction: "Kiểm soát thông số mài; giám sát lưu lượng làm mát",
      },
    ],
  },
  {
    // Đánh bóng (Fork Pipe, Rod)
    keywords: /đánh bóng|polish|buff/i,
    fn: "Đánh bóng bề mặt trượt đạt độ nhám & ngoại quan",
    modes: [
      {
        requirement: "Độ nhám & độ bóng bề mặt đạt yêu cầu",
        failureMode: "Độ nhám / độ bóng không đạt",
        effect: "Bề mặt trượt kém → mòn phớt, rò dầu",
        cause: "Bánh bóng mòn; lực/thời gian không đủ",
        classification: "",
        controlPrevention: "Quy định thay bánh bóng & thông số đánh bóng",
        controlDetection: "Đo độ nhám/kiểm ngoại quan theo mẫu",
        severity: 6,
        occurrence: 3,
        detection: 4,
        recommendedAction: "Chuẩn hóa thông số đánh bóng; giám sát bánh bóng",
      },
      {
        requirement: "Bề mặt không xước / lõm sau đánh bóng",
        failureMode: "Xước / lõm sau đánh bóng",
        effect: "Lỗi ngoại quan; xước phớt khi vận hành → rò dầu",
        cause: "Lẫn hạt mài; va đập khi thao tác/vận chuyển",
        classification: "",
        controlPrevention: "Vệ sinh hạt mài; bảo vệ chi tiết khi vận chuyển",
        controlDetection: "Kiểm tra ngoại quan",
        severity: 5,
        occurrence: 4,
        detection: 4,
        recommendedAction: "Kiểm soát sạch khu vực; cải thiện cách đựng/thao tác hàng",
      },
    ],
  },
];

const GENERIC_FN = (step: string) =>
  `Thực hiện "${step.replace(/[.;]+$/, "")}" đạt yêu cầu kỹ thuật`;

const GENERIC_MODES: Mode[] = [
  {
    requirement: "Thao tác thực hiện đúng hướng dẫn công việc",
    failureMode: "Thao tác thực hiện sai",
    effect: "Lỗi chuyển sang công đoạn sau; phải sửa hoặc khách khiếu nại",
    cause: "Quá trình chưa chống nhầm; phụ thuộc tay nghề công nhân",
    classification: "",
    controlPrevention: "Hướng dẫn công việc + đào tạo công nhân",
    controlDetection: "Kiểm tra xác nhận tại công đoạn",
    severity: 6,
    occurrence: 4,
    detection: 5,
    recommendedAction: "Thêm cơ cấu chống nhầm (poka-yoke) + xác nhận tại công đoạn",
  },
  {
    requirement: "Thực hiện đủ & đúng trình tự thao tác",
    failureMode: "Bỏ sót / sai trình tự thao tác",
    effect: "Sản phẩm chưa hoàn chỉnh; lỗi chức năng",
    cause: "Không có khóa liên động trình tự giữa các trạm",
    classification: "",
    controlPrevention: "Khóa liên động trình tự trạm",
    controlDetection: "Kiểm tra cuối chuyền",
    severity: 7,
    occurrence: 3,
    detection: 4,
    recommendedAction: "Thiết lập khóa liên động trình tự / cổng kiểm soát quá trình",
  },
];

function matchArchetype(step: string): Archetype | undefined {
  // Company/product-specific knowledge (PRO2 — Astemo) takes priority.
  return COMPANY.find((a) => a.keywords.test(step)) || A.find((a) => a.keywords.test(step));
}

function modeToRow(step: string, fn: string, m: Mode): GeneratedRow {
  return { processStep: step, function: fn, ...m };
}

/** Sinh các dòng PFMEA cho một công đoạn (mỗi yêu cầu → 1 dạng hỏng hóc). */
function generateForStep(step: string): GeneratedRow[] {
  const a = matchArchetype(step);
  const fn = a ? a.fn : GENERIC_FN(step);
  const modes = a ? a.modes : GENERIC_MODES;
  return modes.map((m) => modeToRow(step, fn, m));
}

/** Sinh bản nháp PFMEA đầy đủ cho danh sách công đoạn theo thứ tự. */
export function generateFallback(steps: string[]): GeneratedRow[] {
  return steps.flatMap(generateForStep);
}

/**
 * Phủ định một hạng mục yêu cầu để gợi ý dạng hỏng hóc.
 * VD: "Kích thước đạt bản vẽ" → "Kích thước không đạt bản vẽ".
 */
export function negateRequirement(req: string): string {
  const r = req.trim();
  if (!r) return "";
  if (/trong dung sai/i.test(r)) return r.replace(/trong dung sai/i, "ngoài dung sai");
  if (/\bđạt\b/i.test(r) && !/không đạt/i.test(r)) return r.replace(/\bđạt\b/i, "không đạt");
  if (/\bđúng\b/i.test(r)) return r.replace(/\bđúng\b/i, "sai");
  if (/\bđủ\b/i.test(r)) return r.replace(/\bđủ\b/i, "thiếu");
  if (/\bcó\b/i.test(r)) return r.replace(/\bcó\b/i, "không có");
  return `Không đảm bảo: ${r}`;
}

/**
 * Tương đương ngoại tuyến của nút "AI gợi ý" cho MỘT hạng mục yêu cầu:
 * trả về đúng một dạng hỏng hóc (phủ định của yêu cầu) kèm phân tích.
 */
export function analyzeRequirementFallback(args: {
  processStep: string;
  fn: string;
  requirement: string;
}): GeneratedRow {
  const a = matchArchetype(args.processStep);
  const fn = args.fn || (a ? a.fn : GENERIC_FN(args.processStep));
  const reqLower = args.requirement.trim().toLowerCase();

  // 1) Nếu khớp được hạng mục yêu cầu trong kho kiến thức → dùng nguyên phân tích.
  if (a && reqLower) {
    const hit =
      a.modes.find((m) => m.requirement.trim().toLowerCase() === reqLower) ||
      a.modes.find(
        (m) =>
          m.requirement.trim().toLowerCase().includes(reqLower) ||
          reqLower.includes(m.requirement.trim().toLowerCase()),
      );
    if (hit) return modeToRow(args.processStep, fn, { ...hit, requirement: args.requirement });
  }

  // 2) Nếu không khớp → tạo dạng hỏng hóc bằng phép phủ định + phân tích chung.
  const base = a ? a.modes[0] : GENERIC_MODES[0];
  return {
    processStep: args.processStep,
    function: fn,
    requirement: args.requirement,
    failureMode: negateRequirement(args.requirement) || base.failureMode,
    effect: base.effect,
    cause: base.cause,
    classification: base.classification,
    controlPrevention: base.controlPrevention,
    controlDetection: base.controlDetection,
    severity: base.severity,
    occurrence: base.occurrence,
    detection: base.detection,
    recommendedAction: base.recommendedAction,
  };
}
