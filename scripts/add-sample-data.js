#!/usr/bin/env node

// 添加示例数据到Vercel Blob Storage
// 此脚本将创建一些示例数据并存储到Vercel Blob Storage中

import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🚀 开始添加示例数据...');

// 验证必要的环境变量
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ 缺少BLOB_READ_WRITE_TOKEN环境变量！');
  console.error('请确保在.env.local文件中设置BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

// 生成唯一ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 生成当前时间戳
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// 示例菜品数据
const sampleDishes = [
  {
    id: generateId(),
    name: '宫保鸡丁',
    description: '经典川菜，鸡肉丁与花生米炒制，口味鲜香微辣',
    price: 28.00,
    category: '小炒川菜',
    imageUrl: '',
    available: true,
    spiciness: 2
  },
  {
    id: generateId(),
    name: '红烧肉',
    description: '传统家常菜，五花肉炖煮至软糯，色泽红亮',
    price: 35.00,
    category: '小炒川菜',
    imageUrl: '',
    available: true,
    spiciness: 0
  },
  {
    id: generateId(),
    name: '蒸蛋羹',
    description: '嫩滑鸡蛋羹，营养丰富，老少皆宜',
    price: 12.00,
    category: '港式快餐',
    imageUrl: '',
    available: true,
    spiciness: 0
  },
  {
    id: generateId(),
    name: '鱼香肉丝',
    description: '猪肉丝配木耳胡萝卜，酸甜微辣口感',
    price: 32.00,
    category: '小炒川菜',
    imageUrl: '',
    available: true,
    spiciness: 3
  }
];

// 示例订单数据
const sampleOrders = [
  {
    id: generateId(),
    tableNumber: 'A1',
    source: 'LOBBY',
    status: '已支付',
    totalAmount: 60.00,
    createdAt: getCurrentTimestamp(),
    notes: '少盐',
    paymentMethod: 'CASH'
  },
  {
    id: generateId(),
    tableNumber: 'B2',
    source: 'ROOM_SERVICE',
    status: '已完成',
    totalAmount: 95.50,
    createdAt: getCurrentTimestamp(),
    notes: '加急',
    paymentMethod: 'MOBILE_WALLET'
  }
];

// 示例费用数据
const sampleExpenses = [
  {
    id: generateId(),
    amount: 1200.00,
    category: '食材采购',
    description: '蔬菜肉类采购',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: generateId(),
    amount: 800.00,
    category: '员工工资',
    description: '服务员工资',
    date: new Date().toISOString().split('T')[0]
  }
];

// 示例库存数据
const sampleInventory = [
  {
    id: generateId(),
    name: '大米',
    quantity: 50,
    unit: '公斤',
    minThreshold: 10,
    lastUpdated: getCurrentTimestamp()
  },
  {
    id: generateId(),
    name: '食用油',
    quantity: 30,
    unit: '升',
    minThreshold: 5,
    lastUpdated: getCurrentTimestamp()
  }
];

// 示例KTV房间数据
const sampleKtvRooms = [
  {
    id: generateId(),
    name: 'VIP888',
    status: '空闲',
    hourlyRate: 88.00,
    lastOccupied: null
  },
  {
    id: generateId(),
    name: 'MID666',
    status: '空闲',
    hourlyRate: 66.00,
    lastOccupied: null
  }
];

// 示例挂账账户数据
const sampleSignBillAccounts = [
  {
    id: generateId(),
    customerName: 'ABC公司',
    balance: 1200.00,
    creditLimit: 5000.00,
    status: '正常',
    createdAt: getCurrentTimestamp()
  }
];

// 示例酒店房间数据
const sampleHotelRooms = [
  {
    id: generateId(),
    roomNumber: '8201',
    roomType: '标准间',
    status: '空闲',
    dailyRate: 288.00,
    lastCheckOut: null
  },
  {
    id: generateId(),
    roomNumber: '8301',
    roomType: '豪华套房',
    status: '已入住',
    dailyRate: 588.00,
    lastCheckOut: null
  }
];

// 示例支付方式数据
const samplePaymentMethods = [
  {
    id: generateId(),
    name: '现金支付',
    englishName: 'Cash',
    isEnabled: true,
    qrCodeUrl: '',
    accountInfo: '',
    paymentType: 'CASH',
    currency: 'CNY',
    exchangeRate: 1.0000,
    sortOrder: 1,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  },
  {
    id: generateId(),
    name: '微信支付',
    englishName: 'WeChat Pay',
    isEnabled: true,
    qrCodeUrl: 'https://example.com/wechat-qrcode.png',
    accountInfo: '',
    paymentType: 'MOBILE_WALLET',
    currency: 'CNY',
    exchangeRate: 1.0000,
    sortOrder: 2,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  }
];

// 所有示例数据
const allSampleData = {
  dishes: sampleDishes,
  orders: sampleOrders,
  expenses: sampleExpenses,
  inventory: sampleInventory,
  ktv_rooms: sampleKtvRooms,
  sign_bill_accounts: sampleSignBillAccounts,
  hotel_rooms: sampleHotelRooms,
  payment_methods: samplePaymentMethods
};

// 生成Blob存储键名
function generateBlobKey(tableName, id) {
  return `${tableName}/${id}.json`;
}

// 将数据存储到Vercel Blob Storage
async function storeDataInBlob(tableName, data) {
  console.log(`💾 将 ${data.length} 条记录存储到Blob Storage (${tableName})...`);
  let successCount = 0;
  
  for (const item of data) {
    try {
      const blobKey = generateBlobKey(tableName, item.id);
      const blobResult = await put(blobKey, JSON.stringify(item), {
        access: 'public',
        contentType: 'application/json'
      });
      successCount++;
      
      // 显示进度（每条记录显示一次）
      console.log(`  ✅ 已存储: ${item.name || item.id}`);
    } catch (error) {
      console.error(`  ❌ 存储记录失败 (ID: ${item.id}):`, error.message);
    }
  }
  
  console.log(`✅ 成功将 ${successCount}/${data.length} 条记录存储到Blob Storage (${tableName})`);
  return successCount;
}

// 添加单个数据项到Blob Storage
async function addSingleItem(tableName, item) {
  try {
    const blobKey = generateBlobKey(tableName, item.id);
    const blobResult = await put(blobKey, JSON.stringify(item), {
      access: 'public',
      contentType: 'application/json'
    });
    console.log(`✅ 成功添加单项到 ${tableName}: ${item.name || item.id}`);
    return true;
  } catch (error) {
    console.error(`❌ 添加单项到 ${tableName} 失败 (ID: ${item.id}):`, error.message);
    return false;
  }
}

// 主函数
async function addSampleData() {
  console.log('🚀 开始添加示例数据到Vercel Blob Storage');
  console.log('=========================================');
  
  let totalSuccess = 0;
  let totalItems = 0;
  
  // 遍历所有数据类型
  for (const [tableName, data] of Object.entries(allSampleData)) {
    console.log(`\n🔄 处理表: ${tableName}`);
    
    if (data.length === 0) {
      console.log(`⚠️  ${tableName} 中没有数据，跳过`);
      continue;
    }
    
    totalItems += data.length;
    const successCount = await storeDataInBlob(tableName, data);
    totalSuccess += successCount;
    
    console.log(`📋 ${tableName} 处理完成: ${successCount}/${data.length} 条记录成功存储\n`);
  }
  
  console.log('=========================================');
  console.log(`🎉 所有示例数据添加完成！`);
  console.log(`📊 总计: ${totalSuccess}/${totalItems} 条记录成功存储`);
  
  return totalSuccess === totalItems;
}

// 运行主函数
async function main() {
  try {
    const success = await addSampleData();
    
    if (success) {
      console.log('\n✅ 示例数据添加成功！');
      console.log('\n💡 下一步操作:');
      console.log('1. 启动开发服务器: npm run dev');
      console.log('2. 访问应用并验证数据');
      console.log('3. 根据需要修改数据');
    } else {
      console.log('\n❌ 部分数据添加失败，请检查错误信息');
      process.exit(1);
    }
  } catch (error) {
    console.error('未处理的错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main();