const PORT = process.env.PORT || process.env.WEB_PORT || 3017;

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('WEB_PORT:', process.env.WEB_PORT);
console.log('Using port:', PORT);

// 設定環境變數
Object.assign(process.env, {
  MCP_TRANSPORT_TYPE: 'http',
  MCP_HTTP_PORT: PORT.toString(),
  MCP_HTTP_HOST: '0.0.0.0',
  MCP_LOG_LEVEL: 'info',
  MCP_ALLOWED_ORIGINS: '*'
});

// 啟動服務器
const { spawn } = require('child_process');

const server = spawn('npx', ['@cyanheads/pubmed-mcp-server'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});
