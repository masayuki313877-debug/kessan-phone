/* 決算帳 スマホ入力 – オフライン用（圏外でも開けるようにファイルを端末に保存しておく）
   アプリを更新したら CACHE の日付を変えること。古い保存が捨てられ、新しい版に入れ替わる。 */
const CACHE = 'kessan-phone-202609181202';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './guide.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* まず保存した分を返す（＝圏外でも開ける）。裏でネットから取り直して次回に備える。 */
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if(res && res.ok && new URL(e.request.url).origin === location.origin){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
