// 設定環境變數
process.env.MCP_TRANSPORT_TYPE = 'http';
process.env.MCP_HTTP_PORT = process.env.PORT || '3017';
process.env.MCP_HTTP_HOST = '0.0.0.0';
process.env.MCP_LOG_LEVEL = 'info';
process.env.MCP_ALLOWED_ORIGINS = '*';

console.log('Starting PubMed MCP Server...');
console.log('Port:', process.env.MCP_HTTP_PORT);
console.log('Host:', process.env.MCP_HTTP_HOST);

// 啟動 MCP Server
try {
  require('@cyanheads/pubmed-mcp-server');
  console.log('PubMed MCP Server started successfully');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
