# Grasshopper → Web Points (WebSocket bridge)

One-time: install [Node.js LTS](https://nodejs.org), then in this folder:

```bash
npm install
node server.js
```

Leave the server running. Open `index.html` in your browser (double-click or drag into Chrome/Edge).

In Grasshopper, point your C# WebSocket client to `ws://127.0.0.1:9000`. When Grasshopper sends point data (e.g. JSON array of `{x,y,z}`), the page will show "Connected" and display the points.

## If something fails

- **"node" not recognized** → Install Node.js from https://nodejs.org
- **Cannot find module 'ws'** → Run `npm install` in this folder
- **Nothing when GH sends** → Check C# URL is `ws://127.0.0.1:9000`, server is running, firewall not blocking
