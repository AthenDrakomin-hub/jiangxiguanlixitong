
import { Order, StoreInfo } from '../types';

// Helper to format currency
const formatPrice = (price: number) => `₱${price.toFixed(2)}`;

// Helper to get current store info (fallback if not passed)
const getStoreInfo = (): StoreInfo => {
  try {
    const settings = localStorage.getItem('jx_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.storeInfo || {};
    }
  } catch (e) {
    console.error("Error loading settings for print", e);
  }
  return {
    name: '江西饭店 Jiangxi Hotel',
    address: 'Pasay City',
    phone: '',
    openingHours: '10:00 - 02:00',
    wifiSsid: '',
    wifiPassword: ''
  };
};

export const PrinterService = {
  
  // Print a single order receipt
  printOrder: (order: Order) => {
    const store = getStoreInfo();
    const date = new Date(order.createdAt).toLocaleString('zh-CN');
    
    // Receipt HTML Template - Optimized for Thermal Printers (High Contrast, Bold)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Order #${order.id}</title>
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { 
            width: 72mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px; 
            line-height: 1.1;
            margin: 0; 
            padding: 5px;
            color: #000;
            background: #fff;
          }
          .header { text-align: center; margin-bottom: 8px; }
          .title { font-size: 18px; font-weight: 900; margin-bottom: 2px; display: block; }
          .subtitle { font-size: 14px; font-weight: bold; margin-top: 4px; border: 2px solid #000; display: inline-block; padding: 2px 6px; border-radius: 4px; }
          .info { font-size: 12px; margin-bottom: 4px; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
          
          .item-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; font-weight: bold; }
          .item-name { flex: 1; font-weight: bold; font-size: 14px; }
          .item-qty { width: 30px; text-align: center; font-weight: 900; font-size: 14px; }
          .item-price { width: 60px; text-align: right; }
          
          .total-row { display: flex; justify-content: space-between; font-weight: 900; font-size: 18px; margin-top: 8px; }
          .footer { text-align: center; font-size: 11px; margin-top: 15px; font-weight: bold; }
          .big-text { font-size: 26px; font-weight: 900; display: block; margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="title">${store.name}</span><br/>
          <div class="info">${store.address}</div>
          <div class="info">Tel: ${store.phone}</div>
          <div class="subtitle">${order.source === 'TAKEOUT' ? '外卖 Takeout' : (order.source === 'ROOM_SERVICE' ? '客房送餐 Room' : '堂食 Dine-in')}</div>
        </div>

        <div class="divider"></div>
        <div class="info">
          No: #${order.id.slice(-4)}<br/>
          Time: ${date}<br/>
          <span class="big-text">Table: ${order.tableNumber}</span>
        </div>
        <div class="double-divider"></div>

        <div class="item-row" style="font-size:11px; text-transform: uppercase;">
          <span style="flex:1">Item 品名</span>
          <span style="width:30px; text-align:center;">Qty</span>
          <span style="width:60px; text-align:right;">Amt</span>
        </div>
        <div class="divider"></div>

        ${order.items.map(item => `
          <div class="item-row">
            <span class="item-name">${item.dishName}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${(item.price * item.quantity).toFixed(0)}</span>
          </div>
        `).join('')}

        <div class="divider"></div>

        ${order.notes ? `
          <div style="font-weight:bold; font-size: 14px; margin: 5px 0;">* 备注: ${order.notes} *</div>
          <div class="divider"></div>
        ` : ''}

        <div class="total-row">
          <span>TOTAL:</span>
          <span>${formatPrice(order.totalAmount)}</span>
        </div>
        
        <div style="text-align:right; margin-top:5px; font-size:12px; font-weight:bold;">
           ${order.paymentMethod || 'Unpaid'}
        </div>

        <div class="footer">
          WiFi: ${store.wifiSsid || 'N/A'}<br/>
          Pass: ${store.wifiPassword || ''}<br/>
          <br/>
          *** Thank you 谢谢惠顾 ***
        </div>
      </body>
      </html>
    `;

    PrinterService.printHtml(htmlContent);
  },

  // Print Shift Report (Finance)
  printShiftReport: (data: { total: number; byMethod: Record<string, number>; count: number }) => {
    const store = getStoreInfo();
    const date = new Date().toLocaleString('zh-CN');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shift Report</title>
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { width: 72mm; font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; margin: 0; color: #000; font-weight: bold; }
          .header { text-align: center; margin-bottom: 10px; }
          .title { font-size: 18px; font-weight: 900; margin-bottom: 5px; }
          .subtitle { font-size: 14px; font-weight: bold; color: #ea580c; margin-bottom: 8px; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .label { font-weight: normal; }
          .value { font-weight: bold; }
          .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; font-weight: 900; border-top: 2px solid #000; padding-top: 5px; }
          .section-title { font-weight: bold; margin: 8px 0 4px 0; color: #ea580c; }
          .footer { text-align: center; font-size: 10px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">江西饭店 Jiangxi Hotel</div>
          <div class="subtitle">交班报表 Shift Report</div>
          <div>${date}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="label">Total Orders 单量:</span>
          <span class="value">${data.count}</span>
        </div>

        <div class="divider"></div>
        <div class="section-title">Income Breakdown 收入明细:</div>

        ${Object.entries(data.byMethod).map(([method, amount]) => `
          <div class="row">
            <span class="label">${method}:</span>
            <span class="value">${formatPrice(amount)}</span>
          </div>
        `).join('')}

        <div class="total-row">
          <span>TOTAL REVENUE 总营收:</span>
          <span>${formatPrice(data.total)}</span>
        </div>

        <div class="divider"></div>
        <div class="footer">
          Printed by Admin System<br/>
          *** Thank you 谢谢惠顾 ***
        </div>
      </body>
      </html>
    `;

    PrinterService.printHtml(htmlContent);
  },

  // Optimized print function using invisible Iframe (No Popups!)
  printHtml: (html: string) => {
    // Remove existing print frame if any
    const existingFrame = document.getElementById('print-frame');
    if (existingFrame) {
      document.body.removeChild(existingFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      // Wait for content to load then print
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error("Printing failed", e);
            alert("Printing failed. Please check printer connection.");
          }
        }, 500);
      };
    }
  }
};
