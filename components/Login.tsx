import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (userRole?: string, language?: string) => void; // 添加用户角色和语言参数
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 调用后端认证 API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 登录成功，保存认证状态到 sessionStorage
        sessionStorage.setItem('jx_auth', 'true');
        
        // 保存用户角色到 sessionStorage（如果存在）
        if (result.user && result.user.role) {
          sessionStorage.setItem('jx_user_role', result.user.role);
        }
        
        // 保存用户语言到 sessionStorage（如果存在）
        if (result.user && result.user.language) {
          sessionStorage.setItem('jx_user_language', result.user.language);
        }
        
        // 调用 onLogin 回调函数并传递用户角色和语言
        onLogin(result.user?.role || 'staff', result.user?.language || 'zh');
      } else {
        setError(result.message || '登录失败 / Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        '登录失败: ' + (error instanceof Error ? error.message : '网络错误')
      );
    } finally {
      setIsLoading(false);
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
                placeholder=""
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
                placeholder=""
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !username || !password}
          >
            <LogIn size={20} /> {isLoading ? 'Logging in...' : 'Login 登录'}
          </button>
        </form>

        <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-400">
          Secure Access • Backend Authentication
        </div>
      </div>
    </div>
  );
};

export default Login;