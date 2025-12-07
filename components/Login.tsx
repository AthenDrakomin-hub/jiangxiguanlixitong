
import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get credentials from Env Vars or default safely
    const env = (import.meta as any).env || {};
    // VITE_ADMIN_USER and VITE_ADMIN_PASS should be set in Vercel Environment Variables
    const validUser = env.VITE_ADMIN_USER || 'admin';
    const validPass = env.VITE_ADMIN_PASS || 'jx88888888';

    if (username === validUser && password === validPass) {
      onLogin();
    } else {
      setError('Invalid Credentials / 账号或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-8 pb-0 text-center">
           <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
              <Lock className="text-white" size={32} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">系统登录 Login</h2>
           <p className="text-slate-500 text-sm mt-1">江西饭店后端管理系统<br/>Backend Management System</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
             </div>
           )}

           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Username 账号</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="admin"
                />
             </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Password 密码</label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="••••••"
                />
             </div>
           </div>

           <button 
             type="submit"
             className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
           >
             <LogIn size={20} /> Login 登录
           </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
           Secure Access • Vercel Protected
        </div>
      </div>
    </div>
  );
};

export default Login;
