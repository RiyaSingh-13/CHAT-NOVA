import http from "http";
import https from "https";

const TARGET_HOST = "chat-nova-bk.onrender.com";
const PORT = 5002;

const server = http.createServer((req, res) => {
  // Add CORS headers to all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Forward request to Render backend
  const headers = { ...req.headers };
  headers.host = TARGET_HOST;
  headers.origin = "https://chat-nova-fd.onrender.com"; // Matches allowed origin
  delete headers["referer"];

  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const responseHeaders = { ...proxyRes.headers };
    responseHeaders["access-control-allow-origin"] = "*";
    res.writeHead(proxyRes.statusCode, responseHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("[Proxy Error]:", err.message);
    res.writeHead(502, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ success: false, message: "Proxy error: " + err.message }));
  });

  req.pipe(proxyReq, { end: true });
});

// WebSocket proxying for Socket.IO
server.on("upgrade", (req, clientSocket, head) => {
  const headers = { ...req.headers };
  headers.host = TARGET_HOST;
  headers.origin = "https://chat-nova-fd.onrender.com";

  const proxyReq = https.request({
    hostname: TARGET_HOST,
    port: 443,
    path: req.url,
    method: req.method,
    headers,
  });

  proxyReq.on("upgrade", (proxyRes, remoteSocket, proxyHead) => {
    clientSocket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}\r\n`)
        .join("") +
      `\r\n`
    );
    if (proxyHead && proxyHead.length) clientSocket.write(proxyHead);
    remoteSocket.pipe(clientSocket);
    clientSocket.pipe(remoteSocket);
  });

  proxyReq.on("error", (err) => {
    console.error("[WS Proxy Error]:", err.message);
    clientSocket.destroy();
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`[ChatNova] CORS Dev Proxy running on http://localhost:${PORT} -> https://${TARGET_HOST}`);
});
