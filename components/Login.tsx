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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 检查是否已达到最大登录尝试次数
      if (loginAttempts >= 3) {
        setError('登录尝试次数已达上限 / Max login attempts reached');
        return;
      }

      // 获取环境变量或默认凭证
      // 产品备注: 使用类型安全的方式访问环境变量
      const validUser = import.meta.env.VITE_ADMIN_USER || APP_CONFIG.DEFAULT_ADMIN.username;
      const validPass = import.meta.env.VITE_ADMIN_PASS || APP_CONFIG.DEFAULT_ADMIN.password;

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
          setError(
            `密码错误 / Invalid Password (${3 - newAttempts} attempts left)`
          );
        }
      } else {
        // 增加登录尝试次数
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        setError(
          `用户名不存在 / User not found (${3 - newAttempts} attempts left)`
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      // 添加错误处理，防止白屏
      setError('登录过程中发生错误: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="animate-fade-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-8 pb-0 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-500/30">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">系统登录 Login</h2>
          <p className="mt-1 text-sm text-slate-500">
            江西酒店后端管理系统
            <br />
            Backend Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 p-8">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Username 账号
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Password 密码
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
            disabled={loginAttempts >= 3}
          >
            <LogIn size={20} /> Login 登录
          </button>
        </form>

        <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-400">
          Secure Access • Vercel Protected • 登录失败次数: {loginAttempts}/3
        </div>
      </div>
    </div>
  );
};

export default Login;
