// api/print-order.ts
// 后台自动打印订单接口（用于H5客户点餐后自动打印到收银台/厨房）

import { PrinterService } from '../services/printer.js';
import { Order, OrderStatus } from '../types.js';

// 扩展 Order 类型以包含打印服务需要的额外属性
interface PrintOrder extends Order {
  tableNumber?: string;
  totalAmount?: number;
  source?: string;
}


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
    
    // 直接使用原始订单对象，因为PrinterService内部会访问特定属性
    // 这里我们创建一个包含所需属性的扩展对象
    const printOrder: PrintOrder = {
      ...order,
      tableNumber: order.tableId, // 为兼容性添加的映射
      totalAmount: order.total,   // 为兼容性添加的映射
      source: 'LOBBY',
      status: OrderStatus.PENDING,
    };
    
    const printResult = await PrinterService.printOrder(printOrder as Order);

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