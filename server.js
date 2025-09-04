// 處理 Zeabur 的特殊環境變數格式
function getActualPort() {
  const portEnv = process.env.PORT || process.env.WEB_PORT || '8080';
  
  // 如果是 ${WEB_PORT} 格式，就使用默認端口
  if (typeof portEnv === 'string' && portEnv.includes('${')) {
    console.log('Detected template variable, using default port 8080');
    return '8080';
  }
  
  return portEnv.toString();
}

const PORT = getActualPort();

console.log('Environment variables:');
console.log('Raw PORT:', process.env.PORT);
console.log('Raw WEB_PORT:', process.env.WEB_PORT);
console.log('Final port:', PORT);

// 設定環境變數
process.env.MCP_TRANSPORT_TYPE = 'http';
process.env.MCP_HTTP_PORT = PORT;
process.env.MCP_HTTP_HOST = '0.0.0.0';
process.env.MCP_LOG_LEVEL = 'info';
process.env.MCP_ALLOWED_ORIGINS = '*';

console.log('Starting PubMed MCP Server with port:', PORT);

// 保持進程活躍的簡單方法
const server = require('http').createServer((req, res) => {
  // 簡單的健康檢查端點
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT }));
    return;
  }
  
  // 對於其他請求，返回 MCP 信息
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'PubMed MCP Server', 
    port: PORT,
    endpoints: ['/messages', '/health']
  }));
});

// 啟動 HTTP 服務器
server.listen(parseInt(PORT), '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  
  // 在服務器啟動後再啟動 MCP Server
  try {
    require('@cyanheads/pubmed-mcp-server');
    console.log('PubMed MCP Server integration loaded');
  } catch (error) {
    console.error('Failed to load MCP Server:', error);
  }
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
