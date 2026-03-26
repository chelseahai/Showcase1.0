const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const PORT = 9000;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ALLOW_ORIGIN = "http://127.0.0.1:8080";

function getOpenAiApiKey() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return process.env.OPENAI_API_KEY.trim();
  }
  try {
    const raw = fs.readFileSync(path.join(__dirname, "api-key.json"), "utf8");
    const parsed = JSON.parse(raw);
    return (parsed.OPENAI_API_KEY || "").trim();
  } catch (e) {
    return "";
  }
}

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad request" }));
    return;
  }

  if (req.method === "OPTIONS" && req.url === "/api/openai/chat/completions") {
    applyCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/openai/chat/completions") {
    applyCors(res);
    const apiKey = getOpenAiApiKey();
    if (!apiKey) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "OPENAI_API_KEY is not configured on server." } }));
      return;
    }
    try {
      const payload = await readJsonBody(req);
      const upstream = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, { "Content-Type": "application/json" });
      res.end(text);
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: e.message || "Proxy request failed" } }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocket.Server({ server });

console.log("WS+API server starting on " + PORT);
server.listen(PORT, () => {
  console.log("WS+API server running on " + PORT);
});

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
