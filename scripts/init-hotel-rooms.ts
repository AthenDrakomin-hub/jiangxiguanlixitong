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