class s{static config={mode:"browser"};static configure(t){this.config=t,console.log("[PRINTER] Configuration updated:",t.mode)}static async printOrder(t){switch(console.log("[PRINTER] Printing order:",t.id,"Mode:",this.config.mode),this.config.mode){case"browser":return this.printOrderBrowser(t);case"cloud":return this.printOrderCloud(t);case"usb":return console.warn("[PRINTER] USB printing not implemented yet"),!1;default:return console.error("[PRINTER] Unknown printer mode:",this.config.mode),!1}}static async printShiftReport(t){switch(console.log("[PRINTER] Printing shift report:",t.id,"Mode:",this.config.mode),this.config.mode){case"browser":return this.printReportBrowser(t);case"cloud":return this.printReportCloud(t);default:return console.warn("[PRINTER] Using browser print as fallback"),this.printReportBrowser(t)}}static printOrderBrowser(t){const e=window.open("","_blank","width=300,height=600");if(!e)return alert("请允许弹出窗口以打印小票"),!1;const o=this.generateOrderHTML(t);return e.document.write(o),e.document.close(),e.onload=()=>{e.focus(),e.print(),setTimeout(()=>e.close(),500)},!0}static printReportBrowser(t){const e=window.open("","_blank","width=800,height=600");if(!e)return alert("请允许弹出窗口以打印报表"),!1;const o=this.generateReportHTML(t);return e.document.write(o),e.document.close(),e.onload=()=>{e.focus(),e.print()},!0}static async printOrderCloud(t){if(!this.config.cloud)return console.error("[PRINTER] Cloud config not set"),!1;try{const e=this.generateOrderESCPOS(t),n=await(await fetch("/api/print",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"cloud",config:this.config.cloud,content:e})})).json();return n.success?(console.log("[PRINTER] Cloud print success:",n),!0):(console.error("[PRINTER] Cloud print failed:",n.message),!1)}catch(e){return console.error("[PRINTER] Cloud print error:",e),!1}}static async printReportCloud(t){if(!this.config.cloud)return console.error("[PRINTER] Cloud config not set"),!1;try{const e=this.generateReportESCPOS(t);return(await(await fetch("/api/print",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"cloud",config:this.config.cloud,content:e})})).json()).success}catch(e){return console.error("[PRINTER] Cloud print error:",e),!1}}static generateOrderHTML(t){const e=t.items.map(i=>`
        <tr>
          <td>${i.name}</td>
          <td style="text-align: center;">${i.quantity}</td>
          <td style="text-align: right;">₱${i.price.toFixed(2)}</td>
          <td style="text-align: right;">₱${(i.price*i.quantity).toFixed(2)}</td>
        </tr>
      `).join(""),o=/^8[23]\d{2}$/.test(t.tableId||""),n=o?"🚪 房间号 Room No.":"🍽️ 桌号 Table",r=t.tableId||"N/A";return`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>订单小票 - ${t.id}</title>
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
          .room-highlight {
            background: #000;
            color: #fff;
            padding: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
            border-radius: 4px;
          }
          .location-badge {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: bold;
          }
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
        
        ${o?`
          <div class="room-highlight">
            🚪 送至房间 DELIVER TO ROOM<br>
            <span style="font-size: 24px;">${r}</span>
          </div>
        `:`
          <p style="text-align: center; margin: 10px 0;">
            <span class="location-badge">${n}: ${r}</span>
          </p>
        `}
        
        <p style="text-align: center; margin: 5px 0; border-bottom: 1px dashed #000; padding-bottom: 5px;">
          订单号 Order No: ${t.id}<br>
          时间 Time: ${new Date(t.createdAt).toLocaleString("zh-CN")}
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
            ${e}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="3" style="text-align: right;">总计:</td>
              <td style="text-align: right;">₱${t.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">
          <p>谢谢惠顾 Thank You!</p>
          <p>欢迎再次光临 Welcome Again!</p>
        </div>
      </body>
      </html>
    `}static generateReportHTML(t){const e=t.orders.map((o,n)=>`
        <tr>
          <td>${n+1}</td>
          <td>${o.id}</td>
          <td>${o.tableId||"N/A"}</td>
          <td style="text-align: right;">₱${o.total.toFixed(2)}</td>
          <td>${new Date(o.createdAt).toLocaleTimeString("zh-CN")}</td>
        </tr>
      `).join("");return`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>交班报表 - ${t.id}</title>
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
        <p>交班时间: ${t.startTime} - ${t.endTime}</p>
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
            ${e}
          </tbody>
        </table>
        <div class="summary">
          总订单数: ${t.orders.length}<br>
          总营收: ₱${t.totalRevenue.toFixed(2)}
        </div>
      </body>
      </html>
    `}static generateOrderESCPOS(t){const e=/^8[23]\d{2}$/.test(t.tableId||"");let o="";return o+="<CB>江西酒店 Jiangxi Hotel</CB><BR>",o+="<C>Pasay City, Manila</C><BR>",o+="--------------------------------<BR>",e?(o+="<CB><BOLD>🚪 送至房间 DELIVER TO ROOM</BOLD></CB><BR>",o+=`<CB><BOLD><font size="tall">${t.tableId}</font></BOLD></CB><BR>`,o+="--------------------------------<BR>"):o+=`<B>🍽️ 桌号 Table: ${t.tableId||"N/A"}</B><BR>`,o+=`订单号 Order: ${t.id}<BR>`,o+=`时间 Time: ${new Date(t.createdAt).toLocaleString("zh-CN")}<BR>`,o+="--------------------------------<BR>",t.items.forEach(n=>{o+=`${n.name}<BR>`,o+=`  ${n.quantity} x ₱${n.price.toFixed(2)} = ₱${(n.price*n.quantity).toFixed(2)}<BR>`}),o+="--------------------------------<BR>",o+=`<B>总计: ₱${t.total.toFixed(2)}</B><BR>`,o+="--------------------------------<BR>",o+="<C>谢谢惠顾 Thank You!</C><BR>",o+="<C>欢迎再次光临!</C><BR><BR><BR>",o}static generateReportESCPOS(t){let e="";return e+="<CB>江西酒店交班报表</CB><BR>",e+="================================<BR>",e+=`交班时间: ${t.startTime}<BR>`,e+=`结束时间: ${t.endTime}<BR>`,e+="================================<BR>",t.orders.forEach((o,n)=>{e+=`${n+1}. ${o.id} - ₱${o.total.toFixed(2)}<BR>`}),e+="================================<BR>",e+=`<B>总订单数: ${t.orders.length}</B><BR>`,e+=`<B>总营收: ₱${t.totalRevenue.toFixed(2)}</B><BR>`,e+="================================<BR><BR><BR>",e}}export{s as P};
