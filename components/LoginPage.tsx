
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, Brain } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!email.includes('@')) {
      setError('Vui lòng nhập đúng định dạng Gmail.');
      return;
    }

    setLoading(true);

    // Specific account demo logic
    setTimeout(() => {
      if (email === 'qtrungdemo@gmail.com' && password === '12344321') {
        onLogin(email);
      } else if (email !== 'qtrungdemo@gmail.com') {
        setError('Tài khoản này chưa được cấp quyền truy cập demo.');
        setLoading(false);
      } else {
        setError('Mật khẩu không chính xác.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dot-pattern">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-xl inline-flex mb-6 animate-float">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Trợ lý Giáo dục</h1>
          <p className="text-slate-500 font-medium">Tích hợp Năng lực số - Công văn 5512</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-500/10 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Gmail truy cập</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập Gmail của bạn"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 animate-shake text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-95 shadow-indigo-200'
                }
              `}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập ngay
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>Hệ thống bảo mật</span>
            </div>
            <p className="text-slate-400 text-xs text-center leading-relaxed">
              Vui lòng sử dụng tài khoản Gmail được cấp quyền demo.<br/>
              Hệ thống mã hóa dữ liệu 256-bit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
