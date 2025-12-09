import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 最简化的测试组件
const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#1e293b', fontSize: '2rem', marginBottom: '1rem' }}>
        江西酒店管理系统
      </h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
        如果您能看到这个页面，说明基本渲染正常
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#475569' }}>接下来我们将逐步排查问题...</p>
      </div>
    </div>
  );
};

console.log('🚀 应用开始加载...');

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ 找到根元素');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<SimpleTest />);
    console.log('✅ React应用渲染完成');
  } catch (error) {
    console.error('❌ React渲染失败:', error);
  }
} else {
  console.error('❌ 未找到根元素 #root');
}