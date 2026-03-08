const WebSocket = require("ws");

const PORT = 9000;
const wss = new WebSocket.Server({ port: PORT });

console.log("WS server on " + PORT);

wss.on("connection", (ws) => {
  console.log("client connected (total:", wss.clients.size, ")");

  ws.on("error", (err) => {
    console.warn("client error:", err.message);
  });

  ws.on("message", (data, isBinary) => {
    if (isBinary) {
      console.log("[recv] binary", data.length, "bytes → broadcasting to", wss.clients.size, "client(s)");
    } else {
      const str = data.toString();
      const preview = str.length > 80 ? str.slice(0, 80) + "…" : str;
      console.log("[recv] text", str.length, "chars → broadcasting to", wss.clients.size, "client(s)", preview);
    }

    // Broadcast preserving type; don't let one failing client kill the server
    const payload = isBinary ? data : data.toString();
    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      try {
        client.send(payload, { binary: isBinary });
      } catch (e) {
        console.warn("send failed:", e.message);
      }
    });
  });

  ws.on("close", () => {
    console.log("client disconnected (remaining:", wss.clients.size, ")");
  });
});
