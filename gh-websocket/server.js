const WebSocket = require("ws");

const PORT = 9000;
const wss = new WebSocket.Server({ port: PORT });

console.log("WS server on " + PORT);

wss.on("connection", (ws) => {
  console.log("client connected");

  ws.on("message", (data, isBinary) => {
    // Debug log
    if (isBinary) {
      console.log("recv binary bytes:", data.length);
    } else {
      console.log("recv text:", data.toString().slice(0, 120));
    }

    // Broadcast preserving type correctly
    wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;

      if (isBinary) {
        client.send(data, { binary: true });
      } else {
        client.send(data.toString(), { binary: false });
      }
    });
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});
