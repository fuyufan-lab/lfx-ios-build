#!/usr/bin/env node
/**
 * sync-web.js  —  把 modified/* 同步到三个壳工程
 *
 * Usage:
 *   node mobile/scripts/sync-web.js ios      # → mobile/capacitor-ios/www/
 *   node mobile/scripts/sync-web.js harmony  # → mobile/harmony-next/entry/src/main/resources/rawfile/web/
 *   node mobile/scripts/sync-web.js android  # → modified-apk-android/app/src/main/assets/web/  (旧 APK 壳, 可选)
 *   node mobile/scripts/sync-web.js all      # 三个全做
 *
 * 默认行为：覆盖目标目录，复制 modified/ 全部内容。
 * 远程模式 (壳直接拉 https://yh.xiaofenhe.com/...) 时其实可以不跑此脚本，
 * 但跑一下没坏处——离线模式回退也用得到。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'modified');

const TARGETS = {
  ios:     path.join(ROOT, 'mobile', 'capacitor-ios', 'www'),
  harmony: path.join(ROOT, 'mobile', 'harmony-next', 'entry', 'src', 'main', 'resources', 'rawfile', 'web'),
  android: path.join(ROOT, 'mobile', 'webview-android', 'app', 'src', 'main', 'assets', 'web'),
};

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  if (fs.rmSync) {
    fs.rmSync(p, { recursive: true, force: true });
  } else {
    // node < 14
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const f of fs.readdirSync(p)) rmrf(path.join(p, f));
      fs.rmdirSync(p);
    } else {
      fs.unlinkSync(p);
    }
  }
}

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dst, name);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function syncOne(key) {
  const dst = TARGETS[key];
  if (!dst) {
    console.error('[sync] unknown target:', key);
    process.exit(2);
  }
  if (!fs.existsSync(SRC)) {
    console.error('[sync] source not found:', SRC);
    process.exit(2);
  }
  console.log(`[sync:${key}] ${SRC}  →  ${dst}`);
  rmrf(dst);
  copyDir(SRC, dst);

  // iOS 平台需要一个 index.html（Capacitor 默认入口）
  if (key === 'ios') {
    const idx = path.join(dst, 'index.html');
    if (!fs.existsSync(idx)) {
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>LFX 珠宝内容</title>
<meta http-equiv="refresh" content="0; url=入口页.html" />
<script>location.replace('入口页.html');</script>
<style>html,body{margin:0;background:#1a1714;color:#d4b275;font-family:-apple-system,BlinkMacSystemFont,sans-serif;height:100%}body{display:flex;align-items:center;justify-content:center}</style>
</head>
<body>正在进入 LFX…</body>
</html>`;
      fs.writeFileSync(idx, html, 'utf8');
      console.log('[sync:ios] inject index.html → 入口页.html');
    }
  }

  console.log(`[sync:${key}] done`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node sync-web.js <ios|harmony|android|all>');
  process.exit(1);
}
const which = args[0];
if (which === 'all') {
  for (const k of Object.keys(TARGETS)) {
    if (TARGETS[k] === TARGETS.android && !fs.existsSync(path.dirname(path.dirname(TARGETS.android)))) {
      console.log('[sync:android] skip (target dir not present)');
      continue;
    }
    try { syncOne(k); } catch (e) { console.warn(`[sync:${k}] fail:`, e.message); }
  }
} else {
  syncOne(which);
}
