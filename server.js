const http = require('http');

// Zeabur 提供的端口
const PORT = process.env.PORT || 3017;

console.log('=== Starting PubMed MCP Server ===');
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 建立服務器
const server = http.createServer((req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 健康檢查
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const response = {
      status: 'healthy',
      service: 'PubMed MCP Server',
      port: PORT,
      time: now,
      uptime: process.uptime()
    };
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  // MCP 訊息端點
  if (req.url === '/messages') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'MCP endpoint received',
          received: body,
          time: now
        }));
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'MCP Messages endpoint ready',
        methods: ['POST'],
        time: now
      }));
    }
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    path: req.url,
    available: ['/', '/health', '/messages']
  }));
});

// 啟動服務器
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP Server started successfully`);
  console.log(`✅ Listening on: 0.0.0.0:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ MCP endpoint: http://localhost:${PORT}/messages`);
  console.log('=== Server Ready ===');
});

// 監聽服務器事件
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`🎯 Server is listening on ${address.address}:${address.port}`);
});

// 進程事件處理
process.on('SIGTERM', () => {
  console.log('📝 Received SIGTERM signal, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📝 Received SIGINT signal, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// 錯誤處理
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🚀 Application initialized, waiting for server to start...');
