'use strict';

// ============================================================
// CONSTANTS
// ============================================================

const TOTAL_SEATS    = 24;
const FOCUS_SECS     = 25 * 60;
const BREAK_SECS     = 5  * 60;
const MAX_LOG        = 16;
const DANMAKU_SPEED  = 110; // px / second

// ============================================================
// FAKE USER POOL  (for auto-simulation)
// ============================================================

const FAKE_USERS = [
  { name: '努力的小明',  av: '明', color: '#7c6af7' },
  { name: '学霸狂人',    av: '霸', color: '#f7a06a' },
  { name: '考研冲刺',    av: '研', color: '#6af7a0' },
  { name: '数学大神',    av: '数', color: '#f76a6a' },
  { name: 'coding每天',  av: 'C',  color: '#6ab4f7' },
  { name: '英语四六级',  av: '英', color: '#f7e06a' },
  { name: '物理竞赛生',  av: '物', color: '#c76af7' },
  { name: '医学生苦苦',  av: '医', color: '#f76ab4' },
  { name: '法律人备考',  av: '法', color: '#6af7f7' },
  { name: '会计证必过',  av: '会', color: '#f7a06a' },
  { name: '高考倒计时',  av: '高', color: '#ff7e7e' },
  { name: '研究生在读',  av: '研', color: '#7eb4ff' },
  { name: '复习的你',    av: '复', color: '#7effc0' },
  { name: '每日打卡er',  av: '卡', color: '#ffdc7e' },
  { name: '不睡觉战神',  av: '战', color: '#dc7eff' },
  { name: '刷题100天',   av: '题', color: '#ff7eb4' },
  { name: '自律养成计',  av: '律', color: '#7effdc' },
  { name: '化学竞赛ing', av: '化', color: '#ff9e6a' },
  { name: '加油不熬夜',  av: '加', color: '#6affb4' },
  { name: '日语N2冲刺',  av: 'N',  color: '#ff6ab4' },
];

const STUDY_SUBJECTS = ['高数', '英语', '物理', '化学', '编程', '历史', '政治', '语文', '生物', '地理', '考研', '四六级'];

const DANMAKU_POOL = [
  '打卡！今天也要努力！',
  '一起学习！加油！',
  '#入座 学高数',
  '今天目标：做完三套卷子',
  '刚下班来学习了 😅',
  '感谢班主任！',
  '同学们晚上好！',
  '#打卡',
  '这个自习室好安静 👍',
  '已经坚持21天打卡了！',
  '明天考试，今晚复习',
  '冲冲冲！',
  '今天一定要完成计划',
  '老师点名了好紧张',
  '好困但是不能睡 😭',
  '学习使我快乐（bushi）',
  '感谢礼物 ❤️',
  '坚持就是胜利！',
  '大家加油！',
  '这节番茄钟我要认真学',
];

// ============================================================
// GIFT DEFINITIONS
// ============================================================

const GIFTS = {
  rose:   { name: '玫瑰',   emoji: '🌹', value: 1,   color: '#ff6b8a', role: '🌹 玫瑰鼓励' },
  coffee: { name: '咖啡',   emoji: '☕', value: 5,   color: '#c07840', role: '☕ 咖啡续命', lit: true },
  star:   { name: '星星',   emoji: '⭐', value: 10,  color: '#ffc107', role: '⭐ 学习之星', lit: true },
  front:  { name: '前排票', emoji: '👑', value: 20,  color: '#f7b731', role: '👑 前排VIP',  lit: true },
  lamp:   { name: '台灯',   emoji: '🔦', value: 50,  color: '#a8ff78', role: '🔦 台灯赞助', lit: true },
  rocket: { name: '火箭',   emoji: '🚀', value: 100, color: '#7eb4ff', role: '🚀 火箭豪礼', lit: true },
};

// ============================================================
// SESSION DEFINITIONS
// ============================================================

const SESSIONS = [
  { hours: [6,7,8,9,10],    name: '🌅 晨读场',    desc: '早起的鸟儿有虫吃，元气满满！' },
  { hours: [11,12],         name: '☀️ 午间场',    desc: '午间充电，短暂学习效率高' },
  { hours: [13,14,15,16,17],name: '📚 下午场',    desc: '黄金学习时段，注意力最集中' },
  { hours: [18,19,20,21],   name: '🌆 晚自习',    desc: '经典晚自习，大家都在认真学' },
  { hours: [22,23],         name: '🌙 深夜场',    desc: '夜深人静，适合深度思考' },
  { hours: [0,1,2,3,4,5],   name: '🌃 挑灯夜战',  desc: '凌晨还在坚持，你最厉害！' },
];

// ============================================================
// TEACHER MESSAGES
// ============================================================

const MSG = {
  startup:      [['欢迎来到24小时自习室！','今天也要认真学习哦 📚'],
                 ['自习室已开门！','同学们准备好了吗？']],
  join:         [['新同学入座！','欢迎加入我们的学习队伍 👋'],
                 ['又来了一位学霸！','大家互相加油，共同进步！'],
                 ['欢迎入座！','开始今天的学习吧！💪']],
  leave:        [['有同学离开了','辛苦了！明天见 👋'],
                 ['座位空出来了','学习告一段落，好好休息！']],
  focus_start:  [['专注时间开始！','接下来25分钟，手机放一边 📵'],
                 ['番茄时钟启动！','专注25分钟，之后休息 🍅'],
                 ['学习模式开启！','保持专注，远离干扰！']],
  break_start:  [['休息时间到了！','起来活动一下，喝点水 💧'],
                 ['5分钟休息！','眼睛看看远方放松一下 👀'],
                 ['番茄完成！','休息5分钟，你已经很棒了 ✨']],
  patrol:       [['老师来巡查了！','同学们都在认真学吗？ 👀'],
                 ['巡查一下...','嗯，同学们都很认真！'],
                 ['老师巡视中...','大家继续加油！']],
  encourage:    [['同学们辛苦了！','坚持就是胜利！💪'],
                 ['大家都很棒！','继续保持这个状态！'],
                 ['学习不能停！','知识是最好的投资！📚']],
  gift:         [['感谢同学送礼物！','老师代全班说谢谢 🙏'],
                 ['礼物收到！','有爱的自习室！💕'],
                 ['哇，有礼物！','谢谢同学的支持！❤️']],
  full:         [['自习室坐满啦！','大家学习热情高涨！🔥'],
                 ['24个座位全满！','今天人气超旺！']],
  morning:      [['早上好！','新的一天，新的开始 🌅'],
                 ['晨读时间！','趁早上大脑清醒多看点书 📖']],
  night:        [['深夜还在坚持！','记得注意休息哦 💤'],
                 ['夜深了...','加油！但别忘了睡觉！']],
  latenight:    [['凌晨了还在学！','你是最努力的同学！🌟'],
                 ['深夜学习勇士！','一定要注意身体呀！']],
};

// ============================================================
// STATE
// ============================================================

let seats       = [];
let totalGifts  = 0;
let viewers     = 156;
let timerMode   = 'focus';
let timerSecs   = FOCUS_SECS;
let timerActive = false;
let timerHandle = null;
let patrolIdx   = 0;
let pomoCount   = 0;
let leaderboard = {};          // { name: { score, av, color } }
let autoRunning = false;
let autoHandle  = null;
let autoPatrol  = null;
let simUsers    = [];          // names of fake users currently seated

// ============================================================
// SEAT INIT
// ============================================================

function initSeats() {
  seats = Array.from({ length: TOTAL_SEATS }, (_, i) => ({
    id:       i,
    row:      Math.floor(i / 6),
    col:      i % 6,
    frontRow: i < 6,
    occupant: null,
    av:       null,
    color:    null,
    role:     null,
    lit:      false,
    since:    null,
  }));
}

// ============================================================
// UTILITIES
// ============================================================

function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(a, b)    { return Math.floor(Math.random() * (b - a + 1)) + a; }
function fmt2(n)      { return String(n).padStart(2, '0'); }

function fmtTime(s) {
  return `${fmt2(Math.floor(s / 60))}:${fmt2(s % 60)}`;
}

function fmtDur(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${fmt2(m)}:${fmt2(sec)}`;
  return `${fmt2(m)}:${fmt2(sec)}`;
}

function getInputs() {
  const name  = (document.getElementById('inp-user')?.value  || '').trim() || '匿名同学';
  const av    = (document.getElementById('inp-avatar')?.value || '').trim().slice(0, 2) || name.slice(0, 1);
  const color = '#7c6af7';
  return { name, av, color };
}

function firstEmpty()      { return seats.find(s => !s.occupant) || null; }
function firstFrontEmpty() { return seats.find(s => s.frontRow && !s.occupant) || null; }
function findSeat(name)    { return seats.find(s => s.occupant === name) || null; }
function filledCount()     { return seats.filter(s => s.occupant).length; }

// ============================================================
// LOGGING
// ============================================================

function log(text) {
  const list = document.getElementById('log-list');
  if (!list) return;
  const now = new Date().toLocaleTimeString('zh', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const el  = document.createElement('div');
  el.className = 'log-item';
  el.innerHTML  = `<span class="log-time">${now}</span>${text}`;
  list.prepend(el);
  while (list.children.length > MAX_LOG) list.removeChild(list.lastChild);
}

// ============================================================
// TEACHER
// ============================================================

function updateTeacher(main, sub) {
  const mEl = document.getElementById('teacher-main');
  const sEl = document.getElementById('teacher-sub');
  const bEl = document.getElementById('teacher-bubble');
  const tEl = document.getElementById('ticker-text');
  if (mEl) mEl.textContent = main;
  if (sEl) sEl.textContent = sub || '';
  if (tEl) tEl.textContent = `${main}${sub ? '  ' + sub : ''}`;
  if (bEl) { bEl.classList.remove('excite'); void bEl.offsetWidth; bEl.classList.add('excite'); }
}

function patrol() {
  patrolIdx = (patrolIdx + 1) % 4;
  const char = document.getElementById('teacher-char');
  if (char) char.style.left = ['4%','28%','52%','76%'][patrolIdx];

  const rowSeats = seats.filter(s => s.row === patrolIdx && s.occupant);
  if (rowSeats.length > 0) {
    const praised = pick(rowSeats);
    const msgs = [
      [`👀 ${praised.occupant} 同学！`, '学得很认真，继续加油！'],
      [`发现 ${praised.occupant}！`,    '坐姿端正，表扬！✨'],
      [`${praised.occupant}，注意！`,   '题目都做完了吗？'],
    ];
    const [m, s] = pick(msgs);
    updateTeacher(m, s);
    log(`🚶 老师巡查第${patrolIdx+1}排，点名 ${praised.occupant}`);
    addDanmaku(`老师点名了 ${praised.occupant}！来了来了 👀`, '#ffdc7e', 'system');
  } else {
    const [m, s] = pick(MSG.patrol);
    updateTeacher(m, s);
    log(`🚶 老师巡查第${patrolIdx+1}排`);
  }
  const ps = document.getElementById('patrol-status');
  if (ps) ps.textContent = `🚶 老师正在巡查第 ${patrolIdx+1} 排...`;
}

// ============================================================
// DANMAKU ENGINE  (JS transition-based, reliable for any width)
// ============================================================

const _dmLaneTs = [0, 0, 0, 0, 0, 0]; // last-used timestamp per lane

function addDanmaku(text, color, type) {
  const layer = document.getElementById('danmaku-layer');
  if (!layer) return;

  // Pick least-recently-used lane
  let lane = 0;
  for (let i = 1; i < _dmLaneTs.length; i++) {
    if (_dmLaneTs[i] < _dmLaneTs[lane]) lane = i;
  }
  _dmLaneTs[lane] = Date.now();

  const el = document.createElement('div');
  el.className = `danmaku-item danmaku-${type || 'normal'}`;
  el.textContent = text;
  el.style.color  = color || '#ffffff';
  el.style.top    = `${8 + lane * 13}%`;
  el.style.left   = '100%'; // start off right edge

  layer.appendChild(el);

  // Two rAF to ensure layout is calculated before transition starts
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const W    = layer.offsetWidth  || 800;
    const elW  = el.offsetWidth     || 200;
    const dist = W + elW + 20;
    const dur  = dist / DANMAKU_SPEED;
    el.style.transition = `left ${dur.toFixed(2)}s linear`;
    el.style.left       = `-${elW + 20}px`;
    setTimeout(() => el.remove(), (dur + 0.5) * 1000);
  }));
}

// ============================================================
// SEAT MANAGEMENT
// ============================================================

function assignSeat(name, av, color, subject, mode) {
  // Already seated?
  let seat = findSeat(name);
  if (seat) {
    updateTeacher(`${name} 已就座`, '继续学习中！');
    return seat;
  }

  const target = (mode === 'front')
    ? (firstFrontEmpty() || firstEmpty())
    : firstEmpty();

  if (!target) {
    updateTeacher('自习室已满！', '等等看有没有同学离开 😅');
    addDanmaku('自习室满员，稍等一下～', '#ff6b8a', 'system');
    log('⚠️ 教室已满，无法入座');
    return null;
  }

  target.occupant = name;
  target.av       = av  || name.slice(0, 2);
  target.color    = color || '#7c6af7';
  target.role     = subject ? `📖 ${subject}` : null;
  target.since    = Date.now();
  target.lit      = false;

  viewers = Math.max(viewers, filledCount() + rnd(80, 160));

  const [m, s] = pick(MSG.join);
  updateTeacher(m, s);
  addDanmaku(`${name} 入座第${target.row+1}排第${target.col+1}位！`, target.color, 'join');
  log(`🪑 ${name} → 第${target.row+1}排${target.col+1}号`);

  if (filledCount() === TOTAL_SEATS) {
    const [fm, fs] = pick(MSG.full);
    updateTeacher(fm, fs);
    addDanmaku('自习室全满啦！🔥', '#ff6b8a', 'system');
  }

  render();
  return target;
}

function leaveSeat(name) {
  const seat = findSeat(name);
  if (!seat) return;
  const dur = seat.since ? fmtDur(Date.now() - seat.since) : '?';
  const [m, s] = pick(MSG.leave);

  Object.assign(seat, { occupant: null, av: null, color: null, role: null, lit: false, since: null });

  updateTeacher(m, s);
  addDanmaku(`${name} 离开了（学习了 ${dur}）`, '#aaaaaa', 'leave');
  log(`🚶 ${name} 离开 (${dur})`);
  render();
}

// ============================================================
// GIFT SYSTEM
// ============================================================

function updateLeaderboard(name, av, color, value) {
  if (!leaderboard[name]) leaderboard[name] = { score: 0, av, color };
  leaderboard[name].score += value;
  renderLeaderboard();
}

function showGiftToast(name, gDef) {
  const area = document.getElementById('gift-toast-area');
  if (!area) return;
  const el = document.createElement('div');
  el.className = 'gift-toast';
  el.style.borderLeftColor = gDef.color;
  el.innerHTML = `<span class="gift-toast-emoji">${gDef.emoji}</span><span class="gift-toast-user">${name}</span> 送出 ${gDef.name}！`;
  area.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

function handleGift(type, name, av, color) {
  const gDef = GIFTS[type];
  if (!gDef) return;

  totalGifts++;
  viewers += rnd(3, 8);
  updateLeaderboard(name, av, color, gDef.value);
  showGiftToast(name, gDef);
  const [m, s] = pick(MSG.gift);
  updateTeacher(m, s);
  addDanmaku(`${name} 送出了 ${gDef.emoji}${gDef.name}！`, gDef.color, 'gift');
  log(`🎁 ${name} 送出 ${gDef.emoji}${gDef.name} (+${gDef.value}分)`);

  // Ensure user is seated
  let seat = findSeat(name) || assignSeat(name, av, color, null, type === 'front' ? 'front' : 'normal');
  if (!seat) { render(); return; }

  if (type === 'front' && !seat.frontRow) {
    const front = firstFrontEmpty();
    if (front) {
      Object.assign(front, { occupant: seat.occupant, av: seat.av, color: seat.color, role: gDef.role, lit: true, since: seat.since });
      Object.assign(seat,  { occupant: null, av: null, color: null, role: null, lit: false, since: null });
      updateTeacher(`${name} 升级前排！`, '👑 前排VIP到位！');
      addDanmaku(`${name} 获得前排VIP席！👑`, gDef.color, 'gift');
    } else {
      seat.role = gDef.role;
      seat.lit  = true;
    }
  } else if (type === 'lamp') {
    seats.filter(s => s.occupant).forEach(s => { s.lit = true; });
    updateTeacher('台灯全开！', '整个自习室亮起来了 🔦');
    addDanmaku('台灯全开！自习室大亮！🔦', gDef.color, 'gift');
  } else if (type === 'rocket') {
    seats.filter(s => s.occupant).forEach(s => { s.lit = true; });
    seat.role = gDef.role;
    updateTeacher(`${name} 送出火箭！`, '哇！全场沸腾！🚀🔥');
    addDanmaku(`🚀🚀🚀 ${name} 火箭助力！全场亮灯！`, gDef.color, 'gift');
    for (let i = 0; i < 4; i++) setTimeout(() => addDanmaku('🚀 火箭！', gDef.color, 'gift'), i * 250);
  } else {
    seat.role = gDef.role;
    if (gDef.lit) seat.lit = true;
  }

  render();
}

// ============================================================
// TIMER
// ============================================================

function setTimerMode(mode) {
  timerMode = mode;
  timerSecs = mode === 'focus' ? FOCUS_SECS : BREAK_SECS;
  const lEl = document.getElementById('pomo-label');
  if (lEl) lEl.textContent = mode === 'focus' ? '🍅 专注中' : '☕ 休息中';
  updateTimerUI();
}

function updateTimerUI() {
  const d = document.getElementById('timer-display');
  if (d) d.textContent = fmtTime(timerSecs);
  const bar = document.getElementById('pomo-bar');
  if (!bar) return;
  const total = timerMode === 'focus' ? FOCUS_SECS : BREAK_SECS;
  bar.style.width = `${((total - timerSecs) / total * 100).toFixed(1)}%`;
  bar.style.background = timerMode === 'focus'
    ? 'linear-gradient(90deg, #7c3aed, #22d3ee)'
    : 'linear-gradient(90deg, #059669, #22d3ee)';
}

function tickTimer() {
  if (timerSecs > 0) {
    timerSecs--;
    updateTimerUI();
  } else {
    if (timerMode === 'focus') {
      pomoCount++;
      const pcEl = document.getElementById('pomo-count');
      if (pcEl) pcEl.textContent = pomoCount;
      setTimerMode('break');
      const [m, s] = pick(MSG.break_start);
      updateTeacher(m, s);
      addDanmaku('🍅 番茄完成！休息5分钟！', '#22c55e', 'system');
      log(`🍅 番茄 #${pomoCount} 完成！进入休息`);
    } else {
      setTimerMode('focus');
      const [m, s] = pick(MSG.focus_start);
      updateTeacher(m, s);
      addDanmaku('⏰ 休息结束！开始新一轮专注！', '#7c6af7', 'system');
      log('⏰ 休息结束，新番茄开始');
    }
  }
}

function toggleTimer() {
  if (timerActive) {
    clearInterval(timerHandle);
    timerHandle = null;
    timerActive = false;
    log('⏸️ 计时器暂停');
  } else {
    timerHandle = setInterval(tickTimer, 1000);
    timerActive = true;
    const [m, s] = pick(MSG.focus_start);
    updateTeacher(m, s);
    log('▶️ 计时器开始');
  }
}

function skipTimer() {
  setTimerMode(timerMode === 'focus' ? 'break' : 'focus');
  log(`⏭️ 手动切换到${timerMode === 'focus' ? '专注' : '休息'}模式`);
}

// ============================================================
// SESSION & CLOCK
// ============================================================

function getSession() {
  const h = new Date().getHours();
  return SESSIONS.find(s => s.hours.includes(h)) || SESSIONS[3];
}

function updateClock() {
  const now = new Date();
  const hhmmss = now.toLocaleTimeString('zh', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false });
  const hhmm   = now.toLocaleTimeString('zh', { hour:'2-digit', minute:'2-digit', hour12: false });
  const rc = document.getElementById('real-clock');
  const cc = document.getElementById('classroom-clock');
  if (rc) rc.textContent = hhmmss;
  if (cc) cc.textContent = hhmm;
}

function updateSessionUI() {
  const sess = getSession();
  const sb   = document.getElementById('session-badge');
  const sn   = document.getElementById('session-name');
  const sd   = document.getElementById('session-desc');
  if (sb) sb.textContent = sess.name;
  if (sn) sn.textContent = sess.name;
  if (sd) sd.textContent = sess.desc;
}

// ============================================================
// AUTO SIMULATION ENGINE
// ============================================================

function simStep() {
  const r = Math.random();

  if (r < 0.30 && filledCount() < TOTAL_SEATS - 2) {
    // New fake user joins
    const pool = FAKE_USERS.filter(u => !simUsers.includes(u.name));
    if (pool.length > 0) {
      const u = pick(pool);
      const subj = Math.random() > 0.45 ? pick(STUDY_SUBJECTS) : null;
      assignSeat(u.name, u.av, u.color, subj);
      simUsers.push(u.name);
      viewers += rnd(1, 4);
    }
  } else if (r < 0.40 && simUsers.length > 4) {
    // Fake user leaves
    const leaving = pick(simUsers);
    leaveSeat(leaving);
    simUsers = simUsers.filter(n => n !== leaving);
  } else if (r < 0.60) {
    // Random danmaku comment
    const u = pick(FAKE_USERS);
    addDanmaku(`${u.name}：${pick(DANMAKU_POOL)}`, u.color, 'normal');
    viewers += rnd(0, 2);
  } else if (r < 0.68) {
    // Random gift
    const gTypes = ['rose','coffee','coffee','star','star'];
    const u = pick(FAKE_USERS);
    handleGift(pick(gTypes), u.name, u.av, u.color);
  } else if (r < 0.76) {
    // Teacher encouragement
    const [m, s] = pick(MSG.encourage);
    updateTeacher(m, s);
  } else if (r < 0.84) {
    // Viewer fluctuation
    viewers = Math.max(100, viewers + rnd(-10, 15));
  } else {
    // Extra danmaku burst
    const u = pick(FAKE_USERS);
    addDanmaku(`${u.name}：${pick(DANMAKU_POOL)}`, u.color, 'normal');
  }

  render();
}

function startAutoSim() {
  if (autoRunning) return;
  autoRunning = true;

  // Seed classroom with some students
  const seedN = rnd(6, 12);
  const pool  = [...FAKE_USERS].sort(() => Math.random() - 0.5).slice(0, seedN);
  pool.forEach(u => {
    assignSeat(u.name, u.av, u.color, Math.random() > 0.4 ? pick(STUDY_SUBJECTS) : null);
    simUsers.push(u.name);
  });

  // Scheduled sim ticks (variable interval feels natural)
  function schedNext() {
    if (!autoRunning) return;
    simStep();
    autoHandle = setTimeout(schedNext, rnd(6000, 14000));
  }
  schedNext();

  // Auto patrol every 40s
  autoPatrol = setInterval(patrol, 40000);

  // Start timer if not running
  if (!timerActive) toggleTimer();

  log('🤖 自动模拟已开启，24小时自习室运行中...');
  updateTeacher('自动自习室运行中！', '同学们自由学习 🤖');
  render();
}

function stopAutoSim() {
  if (!autoRunning) return;
  autoRunning = false;
  clearTimeout(autoHandle);
  clearInterval(autoPatrol);
  autoHandle = autoPatrol = null;
  log('⏹️ 自动模拟已停止');
}

// ============================================================
// RENDER
// ============================================================

function renderSeat(seat) {
  const el = document.createElement('div');
  el.className = 'seat';
  if (seat.frontRow) el.classList.add('front-row');
  if (seat.lit)      el.classList.add('lit');
  if (!seat.occupant) el.classList.add('empty');

  if (seat.occupant) {
    const dur = seat.since ? fmtDur(Date.now() - seat.since) : '00:00';
    el.innerHTML = `
      <div class="seat-avatar" style="background:${seat.color || '#7c6af7'}">${seat.av || '?'}</div>
      <div class="seat-name">${seat.occupant}</div>
      <div class="seat-timer" data-sid="${seat.id}">${dur}</div>
      ${seat.role ? `<div class="seat-role">${seat.role}</div>` : ''}
    `;
  } else {
    el.innerHTML = `
      <div class="seat-empty-icon">+</div>
      <div class="seat-empty-label">空位</div>
    `;
  }
  return el;
}

function render() {
  const grid = document.getElementById('desk-rows');
  if (!grid) return;
  grid.innerHTML = '';
  seats.forEach(s => grid.appendChild(renderSeat(s)));

  const fc = filledCount();
  const sc = document.getElementById('seat-count');
  const vc = document.getElementById('viewer-count');
  const gt = document.getElementById('gift-total');
  if (sc) sc.textContent = fc;
  if (vc) vc.textContent = viewers.toLocaleString('zh');
  if (gt) gt.textContent = totalGifts;
}

function renderLeaderboard() {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;
  const sorted = Object.entries(leaderboard).sort((a,b) => b[1].score - a[1].score).slice(0, 5);
  if (sorted.length === 0) { lb.innerHTML = '<div class="lb-empty">暂无上榜，快来送礼物！</div>'; return; }
  lb.innerHTML = sorted.map(([name, d], i) => `
    <div class="lb-item">
      <span class="lb-rank rank-${i+1}">${i+1}</span>
      <span class="lb-avatar" style="background:${d.color||'#7c6af7'}">${d.av||name[0]}</span>
      <span class="lb-name">${name}</span>
      <span class="lb-score">${d.score}分</span>
    </div>
  `).join('');
}

// Duration ticker (updates all seated timers every second without re-rendering seats)
function startDurationTicker() {
  setInterval(() => {
    document.querySelectorAll('.seat-timer[data-sid]').forEach(el => {
      const seat = seats[parseInt(el.dataset.sid)];
      if (seat?.since) el.textContent = fmtDur(Date.now() - seat.since);
    });
  }, 1000);
}

// ============================================================
// RESET
// ============================================================

function resetScene() {
  stopAutoSim();
  if (timerActive) toggleTimer();
  simUsers = [];
  leaderboard = {};
  totalGifts  = 0;
  viewers     = 156;
  pomoCount   = 0;
  patrolIdx   = 0;
  initSeats();
  setTimerMode('focus');
  const pcEl = document.getElementById('pomo-count');
  if (pcEl) pcEl.textContent = '0';
  const ll = document.getElementById('log-list');
  if (ll) ll.innerHTML = '';
  const teacher = document.getElementById('teacher-char');
  if (teacher) teacher.style.left = '4%';
  const ps = document.getElementById('patrol-status');
  if (ps) ps.textContent = '🚶 老师待机中...';
  const btn = document.getElementById('btn-autosim');
  if (btn) { btn.textContent = '🤖 自动模拟'; btn.classList.remove('active-sim'); }
  render();
  renderLeaderboard();
  updateTeacher('教室重置完成！', '欢迎重新开始学习 📚');
  log('🔄 教室已重置');
}

// ============================================================
// EVENT BINDING
// ============================================================

function bindActions() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const { name, av, color } = getInputs();

    switch (action) {
      case 'checkin':
        assignSeat(name, av, color, null, 'normal');
        addDanmaku(`${name}：#打卡 来学习啦！`, color, 'join');
        break;
      case 'seat':
        assignSeat(name, av, color, null, 'normal');
        addDanmaku(`${name}：#入座`, color, 'join');
        break;
      case 'study':
        assignSeat(name, av, color, '自学', 'normal');
        addDanmaku(`${name} 开始自习！📚`, color, 'join');
        break;
      case 'leave':
        leaveSeat(name);
        break;
      case 'gift-rose':   handleGift('rose',   name, av, color); break;
      case 'gift-coffee': handleGift('coffee', name, av, color); break;
      case 'gift-star':   handleGift('star',   name, av, color); break;
      case 'gift-front':  handleGift('front',  name, av, color); break;
      case 'gift-lamp':   handleGift('lamp',   name, av, color); break;
      case 'gift-rocket': handleGift('rocket', name, av, color); break;
      case 'toggle-timer': toggleTimer(); break;
      case 'skip-timer':   skipTimer();   break;
      case 'patrol':       patrol();      break;
      case 'auto-sim':
        if (autoRunning) {
          stopAutoSim();
          btn.textContent = '🤖 自动模拟';
          btn.classList.remove('active-sim');
        } else {
          startAutoSim();
          btn.textContent = '⏹️ 停止模拟';
          btn.classList.add('active-sim');
        }
        break;
      case 'reset': resetScene(); break;
    }
  });
}

// ============================================================
// INIT
// ============================================================

function init() {
  initSeats();
  setTimerMode('focus');
  updateClock();
  updateSessionUI();
  render();
  renderLeaderboard();
  bindActions();
  startDurationTicker();

  // Clock ticks
  setInterval(updateClock,     1000);
  setInterval(updateSessionUI, 60000);

  // Time-aware greeting
  const h = new Date().getHours();
  let greet;
  if      (h >= 6  && h < 11) greet = pick(MSG.morning);
  else if (h >= 22 || h < 3)  greet = pick(MSG.night);
  else if (h < 6)             greet = pick(MSG.latenight);
  else                        greet = pick(MSG.startup);
  updateTeacher(greet[0], greet[1]);

  const sess = getSession();
  log(`🏫 自习室开门 (${sess.name})`);
  addDanmaku('欢迎来到24小时自习室！发弹幕 #打卡 加入学习 📚', '#c4b5fd', 'system');

  // Auto-start timer after short delay
  setTimeout(toggleTimer, 1500);
}

init();
