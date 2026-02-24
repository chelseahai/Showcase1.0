const WebSocket = require("ws");

const PORT = 9000;
const wss = new WebSocket.Server({ port: PORT });

console.log("WS server on " + PORT);

wss.on("connection", (ws) => {
  console.log("Grasshopper connected");

  ws.on("message", (msg) => {
    // broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    console.log("Connection closed");
  });
});
