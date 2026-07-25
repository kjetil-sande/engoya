// Bitteliten utviklingsserver for forhåndsvisning: node .claude/serve.mjs
// Speiler også Netlify-oppsettet: /meloy-proxy/* videresendes til meloy.kommune.no
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// Last .env.local (git-ignorert) inn i process.env — for GOOGLE_PLACES_KEY lokalt
try {
  const env = await readFile(join(root, ".env.local"), "utf8");
  env.split("\n").forEach((l) => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch {}
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

    // /api/<navn>: kjør Netlify-funksjonen netlify/functions/<navn>.mjs direkte
    // (samme kode som i produksjon; cache-bust så endringer slår gjennom uten omstart)
    if (path.startsWith("/api/")) {
      const navn = path.split("/")[2]?.replace(/[^a-z0-9-]/gi, "");
      try {
        const mod = await import(join(root, `netlify/functions/${navn}.mjs`) + "?t=" + Date.now());
        const svar = await mod.default();
        const body = await svar.text();
        res.writeHead(svar.status, { "content-type": svar.headers.get("content-type") || "application/json", "cache-control": "no-store" });
        res.end(body);
      } catch {
        res.writeHead(404, { "content-type": "application/json" });
        res.end('{"feil":"ukjent api-rute"}');
      }
      return;
    }

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
