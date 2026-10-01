const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const switchModuleCode = `      // Lazy-load weather if switching to weather tab
      if (modId === 'weather') updateWeatherData();`;
      
const replaceSwitch = `      // Lazy-load weather if switching to weather tab
      if (modId === 'weather') updateWeatherData();
      if (modId === 'schemes') fetchSchemes();`;

html = html.replace(switchModuleCode, replaceSwitch);

const schemesFunc = `
    async function fetchSchemes() {
      const container = document.getElementById('schemes-list-container');
      if (!container) return;
      container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Fetching latest government schemes...</div>';
      
      try {
        const res = await fetch('/api/schemes?state=Tamil Nadu');
        const data = await res.json();
        if (data && data.success && data.data && data.data.schemes) {
          container.innerHTML = '';
          const schemes = data.data.schemes;
          if (schemes.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;">No matching results found.</div>';
          } else {
            schemes.forEach(s => {
              const div = document.createElement('div');
              div.style.border = '1px solid var(--border)';
              div.style.borderRadius = 'var(--radius-sm)';
              div.style.padding = '18px';
              div.style.background = '#FAFCF9';
              
              div.innerHTML = \`
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <div>
                    <span class="status-badge" style="background: var(--growth-light); color: var(--growth-dk);">\${s.category || 'General'}</span>
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--soil); margin-top: 4px;">\${s.name}</h3>
                  </div>
                </div>
                <p style="font-size: 0.84rem; color: var(--soil); line-height: 1.5; margin-bottom: 12px;">\${s.description}</p>
                <div style="font-size:0.8rem; margin-bottom:10px;"><strong>Benefits:</strong> \${(s.benefits||[]).join(', ')}</div>
                <div style="font-size:0.8rem; margin-bottom:10px;"><strong>Eligibility:</strong> \${(s.eligibility||[]).join(', ')}</div>
                <div>
                  <a href="\${s.applicationUrl || '#'}" target="_blank" class="btn btn-sm btn-outline">Apply via Official Portal</a>
                </div>
              \`;
              container.appendChild(div);
            });
            
            let sourceP = document.getElementById('schemes-source');
            if (!sourceP) {
              sourceP = document.createElement('p');
              sourceP.id = 'schemes-source';
              sourceP.style = 'font-size:0.8rem; color:var(--text-muted); margin-top:10px; text-align:right;';
              container.parentNode.appendChild(sourceP);
            }
            if (data.source) {
              sourceP.innerHTML = \`Source: <strong>\${data.source.provider}</strong> (\${data.source.mode}) \${data.source.cached ? ' [Cached]' : ''}\`;
            }
          }
        }
      } catch (err) {
        container.innerHTML = '<div style="text-align:center;padding:20px;">Live data is temporarily unavailable.</div>';
      }
    }
`;

html = html.replace('// ── UI Interactions ──────────', '// ── UI Interactions ──────────\n' + schemesFunc);

fs.writeFileSync('dashboard.html', html);
console.log('done');
