// Run:  node server.js            (needs Node 18+, no packages to install)
// Find your chat id:  node server.js --chat-id
const http = require("http"), fs = require("fs"), path = require("path");

// Read BOT_TOKEN and CHAT_ID from the .env file next to this script
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (e) { /* no .env file, use real environment variables */ }
const { BOT_TOKEN, CHAT_ID, PORT = 3000 } = process.env;

// Helper: prints the chat ids of people who wrote to your bot
if (process.argv.includes("--chat-id")) {
  if (!BOT_TOKEN) { console.log("Put BOT_TOKEN=... into the .env file first."); process.exit(1); }
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`).then(r => r.json()).then(j => {
    if (!j.ok) return console.log("Telegram error:", j.description);
    const chats = new Map();
    for (const u of j.result) { const c = (u.message || u.channel_post || u.my_chat_member || {}).chat; if (c) chats.set(c.id, c.title || c.first_name || c.username || ""); }
    if (!chats.size) return console.log("Nothing found. Open your bot in Telegram, press Start, send it any message, then run this again.");
    for (const [id, name] of chats) console.log("CHAT_ID=" + id + "   (" + name + ")");
  });
  return;
}
if (!BOT_TOKEN || !CHAT_ID) console.warn("WARNING: BOT_TOKEN or CHAT_ID is missing. Requests from the form will fail. See the .env file.");

const hits = new Map(); // simple limit: 5 requests per hour from one IP
const esc = s => String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/lead") {
    const ip = req.socket.remoteAddress, now = Date.now();
    const list = (hits.get(ip) || []).filter(t => now - t < 36e5);
    if (list.length >= 5) { res.writeHead(429); return res.end(); }
    let raw = ""; for await (const ch of req) { raw += ch; if (raw.length > 2000) { res.writeHead(413); return res.end(); } }
    try {
      const { name, phone, website } = JSON.parse(raw);
      if (website) { res.writeHead(200); return res.end("{}"); } // trap for spam bots
      if (!/^.{2,60}$/.test(name || "") || !/^[+0-9 ()\-]{9,20}$/.test(phone || "")) { res.writeHead(400); return res.end(); }
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, parse_mode: "HTML", text: `<b>New consultation request</b>\nName: ${esc(name)}\nPhone: ${esc(phone)}` })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const hint = r.status === 401 ? "BOT_TOKEN is wrong." : r.status === 400 ? "CHAT_ID is wrong, or you did not press Start in the bot yet." : r.status === 403 ? "The bot is blocked or was removed from the chat." : "";
        throw new Error(`Telegram ${r.status}: ${j.description || ""} ${hint}`);
      }
      hits.set(ip, [...list, now]); res.writeHead(200, { "Content-Type": "application/json" }); res.end("{}");
    } catch (e) { console.error("Could not send to Telegram ->", e.message); res.writeHead(500); res.end(); }
    return;
  }
  // static files
  let f = path.join(__dirname, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  const base = path.basename(f);
  if (!f.startsWith(__dirname) || base === "server.js" || base.startsWith(".") || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log("Site: http://localhost:" + PORT));
