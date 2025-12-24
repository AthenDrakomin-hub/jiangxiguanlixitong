// api/print-order.ts
// 后台自动打印订单接口（用于H5客户点餐后自动打印到收银台/厨房）

import { PrinterService } from '../services/printer.js';
import { Order } from '../types.js';

export const config = {
  runtime: 'edge',
};

interface PrintOrderRequest {
  order: Order;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: PrintOrderRequest = await req.json();
    const { order } = body;

    if (!order || !order.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid order data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 调用 PrinterService 打印订单
    // 注意：这里会使用 Settings 中配置的打印模式（浏览器打印或云打印）
    // 对于云打印，订单会自动发送到飞鹅云打印机
    // 对于浏览器打印，需要服务器端触发（或者后续优化为Webhook通知收银台）
    
    const printResult = await PrinterService.printOrder({
      id: order.id,
      tableNumber: order.tableNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      source: 'LOBBY', // 添加默认值
      status: 'PENDING', // 添加默认值
    });

    if (printResult) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Order sent to printer successfully',
          orderId: order.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Print failed',
          orderId: order.id,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[API /print-order] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}