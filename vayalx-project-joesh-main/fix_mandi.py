import re
with open('dashboard.html', 'r') as f:
    html = f.read()

# Replace renderMandiTable and remove simulateLivePrices
new_render = """    async function renderMandiTable() {
      const tbody = document.querySelector('#panel-market tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">⏳ Fetching market data...</td></tr>';
      
      const query       = (document.getElementById('mandi-search-input') || document.createElement('input')).value.toLowerCase();
      const filterEl    = document.getElementById('mandi-market-filter');
      const mandiFilter = filterEl ? filterEl.value : 'all';
      
      try {
        let filters = { state: 'Tamil Nadu' };
        if (mandiFilter !== 'all') filters.market = mandiFilter;
        
        const response = await window.VayalXMarketplace.dashboards.getDailyMandiRates(filters);
        const data = response?.data?.prices || [];
        
        let filtered = data;
        if (query) {
          filtered = filtered.filter(item => item.commodity.toLowerCase().includes(query) || item.market.toLowerCase().includes(query));
        }
        
        tbody.innerHTML = '';
        if (filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No matching results found.</td></tr>';
          return;
        }

        filtered.forEach(item => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border)';
          tr.className = 'price-tick';
          
          const trendBadge = `<span style="color:var(--text-muted);font-weight:600;">● Stable</span>`;
          const modalDisplay = typeof item.modalPrice === 'number' ? item.modalPrice.toFixed(item.modalPrice > 10 ? 0 : 1) : item.modalPrice;
          const minP = item.minPrice || 0;
          const maxP = item.maxPrice || 0;
          
          tr.innerHTML = `
            <td style="padding:12px 14px;font-weight:700;color:var(--soil);">${item.commodity}</td>
            <td style="padding:12px 14px;color:var(--text-muted);font-size:0.82rem;">${item.market}</td>
            <td style="padding:12px 14px;color:var(--text-muted);">₹${minP}</td>
            <td style="padding:12px 14px;color:var(--text-muted);">₹${maxP}</td>
            <td style="padding:12px 14px;text-align:right;font-weight:800;font-size:1rem;color:var(--soil);">₹${modalDisplay}</td>
            <td style="padding:12px 14px;text-align:center;">${trendBadge}</td>
            <td style="padding:12px 14px;text-align:center;">
              <button class="btn btn-sm btn-outline" style="padding:3px 8px;font-size:0.72rem;" onclick="prebookFromMandi('${item.commodity}',${item.modalPrice})">Pre-Book</button>
            </td>`;
          tbody.appendChild(tr);
        });
        
        let sourceP = document.getElementById('market-source');
        if (!sourceP) {
          const panel = document.getElementById('panel-market');
          if(panel) {
            sourceP = document.createElement('p');
            sourceP.id = 'market-source';
            sourceP.style = 'font-size:0.8rem; color:var(--text-muted); margin-top:10px; text-align:right;';
            panel.appendChild(sourceP);
          }
        }
        if (sourceP && response && response.source) {
          sourceP.innerHTML = `Source: <strong>${response.source.provider}</strong> (${response.source.mode}) ${response.source.cached ? ' [Cached]' : ''}`;
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Live data is temporarily unavailable.</td></tr>';
      }
    }
"""

html = re.sub(r'function renderMandiTable\(\) \{.*?\n    \}', new_render, html, flags=re.DOTALL)
html = re.sub(r'function simulateLivePrices\(\) \{.*?\}\n', '', html, flags=re.DOTALL)
html = re.sub(r'setInterval\(simulateLivePrices, 90000\);', '', html)
html = re.sub(r'simulateLivePrices\(\);', '', html)

with open('dashboard.html', 'w') as f:
    f.write(html)
