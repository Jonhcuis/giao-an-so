import React, { useRef } from 'react';
import { Upload, CheckCircle2, FileText, FileSpreadsheet, Scale } from 'lucide-react';
import { UploadedFile } from '../types';
import { fileToGenerativePart } from '../services/geminiService';

interface FileUploadCardProps {
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  iconColorClass?: string;
  onFileSelect: (file: UploadedFile) => void;
  uploadedFile: UploadedFile | null;
  accept?: string;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ 
  label, 
  subLabel,
  icon, 
  iconColorClass = "bg-blue-100 text-blue-600",
  onFileSelect, 
  uploadedFile,
  accept = ".pdf,.doc,.docx,.txt"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const processedFile = await fileToGenerativePart(file);
        onFileSelect(processedFile);
      } catch (error) {
        console.error("Error processing file", error);
        alert("Lỗi đọc file. Vui lòng thử lại.");
      }
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept={accept}
      />
      <button 
        onClick={handleClick}
        className={`
          relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 w-full md:w-auto text-left group
          ${uploadedFile 
            ? 'bg-green-50/80 border-green-200 shadow-md' 
            : 'bg-white/80 border-white/40 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1'
          }
          backdrop-blur-sm
        `}
      >
        <div className={`p-3 rounded-xl transition-colors duration-300 ${uploadedFile ? 'bg-green-100 text-green-600' : iconColorClass}`}>
          {uploadedFile ? <CheckCircle2 className="w-6 h-6" /> : (icon || <Upload className="w-6 h-6" />)}
        </div>
        
        <div className="flex flex-col">
          <span className={`font-bold text-sm ${uploadedFile ? 'text-green-800' : 'text-slate-700'}`}>
            {uploadedFile ? "Đã tải lên thành công" : label}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">
            {uploadedFile ? uploadedFile.file.name : (subLabel || "Nhấn để chọn file")}
          </span>
        </div>

        {!uploadedFile && (
           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-4 h-4 text-slate-400" />
           </div>
        )}
      </button>
    </>
  );
};

export default FileUploadCard;