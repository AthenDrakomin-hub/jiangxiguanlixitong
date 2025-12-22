// scripts/init-hotel-rooms.ts
// 初始化酒店房间数据：8201-8232 (32间) + 8301-8332 (32间) = 64间

import { HotelRoom } from '../types';

/**
 * 生成酒店房间数据
 * 8楼: 8201-8232 (32间)
 * 8楼: 8301-8332 (32间)
 * 共计: 64间
 */
export function generateHotelRooms(): HotelRoom[] {
  const rooms: HotelRoom[] = [];

  // 8楼 8201-8232 (32间)
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `82${String(i).padStart(2, '0')}`;
    rooms.push({
      id: `room-${roomNumber}`,
      number: roomNumber,
      floor: 82, // 8楼2区
      status: 'Vacant',
      orders: [],
    });
  }

  // 8楼 8301-8332 (32间)
  for (let i = 1; i <= 32; i++) {
    const roomNumber = `83${String(i).padStart(2, '0')}`;
    rooms.push({
      id: `room-${roomNumber}`,
      number: roomNumber,
      floor: 83, // 8楼3区
      status: 'Vacant',
      orders: [],
    });
  }

  return rooms;
}

/**
 * 打印房间列表供验证
 */
export function printRoomList() {
  const rooms = generateHotelRooms();
  
  console.log('========================================');
  console.log('酒店房间初始化数据');
  console.log(`总计: ${rooms.length} 间房`);
  console.log('========================================\n');

  // 按楼层分组
  const floor82 = rooms.filter(r => r.floor === 82);
  const floor83 = rooms.filter(r => r.floor === 83);

  console.log(`8楼2区 (${floor82.length}间):`);
  console.log(floor82.map(r => r.number).join(', '));
  console.log();

  console.log(`8楼3区 (${floor83.length}间):`);
  console.log(floor83.map(r => r.number).join(', '));
  console.log();

  console.log('========================================');
  console.log('JSON 数据预览 (前3间):');
  console.log(JSON.stringify(rooms.slice(0, 3), null, 2));
  console.log('========================================');
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  printRoomList();
}

export default generateHotelRooms;
