const a=t=>`₱${t.toFixed(2)}`,r=()=>{try{const t=localStorage.getItem("jx_settings");if(t)return JSON.parse(t).storeInfo||{}}catch(t){console.error("Error loading settings for print",t)}return{name:"江西饭店 Jiangxi Hotel",address:"Pasay City",phone:"",openingHours:"10:00 - 02:00",wifiSsid:"",wifiPassword:""}},l={printOrder:t=>{const e=r(),i=new Date(t.createdAt).toLocaleString("zh-CN"),o=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Order #${t.id}</title>
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
          <span class="title">${e.name}</span><br/>
          <div class="info">${e.address}</div>
          <div class="info">Tel: ${e.phone}</div>
          <div class="subtitle">${t.source==="TAKEOUT"?"外卖 Takeout":t.source==="ROOM_SERVICE"?"客房送餐 Room":"堂食 Dine-in"}</div>
        </div>

        <div class="divider"></div>
        <div class="info">
          No: #${t.id.slice(-4)}<br/>
          Time: ${i}<br/>
          <span class="big-text">Table: ${t.tableNumber}</span>
        </div>
        <div class="double-divider"></div>

        <div class="item-row" style="font-size:11px; text-transform: uppercase;">
          <span style="flex:1">Item 品名</span>
          <span style="width:30px; text-align:center;">Qty</span>
          <span style="width:60px; text-align:right;">Amt</span>
        </div>
        <div class="divider"></div>

        ${t.items.map(n=>`
          <div class="item-row">
            <span class="item-name">${n.dishName}</span>
            <span class="item-qty">x${n.quantity}</span>
            <span class="item-price">${(n.price*n.quantity).toFixed(0)}</span>
          </div>
        `).join("")}

        <div class="divider"></div>

        ${t.notes?`
          <div style="font-weight:bold; font-size: 14px; margin: 5px 0;">* 备注: ${t.notes} *</div>
          <div class="divider"></div>
        `:""}

        <div class="total-row">
          <span>TOTAL:</span>
          <span>${a(t.totalAmount)}</span>
        </div>
        
        <div style="text-align:right; margin-top:5px; font-size:12px; font-weight:bold;">
           ${t.paymentMethod||"Unpaid"}
        </div>

        <div class="footer">
          WiFi: ${e.wifiSsid||"N/A"}<br/>
          Pass: ${e.wifiPassword||""}<br/>
          <br/>
          *** Thank you 谢谢惠顾 ***
        </div>
      </body>
      </html>
    `;l.printHtml(o)},printShiftReport:t=>{const e=r(),i=new Date().toLocaleString("zh-CN"),o=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shift Report</title>
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { width: 72mm; font-family: 'Courier New', monospace; font-size: 12px; padding: 5px; margin: 0; color: #000; font-weight: bold; }
          .header { text-align: center; margin-bottom: 10px; }
          .title { font-size: 16px; font-weight: 900; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .total { font-size: 18px; font-weight: 900; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">交班报表 Shift Report</div>
          <div>${e.name}</div>
          <div style="font-size:10px;">${i}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
           <span>Total Orders 单量:</span>
           <span>${t.count}</span>
        </div>

        <div class="divider"></div>
        <div style="font-weight:bold; margin-bottom:5px;">Income Breakdown 收入明细:</div>

        ${Object.entries(t.byMethod).map(([n,s])=>`
           <div class="row">
             <span>${n}:</span>
             <span>${a(s)}</span>
           </div>
        `).join("")}

        <div class="row total">
           <span>REVENUE:</span>
           <span>${a(t.total)}</span>
        </div>

        <div class="divider"></div>
        <div style="text-align:center; font-size:10px; margin-top:20px;">
           Printed by Admin System
        </div>
      </body>
      </html>
    `;l.printHtml(o)},printHtml:t=>{var n;const e=document.getElementById("print-frame");e&&document.body.removeChild(e);const i=document.createElement("iframe");i.id="print-frame",i.style.position="fixed",i.style.right="0",i.style.bottom="0",i.style.width="0",i.style.height="0",i.style.border="0",document.body.appendChild(i);const o=(n=i.contentWindow)==null?void 0:n.document;o&&(o.open(),o.write(t),o.close(),i.onload=()=>{setTimeout(()=>{var s,d;try{(s=i.contentWindow)==null||s.focus(),(d=i.contentWindow)==null||d.print()}catch(p){console.error("Printing failed",p),alert("Printing failed. Please check printer connection.")}},500)})}};export{l as P};
