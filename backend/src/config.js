import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
    path.resolve(__dirname, '../../config.json'),
    path.resolve(__dirname, '../config.json'),
];

let fileCfg = {};
for (const p of candidates) {
    try {
        if (fs.existsSync(p)) {
            fileCfg = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
        }
    } catch { }
}

export const EXTERNAL_API_URL =
    process.env.EXTERNAL_API_URL ||
    fileCfg?.externalApiUrl;
