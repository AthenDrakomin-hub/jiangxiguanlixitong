#!/usr/bin/env node

// 导入菜品数据脚本
// 此脚本将提供的菜品数据存储到Vercel Blob Storage中

import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🚀 开始导入菜品数据...');

// 验证必要的环境变量
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ 缺少BLOB_READ_WRITE_TOKEN环境变量！');
  console.error('请确保在.env.local文件中设置BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

// 菜品数据
const dishesData = [
  {
    "id": "A1",
    "name": "港式快餐",
    "description": "经典港式风味快餐",
    "price": 25,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A2",
    "name": "星椒猪扒(炒饭)",
    "description": "星级辣椒猪排炒饭",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A3",
    "name": "星椒牛肉(炒饭)",
    "description": "星级辣椒牛肉炒饭",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A4",
    "name": "黑椒鸡肉(炒饭)",
    "description": "黑胡椒鸡肉炒饭",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A5",
    "name": "黑椒牛肉(炒饭)",
    "description": "黑胡椒牛肉炒饭",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A6",
    "name": "黑椒猪扒(意面)",
    "description": "黑胡椒猪排意大利面",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A7",
    "name": "黑椒鸡肉(意面)",
    "description": "黑胡椒鸡肉意大利面",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A8",
    "name": "黑椒牛肉(意面)",
    "description": "黑胡椒牛肉意大利面",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A9",
    "name": "咖喱鸡肉(炒饭)",
    "description": "咖喱风味鸡肉炒饭",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A10",
    "name": "咖喱鸡排(炒饭)",
    "description": "咖喱风味鸡排炒饭",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A11",
    "name": "咖喱牛排(意面)",
    "description": "咖喱风味牛排意大利面",
    "price": 34,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A12",
    "name": "咖喱鸡排(意面)",
    "description": "咖喱风味鸡排意大利面",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A13",
    "name": "咖喱鸡排(意面)",
    "description": "咖喱风味鸡排意大利面",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "A14",
    "name": "川酱茄瓜(意面)",
    "description": "四川风味茄子意大利面",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "A15",
    "name": "雪菜扣肉(意面)",
    "description": "雪菜扣肉意大利面",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A16",
    "name": "番茄牛肉(意面)",
    "description": "番茄牛肉意大利面",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A17",
    "name": "可乐鸡丁(炒饭)",
    "description": "可乐风味鸡丁炒饭",
    "price": 26,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A18",
    "name": "台卤牛肉(饭)",
    "description": "台湾风味卤牛肉饭",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A19",
    "name": "台式卤肉饭",
    "description": "经典台湾卤肉饭",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A20",
    "name": "蜜汁卤肉饭",
    "description": "蜜汁风味卤肉饭",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A21",
    "name": "宫保鸡丁(饭)",
    "description": "经典宫保鸡丁饭",
    "price": 26,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "A22",
    "name": "糖醋鸡肉(饭)",
    "description": "酸甜可口糖醋鸡肉饭",
    "price": 26,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A23",
    "name": "糖醋排骨(饭)",
    "description": "酸甜可口糖醋排骨饭",
    "price": 30,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A24",
    "name": "糖醋猪扒(饭)",
    "description": "酸甜可口糖醋猪排饭",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "A25",
    "name": "糖醋鱼片(饭)",
    "description": "酸甜可口糖醋鱼片饭",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "B1",
    "name": "云吞",
    "description": "传统广式云吞",
    "price": 20,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "B2",
    "name": "水饺",
    "description": "北方风味水饺",
    "price": 18,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "B3",
    "name": "海鲜炒饭",
    "description": "鲜香海鲜炒饭",
    "price": 32,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "B4",
    "name": "三鲜炒面",
    "description": "三种鲜味食材炒面",
    "price": 28,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "B5",
    "name": "酸菜炒米(面)",
    "description": "酸菜风味炒米或炒面",
    "price": 24,
    "category": "主食",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "C1",
    "name": "小湘笋",
    "description": "湖南风味小笋",
    "price": 22,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C2",
    "name": "野山椒爆猪肝",
    "description": "野山椒爆炒猪肝",
    "price": 28,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 3
  },
  {
    "id": "C3",
    "name": "剁椒鸡蛋",
    "description": "剁椒炒鸡蛋",
    "price": 18,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C4",
    "name": "歌乐山辣子鸡",
    "description": "重庆风味辣子鸡",
    "price": 32,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 3
  },
  {
    "id": "C5",
    "name": "新派麻婆豆腐",
    "description": "创新麻婆豆腐",
    "price": 20,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C6",
    "name": "湘西小炒肉",
    "description": "湘西风味小炒肉",
    "price": 26,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C7",
    "name": "剁椒鱼头",
    "description": "湖南特色剁椒鱼头",
    "price": 48,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 3
  },
  {
    "id": "C8",
    "name": "干煸椒麻鸭",
    "description": "干煸炒椒麻鸭",
    "price": 36,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C9",
    "name": "小炒牛肉",
    "description": "家常小炒牛肉",
    "price": 38,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C10",
    "name": "土豆红烧肉",
    "description": "经典土豆红烧肉",
    "price": 32,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "C11",
    "name": "红烧烤茄子",
    "description": "红烧风味烤茄子",
    "price": 22,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "C12",
    "name": "酸辣土豆丝",
    "description": "酸辣爽口土豆丝",
    "price": 16,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "C13",
    "name": "杏鲍菇炒肉",
    "description": "杏鲍菇炒肉片",
    "price": 26,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "C14",
    "name": "水煮肉片",
    "description": "四川风味水煮肉片",
    "price": 34,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 3
  },
  {
    "id": "C15",
    "name": "水煮鱼",
    "description": "四川风味水煮鱼",
    "price": 42,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 3
  },
  {
    "id": "C16",
    "name": "虎皮辣椒",
    "description": "家常虎皮辣椒",
    "price": 18,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C17",
    "name": "红烧腐竹",
    "description": "传统红烧腐竹",
    "price": 20,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "C18",
    "name": "辣椒炒肉",
    "description": "青椒炒肉片",
    "price": 24,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "C19",
    "name": "酱椒牛肉",
    "description": "酱椒炒牛肉",
    "price": 36,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C20",
    "name": "拌凉皮",
    "description": "陕西风味凉皮",
    "price": 16,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 1
  },
  {
    "id": "C21",
    "name": "黄豆炖猪脚",
    "description": "黄豆炖猪脚",
    "price": 36,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  },
  {
    "id": "C22",
    "name": "农家小炒肉",
    "description": "农家风味小炒肉",
    "price": 26,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 2
  },
  {
    "id": "C23",
    "name": "生炒牛肉饭",
    "description": "鲜嫩生炒牛肉饭",
    "price": 34,
    "category": "炒菜",
    "imageUrl": "",
    "available": true,
    "spiciness": 0
  }
];

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
      
      // 显示进度（每10条记录显示一次）
      if (successCount % 10 === 0 || successCount === data.length) {
        console.log(`  进度: ${successCount}/${data.length} 条记录已存储`);
      }
    } catch (error) {
      console.error(`  ❌ 存储记录失败 (ID: ${item.id}):`, error.message);
    }
  }
  
  console.log(`✅ 成功将 ${successCount}/${data.length} 条记录存储到Blob Storage (${tableName})`);
  return successCount;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始导入菜品数据到Vercel Blob Storage');
    console.log('=========================================');
    
    const successCount = await storeDataInBlob('dishes', dishesData);
    
    console.log('=========================================');
    console.log(`🎉 菜品数据导入完成！`);
    console.log(`📊 总计: ${successCount}/${dishesData.length} 条记录成功存储`);
    
    if (successCount === dishesData.length) {
      console.log('\n✅ 所有菜品数据导入成功！');
    } else {
      console.log(`\n⚠️  部分数据导入失败，请检查错误信息`);
    }
  } catch (error) {
    console.error('未处理的错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main();