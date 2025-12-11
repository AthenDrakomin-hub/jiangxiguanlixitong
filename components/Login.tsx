import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // 检查密码强度
  const isPasswordStrong = (password: string) => {
    // 至少8位，包含大小写字母和数字
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 登录尝试次数限制
    if (loginAttempts >= 3) {
      setError('登录失败次数过多，请5分钟后再试 / Too many failed attempts, please try again in 5 minutes');
      return;
    }
    
    // 获取环境变量或默认凭证
    const env = (import.meta as any).env || {};
    const validUser = env.VITE_ADMIN_USER || APP_CONFIG.DEFAULT_ADMIN.username;
    const validPass = env.VITE_ADMIN_PASS || APP_CONFIG.DEFAULT_ADMIN.password;

    if (username === validUser) {
      // 检查密码
      if (password === validPass) {
        // 重置登录尝试次数
        setLoginAttempts(0);
        onLogin();
      } else {
        // 增加登录尝试次数
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        setError(`密码错误 / Invalid Password (${3 - newAttempts} attempts left)`);
      }
    } else {
      // 增加登录尝试次数
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      setError(`用户名不存在 / User not found (${3 - newAttempts} attempts left)`);
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
          <p className="text-slate-500 text-sm mt-1">江西酒店后端管理系统<br/>Backend Management System</p>
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
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password 密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && !isPasswordStrong(password) && (
              <div className="mt-2 text-xs text-amber-600">
                密码至少8位，需包含大小写字母和数字
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            disabled={loginAttempts >= 3}
          >
            <LogIn size={20} /> Login 登录
          </button>
        </form>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          Secure Access • Vercel Protected • 登录失败次数: {loginAttempts}/3
        </div>
      </div>
    </div>
  );
};

export default Login;