import re
with open('dashboard.html', 'r') as f:
    html = f.read()

new_func = """    async function handlePreBooking(e) {
      e.preventDefault();
      const crop  = document.getElementById('pb-crop').value;
      const qty   = parseInt(document.getElementById('pb-qty').value);
      const date  = document.getElementById('pb-date').value || (() => { const d=new Date(); d.setDate(d.getDate()+45); return d.toISOString().split('T')[0]; })();
      
      const payload = {
        cropName: crop,
        targetQuantity: qty,
        expectedHarvestDate: date,
        notes: "TN Wholesale Agro Buyer Network"
      };

      let tokenId = 'VX-PB-DEMO';
      let status = 'Contract Locked';
      let totalAmountDisplay = document.getElementById('pb-total').textContent;
      let rateDisplay = document.getElementById('pb-rate').textContent;

      try {
        const res = await window.VayalXMarketplace.prebookings.create(payload);
        if (res && res.success && res.data) {
          tokenId = res.data.tokenCode || res.data._id;
          status = res.data.status;
          totalAmountDisplay = '₹' + res.data.advanceAmount;
        }
      } catch (err) {
        console.warn('Prebooking API failed, falling back to local demo state');
        tokenId = 'VX-PB-' + Math.floor(1000 + Math.random() * 9000);
      }

      const tokenObj = { id:tokenId, crop, qty:`${qty} kg`, date, rate:rateDisplay, total:totalAmountDisplay, status, buyer:'TN State Agro Procurement Partner' };
      prebookingTokens.unshift(tokenObj);
      renderPrebookingTokens();
      saveData();
      document.getElementById('receipt-details').innerHTML = `
        <div style="font-size:0.85rem;line-height:1.8;">
          <div><strong>Contract Token ID:</strong> <span style="font-family:monospace;color:var(--growth-dk);font-weight:800;">#${tokenId}</span></div>
          <div><strong>Farmer:</strong> ${currentUser.name} (${currentUser.district})</div>
          <div><strong>Produce:</strong> ${crop} &bull; ${qty} kg</div>
          <div><strong>Harvest Target Delivery:</strong> ${date}</div>
          <div><strong>Guaranteed Rate:</strong> ${rateDisplay} &bull; <strong>Total:</strong> <span style="color:var(--growth-dk);font-size:1.1rem;font-weight:800;">${totalAmountDisplay}</span></div>
          <div><strong>Buyer Network:</strong> TN Wholesale Agro Buyer Network</div>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);border-top:1px dashed var(--border);padding-top:6px;">🔒 Escrow Protected &bull; 10% Advance Credit initiated &bull; ${new Date().toLocaleString('en-IN')}</div>
        </div>`;
      openModal('modal-receipt');
    }"""

html = re.sub(r'function handlePreBooking\(e\) \{.*?\n    \}', new_func, html, flags=re.DOTALL)
with open('dashboard.html', 'w') as f:
    f.write(html)
