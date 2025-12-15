import { put } from '@vercel/blob';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// 验证必要的环境变量
console.log('Checking environment variables...');
console.log(
  'BLOB_READ_WRITE_TOKEN:',
  process.env.BLOB_READ_WRITE_TOKEN ? 'Present' : 'Missing'
);
console.log('Current working directory:', process.cwd());

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ 缺少BLOB_READ_WRITE_TOKEN环境变量！');
  console.error('请确保在.env.local文件中设置BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

// 生成唯一ID
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// 获取当前时间戳
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// 生成8201-8232和8301-8332房间号列表
function generateRoomNumbers() {
  const rooms = [];

  // 生成82xx系列房间 (8201-8232)
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `82${i.toString().padStart(2, '0')}`;
    rooms.push({
      id: generateId(),
      number: roomNumber,
      floor: 2,
      status: 'Vacant',
      guestName: '',
      orders: [],
      lastOrderTime: null,
    });
  }

  // 生成83xx系列房间 (8301-8332)
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `83${i.toString().padStart(2, '0')}`;
    rooms.push({
      id: generateId(),
      number: roomNumber,
      floor: 3,
      status: 'Vacant',
      guestName: '',
      orders: [],
      lastOrderTime: null,
    });
  }

  return rooms;
}

// 生成Blob存储键名
function generateBlobKey(tableName, id) {
  return `${tableName}/${id}.json`;
}

// 将数据存储到Vercel Blob Storage
async function storeDataInBlob(tableName, data) {
  console.log(
    `💾 将 ${data.length} 条记录存储到Blob Storage (${tableName})...`
  );
  let successCount = 0;

  for (const item of data) {
    try {
      const blobKey = generateBlobKey(tableName, item.id);
      const blobResult = await put(blobKey, JSON.stringify(item), {
        access: 'public',
        contentType: 'application/json',
      });
      successCount++;

      // 显示进度（每条记录显示一次）
      console.log(`  ✅ 已存储: ${item.number}`);
    } catch (error) {
      console.error(`  ❌ 存储记录失败 (ID: ${item.id}):`, error.message);
    }
  }

  console.log(
    `✅ 成功将 ${successCount}/${data.length} 条记录存储到Blob Storage (${tableName})`
  );
  return successCount;
}

// 主函数
async function generateHotelRooms() {
  console.log('🚀 开始生成酒店房间数据...');
  console.log('=========================================');

  try {
    // 生成房间数据
    const hotelRooms = generateRoomNumbers();
    console.log(`📋 生成了 ${hotelRooms.length} 个房间`);

    // 存储到Blob Storage
    const successCount = await storeDataInBlob('hotel_rooms', hotelRooms);

    console.log('=========================================');
    if (successCount === hotelRooms.length) {
      console.log('🎉 所有房间数据生成并存储成功！');
      console.log('\n💡 下一步操作:');
      console.log('1. 启动开发服务器: npm run dev');
      console.log('2. 访问客房服务页面验证房间数据');
    } else {
      console.log(
        `⚠️  部分房间数据存储失败: ${successCount}/${hotelRooms.length}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('未处理的错误:', error);
    process.exit(1);
  }
}

// 执行主函数
generateHotelRooms();
