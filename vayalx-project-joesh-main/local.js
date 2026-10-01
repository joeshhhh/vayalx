const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const processes = [];
const frontendPort = process.env.FRONTEND_PORT || '3000';
const localEnv = {
  ...process.env,
  PORT: process.env.PORT || '5000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vayalx',
  JWT_SECRET: process.env.JWT_SECRET || 'vayalx_local_development_secret',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'vayalx_local_cookie_secret',
  AI_MODE: process.env.AI_MODE || 'DEMO',
  MARKET_MODE: process.env.MARKET_MODE || 'DEMO',
  SCHEMES_MODE: process.env.SCHEMES_MODE || 'DEMO'
};

function start(name, script, env) {
  const child = spawn(process.execPath, [path.join(root, script)], {
    cwd: root,
    env,
    stdio: 'inherit'
  });
  processes.push(child);
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0) {
      console.error(`${name} stopped with code ${code || signal}.`);
      shutdown(code || 1);
    }
  });
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) child.kill();
  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

start('Backend', path.join('backend', 'src', 'server.js'), localEnv);
start('Frontend', 'server.js', { ...localEnv, PORT: frontendPort });

console.log('\nVAYALX local services starting:');
console.log(`  Frontend: http://localhost:${frontendPort}`);
console.log('  Backend:  http://localhost:5000/api/health');
console.log('  Database: mongodb://localhost:27017/vayalx\n');
