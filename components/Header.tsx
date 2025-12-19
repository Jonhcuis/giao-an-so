import React from 'react';
import { Brain, ScanLine } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 transition-all duration-300">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight leading-none">Trợ lý</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">Tích hợp năng lực số</p>
        </div>
      </div>
      
      <button className="flex items-center gap-2 bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
        <ScanLine className="w-4 h-4" />
        <span>Học theo file gốc</span>
      </button>
    </header>
  );
};

export default Header;