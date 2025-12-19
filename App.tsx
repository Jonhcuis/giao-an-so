
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUploadCard from './components/FileUploadCard';
import MainUploader from './components/MainUploader';
import LoginPage from './components/LoginPage';
import SelectInput from './components/SelectInput'; // Import new component
import { UploadedFile, ProcessingStatus } from './types';
import { generateLessonPlan } from './services/geminiService';
import { Download, Sparkles, LayoutTemplate, FileSpreadsheet, MessageCircle, RefreshCw, CheckCircle, LogOut, Settings } from 'lucide-react';

// Options for dropdowns
const classOptions = Array.from({ length: 12 }, (_, i) => ({ value: `Lớp ${i + 1}`, label: `Lớp ${i + 1}` }));
const subjectOptions = [
  { value: 'Toán', label: 'Toán' },
  { value: 'Ngữ Văn', label: 'Ngữ Văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Vật Lý', label: 'Vật Lý' },
  { value: 'Hóa Học', label: 'Hóa Học' },
  { value: 'Sinh Học', label: 'Sinh Học' },
  { value: 'Lịch Sử', label: 'Lịch Sử' },
  { value: 'Địa Lý', label: 'Địa Lý' },
  { value: 'Giáo dục Công dân', label: 'Giáo dục Công dân' },
  { value: 'Tin Học', label: 'Tin Học' },
  { value: 'Công Nghệ', label: 'Công Nghệ' },
  { value: 'Nghệ Thuật', label: 'Nghệ Thuật' },
  { value: 'Thể Dục', label: 'Thể Dục' },
  { value: 'Khoa Học Tự Nhiên', label: 'Khoa Học Tự Nhiên' },
  { value: 'Lịch Sử & Địa Lý', label: 'Lịch Sử & Địa Lý' },
  { value: 'Hoạt động trải nghiệm', label: 'Hoạt động trải nghiệm' },
  { value: 'Chưa xác định', label: 'Chưa xác định' },
];
const textbookOptions = [
  { value: 'Kết nối tri thức với cuộc sống', label: 'Kết nối tri thức với cuộc sống' },
  { value: 'Chân trời sáng tạo', label: 'Chân trời sáng tạo' },
  { value: 'Cánh diều', label: 'Cánh diều' },
  { value: 'Chưa xác định', label: 'Chưa xác định' },
];

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [standardTemplate, setStandardTemplate] = useState<UploadedFile | null>(null);
  const [competenceTable, setCompetenceTable] = useState<UploadedFile | null>(null);
  const [lessonPlan, setLessonPlan] = useState<UploadedFile | null>(null);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTextbook, setSelectedTextbook] = useState<string>('');

  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Persistence for session and selections
  useEffect(() => {
    const savedUser = localStorage.getItem('demo_user_session');
    if (savedUser) setUser(savedUser);

    const savedClass = localStorage.getItem('selected_class');
    if (savedClass) setSelectedClass(savedClass);
    const savedSubject = localStorage.getItem('selected_subject');
    if (savedSubject) setSelectedSubject(savedSubject);
    const savedTextbook = localStorage.getItem('selected_textbook');
    if (savedTextbook) setSelectedTextbook(savedTextbook);
  }, []);

  useEffect(() => {
    localStorage.setItem('selected_class', selectedClass);
  }, [selectedClass]);
  useEffect(() => {
    localStorage.setItem('selected_subject', selectedSubject);
  }, [selectedSubject]);
  useEffect(() => {
    localStorage.setItem('selected_textbook', selectedTextbook);
  }, [selectedTextbook]);


  const handleLogin = (email: string) => {
    setUser(email);
    localStorage.setItem('demo_user_session', email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('demo_user_session');
    localStorage.removeItem('selected_class');
    localStorage.removeItem('selected_subject');
    localStorage.removeItem('selected_textbook');
    reset();
  };

  const isLocked = !competenceTable;

  const handleLessonPlanSelect = async (file: UploadedFile) => {
    setLessonPlan(file);
    if (competenceTable) {
      processFiles(
        competenceTable, 
        file, 
        standardTemplate, 
        selectedClass || 'Chưa xác định', 
        selectedSubject || 'Chưa xác định', 
        selectedTextbook || 'Chưa xác định'
      );
    }
  };

  const processFiles = async (
    comp: UploadedFile, 
    lesson: UploadedFile, 
    template: UploadedFile | null,
    className: string,
    subjectName: string,
    textbookName: string
  ) => {
    setStatus('processing');
    setError(null);
    setResult('');

    try {
      let generatedContent = await generateLessonPlan(comp, lesson, template, className, subjectName, textbookName);
      setResult(generatedContent);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi xử lý giáo án.");
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const preHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Giáo án tích hợp Năng lực số</title>
        <style>
          @page {
            size: 21.0cm 29.7cm;
            margin: 2.0cm 1.5cm 2.0cm 2.5cm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13.0pt;
            line-height: 1.3;
            text-align: justify;
            color: black;
          }
          h1, h2, h3, h4 {
            font-family: 'Times New Roman', Times, serif;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          h1 { font-size: 16pt; text-transform: uppercase; text-align: center; }
          h2 { font-size: 14pt; }
          table {
            border-collapse: collapse;
            width: 100%;
            border: 0.5pt solid windowtext;
            margin: 10pt 0;
          }
          td, th {
            border: 0.5pt solid windowtext;
            padding: 5pt;
            vertical-align: top;
            font-size: 13pt;
          }
          th {
            background-color: #F2F2F2;
            font-weight: bold;
            text-align: center;
          }
          .red-text {
            color: red;
            font-weight: bold;
          }
          img {
            display: block;
            margin: 10pt auto;
            max-width: 100%;
          }
        </style>
      </head>
      <body>
    `;
    
    let processedResult = result;
    processedResult = processedResult.replace(/color:\s*red/gi, 'color: red; font-weight: bold;');
    
    const postHtml = "</body></html>";
    const html = preHtml + processedResult + postHtml;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Giao_an_5512_Tich_hop_NLS_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStatus('idle');
    setResult('');
    setLessonPlan(null);
    setError(null);
    // Keep selections for class, subject, textbook
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <Header />
      
      {/* User Status Bar */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-200/50 px-6 py-2 flex justify-end items-center gap-4 animate-fade-in-up">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Đang đăng nhập: <span className="text-indigo-600">{user}</span>
        </span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất
        </button>
      </div>

      <main className="flex-grow flex flex-col items-center px-4 pt-12 pb-24 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-12 relative animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>Trợ lý AI Giáo dục - Tối ưu CV 5512</span>
            </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Tích hợp <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Năng Lực Số</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Hệ thống tự động phân tích giáo án, <span className="font-semibold text-indigo-600">giữ nguyên 100% layout</span>, 
            và chèn mã Năng lực số (NLS) theo đúng yêu cầu chuyên môn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full z-10 uppercase tracking-widest shadow-sm">Bước 1</div>
             <FileUploadCard 
                label="Bảng mã Năng lực số" 
                subLabel="Tài liệu dữ liệu (Excel/Word/PDF)"
                icon={<FileSpreadsheet className="w-6 h-6"/>}
                iconColorClass="bg-blue-100 text-blue-600"
                onFileSelect={setCompetenceTable}
                uploadedFile={competenceTable}
                accept=".xlsx,.xls,.doc,.docx,.pdf"
              />
          </div>
          <div className="relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-600 text-white text-[10px] font-bold rounded-full z-10 uppercase tracking-widest shadow-sm">Tùy chọn</div>
             <FileUploadCard 
                label="Mẫu giáo án đích" 
                subLabel="Định dạng mong muốn (Docx)"
                icon={<LayoutTemplate className="w-6 h-6"/>}
                iconColorClass="bg-orange-100 text-orange-600"
                onFileSelect={setStandardTemplate}
                uploadedFile={standardTemplate}
                accept=".doc,.docx"
              />
          </div>
        </div>

        {/* New section for Class, Subject, Textbook selection */}
        <div className="w-full max-w-4xl mb-12 p-8 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-white animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <Settings className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Cấu hình bài học</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectInput
                    label="Lớp"
                    options={classOptions}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="Chọn lớp"
                    disabled={status === 'processing'}
                />
                <SelectInput
                    label="Môn học"
                    options={subjectOptions}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    placeholder="Chọn môn học"
                    disabled={status === 'processing'}
                />
                <SelectInput
                    label="Bộ sách"
                    options={textbookOptions}
                    value={selectedTextbook}
                    onChange={setSelectedTextbook}
                    placeholder="Chọn bộ sách"
                    disabled={status === 'processing'}
                />
            </div>
        </div>


        <div className="w-full animate-fade-in-up" style={{animationDelay: '0.3s'}}> {/* Adjusted animation delay */}
            <MainUploader 
              isLocked={isLocked} 
              onLessonPlanSelect={handleLessonPlanSelect}
              status={status}
            />
        </div>

        {status === 'error' && (
          <div className="w-full max-w-2xl p-6 mb-8 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center shadow-lg animate-bounce">
            <span className="font-bold block mb-1 text-lg">Lỗi xử lý</span>
            <p>{error}</p>
            <button onClick={reset} className="mt-4 text-sm font-bold underline">Thử lại</button>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12 animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Kết quả xử lý</h2>
                      <p className="text-slate-500 text-sm">Xem trước định dạng (có thể khác một chút so với Word thật)</p>
                  </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-slate-500 font-semibold hover:text-indigo-600 px-4 py-2.5 rounded-xl transition-all border border-slate-200 hover:border-indigo-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm giáo án khác
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Tải file Word (.doc)
                </button>
              </div>
            </div>
            
            <div className="markdown-body p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-auto max-h-[800px]">
              <div dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default App;
