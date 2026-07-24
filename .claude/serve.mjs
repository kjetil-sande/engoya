// Bitteliten utviklingsserver for forhåndsvisning: node .claude/serve.mjs
// Speiler også Netlify-oppsettet: /meloy-proxy/* videresendes til meloy.kommune.no
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);

    // Proxy for nyheter fra Meløy kommune (samme rute som netlify.toml setter opp)
    if (path.startsWith("/meloy-proxy")) {
      const target = "https://www.meloy.kommune.no" + path.replace("/meloy-proxy", "") || "/";
      const upstream = await fetch(target, { headers: { "user-agent": "EngoyaWebsite/1.0 (dev)" } });
      const body = await upstream.text();
      res.writeHead(upstream.status, { "content-type": upstream.headers.get("content-type") || "text/html", "cache-control": "no-store" });
      res.end(body);
      return;
    }

    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) throw new Error("utenfor rot");
    const data = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404");
  }
}).listen(4173, () => console.log("Engøya-forhåndsvisning på http://localhost:4173"));
