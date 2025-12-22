// services/printer.ts
// Printer service for handling print operations
// 已集成到 OrderManagement、FinanceSystem、Settings 等组件

// TODO: 统一使用 types.ts 中的类型定义，避免重复定义
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  tableId?: string;
  timestamp: string;
}

interface ShiftReport {
  id: string;
  startTime: string;
  endTime: string;
  orders: Order[];
  totalRevenue: number;
}

/**
 * 打印服务配置
 * 支持三种打印方式：
 * 1. browser - 浏览器原生打印（window.print）
 * 2. cloud - 云打印服务（飞鹅云/易联云）
 * 3. usb - USB 打印机（WebUSB API）
 */
type PrinterMode = 'browser' | 'cloud' | 'usb';

interface PrinterConfig {
  mode: PrinterMode;
  // 云打印配置（飞鹅云示例）
  cloud?: {
    apiUrl: string;      // API 地址
    user: string;        // 飞鹅云用户名
    ukey: string;        // 飞鹅云 UKEY
    sn: string;          // 打印机编号
  };
}

export class PrinterService {
  private static config: PrinterConfig = {
    mode: 'browser', // 默认使用浏览器打印
  };

  /**
   * 配置打印服务
   * @param config 打印配置
   */
  static configure(config: PrinterConfig) {
    this.config = config;
    console.log('[PRINTER] Configuration updated:', config.mode);
  }

  /**
   * 打印订单小票
   * 支持多种打印方式
   */
  static async printOrder(order: Order): Promise<boolean> {
    console.log('[PRINTER] Printing order:', order.id, 'Mode:', this.config.mode);

    switch (this.config.mode) {
      case 'browser':
        return this.printOrderBrowser(order);
      case 'cloud':
        return this.printOrderCloud(order);
      case 'usb':
        console.warn('[PRINTER] USB printing not implemented yet');
        return false;
      default:
        console.error('[PRINTER] Unknown printer mode:', this.config.mode);
        return false;
    }
  }

  /**
   * 打印交班报表
   */
  static async printShiftReport(report: ShiftReport): Promise<boolean> {
    console.log('[PRINTER] Printing shift report:', report.id, 'Mode:', this.config.mode);

    switch (this.config.mode) {
      case 'browser':
        return this.printReportBrowser(report);
      case 'cloud':
        return this.printReportCloud(report);
      default:
        console.warn('[PRINTER] Using browser print as fallback');
        return this.printReportBrowser(report);
    }
  }

  // ==================== 浏览器打印实现 ====================

  private static printOrderBrowser(order: Order): boolean {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      alert('请允许弹出窗口以打印小票');
      return false;
    }

    const html = this.generateOrderHTML(order);
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // 打印后关闭窗口（可选）
      setTimeout(() => printWindow.close(), 500);
    };

    return true;
  }

  private static printReportBrowser(report: ShiftReport): boolean {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('请允许弹出窗口以打印报表');
      return false;
    }

    const html = this.generateReportHTML(report);
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    return true;
  }

  // ==================== 云打印实现（飞鹅云示例）====================

  private static async printOrderCloud(order: Order): Promise<boolean> {
    if (!this.config.cloud) {
      console.error('[PRINTER] Cloud config not set');
      return false;
    }

    try {
      const content = this.generateOrderESCPOS(order);
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'cloud',
          config: this.config.cloud,
          content,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('[PRINTER] Cloud print success:', result);
        return true;
      } else {
        console.error('[PRINTER] Cloud print failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('[PRINTER] Cloud print error:', error);
      return false;
    }
  }

  private static async printReportCloud(report: ShiftReport): Promise<boolean> {
    if (!this.config.cloud) {
      console.error('[PRINTER] Cloud config not set');
      return false;
    }

    try {
      const content = this.generateReportESCPOS(report);
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'cloud',
          config: this.config.cloud,
          content,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('[PRINTER] Cloud print error:', error);
      return false;
    }
  }

  // ==================== HTML 模板生成 ====================

  private static generateOrderHTML(order: Order): string {
    const items = order.items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">₱${item.price.toFixed(2)}</td>
          <td style="text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>订单小票 - ${order.id}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 5mm; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            padding: 10px;
            margin: 0 auto;
          }
          h2 { text-align: center; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 5px 2px; font-size: 12px; }
          th { border-bottom: 1px dashed #000; }
          .total { border-top: 1px dashed #000; font-weight: bold; }
          .footer { text-align: center; margin-top: 10px; font-size: 11px; }
        </style>
      </head>
      <body>
        <h2>江西酒店 Jiangxi Hotel</h2>
        <p style="text-align: center; margin: 5px 0;">Pasay City, Manila</p>
        <p style="text-align: center; margin: 5px 0; border-bottom: 1px dashed #000; padding-bottom: 5px;">
          订单号: ${order.id}<br>
          桌号: ${order.tableId || 'N/A'}<br>
          时间: ${new Date(order.timestamp).toLocaleString('zh-CN')}
        </p>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">菜品</th>
              <th style="text-align: center;">数量</th>
              <th style="text-align: right;">单价</th>
              <th style="text-align: right;">小计</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="3" style="text-align: right;">总计:</td>
              <td style="text-align: right;">₱${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">
          <p>谢谢惠顾 Thank You!</p>
          <p>欢迎再次光临 Welcome Again!</p>
        </div>
      </body>
      </html>
    `;
  }

  private static generateReportHTML(report: ShiftReport): string {
    const orderRows = report.orders
      .map(
        (order, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${order.id}</td>
          <td>${order.tableId || 'N/A'}</td>
          <td style="text-align: right;">₱${order.total.toFixed(2)}</td>
          <td>${new Date(order.timestamp).toLocaleTimeString('zh-CN')}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>交班报表 - ${report.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
          .summary { margin-top: 20px; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>江西酒店交班报表</h2>
        <p>交班时间: ${report.startTime} - ${report.endTime}</p>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>订单号</th>
              <th>桌号</th>
              <th>金额</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            ${orderRows}
          </tbody>
        </table>
        <div class="summary">
          总订单数: ${report.orders.length}<br>
          总营收: ₱${report.totalRevenue.toFixed(2)}
        </div>
      </body>
      </html>
    `;
  }

  // ==================== ESC/POS 指令生成（云打印用）====================

  private static generateOrderESCPOS(order: Order): string {
    // ESC/POS 指令格式（飞鹅云支持）
    let content = '';
    content += '<CB>江西酒店 Jiangxi Hotel</CB><BR>';
    content += '<C>Pasay City, Manila</C><BR>';
    content += '--------------------------------<BR>';
    content += `订单号: ${order.id}<BR>`;
    content += `桌号: ${order.tableId || 'N/A'}<BR>`;
    content += `时间: ${new Date(order.timestamp).toLocaleString('zh-CN')}<BR>`;
    content += '--------------------------------<BR>';

    order.items.forEach((item) => {
      content += `${item.name}<BR>`;
      content += `  ${item.quantity} x ₱${item.price.toFixed(2)} = ₱${(item.price * item.quantity).toFixed(2)}<BR>`;
    });

    content += '--------------------------------<BR>';
    content += `<B>总计: ₱${order.total.toFixed(2)}</B><BR>`;
    content += '--------------------------------<BR>';
    content += '<C>谢谢惠顾 Thank You!</C><BR>';
    content += '<C>欢迎再次光临!</C><BR><BR><BR>';

    return content;
  }

  private static generateReportESCPOS(report: ShiftReport): string {
    let content = '';
    content += '<CB>江西酒店交班报表</CB><BR>';
    content += '================================<BR>';
    content += `交班时间: ${report.startTime}<BR>`;
    content += `结束时间: ${report.endTime}<BR>`;
    content += '================================<BR>';

    report.orders.forEach((order, index) => {
      content += `${index + 1}. ${order.id} - ₱${order.total.toFixed(2)}<BR>`;
    });

    content += '================================<BR>';
    content += `<B>总订单数: ${report.orders.length}</B><BR>`;
    content += `<B>总营收: ₱${report.totalRevenue.toFixed(2)}</B><BR>`;
    content += '================================<BR><BR><BR>';

    return content;
  }
}
