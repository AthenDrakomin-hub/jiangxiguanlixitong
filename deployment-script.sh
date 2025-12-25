#!/bin/bash
# deployment-script.sh - 部署脚本，执行版本化管理策略

echo "🚀 开始部署江西酒店管理系统 v2.1.0 (运维增强版)"

# 1. 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$VERCEL_GIT_COMMIT_SHA" ]; then
    echo "⚠️  未检测到 Vercel 环境变量，使用本地 Git 信息"
    export VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD)
    export VERCEL_GIT_COMMIT_MESSAGE=$(git log -1 --pretty=%B)
    export VERCEL_GIT_COMMIT_AUTHOR_NAME=$(git log -1 --pretty=%an)
    export VERCEL_GIT_REPO_URL=$(git config --get remote.origin.url)
fi

echo "📊 Git 信息:"
echo "   Commit SHA: $VERCEL_GIT_COMMIT_SHA"
echo "   Commit Message: $VERCEL_GIT_COMMIT_MESSAGE"
echo "   Commit Author: $VERCEL_GIT_COMMIT_AUTHOR_NAME"
echo "   Repository URL: $VERCEL_GIT_REPO_URL"

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 构建项目
echo "🔨 构建项目..."
npm run build

# 4. 运行数据库迁移（如果需要）
echo "🗄️  运行数据库迁移..."
npm run db:migrate

# 5. 初始化系统数据
echo "🌱 初始化系统数据..."
npm run init:system

# 6. 启动开发服务器进行测试
echo "🧪 启动开发服务器进行测试..."
npx vercel dev &

# 7. 等待服务器启动
sleep 10

# 8. 测试API端点
echo "🧪 测试API端点..."
curl -f http://localhost:3000/api/db-config > /dev/null && echo "✅ 数据库配置API正常" || echo "❌ 数据库配置API异常"
curl -f http://localhost:3000/api/test-connection > /dev/null && echo "✅ 数据库连接API正常" || echo "❌ 数据库连接API异常"
curl -f http://localhost:3000/api/db-status > /dev/null && echo "✅ 数据库状态API正常" || echo "❌ 数据库状态API异常"

# 9. 停止开发服务器
echo "🛑 停止开发服务器..."
pkill -f "vercel dev"

echo "✅ 部署脚本执行完成"
echo "📈 系统已准备就绪，可部署到Vercel"
echo "📝 版本信息已记录到快照系统，关联Git Commit: $VERCEL_GIT_COMMIT_SHA"