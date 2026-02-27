
# Receiving the 5 metrics in Grasshopper

The webpage sends the five garment values (Fit, Mesh, Thickness, Airflow, Support) over the **same WebSocket** (`ws://127.0.0.1:9000`) as **CSV text** when:

- You click **Analyze text** and get a result (sent automatically), or  
- You click **Resend to Grasshopper** (re-sends the last result).

## Message format

- **Type:** UTF-8 text (not binary).
- **Content:** Exactly **8 comma-separated numbers**, dot decimals, e.g.:
  ```text
  0.40,0.60,0.30,0.50,0.20,0.00,0.00,0.00
  ```
- **Mapping:**
  - 1 → Fit  
  - 2 → Mesh  
  - 3 → Thickness  
  - 4 → Airflow  
  - 5 → Support  
  - 6–8 → currently unused (0.0), available for future signals.

Binary messages (e.g. Float32 point data) are unchanged; the server broadcasts everything. Your GH definition should treat **text** as metrics and **binary** as points.

## Grasshopper side

1. **WebSocket server**  
   Run `node server.js` in this folder so the server is listening on port 9000.

2. **Connect from Grasshopper**  
   Use a WebSocket client component that can:
   - Connect to `ws://127.0.0.1:9000`
   - Receive **text** messages (metrics) and **binary** messages (points), or only the one you need.

3. **Parse metrics**  
   When you receive a **string** message in Grasshopper, feed it into the C# script you set up (the one that parses 8 CSV doubles). That script will:
   - Parse the 8 numbers
   - Output them on A–H
   - You can treat A–E as Fit, Mesh, Thickness, Airflow, Support and ignore F–H for now.

You still need a way to get `message` from the WebSocket in GH (e.g. **Lunchbox** “WebSocket”, **Elefront**, or a custom C#/Python client that writes into the C# input).

### Plugins that can help

- **Lunchbox for Grasshopper** – has a WebSocket component.  
- **Hoopsnake** or **Anemone** – to feed the last received metrics into your definition.  
- A **C# Script** or **Python** component that uses a WebSocket library and updates outputs when a message arrives.

Once the client is connected to `ws://127.0.0.1:9000`, run the page, click **Analyze text** (or **Resend to Grasshopper**), and the 5 values will be broadcast (as 8 CSV numbers) to all connected clients, including Grasshopper.
