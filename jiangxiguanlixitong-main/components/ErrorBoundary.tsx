import React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染可以显示降级 UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // 你可以自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认降级 UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 text-5xl text-red-500">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">出错了</h2>
            <p className="mb-4 text-slate-600">
              抱歉，应用程序遇到了一些问题。
            </p>
            <details className="mb-4 text-left text-sm text-slate-500">
              <summary className="cursor-pointer font-medium">错误详情</summary>
              <pre className="mt-2 overflow-auto rounded bg-slate-100 p-4">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 产品备注: 显式使用React变量以避免TypeScript警告
export default React.memo(ErrorBoundary);
