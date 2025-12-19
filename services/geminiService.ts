

import { GoogleGenAI } from "@google/genai";
import { UploadedFile } from "../types";

declare global {
  interface Window {
    mammoth: {
      convertToHtml: (input: { arrayBuffer: ArrayBuffer }, options?: any) => Promise<{ value: string, messages: any[] }>;
      images: any;
    };
    XLSX: any;
    katex: any;
    marked: any;
  }
}

export const fileToGenerativePart = async (file: File): Promise<UploadedFile> => {
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
  const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx' )|| file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xls');

  if (isDocx) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        if (window.mammoth) {
          try {
            const imageMap: Record<string, string> = {};
            let imageCounter = 0;
            const options = {
              styleMap: [
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Heading 1'] => h2:fresh",
                "table => table.table-bordered"
              ],
              convertImage: window.mammoth.images.imgElement((image: any) => {
                return image.read("base64").then((imageBuffer: string) => {
                  imageCounter++;
                  const placeholder = `IMAGE_PLACEHOLDER_${imageCounter}`;
                  imageMap[placeholder] = `data:${image.contentType};base64,${imageBuffer}`;
                  return { src: placeholder };
                });
              })
            };
            const result = await window.mammoth.convertToHtml({ arrayBuffer }, options);
            resolve({
              file,
              base64: '',
              mimeType: 'text/html',
              textContent: result.value,
              imageMap
            });
          } catch (err) {
            reject(new Error("Lỗi đọc file Word."));
          }
        } else {
          reject(new Error("Thư viện Mammoth chưa sẵn sàng."));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  if (isExcel) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        if (window.XLSX) {
          try {
            const workbook = window.XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            resolve({
              file,
              base64: '',
              mimeType: 'text/csv',
              textContent: window.XLSX.utils.sheet_to_csv(worksheet)
            });
          } catch (err) {
            reject(new Error("Lỗi đọc file Excel."));
          }
        } else {
          reject(new Error("Thư viện SheetJS chưa sẵn sàng."));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({ file, base64: base64Data, mimeType: file.type });
      }
    };
    reader.onerror = () => reject(new Error("Lỗi đọc file."));
    reader.readAsDataURL(file);
  });
};

const getPart = (file: UploadedFile) => {
  if (file.textContent) return { text: `TÀI LIỆU [${file.file.name}]:\n${file.textContent}` };
  return { inlineData: { mimeType: file.mimeType, data: file.base64 } };
};

export const generateLessonPlan = async (
  competenceTable: UploadedFile,
  lessonPlan: UploadedFile,
  standardTemplate: UploadedFile | null,
  selectedClass: string,
  selectedSubject: string,
  selectedTextbook: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `BẠN LÀ CHUYÊN GIA GIÁO DỤC SỐ CAO CẤP.
Nhiệm vụ: Tích hợp mã chỉ báo Năng lực số (NLS) vào giáo án HTML 5512 một cách phong phú và sáng tạo.

NGỮ CẢNH DẠY HỌC HIỆN TẠI:
- Lớp: ${selectedClass || 'Chưa xác định'}
- Môn học: ${selectedSubject || 'Chưa xác định'}
- Bộ sách: ${selectedTextbook || 'Chưa xác định'}

QUY TRÌNH TƯ DUY NÂNG CAO (PHẢI THỰC HIỆN):
1. HỌC SÂU BẢNG MÃ: Ghi nhớ các mã chỉ báo (ví dụ: 1.1.CB1a, 3.2.CB1b...) từ tài liệu được cung cấp. Nắm vững ý nghĩa và mục tiêu của từng năng lực số.
2. NHẬN DIỆN CÔNG CỤ & HỌC LIỆU (TRA CỨU CHUYÊN SÂU CÓ NGỮ CẢNH):
   - Khi thấy các từ khóa như GeoGebra, Quizziz, Canva, Google Forms, Padlet, Phet, Kahoot, ChatGPT, Google Search, Khan Academy, Coursera, VNEDU, LMS, v.v..., hãy sử dụng công cụ tìm kiếm để TÌM HIỂU SÂU.
   - **Đặc biệt, khi tìm kiếm, hãy kết hợp từ khóa công cụ với các thông tin về Lớp, Môn học và Bộ sách (nếu có) để tìm kiếm các ứng dụng sư phạm cụ thể và phù hợp nhất.**
   - Tập trung vào các khía cạnh sau:
     - **Tính năng cốt lõi**: Công cụ đó làm được gì?
     - **Ứng dụng sư phạm**: Công cụ đó thường được dùng như thế nào trong dạy học và giáo dục? Nó hỗ trợ các hoạt động nào của giáo viên và học sinh?
     - **Phù hợp môn học/cấp lớp/bộ sách**: Công cụ này có thể tối ưu cho môn học/cấp lớp/bộ sách nào? (ví dụ: GeoGebra cho Toán học lớp 8 sách Cánh diều).
3. LÀM PHONG PHÚ MÔ TẢ (TỔNG HỢP & CÁ NHÂN HÓA):
   - Không chỉ chép nguyên văn bảng mã. Hãy kết hợp nội dung bảng mã với ngữ cảnh sử dụng công cụ/học liệu và thông tin Lớp/Môn/Bộ sách đã cho.
   - **CÔNG THỨC:** <span style="color: red; font-weight: bold;">[Mã chỉ báo]: [Nội dung bảng mã] thông qua [Tên công cụ/Hành động cụ thể] để [Mô tả chi tiết ứng dụng/lợi ích trong ngữ cảnh ${selectedClass}, môn ${selectedSubject}, bộ sách ${selectedTextbook}]</span>.
   - **Mục tiêu:** Mô tả phải thể hiện sự hiểu biết sâu sắc về cả năng lực số và công cụ, làm cho mô tả trở nên sống động, cụ thể, và phù hợp với hoạt động dạy học được đề cập trong giáo án, trong ngữ cảnh đã cung cấp.

VÍ DỤ LÀM PHONG PHÚ (có ngữ cảnh):
- Thay vì: <span style="color: red; font-weight: bold;">[1.1.CB1a]: Tìm kiếm và lọc dữ liệu.</span>
- Hãy viết: <span style="color: red; font-weight: bold;">[1.1.CB1a]: Tìm kiếm và khai thác dữ liệu số thông qua việc sử dụng Google Search để thu thập tư liệu bài học về biến đổi khí hậu, phục vụ cho môn Địa lý lớp 10 sách Kết nối tri thức</span>.
- Hoặc: <span style="color: red; font-weight: bold;">[3.2.CB1b]: Tạo mới nội dung số thông qua việc thiết kế mô hình hình học động trên phần mềm GeoGebra để minh họa các định lý tam giác trong môn Toán lớp 8 sách Cánh diều</span>.
- Hoặc: <span style="color: red; font-weight: bold;">[2.2.CB1c]: Tương tác và chia sẻ thông tin số an toàn thông qua việc tạo và quản lý nhóm học tập trên Padlet để học sinh ${selectedClass} môn ${selectedSubject} cùng đóng góp ý tưởng cho dự án Lịch sử</span>.


QUY TẮC ĐỊNH DẠNG:
- Luôn dùng: <span style="color: red; font-weight: bold;">[Mã_chỉ_báo]: [Mô tả phong phú]</span>.
- TUYỆT ĐỐI KHÔNG có chữ "NLS" trong mã.
- Mã chỉ báo phải chính xác 100% so với bảng mã Năng lực số được cung cấp.

YÊU CẦU TRÌNH BÀY (HTML):
1. MỤC 2.3 (Năng lực số): Liệt kê danh sách các năng lực số sẽ phát triển trong bài với mô tả phong phú.
2. TIẾN TRÌNH DẠY HỌC: Chèn mã và mô tả ngay sau các hoạt động tương ứng.
3. BẢNG TỔNG HỢP CUỐI GIÁO ÁN: Giữ bảng 3 cột (Hoạt động | Hành động | Mã & Mô tả phong phú).

LƯU Ý: Giữ nguyên 100% layout, hình ảnh và nội dung gốc của giáo án. Chỉ chèn thêm thông tin NLS.`;

  const contents = [
    {
      role: "user",
      parts: [
        { text: "Dưới đây là BẢNG MÃ NĂNG LỰC SỐ để đối chiếu:" },
        getPart(competenceTable),
        { text: `Với ngữ cảnh dạy học Lớp: ${selectedClass}, Môn học: ${selectedSubject}, Bộ sách: ${selectedTextbook}, hãy phân tích GIÁO ÁN GỐC này. Nếu có các công cụ như GeoGebra, Quizziz, Canva, Google Forms, Padlet, Phet, Kahoot, ChatGPT, Google Search, Khan Academy, Coursera, VNEDU, LMS, v.v... hãy tra cứu CHUYÊN SÂU về ứng dụng sư phạm của chúng và làm phong phú mô tả năng lực số khi chèn vào giáo án:` },
        getPart(lessonPlan)
      ]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Tăng nhẹ để AI linh hoạt hơn trong cách viết mô tả phong phú
        tools: [{ googleSearch: {} }] // Kích hoạt Google Search để tra cứu công cụ
      }
    });
    
    let text = response.text || '';
    
    // Nếu kết quả trả về có chứa nguồn trích dẫn từ Google Search, AI có thể thêm vào cuối, ta cần làm sạch
    text = text.replace(/^```html\n?/, '').replace(/\n?```$/, '');

    if (lessonPlan.imageMap) {
      for (const [placeholder, base64Src] of Object.entries(lessonPlan.imageMap)) {
        text = text.replace(new RegExp(placeholder, 'g'), base64Src);
      }
    }
    
    return text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`Lỗi xử lý AI: ${error.message}`);
  }
};
