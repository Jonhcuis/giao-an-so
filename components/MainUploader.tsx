
import React, { useRef, useState, useEffect } from 'react';
import { Lock, UploadCloud, Loader2, Sparkles, FileText, Cpu } from 'lucide-react';
import { UploadedFile, ProcessingStatus } from '../types';
import { fileToGenerativePart } from '../services/geminiService';

interface MainUploaderProps {
  isLocked: boolean;
  onLessonPlanSelect: (file: UploadedFile) => void;
  status: ProcessingStatus;
}

const MainUploader: React.FC<MainUploaderProps> = ({ isLocked, onLessonPlanSelect, status }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);

  const steps = [
    "Đang đọc bảng mã năng lực số...",
    "Phân tích cấu trúc giáo án 5512...",
    "Đối chiếu hoạt động với chỉ báo NLS...",
    "Đang chèn mã và định dạng HTML...",
    "Hoàn tất bản thảo cuối cùng..."
  ];

  useEffect(() => {
    let interval: any;
    if (status === 'processing') {
      setStep(0);
      interval = setInterval(() => {
        setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      setStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleClick = () => {
    if (!isLocked && status !== 'processing') {
      fileInputRef.current?.click();
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const processedFile = await fileToGenerativePart(file);
        onLessonPlanSelect(processedFile);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="mt-8 mb-12 w-full max-w-3xl mx-auto">
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt"
      />
      
      <div 
        onClick={handleClick}
        className={`
          relative overflow-hidden rounded-[2.5rem] border-2 border-dashed p-12 text-center transition-all duration-300
          flex flex-col items-center justify-center min-h-[360px]
          ${isLocked 
            ? 'bg-slate-50/50 border-slate-200 cursor-not-allowed' 
            : 'bg-white/60 backdrop-blur-sm border-indigo-300 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer hover:bg-white/80 group'
          }
          ${status === 'processing' ? 'cursor-wait pointer-events-none border-indigo-200 bg-white/90' : ''}
        `}
      >
        {status === 'processing' ? (
          <div className="flex flex-col items-center relative z-10 w-full">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
                <div className="bg-white p-6 rounded-2xl shadow-lg relative">
                    <Cpu className="w-14 h-14 text-indigo-600 animate-pulse" />
                </div>
            </div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">AI đang học & đối chiếu...</h3>
            
            <div className="w-64 h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                ></div>
            </div>
            
            <p className="text-slate-500 font-medium animate-pulse">{steps[step]}</p>
          </div>
        ) : isLocked ? (
          <div className="relative z-10 opacity-70 grayscale transition-all duration-500">
            <div className="bg-slate-100 p-8 rounded-full mb-6 inline-flex mx-auto">
              <Lock className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-3">Chưa thể tải giáo án</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-2 text-lg">
              Vui lòng cung cấp <span className="font-bold text-slate-700">Bảng mã năng lực số</span> trước để AI có dữ liệu học tập.
            </p>
            <div className="inline-block px-4 py-1.5 bg-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide mt-2">
                Bước 1: Tải tài liệu tham khảo
            </div>
          </div>
        ) : (
          <div className="relative z-10">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>

            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-8 rounded-3xl mb-8 shadow-xl shadow-indigo-200 inline-flex mx-auto transition-all duration-500 animate-float group-hover:scale-110">
              <UploadCloud className="w-16 h-16 text-white transition-transform duration-500 group-hover:animate-wave" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">
              Tải lên Giáo án gốc
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
              Hệ thống sẽ đối chiếu với bảng mã NLS và <span className="text-indigo-600 font-bold">chèn mã chính xác</span> vào từng hoạt động dạy học.
            </p>
            
            <div className="flex items-center justify-center gap-3 mt-8 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100 py-2 px-4 rounded-lg">
                    <FileText className="w-3.5 h-3.5" /> Word/PDF
                </span>
                 <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 py-2 px-4 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5" /> AI Deep Learning
                </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainUploader;
