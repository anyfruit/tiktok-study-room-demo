const TOTAL_SEATS = 24;
const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const classroomGrid = document.getElementById('classroom-grid');
const seatCountEl = document.getElementById('seat-count');
const giftCountEl = document.getElementById('gift-count');
const viewerCountEl = document.getElementById('viewer-count');
const ticker = document.getElementById('ticker');
const teacherLine = document.getElementById('teacher-line');
const teacherSubline = document.getElementById('teacher-subline');
const teacherPanel = document.getElementById('teacher-panel');
const teacher = document.getElementById('teacher');
const patrolStatus = document.getElementById('patrol-status');
const classSummary = document.getElementById('class-summary');
const eventLog = document.getElementById('event-log');
const timerDigits = document.getElementById('timer-digits');
const timerLabel = document.getElementById('timer-label');
const scene = document.getElementById('scene');

const seats = Array.from({ length: TOTAL_SEATS }, (_, index) => ({
  id: index + 1,
  row: Math.floor(index / 6) + 1,
  col: (index % 6) + 1,
  frontRow: index < 6,
  occupant: null,
  lit: false,
}));

let totalGifts = 0;
let viewers = 213;
let timerMode = 'focus';
let timerSeconds = FOCUS_DURATION;
let timerRunning = false;
let timerHandle = null;
let patrolIndex = 0;

const lines = {
  join: [
    '签到成功，坐下开始学。',
    '新同学已入座，别装学习，真学。',
    '入座完成，今天这一轮别掉线。',
  ],
  gift: [
    '礼物收到，班主任记住你了。',
    '谢谢支持，给你安排点排面。',
    '行，这下全班都看到你认真了。',
  ],
  patrol: [
    '我来巡查这一排，别摸鱼。',
    '抬头看黑板，别偷偷刷手机。',
    '这一排状态还行，继续保持。',
  ],
  break: [
    '下课 5 分钟，喝口水，别走远。',
    '休息开始，可以活动一下脖子。',
  ],
  focus: [
    '上课了，手机扣下，开始专注。',
    '下一轮专注开始，全班坐稳。',
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initials(value) {
  const txt = (value || '').trim();
  if (!txt) return '??';
  return txt.slice(0, 3).toUpperCase();
}

function getInputs() {
  const username = document.getElementById('username').value.trim() || `guest${Math.floor(Math.random() * 90 + 10)}`;
  const avatarText = initials(document.getElementById('avatarText').value.trim() || username);
  return { username, avatarText };
}

function log(text) {
  const li = document.createElement('li');
  const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  li.innerHTML = `<strong>${ts}</strong><br>${text}`;
  eventLog.prepend(li);
  while (eventLog.children.length > 12) {
    eventLog.removeChild(eventLog.lastChild);
  }
}

function updateTeacher(main, sub = '这块在真直播里负责 TTS、点名、感谢礼物、催学习。') {
  teacherLine.textContent = main;
  teacherSubline.textContent = sub;
  ticker.textContent = `班主任：${main}`;
  teacherPanel.classList.add('excite');
  scene.classList.add('flash');
  setTimeout(() => teacherPanel.classList.remove('excite'), 700);
  setTimeout(() => scene.classList.remove('flash'), 700);
}

function firstEmptySeat() {
  return seats.find((seat) => !seat.occupant);
}

function findUserSeat(username) {
  return seats.find((seat) => seat.occupant?.username === username);
}

function filledCount() {
  return seats.filter((seat) => seat.occupant).length;
}

function render() {
  classroomGrid.innerHTML = '';

  seats.forEach((seat) => {
    const node = document.createElement('div');
    node.className = 'seat';
    if (seat.frontRow) node.classList.add('front-row');
    if (seat.lit) node.classList.add('lit');

    if (seat.occupant) {
      node.innerHTML = `
        <div class="avatar">${seat.occupant.avatarText}</div>
        <div class="seat-name">@${seat.occupant.username}</div>
        <div class="seat-role">${seat.occupant.role}</div>
        <div class="seat-badge">${seat.occupant.badge}</div>
      `;
    } else {
      node.innerHTML = `
        <div class="avatar empty-copy">…</div>
        <div class="seat-name">空位 ${seat.id}</div>
        <div class="seat-role">弹幕或礼物可上座</div>
        <div class="seat-badge">等待同学</div>
      `;
    }

    classroomGrid.appendChild(node);
  });

  const count = filledCount();
  seatCountEl.textContent = `${count}/${TOTAL_SEATS}`;
  classSummary.textContent = `${count}/${TOTAL_SEATS} 已入座`;
  giftCountEl.textContent = totalGifts;
  viewerCountEl.textContent = viewers;
}

function assignSeat(mode) {
  const { username, avatarText } = getInputs();
  let seat = findUserSeat(username);
  if (!seat) seat = firstEmptySeat();
  if (!seat) {
    log('教室满了，后续可以加候补区。');
    updateTeacher('教室满员了，后来的先在门口排队。');
    return;
  }

  seat.occupant = {
    username,
    avatarText,
    role: mode === 'comment' ? '弹幕签到入座' : '随机旁听位',
    badge: mode === 'comment' ? '📝 已签到' : '👀 旁听中',
  };

  viewers += Math.floor(Math.random() * 3) + 1;
  updateTeacher(pick(lines.join), `@${username} 已经入座，第 ${seat.row} 排第 ${seat.col} 位。`);
  log(`@${username} ${mode === 'comment' ? '通过弹幕签到' : '随机'}入座到第 ${seat.row} 排第 ${seat.col} 位。`);
  render();
}

function handleGift(type) {
  const { username, avatarText } = getInputs();
  let seat = findUserSeat(username);
  if (!seat) {
    seat = firstEmptySeat();
  }
  if (!seat) return;

  if (!seat.occupant) {
    seat.occupant = {
      username,
      avatarText,
      role: '礼物入座',
      badge: '🎁 已上座',
    };
  }

  totalGifts += 1;
  viewers += Math.floor(Math.random() * 5) + 2;

  if (type === 'rose') {
    seat.occupant.role = '玫瑰鼓励位';
    seat.occupant.badge = '🌹 玫瑰';
    updateTeacher(`谢谢 @${username} 的玫瑰，全班继续学。`, `小礼物更适合做“鼓励播报”，别搞得太像讨赏。`);
    log(`@${username} 送出玫瑰，系统播报感谢。`);
  }

  if (type === 'coffee') {
    seat.occupant.role = '深夜苦读位';
    seat.occupant.badge = '☕ 咖啡加成';
    seat.lit = true;
    updateTeacher(`谢谢 @${username} 的咖啡，今晚不许打瞌睡。`, `赠送咖啡 → 书桌点亮 + 老师表扬，反馈非常直观。`);
    log(`@${username} 送出咖啡，座位点亮。`);
  }

  if (type === 'front') {
    let frontSeat = seats.find((item) => item.frontRow && !item.occupant);
    if (!frontSeat) {
      frontSeat = seats.find((item) => item.frontRow) || seat;
      if (frontSeat !== seat) {
        [frontSeat.occupant, seat.occupant] = [seat.occupant, frontSeat.occupant];
      }
    } else {
      frontSeat.occupant = seat.occupant;
      if (frontSeat !== seat) seat.occupant = null;
    }
    frontSeat.occupant.role = '前排监督位';
    frontSeat.occupant.badge = '⭐ 前排';
    updateTeacher(`@${username} 抢到前排，今天盯紧黑板。`, `中礼物非常适合做“升前排 / 锁座位”。`);
    log(`@${username} 送礼升级到前排监督位。`);
  }

  if (type === 'lamp') {
    seats.forEach((item) => {
      if (item.occupant) item.lit = true;
    });
    updateTeacher(`谢谢 @${username} 点亮全班书桌，今晚这班气氛到了。`, `高一点的礼物可以触发全场灯效、铃声或新主题。`);
    log(`@${username} 触发全班点灯特效。`);
  }

  render();
}

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function setTimerMode(mode) {
  timerMode = mode;
  timerSeconds = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  timerLabel.textContent = mode === 'focus' ? '专注中' : '休息中';
  timerDigits.textContent = formatTime(timerSeconds);
}

function tickTimer() {
  timerSeconds -= 1;
  if (timerSeconds < 0) {
    const nextMode = timerMode === 'focus' ? 'break' : 'focus';
    setTimerMode(nextMode);
    const line = nextMode === 'focus' ? pick(lines.focus) : pick(lines.break);
    updateTeacher(line, nextMode === 'focus' ? '番茄钟切回专注，全班重新坐稳。' : '休息 5 分钟，别离开直播间太久。');
    log(`番茄钟切换到 ${nextMode === 'focus' ? '专注' : '休息'} 模式。`);
  }
  timerDigits.textContent = formatTime(timerSeconds);
}

function toggleTimer() {
  timerRunning = !timerRunning;
  if (timerRunning) {
    timerHandle = setInterval(tickTimer, 1000);
    updateTeacher(timerMode === 'focus' ? pick(lines.focus) : pick(lines.break));
    log('番茄钟开始运行。');
  } else {
    clearInterval(timerHandle);
    timerHandle = null;
    updateTeacher('番茄钟暂停，等你继续。', '真直播里这里可以由主播后台控制，不一定开放给观众。');
    log('番茄钟已暂停。');
  }
}

function skipTimer() {
  const nextMode = timerMode === 'focus' ? 'break' : 'focus';
  setTimerMode(nextMode);
  updateTeacher(nextMode === 'focus' ? pick(lines.focus) : pick(lines.break));
  log(`手动切换到 ${nextMode === 'focus' ? '专注' : '休息'} 模式。`);
}

function patrol() {
  patrolIndex = (patrolIndex + 1) % 4;
  const row = patrolIndex + 1;
  const leftPercent = [6, 30, 56, 80][patrolIndex];
  teacher.style.left = `${leftPercent}%`;
  patrolStatus.textContent = `老师正在第 ${row} 排巡查`;

  const rowSeats = seats.filter((seat) => seat.row === row && seat.occupant);
  if (rowSeats.length) {
    const target = rowSeats[Math.floor(Math.random() * rowSeats.length)].occupant.username;
    updateTeacher(`@${target}，老师看到你还在，很好。`, `巡查时最好随机点名一位还在学习的人，增强陪伴感。`);
    log(`老师巡查第 ${row} 排，并点名 @${target}。`);
  } else {
    updateTeacher(pick(lines.patrol), `第 ${row} 排目前还空着，后续可以鼓励用户补位。`);
    log(`老师巡查第 ${row} 排。`);
  }
}

function resetScene() {
  seats.forEach((seat) => {
    seat.occupant = null;
    seat.lit = false;
  });
  totalGifts = 0;
  viewers = 213;
  patrolIndex = 0;
  teacher.style.left = '3%';
  patrolStatus.textContent = '老师正在第 1 排巡查';
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
  timerRunning = false;
  setTimerMode('focus');
  updateTeacher('准备上课，先签到再坐下。', '场景重置完成。');
  log('课堂已重置。');
  render();
}

function bindActions() {
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'comment-join' || action === 'comment-seat') assignSeat('comment');
      if (action === 'free-seat') assignSeat('free');
      if (action === 'gift-rose') handleGift('rose');
      if (action === 'gift-coffee') handleGift('coffee');
      if (action === 'gift-front') handleGift('front');
      if (action === 'gift-lamp') handleGift('lamp');
      if (action === 'timer-toggle') toggleTimer();
      if (action === 'timer-skip') skipTimer();
      if (action === 'patrol-now') patrol();
      if (action === 'reset') resetScene();
    });
  });
}

setTimerMode('focus');
render();
bindActions();
log('Demo 已升级为“大场景占位 + 番茄钟 + 巡查老师”版本。');
