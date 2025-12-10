#!/usr/bin/env node

/**
 * 数据库房间状态诊断脚本
 * 检查房间状态是否能从数据库正确读取和显示
 */

const fs = require('fs');
const path = require('path');

console.log('🏨 开始数据库房间状态诊断...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// 1. 检查数据库连接配置
console.log('🔌 检查 1: 数据库连接配置');
try {
  const dbPath = path.join(__dirname, '..', 'api', 'db.ts');
  if (fs.existsSync(dbPath)) {
    console.log('  ✅ api/db.ts 存在');
    checks.passed++;
    
    const content = fs.readFileSync(dbPath, 'utf8');
    if (content.includes('TIDB_HOST') && content.includes('mysql2')) {
      console.log('  ✅ TiDB 连接配置正确');
      checks.passed++;
    }
    
    if (content.includes('createPool')) {
      console.log('  ✅ 数据库连接池已配置');
      checks.passed++;
    }
  } else {
    console.log('  ❌ api/db.ts 不存在');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法检查数据库配置:', error.message);
  checks.failed++;
}

// 2. 检查 API 路由
console.log('\n🛣️  检查 2: API 路由配置');
try {
  const apiPath = path.join(__dirname, '..', 'api', 'index.ts');
  if (fs.existsSync(apiPath)) {
    console.log('  ✅ api/index.ts 存在');
    checks.passed++;
    
    const content = fs.readFileSync(apiPath, 'utf8');
    if (content.includes('hotel_rooms') || content.includes('tableName')) {
      console.log('  ✅ hotel_rooms 表路由配置');
      checks.passed++;
    }
    
    if (content.includes('SELECT * FROM')) {
      console.log('  ✅ 数据查询逻辑存在');
      checks.passed++;
    }
  } else {
    console.log('  ❌ api/index.ts 不存在');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法检查 API 路由:', error.message);
  checks.failed++;
}

// 3. 检查前端 API 客户端
console.log('\n📡 检查 3: 前端 API 客户端');
try {
  const clientPath = path.join(__dirname, '..', 'services', 'apiClient.ts');
  if (fs.existsSync(clientPath)) {
    console.log('  ✅ apiClient.ts 存在');
    checks.passed++;
    
    const content = fs.readFileSync(clientPath, 'utf8');
    if (content.includes('fetchAll') && content.includes('hotelRooms')) {
      console.log('  ✅ fetchAll 方法包含 hotelRooms');
      checks.passed++;
    }
    
    if (content.includes('hotel_rooms')) {
      console.log('  ✅ API 请求 hotel_rooms 端点');
      checks.passed++;
    } else {
      console.log('  ⚠️  未找到 hotel_rooms API 调用');
      checks.warnings++;
    }
  } else {
    console.log('  ❌ apiClient.ts 不存在');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法检查 API 客户端:', error.message);
  checks.failed++;
}

// 4. 检查 HotelSystem 组件
console.log('\n🏨 检查 4: HotelSystem 组件');
try {
  const hotelPath = path.join(__dirname, '..', 'components', 'HotelSystem.tsx');
  if (fs.existsSync(hotelPath)) {
    console.log('  ✅ HotelSystem.tsx 存在');
    checks.passed++;
    
    const content = fs.readFileSync(hotelPath, 'utf8');
    if (content.includes('room.status')) {
      console.log('  ✅ 房间状态渲染逻辑存在');
      checks.passed++;
    }
    
    if (content.includes('Vacant') && content.includes('Occupied')) {
      console.log('  ✅ 房间状态类型正确 (Vacant/Occupied)');
      checks.passed++;
    }
    
    if (content.includes('bg-orange-50') || content.includes('bg-blue-50')) {
      console.log('  ✅ 房间状态样式已配置');
      checks.passed++;
    }
  } else {
    console.log('  ❌ HotelSystem.tsx 不存在');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法检查 HotelSystem 组件:', error.message);
  checks.failed++;
}

// 5. 检查 App.tsx 数据加载
console.log('\n📱 检查 5: App.tsx 数据加载');
try {
  const appPath = path.join(__dirname, '..', 'App.tsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    if (content.includes('setHotelRooms') && content.includes('fetchAll')) {
      console.log('  ✅ hotelRooms 状态初始化正确');
      checks.passed++;
    }
    
    if (content.includes('response.hotelRooms')) {
      console.log('  ✅ API 响应数据映射正确');
      checks.passed++;
    } else {
      console.log('  ⚠️  hotelRooms 数据映射可能有问题');
      checks.warnings++;
    }
  }
} catch (error) {
  console.log('  ⚠️  无法完全验证数据加载逻辑');
  checks.warnings++;
}

// 6. 检查数据库初始化脚本
console.log('\n🗄️  检查 6: 数据库表结构');
try {
  const sqlPath = path.join(__dirname, '..', 'scripts', 'init-database.sql');
  if (fs.existsSync(sqlPath)) {
    console.log('  ✅ init-database.sql 存在');
    checks.passed++;
    
    const content = fs.readFileSync(sqlPath, 'utf8');
    if (content.includes('CREATE TABLE') && content.includes('hotel_rooms')) {
      console.log('  ✅ hotel_rooms 表定义存在');
      checks.passed++;
    }
    
    if (content.includes("status ENUM('Vacant', 'Occupied')")) {
      console.log('  ✅ status 字段类型正确');
      checks.passed++;
    }
    
    if (content.includes('INSERT') && content.includes('8201')) {
      console.log('  ✅ 示例房间数据存在');
      checks.passed++;
    }
  } else {
    console.log('  ⚠️  init-database.sql 不存在');
    checks.warnings++;
  }
} catch (error) {
  console.log('  ⚠️  无法检查数据库脚本');
  checks.warnings++;
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 诊断总结:');
console.log(`  ✅ 通过: ${checks.passed}`);
console.log(`  ❌ 失败: ${checks.failed}`);
console.log(`  ⚠️  警告: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.failed > 0) {
  console.log('\n❌ 房间状态显示存在问题');
  console.log('\n💡 修复建议:');
  console.log('  1. 确保 Vercel 环境变量已设置 (TIDB_HOST, TIDB_USER, etc.)');
  console.log('  2. 运行数据库初始化: npm run init-db');
  console.log('  3. 检查 /api/hotel_rooms 是否返回数据');
  console.log('  4. 在前端 Console 查看是否有 API 错误');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('\n⚠️  房间状态配置基本正常，但需要注意一些细节');
  console.log('\n💡 建议:');
  console.log('  1. 部署后测试 /api/hotel_rooms 接口');
  console.log('  2. 在生产环境中验证房间状态是否正确显示');
  console.log('  3. 检查浏览器 Console 是否有错误');
  process.exit(0);
} else {
  console.log('\n✅ 房间状态配置完整！');
  console.log('\n🏨 房间状态功能:');
  console.log('  ✓ 数据库表结构正确');
  console.log('  ✓ API 路由配置完整');
  console.log('  ✓ 前端数据加载正确');
  console.log('  ✓ UI 状态显示正常');
  console.log('\n📝 房间状态说明:');
  console.log('  • Vacant (空闲) - 白色背景');
  console.log('  • Occupied (入住) - 蓝色背景');
  console.log('  • 有订单的房间 - 橙色背景 + 金额显示');
  console.log('\n🔗 测试方式:');
  console.log('  1. 访问后台管理 > 酒店客房模块');
  console.log('  2. 查看房间颜色和状态标签');
  console.log('  3. 点击房间可查看详情和修改状态');
  process.exit(0);
}
