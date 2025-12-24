import React, { useState } from 'react';
import { dbManager } from '../lib/database.js';
import { Order, Dish, OrderStatus } from '../types.js';

const ValidationTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testValidOrder = async () => {
    try {
      setResult('');
      setError('');
      
      const validOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        tableId: 'A1',
        items: [
          {
            id: '1',
            dishId: 'dish1',
            name: '测试菜品',
            quantity: 1,
            price: 100,
          }
        ],
        status: OrderStatus.PENDING,
        total: 100,
        paid: false,
        timestamp: new Date().toISOString(),
        customerName: '测试客户',
      };
      
      const database = dbManager.getDatabase();
      const createdOrder = await database.create<Order>('orders', validOrder);
      
      setResult(`成功创建订单: ${createdOrder.id}`);
    } catch (err: any) {
      setError(`创建有效订单失败: ${err.message}`);
    }
  };

  const testInvalidOrder = async () => {
    try {
      setResult('');
      setError('');
      
      // 创建一个缺少必要字段的订单（缺少total）
      const invalidOrder: any = {
        tableId: 'A2',
        items: [],
        status: 'PENDING',
        // 注意：缺少total字段，应该触发验证错误
        paid: false,
        timestamp: new Date().toISOString(),
      };
      
      const database = dbManager.getDatabase();
      await database.create('orders', invalidOrder);
      
      setResult('意外成功：应该验证失败但没有');
    } catch (err: any) {
      setError(`预期的验证错误: ${err.message}`);
    }
  };

  const testValidDish = async () => {
    try {
      setResult('');
      setError('');
      
      const validDish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'> = {
        name: '宫保鸡丁',
        category: '热菜',
        price: 3500,
        available: true,
      };
      
      const database = dbManager.getDatabase();
      const createdDish = await database.create<Dish>('dishes', validDish);
      
      setResult(`成功创建菜品: ${createdDish.id}`);
    } catch (err: any) {
      setError(`创建有效菜品失败: ${err.message}`);
    }
  };

  const testInvalidDish = async () => {
    try {
      setResult('');
      setError('');
      
      // 创建一个缺少必要字段的菜品（价格为负数）
      const invalidDish: any = {
        name: '测试菜品',
        category: '热菜',
        price: -100, // 价格为负数，应该触发验证错误
        available: true,
      };
      
      const database = dbManager.getDatabase();
      await database.create('dishes', invalidDish);
      
      setResult('意外成功：应该验证失败但没有');
    } catch (err: any) {
      setError(`预期的验证错误: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">数据验证测试</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">有效数据测试</h3>
          <button
            onClick={testValidOrder}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            测试有效订单
          </button>
          
          <button
            onClick={testValidDish}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            测试有效菜品
          </button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">无效数据测试</h3>
          <button
            onClick={testInvalidOrder}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            测试无效订单（缺少total）
          </button>
          
          <button
            onClick={testInvalidDish}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            测试无效菜品（负价格）
          </button>
        </div>
      </div>
      
      {result && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg mb-4">
          <strong>成功:</strong> {result}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">验证规则说明：</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>订单(orders)</strong>: 必须有total（总额）、items（订单项数组）、tableId（桌号）</li>
          <li><strong>菜品(dishes)</strong>: name（名称）不能为空，price（价格）必须为非负数</li>
          <li><strong>支出(expenses)</strong>: amount（金额）必须为正数，category（类别）和description（描述）不能为空</li>
          <li><strong>库存(inventory)</strong>: name（名称）和unit（单位）不能为空，quantity（数量）必须为非负数</li>
          <li><strong>酒店房间(hotel_rooms)</strong>: roomNumber（房间号）不能为空，status（状态）必须为有效值</li>
          <li><strong>KTV房间(ktv_rooms)</strong>: name（名称）不能为空，status（状态）必须为有效值</li>
          <li><strong>签单账户(sign_bill_accounts)</strong>: accountName（账户名）不能为空，creditLimit（信用额度）必须为非负数</li>
        </ul>
      </div>
    </div>
  );
};

export default ValidationTest;