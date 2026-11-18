/* Chaos Arcade profile + Chaos Coins: saved in this browser (localStorage), shared by every page on the same site. */
(function () {
  var KEY = 'chaosArcadeProfile_v1';
  var CAT = {
    theme: {
      default: { n: 'Classic', p: 0 }, neon: { n: 'Neon Night', p: 40 }, sunset: { n: 'Sunset', p: 40 },
      forest: { n: 'Forest', p: 40 }, space: { n: 'Deep Space', p: 60 }, candy: { n: 'Candy', p: 60 }
    },
    frame: {
      none: { n: 'No frame', p: 0 }, gold: { n: 'Gold ring', p: 30 }, ice: { n: 'Ice', p: 40 },
      fire: { n: 'Fire', p: 60 }, rainbow: { n: 'Rainbow', p: 80 }
    },
    color: {
      default: { n: 'Default', p: 0 }, gold: { n: 'Gold', p: 25 }, pink: { n: 'Pink', p: 25 },
      cyan: { n: 'Cyan', p: 25 }, rainbow: { n: 'Rainbow', p: 60 }
    },
    pack: {
      animals: { n: 'Animals', p: 30, e: ['🦖', '🐳', '🦉', '🐧'] },
      sports: { n: 'Sports', p: 30, e: ['⚽', '🏀', '🎳', '🏆'] },
      cool: { n: 'Cool', p: 40, e: ['👑', '💎', '🚀', '👽'] }
    }
  };
  CAT.theme.galaxy = { n: 'Galaxy', p: 0, ex: true };
  CAT.frame.diamond = { n: 'Diamond', p: 0, ex: true };
  CAT.color.glitch = { n: 'Glitch', p: 0, ex: true };
  function fresh() {
    return {
      name: 'Player', avatar: '😎', games: {}, streak: 0, best: 0, coins: 0, earned: 0, unlocked: { claw: false }, pity: 0,
      own: { theme: ['default'], frame: ['none'], color: ['default'], pack: [] },
      eq: { theme: 'default', frame: 'none', color: 'default' }
    };
  }
  function load() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY));
      if (p && p.games) {
        var f = fresh(), k;
        for (k in f) if (p[k] === undefined) p[k] = f[k];
        for (k in f.own) if (!p.own[k]) p.own[k] = f.own[k];
        for (k in f.eq) if (!p.eq[k]) p.eq[k] = f.eq[k];
        for (k in f.unlocked) if (p.unlocked[k] === undefined) p.unlocked[k] = f.unlocked[k];
        return p;
      }
    } catch (e) {}
    return fresh();
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function toast(msg) {
    try {
      var d = document.createElement('div');
      d.textContent = msg;
      d.style.cssText = 'position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#1d1540;color:#fff;font:700 14px system-ui,sans-serif;padding:10px 16px;border-radius:999px;z-index:99;box-shadow:0 4px 16px rgba(0,0,0,.35);pointer-events:none;white-space:nowrap';
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 2800);
    } catch (e) {}
  }
  /* Results are saved from Blue's side (Player 1). result: 'win' | 'loss' | 'draw' */
  function record(game, result, vsCpu) {
    var p = load(), s = p.games[game] || (p.games[game] = { w: 0, l: 0, d: 0, cw: 0 }), c;
    if (result === 'win') {
      s.w++; if (vsCpu) s.cw++;
      p.streak = (p.streak || 0) + 1;
      if (p.streak > (p.best || 0)) p.best = p.streak;
      c = 10 + (p.streak >= 3 ? 5 : 0);
    } else if (result === 'loss') { s.l++; p.streak = 0; c = 2; } else { s.d++; c = 3; }
    p.coins += c; p.earned += c;
    save(p);
    toast((result === 'win' ? '🏆 Win saved' : result === 'loss' ? 'Loss saved' : 'Draw saved') + ' · +' + c + ' 🪙');
  }
  function buy(cat, id) {
    var p = load(), it = CAT[cat] && CAT[cat][id];
    if (!it) return { ok: false, msg: 'Item not found.' };
    if (p.own[cat].indexOf(id) >= 0) return { ok: false, msg: 'You already own that.' };
    if (it.ex) return { ok: false, msg: 'Only from the Prize Claw.' };
    if (p.coins < it.p) return { ok: false, msg: 'Need ' + (it.p - p.coins) + ' more 🪙' };
    p.coins -= it.p; p.own[cat].push(id);
    if (cat !== 'pack') p.eq[cat] = id;
    save(p);
    return { ok: true, msg: 'Bought ' + it.n + '!' + (cat !== 'pack' ? ' Equipped.' : ' New avatars unlocked.') };
  }
  function equip(cat, id) {
    var p = load();
    if (cat !== 'pack' && p.own[cat].indexOf(id) >= 0) { p.eq[cat] = id; save(p); return true; }
    return false;
  }
  function addCoins(n) { var p = load(); p.coins += n; p.earned += n; save(p); }
  function spend(n) { var p = load(); if (p.coins < n) return false; p.coins -= n; save(p); return true; }
  function isUnlocked(id) { return !!load().unlocked[id]; }
  function unlock(id) { var p = load(); p.unlocked[id] = true; save(p); }
  function pity(v) { var p = load(); if (v === undefined) return p.pity || 0; p.pity = v; save(p); return v; }
  function giveExclusive() {
    var p = load(), left = [], c, id;
    for (c in CAT) for (id in CAT[c]) if (CAT[c][id].ex && p.own[c].indexOf(id) < 0) left.push([c, id]);
    if (!left.length) return null;
    var e = left[Math.floor(Math.random() * left.length)];
    p.own[e[0]].push(e[1]); save(p);
    return { cat: e[0], id: e[1], name: CAT[e[0]][e[1]].n };
  }
  window.Arcade = {
    CAT: CAT, load: load, save: save, record: record, buy: buy, equip: equip,
    addCoins: addCoins, spend: spend, isUnlocked: isUnlocked, unlock: unlock, pity: pity, giveExclusive: giveExclusive,
    /* Resets wins/losses/streaks only. Coins, purchases, name and avatar are kept. */
    reset: function () { var p = load(); p.games = {}; p.streak = 0; p.best = 0; save(p); }
  };
})();
