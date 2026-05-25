/* 老凤祥内容平台 · 共享脚本 v1
 * 收敛 17 页重复的 theme / tailwind config / toast / confirm / timeAgo
 * 用法：
 *   <link rel="stylesheet" href="shared.css"/>
 *   <script src="shared.js"></script>
 * 即可获得：tailwind.config / window.LFX.toast / LFX.confirm / LFX.timeAgo
 */
(function(global){
  'use strict';

  /* ── 0. Tailwind 配置（与各页保持一致） ───────────────── */
  if (global.tailwind && global.tailwind.config !== undefined) {
    global.tailwind.config = {
      theme: {
        extend: {
          colors: {
            'bg':'#1a1714','card':'#242019','card-hi':'#2e2920',
            'gold':'#c4a265','gold-d':'#8a7d65','gold-b':'#d4b275',
            'tx':'#e8e0d4','tx2':'#9a9080','tx3':'#6a6055',
            'bdr':'rgba(196,162,101,0.08)','bdr2':'rgba(196,162,101,0.18)',
            'red':'#c45a42'
          },
          fontFamily: {'h':['Manrope'],'b':['Manrope'],'l':['Inter']},
          borderRadius: {'c':'12px','pill':'9999px','full':'9999px'}
        }
      }
    };
  }

  /* ── 1. 主题切换 ──────────────────────────────────────── */
  function applyTheme(t){
    document.body.classList.toggle('light', t === 'light');
    try { localStorage.setItem('lfx-theme', t); } catch(e){}
  }
  function initTheme(){
    var t;
    try { t = localStorage.getItem('lfx-theme'); } catch(e){}
    var url = new URLSearchParams(location.search).get('theme');
    if (url === 'light' || url === 'dark') t = url;
    applyTheme(t === 'light' ? 'light' : 'dark');
  }
  function toggleTheme(){
    var cur = document.body.classList.contains('light') ? 'light' : 'dark';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }
  // 立即执行：避免 FOUC（在 body 出现后会自动绑定）
  document.addEventListener('DOMContentLoaded', initTheme);
  // 父框架 postMessage 同步主题
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'theme') applyTheme(e.data.theme);
  });

  /* ── 2. Toast（替代 alert） ───────────────────────────── */
  function toast(msg, opts){
    opts = opts || {};
    var kind = opts.kind || 'info';     // info | success | error
    var dur = opts.duration || 2200;
    var bg = { info: 'var(--lfx-toast-bg)', success: 'var(--lfx-toast-ok)', error: 'var(--lfx-toast-err)' }[kind];
    var t = document.createElement('div');
    t.className = 'lfx-toast lfx-toast-' + kind;
    t.setAttribute('role','status');
    t.style.background = bg;
    t.textContent = msg;
    document.body.appendChild(t);
    // 强制 reflow 触发动画
    void t.offsetWidth;
    t.classList.add('on');
    setTimeout(function(){
      t.classList.remove('on');
      setTimeout(function(){ t.remove(); }, 220);
    }, dur);
  }

  /* ── 3. Confirm（替代 confirm/alert 二次确认） ───────── */
  function confirmDialog(msg, opts){
    return new Promise(function(resolve){
      opts = opts || {};
      var title = opts.title || '请确认';
      var okText = opts.okText || '确定';
      var cancelText = opts.cancelText || '取消';
      var danger = !!opts.danger;
      var mask = document.createElement('div');
      mask.className = 'lfx-modal-mask';
      mask.innerHTML =
        '<div class="lfx-modal" role="dialog" aria-modal="true">' +
          '<h3 class="lfx-modal-t">' + title + '</h3>' +
          '<p class="lfx-modal-m">' + msg + '</p>' +
          '<div class="lfx-modal-a">' +
            '<button class="lfx-btn lfx-btn-g" data-act="cancel">' + cancelText + '</button>' +
            '<button class="lfx-btn ' + (danger ? 'lfx-btn-d' : 'lfx-btn-p') + '" data-act="ok">' + okText + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(mask);
      void mask.offsetWidth;
      mask.classList.add('on');
      mask.addEventListener('click', function(e){
        var a = e.target.getAttribute && e.target.getAttribute('data-act');
        if (a === 'ok' || a === 'cancel' || e.target === mask) {
          mask.classList.remove('on');
          setTimeout(function(){ mask.remove(); }, 200);
          resolve(a === 'ok');
        }
      });
    });
  }

  /* ── 4. 时间格式 timeAgo ─────────────────────────────── */
  function timeAgo(input){
    var d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return String(input);
    var now = new Date();
    var diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
    if (diff < 86400*2) return '昨天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (diff < 86400*7) return Math.floor(diff/86400) + ' 天前';
    // 跨年
    if (d.getFullYear() !== now.getFullYear()) return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
    return (d.getMonth()+1) + '月' + d.getDate() + '日';
  }
  function pad(n){ return n < 10 ? '0'+n : ''+n; }

  /* ── 5. 平台标签渲染 ─────────────────────────────────── */
  function platformTag(p, opts){
    opts = opts || {};
    var size = opts.size === 'sm' ? 'lfx-pt-sm' : '';
    var map = {
      'xhs': {cls:'lfx-pt-xhs', label:'小'},
      'redbook': {cls:'lfx-pt-xhs', label:'小'},
      '小红书': {cls:'lfx-pt-xhs', label:'小'},
      'douyin': {cls:'lfx-pt-dy', label:'抖'},
      '抖音': {cls:'lfx-pt-dy', label:'抖'},
      'wx': {cls:'lfx-pt-wx', label:'微'},
      '视频号': {cls:'lfx-pt-wx', label:'微'}
    };
    var m = map[p] || map['xhs'];
    return '<span class="lfx-pt ' + m.cls + ' ' + size + '" aria-label="'+p+'">' + m.label + '</span>';
  }

  /* ── 6. 通知中心 from 参数构造 ───────────────────────── */
  function notifyHref(from){
    return '通知中心.html?from=' + encodeURIComponent(from || '');
  }

  /* ── 7. 全局 emoji 兜底（向下兼容已部署页面） ─────── */
  function emojiSweep(){
    var emojiRe = /[\u2600-\u27BF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    document.querySelectorAll('p,span,h1,h2,h3,h4,a,div').forEach(function(el){
      if (el.children.length) return;
      if (el.classList.contains('material-symbols-outlined')) return;
      var t = el.textContent;
      if (!t) return;
      if (emojiRe.test(t)) {
        // 仅清理装饰性 emoji，不清理品牌符号
        el.textContent = t.replace(/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').replace(/\s{2,}/g,' ').trim();
      }
    });
  }

  /* ── 7b. 自动 timeAgo：[data-ts] 元素 ───────────── */
  function applyTimeAgo(){
    document.querySelectorAll('[data-ts]').forEach(function(el){
      var ts = el.getAttribute('data-ts');
      if (!ts) return;
      el.textContent = timeAgo(ts);
    });
  }
  document.addEventListener('DOMContentLoaded', applyTimeAgo);

  /* ── 9. Service Worker 注册（C 档：离线缓存秒开） ─── */
  function registerSW(){
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    // sw.js 必须与本脚本同目录（/lfx-preview/sw.js）
    var base = '';
    try {
      var scripts = document.querySelectorAll('script[src*="shared.js"]');
      if (scripts.length) {
        var src = scripts[scripts.length-1].getAttribute('src') || '';
        base = src.replace(/shared\.js.*$/, '');
      }
    } catch(e){}
    var swUrl = base + 'sw.js';
    // 延迟到 load 后注册，不影响首屏
    window.addEventListener('load', function(){
      navigator.serviceWorker.register(swUrl, { scope: base || './' })
        .then(function(reg){
          // 检测更新：发现新 SW 即激活
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          reg.addEventListener('updatefound', function(){
            var nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', function(){
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                nw.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch(function(){ /* 静默 */ });
    });
  }
  registerSW();

  // 提供手动清缓存能力（开发/调试）
  function clearSWCache(){
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    if ('caches' in window) caches.keys().then(function(ks){ ks.forEach(function(k){ caches.delete(k); }); });
  }

  /* ── 10. 动效模块（Luxury Motion） ────────────────────────
   * 滚动揭示 / 数字 count-up / 图片淡入 / 自动绑定
   * 全部尊重 prefers-reduced-motion
   * ───────────────────────────────────────────────────────── */
  var _prefersReduce = false;
  try { _prefersReduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  function _easeOutQuart(t){ return 1 - Math.pow(1 - t, 4); }

  // 滚动揭示：所有 [data-reveal] 进视口才动
  function observeReveal(){
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (_prefersReduce || !('IntersectionObserver' in window)){
      els.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          // stagger 子项支持 data-reveal-stagger="40"
          var delay = parseInt(e.target.getAttribute('data-reveal-delay') || '0', 10);
          if (delay) e.target.style.transitionDelay = delay + 'ms';
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function(el){ io.observe(el); });
  }

  // 数字滚动：[data-count="1234"] 自动 count-up
  // 可选属性：data-count-from, data-count-duration, data-count-decimals,
  //          data-count-prefix, data-count-suffix, data-count-sep="true"
  function countUp(el, opts){
    opts = opts || {};
    var to = parseFloat(el.getAttribute('data-count'));
    if (isNaN(to)) {
      var raw = (el.textContent || '').replace(/[^\d.\-]/g, '');
      to = parseFloat(raw) || 0;
    }
    var from = opts.from != null ? opts.from
              : parseFloat(el.getAttribute('data-count-from') || '0') || 0;
    var dur = opts.duration || parseInt(el.getAttribute('data-count-duration') || '1200', 10);
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var sep = el.getAttribute('data-count-sep') === 'true';

    if (_prefersReduce || dur <= 0){
      var s = decimals ? to.toFixed(decimals) : Math.round(to).toString();
      if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      el.textContent = prefix + s + suffix;
      return;
    }
    var start = performance.now();
    function frame(now){
      var p = Math.min(1, (now - start) / dur);
      var v = from + (to - from) * _easeOutQuart(p);
      var s = decimals ? v.toFixed(decimals) : Math.round(v).toString();
      if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      el.textContent = prefix + s + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function observeCountUp(){
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)){
      els.forEach(function(el){ if (el.dataset.lfxCounted) return; el.dataset.lfxCounted='1'; countUp(el); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting && !e.target.dataset.lfxCounted){
          e.target.dataset.lfxCounted = '1';
          countUp(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function(el){
      if (el.dataset.lfxCounted) return;
      io.observe(el);
    });
  }

  // 图片淡入：未加载完的 img 自动加 .lfx-fade-img
  function fadeImages(){
    var imgs = document.querySelectorAll('img');
    imgs.forEach(function(img){
      if (img.dataset.lfxFade) return;
      img.dataset.lfxFade = '1';
      if (img.complete && img.naturalWidth > 0) return;
      img.classList.add('lfx-fade-img');
      img.addEventListener('load', function(){ img.classList.add('is-loaded'); }, { once:true });
      img.addEventListener('error', function(){ img.classList.add('is-loaded'); }, { once:true });
    });
  }

  // Caret 自动 toggle（[aria-expanded] 已由 §21 CSS 处理；此处兜底 [data-caret-toggle]）
  function bindCaretToggle(){
    document.querySelectorAll('[data-caret-toggle]').forEach(function(btn){
      if (btn.dataset.lfxCaretBound) return;
      btn.dataset.lfxCaretBound = '1';
      btn.addEventListener('click', function(){
        var caret = btn.querySelector('.lfx-caret, [data-caret]');
        if (caret) caret.classList.toggle('is-open');
      });
    });
  }

  // 一键应用所有动效（DOMContentLoaded 自动触发，也可手动调用 LFX.applyMotion）
  function applyMotion(){
    try { observeReveal(); } catch(e){}
    try { observeCountUp(); } catch(e){}
    try { fadeImages(); } catch(e){}
    try { bindCaretToggle(); } catch(e){}
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyMotion, { once: true });
  } else {
    // 已加载完则下一帧执行（避免阻塞首屏）
    requestAnimationFrame(applyMotion);
  }

  // DOM 变化时自动重扫（轻量级，仅看 img / [data-count] / [data-reveal] 节点）
  if ('MutationObserver' in window){
    var _mo = new MutationObserver(function(){ applyMotion(); });
    if (document.body) _mo.observe(document.body, { childList:true, subtree:true });
    else document.addEventListener('DOMContentLoaded', function(){ _mo.observe(document.body, { childList:true, subtree:true }); }, { once:true });
  }

  /* ── 11. 导出 ─────────────────────────────────────────── */
  global.LFX = {
    toast: toast,
    confirm: confirmDialog,
    timeAgo: timeAgo,
    applyTimeAgo: applyTimeAgo,
    platformTag: platformTag,
    notifyHref: notifyHref,
    toggleTheme: toggleTheme,
    applyTheme: applyTheme,
    emojiSweep: emojiSweep,
    clearSWCache: clearSWCache,
    applyMotion: applyMotion,
    countUp: countUp,
    observeReveal: observeReveal,
    observeCountUp: observeCountUp,
    fadeImages: fadeImages
  };
})(window);

/* ============================================================
 * LFX.Store · 伪后端数据层 v1（基于 localStorage）
 * 提供：用户 / 内容 / 通知 / 加购 / 审批流 全链路闭环
 * 跨页面持久化 + 事件订阅
 * ============================================================ */
(function(global){
  'use strict';
  if (!global.LFX) global.LFX = {};

  var KEY = 'lfx-store-v2';
  var ROLES = {
    staff:    { label: '店员',       parent: 'manager', home: '店员首页.html' },
    manager:  { label: '店长',       parent: 'agent',   home: '店长.html' },
    agent:    { label: '省代/总部',   parent: 'hq',      home: '省代总部.html' },
    dealer:   { label: '经销商老板',   parent: 'hq',      home: '经销商老板.html' },
    hq:       { label: '总部',        parent: null,      home: '省代总部.html' }
  };

  // 动态门店列表
  var DEFAULT_STORES = ['上海南京路旗舰店', '上海淮海路店', '上海徐家汇店', '杭州西城店'];

  // 种子数据：首次访问时初始化（让 demo 一打开就有内容）
  function seed(){
    var now = Date.now();
    var H = 3600000;
    var D = 86400000;
    return {
      seq: 100,
      user: null,  // 未登录
      stores: DEFAULT_STORES.slice(),  // 动态门店列表
      contents: [
        { id:1, author:'王雪琪', authorPhone:'13800001001', authorRole:'staff', store:'上海南京路旗舰店', title:'古法金镶玉吊坠 · 五一大促',  body:'限时立减 800 元', platforms:['xhs','dy'], status:'approved',  approvedBy:'李店长', approvedAt:now-2*D, createdAt:now-3*D, exposure:12500, interaction:856 },
        { id:2, author:'王雪琪', authorPhone:'13800001001', authorRole:'staff', store:'上海南京路旗舰店', title:'婚嫁套装「红妆」上新',         body:'承载东方美学的传世之作', platforms:['xhs','wb'], status:'approved', approvedBy:'李店长', approvedAt:now-1*D, createdAt:now-1*D-2*H, exposure:9800, interaction:623 },
        { id:3, author:'张明华', authorPhone:'13800001002', authorRole:'staff', store:'上海淮海路店',     title:'凤舞九天限量手镯预售',          body:'全国限量 300 套', platforms:['xhs','dy','wb'], status:'pending', createdAt:now-3*H },
        { id:4, author:'李芳',   authorPhone:'13800001003', authorRole:'staff', store:'杭州西城店',       title:'樱花季 · 黄金手链试穿',         body:'5/20 上市，先睹为快', platforms:['xhs'],     status:'pending', createdAt:now-1*H }
      ],
      notifications: [
        { id:11, to:'13800001001', type:'approve', title:'内容已通过审核', content:'《古法金镶玉吊坠 · 五一大促》已发布', read:true,  createdAt:now-2*D, link:'发布历史.html' },
        { id:12, to:'13800001001', type:'approve', title:'内容已通过审核', content:'《婚嫁套装「红妆」上新》已发布',     read:true,  createdAt:now-1*D, link:'发布历史.html' },
        { id:13, to:'manager',     type:'review',  title:'有 2 条待审内容', content:'张明华、李芳 提交了新的内容审核',     read:false, createdAt:now-3*H, link:'店长.html' },
        { id:14, to:'agent',       type:'sales',   title:'本周销售数据已更新', content:'门店销售额同比上升 12%',           read:false, createdAt:now-2*H, link:'省代总部.html' },
        { id:15, to:'13800001001', type:'system',  title:'新品预告',         content:'「凤舞九天」限量传承系列 6/1 上市', read:false, createdAt:now-30*60000, link:'爆款内容.html' },
        { id:16, to:'dealer',      type:'review',  title:'经销商待审通知',   content:'门店提交了新的内容素材待经销商审核',  read:false, createdAt:now-1*H, link:'经销商老板.html' },
        { id:17, to:'hq',          type:'report',  title:'月度运营报告',     content:'本月全渠道内容发布量环比增长 18%',    read:false, createdAt:now-4*H, link:'省代总部.html' }
      ],
      cart: [],  // [{id, type:'cart'|'stock', name, store, qty, addedAt}]
      stats: {
        period: 'week',
        kpiByPeriod: {
          week:  { sales:'86.5万', monthSales:'23.8万', activeStores:4, conversion:'18.6%' },
          month: { sales:'342.7万', monthSales:'342.7万', activeStores:4, conversion:'21.3%' }
        },
        pkByPeriod: {
          week: [
            { store:'上海南京路旗舰店', publish:1247, rate:92, hot:9.6, sales:'32.6万' },
            { store:'上海淮海路店',     publish:986,  rate:78, hot:8.9, sales:'24.1万' },
            { store:'上海徐家汇店',     publish:734,  rate:65, hot:7.4, sales:'18.3万' },
            { store:'杭州西城店',       publish:612,  rate:51, hot:6.8, sales:'11.5万' }
          ],
          month: [
            { store:'上海南京路旗舰店', publish:5128, rate:96, hot:9.8, sales:'128.4万' },
            { store:'上海淮海路店',     publish:4072, rate:84, hot:9.2, sales:'94.7万' },
            { store:'上海徐家汇店',     publish:3015, rate:71, hot:8.0, sales:'72.6万' },
            { store:'杭州西城店',       publish:2486, rate:58, hot:7.3, sales:'47.0万' }
          ]
        }
      }
    };
  }

  function load(){
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { var s = seed(); save(s); return s; }
      var s = JSON.parse(raw);
      // 数据迁移：补充缺失字段
      if (!s.stores) s.stores = DEFAULT_STORES.slice();
      if (!s.seq) s.seq = 100;
      save(s);
      return s;
    } catch(e){ return seed(); }
  }
  function save(s){
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){}
  }

  var state = load();
  var listeners = [];
  function emit(evt){
    save(state);
    listeners.forEach(function(fn){ try { fn(evt, state); } catch(e){} });
    // 跨标签页同步
    try { window.dispatchEvent(new CustomEvent('lfx-store-change', { detail: { evt: evt } })); } catch(e){}
  }
  // 跨标签页监听 storage 事件，重新 load
  window.addEventListener('storage', function(e){
    if (e.key === KEY){
      state = load();
      listeners.forEach(function(fn){ try { fn('sync', state); } catch(e){} });
    }
  });

  function nextId(){ return ++state.seq; }
  function now(){ return Date.now(); }

  /* ── 角色识别（精确文件名匹配） ── */
  function detectRoleFromHome(){
    var path = decodeURIComponent(location.pathname).toLowerCase();
    // 提取文件名（去掉路径和参数），精确匹配
    var file = path.split('/').pop().split('?')[0].split('#')[0];
    var ROLE_MAP = {
      '店员首页.html': 'staff',
      '店员我的.html': 'staff',
      '店长.html': 'manager',
      '省代总部.html': 'agent',
      '经销商老板.html': 'dealer'
    };
    return ROLE_MAP[file] || null;
  }

  /* ── 业务 API ───────────────────────────────────────── */
  var Store = {
    KEY: KEY,
    ROLES: ROLES,

    on: function(fn){ listeners.push(fn); return function(){ var i=listeners.indexOf(fn); if(i>=0)listeners.splice(i,1); }; },

    getState: function(){ return state; },

    /* 用户 */
    getUser: function(){ return state.user; },
    isLogged: function(){ return !!state.user; },
    login: function(opts){
      // opts: {phone, role, name?, store?}
      var role = opts.role || 'staff';
      var phone = opts.phone || ('138' + Math.floor(10000000 + Math.random()*90000000));
      var roleLabel = { staff:'店员', manager:'店长', agent:'省代', dealer:'经销商', hq:'总部' }[role] || '员工';
      state.user = {
        phone: phone,
        role: role,
        name: opts.name || (roleLabel + ' ' + phone.slice(-4)),
        store: opts.store || '',
        avatar: opts.avatar || '',
        loginAt: now()
      };
      emit('login');
      return state.user;
    },
    logout: function(){
      state.user = null;
      emit('logout');
    },
    setRole: function(role){
      if (!state.user) return;
      state.user.role = role;
      var info = ROLES[role];
      if (info){
        var roleLabel = { staff:'店员', manager:'店长', agent:'省代', dealer:'经销商', hq:'总部' }[role] || '员工';
        if (!state.user.name || /^(店员|店长|省代|经销商|总部)\s+\d{4}$/.test(state.user.name)){
          state.user.name = roleLabel + ' ' + state.user.phone.slice(-4);
        }
      }
      // 自动绑定门店：manager/dealer 若无门店则取第一个
      if ((role === 'manager' || role === 'dealer') && !state.user.store && state.stores && state.stores.length){
        state.user.store = state.stores[0];
      }
      emit('role-change');
    },
    setUserStore: function(storeName){
      if (!state.user) return;
      state.user.store = storeName || '';
      emit('role-change');
    },

    /* 门店管理 */
    getStores: function(){ return state.stores || []; },
    addStore: function(name){
      if (!name || state.stores.indexOf(name) >= 0) return false;
      state.stores.push(name);
      emit('store-change');
      return true;
    },
    removeStore: function(name){
      var idx = state.stores.indexOf(name);
      if (idx < 0) return false;
      state.stores.splice(idx, 1);
      emit('store-change');
      return true;
    },

    /* 内容发布 */
    publish: function(c){
      var u = state.user || { phone:'', name:'未知用户', role:'staff', store:'' };
      if (!u.store && u.role === 'staff'){
        // 店员必须绑定门店才能发布
        if (typeof LFX !== 'undefined' && LFX.toast) LFX.toast('请先绑定所属门店',{kind:'error'});
        return null;
      }
      var item = {
        id: nextId(),
        author: u.name, authorPhone: u.phone, authorRole: u.role, store: u.store,
        title: c.title || '未命名内容',
        body: c.body || '',
        platforms: c.platforms || ['xhs'],
        status: 'pending',
        createdAt: now()
      };
      state.contents.unshift(item);
      // 给上级发审核通知（多级链路）
      var parent = ROLES[u.role] && ROLES[u.role].parent;
      if (parent){
        var parentInfo = ROLES[parent];
        var parentHome = (parentInfo && parentInfo.home) || '店长.html';
        var parentLabel = (parentInfo && parentInfo.label) || '上级';
        state.notifications.unshift({
          id: nextId(), to: parent, type:'review',
          title:'新内容待审',
          content: u.name + ' 提交《' + item.title + '》待' + parentLabel + '审核',
          read:false, createdAt:now(), link: parentHome
        });
      }
      emit('publish');
      return item;
    },
    getContents: function(filter){
      filter = filter || {};
      var u = state.user;
      var userStore = (u && u.store) || '';
      var userRole = (u && u.role) || 'staff';
      return state.contents.filter(function(c){
        if (filter.status && c.status !== filter.status) return false;
        if (filter.authorPhone && c.authorPhone !== filter.authorPhone) return false;
        // 租户隔离：店员/店长若有门店则只看本店；无门店则看全部（兼容旧数据）
        if ((userRole === 'staff' || userRole === 'manager') && userStore){
          if (c.store && c.store !== userStore) return false;
        }
        return true;
      });
    },
    getMyContents: function(status){
      var u = state.user;
      if (!u) return [];
      return this.getContents({ authorPhone: u.phone, status: status });
    },
    getPendingForRole: function(role){
      // 店长只能看自己门店的待审（有门店时）；省代/总部/经销商可看全部
      if (role === 'manager'){
        var store = (state.user && state.user.store) || '';
        if (store){
          return state.contents.filter(function(c){ return c.status === 'pending' && c.store === store; });
        }
        // 店长未绑定门店时看全部（兼容）
        return state.contents.filter(function(c){ return c.status === 'pending'; });
      }
      if (role === 'agent' || role === 'dealer' || role === 'hq'){
        return state.contents.filter(function(c){ return c.status === 'pending'; });
      }
      return [];
    },

    /* 审批 */
    approve: function(contentId){
      var c = state.contents.find(function(x){ return x.id === contentId; });
      if (!c) return null;
      c.status = 'approved';
      c.approvedBy = (state.user && state.user.name) || '审核员';
      c.approvedAt = now();
      c.exposure = Math.floor(3000 + Math.random()*9000);
      c.interaction = Math.floor(200 + Math.random()*700);
      // 通知作者
      state.notifications.unshift({
        id: nextId(), to: c.authorPhone, type:'approve',
        title:'内容已通过审核',
        content: '《' + c.title + '》已发布，去查看效果',
        read:false, createdAt:now(), link:'发布历史.html'
      });
      // 多级审批链：向上级通报审批结果
      var approver = state.user;
      if (approver){
        var approverRole = approver.role;
        var approverParent = ROLES[approverRole] && ROLES[approverRole].parent;
        if (approverParent){
          var parentInfo = ROLES[approverParent];
          var parentHome = (parentInfo && parentInfo.home) || '省代总部.html';
          var parentLabel = (parentInfo && parentInfo.label) || '上级';
          state.notifications.unshift({
            id: nextId(), to: approverParent, type:'review',
            title:'下级已审批通过',
            content: approver.name + ' 已通过《' + c.title + '》(' + c.store + ')',
            read:false, createdAt:now(), link: parentHome
          });
        }
      }
      emit('approve');
      return c;
    },
    reject: function(contentId, reason){
      var c = state.contents.find(function(x){ return x.id === contentId; });
      if (!c) return null;
      c.status = 'rejected';
      c.rejectReason = reason || '不符合发布规范';
      c.rejectedAt = now();
      state.notifications.unshift({
        id: nextId(), to: c.authorPhone, type:'reject',
        title:'内容审核未通过',
        content: '《' + c.title + '》：' + c.rejectReason,
        read:false, createdAt:now(), link:'发布历史.html'
      });
      emit('reject');
      return c;
    },

    /* 通知 */
    getNotifications: function(){
      var u = state.user;
      if (!u) return [];  // 未登录不返回任何通知
      var matchTo = function(to){
        if (to === u.phone) return true;
        if (to === u.role) return true;
        return false;
      };
      return state.notifications.filter(function(n){ return matchTo(n.to); });
    },
    unreadCount: function(){
      return this.getNotifications().filter(function(n){ return !n.read; }).length;
    },
    markRead: function(notifId){
      var n = state.notifications.find(function(x){ return x.id === notifId; });
      if (n){ n.read = true; emit('notif-read'); }
    },
    markAllRead: function(){
      var changed = false;
      this.getNotifications().forEach(function(n){ if (!n.read){ n.read = true; changed = true; } });
      if (changed) emit('notif-read-all');
    },

    /* 加购 / 备货 */
    addToCart: function(item){
      // item: {type:'cart'|'stock', name, store?, qty?}
      state.cart.unshift({
        id: nextId(),
        type: item.type || 'cart',
        name: item.name || '未命名商品',
        store: item.store || (state.user && state.user.store) || '',
        qty: item.qty || 1,
        addedAt: now()
      });
      emit('cart-add');
    },
    cartCount: function(type){
      return state.cart.filter(function(x){ return !type || x.type === type; }).length;
    },

    /* 周/月数据 */
    setPeriod: function(p){
      state.stats.period = p;
      emit('period-change');
    },
    getPeriod: function(){ return state.stats.period; },
    getKPI: function(){ return state.stats.kpiByPeriod[state.stats.period] || state.stats.kpiByPeriod.week; },
    getPK:  function(){ return state.stats.pkByPeriod[state.stats.period] || state.stats.pkByPeriod.week; },

    /* 重置（开发用） */
    reset: function(){
      state = seed();
      save(state);
      emit('reset');
    },

    /* 角色识别 */
    detectRole: detectRoleFromHome
  };

  /* ── 全局 header 红点同步（自动）─── */
  function updateHeaderBadge(){
    var n = Store.isLogged() ? Store.unreadCount() : 0;
    document.querySelectorAll('[data-lfx-badge="notif"]').forEach(function(el){
      var mode = el.getAttribute('data-lfx-badge-mode');
      if (!mode){
        var c = el.className || '';
        mode = (/min-w/.test(c) || /text-\[/.test(c)) ? 'number' : 'dot';
      }
      if (mode === 'number'){
        el.textContent = n > 0 ? (n > 99 ? '99+' : String(n)) : '';
      }
      el.style.display = n > 0 ? '' : 'none';
    });
  }
  Store.on(function(){ updateHeaderBadge(); });
  document.addEventListener('DOMContentLoaded', updateHeaderBadge);

  /* ── 未登录时，后台页自动跳转登录页；角色不匹配也会阻止 ─── */
  document.addEventListener('DOMContentLoaded', function(){
    if (!Store.isLogged()){
      var path = decodeURIComponent(location.pathname).toLowerCase();
      var isPublic = ['登录','注册','忘记密码','入口页','404','500','index.html','下载'].some(function(k){ return path.indexOf(k) >= 0; });
      // 后台页面未登录 → 跳转登录页
      if (!isPublic){
        var from = encodeURIComponent(location.pathname + location.search);
        location.replace('登录页.html?from=' + from);
        return;
      }
    }
    // 角色-页面权限校验：防止越权访问
    if (Store.isLogged()){
      var u = Store.getUser();
      var r = (u && u.role) || 'staff';
      var path2 = decodeURIComponent(location.pathname).toLowerCase();
      // staff 只能访问店员页面
      if (r === 'staff' && (path2.indexOf('店长') >= 0 || path2.indexOf('省代') >= 0 || path2.indexOf('总部') >= 0 || path2.indexOf('经销商') >= 0)){
        location.replace('店员首页.html');
        return;
      }
      // manager 不能访问省代/总部/经销商页面
      if (r === 'manager' && (path2.indexOf('省代') >= 0 || path2.indexOf('总部') >= 0 || path2.indexOf('经销商') >= 0)){
        location.replace('店长.html');
        return;
      }
      // dealer 不能访问店员/店长/省代页面
      if (r === 'dealer' && (path2.indexOf('店员') >= 0 || path2.indexOf('店长') >= 0 || path2.indexOf('省代') >= 0 || path2.indexOf('总部') >= 0)){
        location.replace('经销商老板.html');
        return;
      }
    }
    updateHeaderBadge();
  });

  global.LFX.Store = Store;
})(window);
