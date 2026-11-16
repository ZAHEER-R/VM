import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chatHandler from './api/chat.js';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8'
};

function safeJoin(base, requestPath) {
  const normalizedPath = normalize(requestPath).replace(/^\/+|\/+$/g, '');
  return resolve(base, normalizedPath || '.');
}

async function readRequestBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function serveStaticFile(req, res, url) {
  const requestPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = safeJoin(rootDir, requestPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return true;
  }

  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      throw new Error('Directory request');
    }

    const contentType = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(body);
    return true;
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return true;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/chat') {
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await readRequestBody(req)
    });

    const response = await chatHandler(request);
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }

    res.writeHead(response.status, headers);
    if (req.method !== 'HEAD') {
      res.end(Buffer.from(await response.arrayBuffer()));
    } else {
      res.end();
    }
    return;
  }

  await serveStaticFile(req, res, url);
});

server.listen(port, () => {
  console.log(`Lisa chat is running at http://localhost:${port}`);
});
