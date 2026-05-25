/* 老凤祥内容平台 · Service Worker v1
 * 策略：
 *   - 同源 HTML/CSS/JS  → stale-while-revalidate（秒开 + 后台更新）
 *   - 字体 fonts.gstatic.com  → cache-first（永久缓存）
 *   - Google Fonts CSS / Tailwind CDN → cache-first + 7 天后台刷新
 *   - 其他网络请求 → 透传
 *
 * 升级：修改 CACHE_VERSION 即可触发全量替换
 */
'use strict';

const CACHE_VERSION = 'lfx-v1.7.0';
const CACHE_STATIC = CACHE_VERSION + '-static';   // 字体/CDN（长期）
const CACHE_PAGES  = CACHE_VERSION + '-pages';    // 同源（SWR）

const PRECACHE_URLS = [
  './shared.css',
  './shared.js',
  './入口页.html',
  './登录页.html',
  './注册页.html',
  './忘记密码.html',
  './店员首页.html',
  './店员我的.html',
  './店长.html',
  './经销商老板.html',
  './省代总部.html',
  './爆款内容.html',
  './产品.html',
  './发布历史.html',
  './发布成功.html',
  './通知中心.html',
  './404.html',
  './500.html'
];

// CDN/字体白名单（cache-first）
const STATIC_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'fonts.googleapis.cn',
  'fonts.gstatic.cn',
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'cdn.staticfile.org'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_PAGES).then(function(cache){
      // 尽力预缓存，单个失败不阻塞
      return Promise.all(PRECACHE_URLS.map(function(u){
        return cache.add(u).catch(function(){ /* ignore */ });
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE_STATIC && k !== CACHE_PAGES) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function isStaticHost(url){
  for (var i=0; i<STATIC_HOSTS.length; i++){
    if (url.hostname === STATIC_HOSTS[i] || url.hostname.endsWith('.' + STATIC_HOSTS[i])) return true;
  }
  return false;
}

// 同源 SWR
async function staleWhileRevalidate(req){
  var cache = await caches.open(CACHE_PAGES);
  var cached = await cache.match(req);
  var network = fetch(req).then(function(res){
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(function(){ return cached; });
  return cached || network;
}

// CDN cache-first
async function cacheFirst(req){
  var cache = await caches.open(CACHE_STATIC);
  var cached = await cache.match(req);
  if (cached) {
    // 后台刷新（不阻塞返回）
    fetch(req).then(function(res){
      if (res && res.status === 200) cache.put(req, res.clone());
    }).catch(function(){});
    return cached;
  }
  try {
    var res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch(e){
    return new Response('', { status: 504, statusText: 'offline' });
  }
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch(_){ return; }

  // 跨域字体/CDN
  if (isStaticHost(url)) {
    e.respondWith(cacheFirst(req));
    return;
  }

  // 同源 + 路径以 /lfx-preview/ 开头
  if (url.origin === self.location.origin && url.pathname.indexOf('/lfx-preview/') === 0) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }
  // 其他不拦截
});

// 主线程消息：跳过等待 / 清空缓存
self.addEventListener('message', function(e){
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data.type === 'CLEAR_CACHE') {
    e.waitUntil(caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }));
  }
});
