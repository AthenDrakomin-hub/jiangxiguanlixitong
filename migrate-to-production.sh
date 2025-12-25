#!/bin/bash
# migrate-to-production.sh - 数据库转移脚本

echo "==========================================="
echo "江西酒店管理系统 - 数据库转移脚本"
echo "==========================================="

# 检查是否设置了必要的环境变量
if [ -z "$NEON_CONNECTION_STRING" ]; then
    echo "错误: 未设置 NEON_CONNECTION_STRING 环境变量"
    echo "请设置您的Neon数据库连接字符串"
    exit 1
fi

if [ -z "$VITE_ADMIN_USER" ] || [ -z "$VITE_ADMIN_PASS" ]; then
    echo "错误: 未设置管理员凭据"
    echo "请设置 VITE_ADMIN_USER 和 VITE_ADMIN_PASS"
    exit 1
fi

echo "✓ 环境变量检查通过"

# 验证数据库连接
echo "🔍 验证Neon数据库连接..."
npx tsx scripts/test-neon-connection.ts
if [ $? -ne 0 ]; then
    echo "❌ 数据库连接验证失败"
    exit 1
fi

echo "✓ 数据库连接验证通过"

# 设置生产环境变量
echo "🔧 设置生产环境配置..."
export DB_TYPE="neon"

# 部署到Vercel (如果在本地运行)
if [ "$LOCAL_DEPLOY" = "true" ]; then
    echo "📦 构建生产版本..."
    npm run build
    
    echo "🚀 启动本地生产服务器..."
    npx vercel dev --env DB_TYPE=neon --env NEON_CONNECTION_STRING="$NEON_CONNECTION_STRING"
else
    echo "💡 提示: 请将代码推送到GitHub并部署到Vercel"
    echo "   确保在Vercel环境中设置了以下环境变量:"
    echo "   - DB_TYPE=neon"
    echo "   - NEON_CONNECTION_STRING=your_connection_string"
    echo "   - VITE_ADMIN_USER=your_username" 
    echo "   - VITE_ADMIN_PASS=your_password"
fi

# 初始化数据
echo ""
echo "📋 数据初始化说明:"
echo "1. 部署完成后访问您的应用"
echo "2. 进入系统设置面板"
echo "3. 点击'初始化系统数据'按钮"
echo "4. 系统将自动创建所有数据表和初始数据"

echo ""
echo "🔍 验证步骤:"
echo "1. 使用'状态检查'功能验证数据库连接"
echo "2. 测试各个功能模块"
echo "3. 使用'数据同步'功能验证备份功能"

echo ""
echo "⚠️  安全提醒:"
echo "- 确保使用强密码"
echo "- 定期备份数据库"
echo "- 监控API访问日志"

echo ""
echo "==========================================="
echo "数据库转移准备就绪！"
echo "==========================================="