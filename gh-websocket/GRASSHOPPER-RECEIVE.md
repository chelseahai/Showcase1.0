
# Receiving metrics in Grasshopper

The webpage sends garment values over the **same WebSocket** (`ws://127.0.0.1:9000`) as **JSON text** when:

- You click **Analyze text** and get a result (sent automatically), or  
- You click **Resend to Grasshopper** (re-sends the last result).

## Message format

- **Type:** UTF-8 text (not binary).
- **Content:** One JSON object per message, e.g.:
  ```json
  { "type": "metrics", "Fit": 0.4, "Mesh": 0.6, "Thickness": 0.3, "Airflow": 0.5, "Support": 0.2, "Comfort": 0.5, "DressLength": 0.6, "DressSize": 0.5 }
  ```
- **Fields (each 0–1):**
  - `Fit`, `Mesh`, `Thickness`, `Airflow`, `Support`, `Comfort`
  - `DressLength` — 0 = short (mini, above knee), 1 = long (midi, maxi, floor)
  - `DressSize` — 0 = narrow hem (fitted, pencil, sheath), 1 = wide hem (A-line, circle, full skirt); infer from occasion, activity, comfort, aesthetic

Binary messages (e.g. Float32 point data) are unchanged; the server broadcasts everything.

## Grasshopper side

1. **WebSocket server**  
   Run `node server.js` in this folder so the server is listening on port 9000.

2. **Connect from Grasshopper**  
   Use a WebSocket client component that can:
   - Connect to `ws://127.0.0.1:9000`
   - Receive **text** messages (metrics) and **binary** messages (points), or only the one you need.

3. **Parse metrics**  
   When you receive a **string** message, parse it as JSON. If `type === "metrics"`, read the 8 fields (Fit, Mesh, Thickness, Airflow, Support, Comfort, DressLength, DressSize). Add outputs for DressLength and DressSize in your C# script if you use them.

You still need a way to get `message` from the WebSocket in GH (e.g. **Lunchbox** “WebSocket”, **Elefront**, or a custom C#/Python client that writes into the C# input).

### Plugins that can help

- **Lunchbox for Grasshopper** – has a WebSocket component.  
- **Hoopsnake** or **Anemone** – to feed the last received metrics into your definition.  
- A **C# Script** or **Python** component that uses a WebSocket library and updates outputs when a message arrives.

Once the client is connected to `ws://127.0.0.1:9000`, run the page, click **Analyze text** (or **Resend to Grasshopper**), and the 8 values will be broadcast as JSON to all connected clients, including Grasshopper.
