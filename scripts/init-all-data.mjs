#!/usr/bin/env node
// scripts/init-all-data.mjs
// 一键初始化所有系统数据：房间、KTV、系统设置

const API_URL = process.env.VITE_API_URL || 'http://localhost:5173/api';

/**
 * 生成64间酒店房间
 * 8201-8232 (32间) + 8301-8332 (32间)
 */
function generateHotelRooms() {
  const rooms = [];

  // 8楼2区: 8201-8232
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `82${String(i).padStart(2, '0')}`;
    rooms.push({
      id: `room-${roomNumber}`,
      number: roomNumber,
      floor: 82,
      status: 'Vacant',
      orders: [],
    });
  }

  // 8楼3区: 8301-8332
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `83${String(i).padStart(2, '0')}`;
    rooms.push({
      id: `room-${roomNumber}`,
      number: roomNumber,
      floor: 83,
      status: 'Vacant',
      orders: [],
    });
  }

  return rooms;
}

/**
 * 生成1间KTV
 */
function generateKTVRooms() {
  return [
    {
      id: 'ktv-vip-001',
      name: 'VIP包厢',
      type: 'VIP',
      status: 'Available',
      hourlyRate: 200,
    },
  ];
}

/**
 * 生成系统设置（包含大厅配置）
 */
function generateSystemSettings() {
  return {
    id: 'system-settings-default',
    storeInfo: {
      name: '江西酒店 Jiangxi Hotel',
      address: 'Pasay City, Manila, Philippines',
      phone: '+63-XXX-XXXX',
      wifiSSID: 'JiangxiHotel-Guest',
      wifiPassword: 'welcome2024',
    },
    exchangeRate: 8.2,
    serviceChargeRate: 0.1,
    categories: ['热菜', '凉菜', '汤类', '主食', '酒水', '小吃'],
    payment: {
      enabledMethods: ['CASH', 'GCASH', 'MAYA', 'WECHAT', 'ALIPAY'],
      aliPayEnabled: true,
      weChatEnabled: true,
      gCashEnabled: true,
      mayaEnabled: true,
    },
    h5PageSettings: {
      enableCustomStyling: true,
      customHeaderColor: '#4F46E5',
      customButtonColor: '#DC2626',
      showStoreInfo: true,
      showWiFiInfo: true,
    },
    // 大厅配置
    lobbyEnabled: true,
    lobbyTableName: 'LOBBY',
  };
}

/**
 * 批量创建数据
 */
async function createBatch(collectionName, items) {
  console.log(`\n📝 正在初始化 ${collectionName}...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      const response = await fetch(`${API_URL}/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        successCount++;
      } else {
        errorCount++;
        const error = await response.text();
        console.error(`  ❌ 创建失败 ${item.id || item.number}:`, error);
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ 网络错误 ${item.id || item.number}:`, error.message);
    }
  }

  console.log(`  ✅ 成功: ${successCount} | ❌ 失败: ${errorCount}`);
  return { successCount, errorCount };
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('🏨 江西酒店管理系统 - 数据初始化');
  console.log('========================================');
  console.log(`API URL: ${API_URL}`);
  console.log('');

  const results = {
    hotelRooms: { successCount: 0, errorCount: 0 },
    ktvRooms: { successCount: 0, errorCount: 0 },
    systemSettings: { successCount: 0, errorCount: 0 },
  };

  // 1. 初始化酒店房间 (64间)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  初始化酒店房间 (64间)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const hotelRooms = generateHotelRooms();
  console.log(`   8楼2区: 8201-8232 (32间)`);
  console.log(`   8楼3区: 8301-8332 (32间)`);
  results.hotelRooms = await createBatch('hotel_rooms', hotelRooms);

  // 2. 初始化KTV (1间)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  初始化KTV包厢 (1间)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const ktvRooms = generateKTVRooms();
  console.log(`   VIP包厢 (ktv-vip-001)`);
  results.ktvRooms = await createBatch('ktv_rooms', ktvRooms);

  // 3. 初始化系统设置 (包含大厅)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  初始化系统设置');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const systemSettings = generateSystemSettings();
  console.log(`   大厅点餐: ${systemSettings.lobbyEnabled ? '已启用' : '未启用'}`);
  console.log(`   大厅名称: ${systemSettings.lobbyTableName}`);
  results.systemSettings = await createBatch('system_settings', [systemSettings]);

  // 汇总结果
  console.log('\n========================================');
  console.log('📊 初始化完成汇总');
  console.log('========================================');
  console.log(`✅ 酒店房间: ${results.hotelRooms.successCount}/${hotelRooms.length}`);
  console.log(`✅ KTV包厢:  ${results.ktvRooms.successCount}/${ktvRooms.length}`);
  console.log(`✅ 系统设置: ${results.systemSettings.successCount}/1`);
  console.log('');

  const totalSuccess = 
    results.hotelRooms.successCount + 
    results.ktvRooms.successCount + 
    results.systemSettings.successCount;
  const totalExpected = hotelRooms.length + ktvRooms.length + 1;

  if (totalSuccess === totalExpected) {
    console.log('🎉 所有数据初始化成功！');
  } else {
    console.log(`⚠️  部分数据初始化失败 (${totalSuccess}/${totalExpected})`);
    process.exit(1);
  }

  console.log('========================================\n');
}

main().catch((error) => {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
});
