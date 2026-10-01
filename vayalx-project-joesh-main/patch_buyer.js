const fs = require('fs');
let html = fs.readFileSync('buyer-dashboard.html', 'utf8');

const oldFunc = `    async function renderBuyerMandi(search = '') {
      const tbody = document.getElementById('buyer-mandi-tbody');
      tbody.innerHTML = '';
      let list = buyerMandiData;

      try {
        if (window.VayalXMarketplace) {
          const res = await window.VayalXMarketplace.dashboards.getDailyMandiRates();
          if (res && res.success && res.data) {
            list = res.data.map(d => ({
              crop: d.crop,
              mandi: d.mandi,
              modal: d.modalPrice,
              min: Math.round(d.modalPrice * 0.9),
              max: Math.round(d.modalPrice * 1.15),
              trend: \`\${d.change} 📈\`
            }));
          }
        }
      } catch {
        // Fallback
      }

      const filtered = list.filter(m => m.crop.toLowerCase().includes(search.toLowerCase()) || m.mandi.toLowerCase().includes(search.toLowerCase()));

      filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td><strong>\${m.crop}</strong></td>
          <td>📍 \${m.mandi}</td>
          <td style="font-size: 1.05rem; font-weight: 800; color: var(--growth-dk);">₹\${m.modal}/kg</td>
          <td style="color: var(--text-muted);">₹\${m.min} - ₹\${m.max}</td>
          <td><span style="font-weight: 700; color: var(--growth-dk);">\${m.trend}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="switchBuyerModule('demands')">Post Counter Demand</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }`;

const newFunc = `    async function renderBuyerMandi(search = '') {
      const tbody = document.getElementById('buyer-mandi-tbody');
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Fetching latest market data...</td></tr>';
      let list = buyerMandiData || [];

      try {
        if (window.VayalXMarketplace) {
          const res = await window.VayalXMarketplace.dashboards.getDailyMandiRates();
          if (res && res.success && res.data && res.data.prices) {
            list = res.data.prices.map(d => ({
              crop: d.commodity,
              mandi: d.market,
              modal: d.modalPrice,
              min: d.minPrice,
              max: d.maxPrice,
              trend: '● Stable'
            }));
          }
        }
      } catch {
        // Fallback
      }

      const filtered = list.filter(m => m.crop.toLowerCase().includes(search.toLowerCase()) || m.mandi.toLowerCase().includes(search.toLowerCase()));

      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No matching results found.</td></tr>';
        return;
      }

      filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td><strong>\${m.crop}</strong></td>
          <td>📍 \${m.mandi}</td>
          <td style="font-size: 1.05rem; font-weight: 800; color: var(--growth-dk);">₹\${m.modal}/kg</td>
          <td style="color: var(--text-muted);">₹\${m.min} - ₹\${m.max}</td>
          <td><span style="font-weight: 700; color: var(--text-muted);">\${m.trend}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="switchBuyerModule('demands')">Post Counter Demand</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }`;

html = html.replace(oldFunc, newFunc);
fs.writeFileSync('buyer-dashboard.html', html);
console.log('done');
