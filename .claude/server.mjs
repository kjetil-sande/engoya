// Bitte liten statisk server til forhåndsvisning. python3 -m http.server kaller
// os.getcwd() før den leser -d, og det får den ikke lov til i sandkassen.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
const ROT = "/Users/kjetilsande/Documents/Claude/Engøya";
const TYPE = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css",
  ".png":"image/png", ".jpg":"image/jpeg", ".gif":"image/gif", ".aac":"audio/aac",
  ".mp3":"audio/mpeg", ".mp4":"video/mp4", ".json":"application/json", ".svg":"image/svg+xml" };
createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fil = join(ROT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
  try {
    const d = await readFile(fil);
    res.writeHead(200, { "Content-Type": TYPE[extname(fil)] || "application/octet-stream",
                         "Cache-Control": "no-store" });
    res.end(d);
  } catch { res.writeHead(404); res.end("nope"); }
}).listen(8901, "127.0.0.1");
