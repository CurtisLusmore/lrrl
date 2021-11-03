let level, action;

function help() {
  document.getElementById('play').style.display = 'none';
  document.getElementById('help').style.display = 'block';
  document.getElementById('game').style.display = 'none';
  document.getElementById('over').style.display = 'none';
}

function play() {
  document.getElementById('play').style.display = 'none';
  document.getElementById('help').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('over').style.display = 'none';

  const canvas = document.getElementById('gameboard');
  const ctx = canvas.getContext('2d');

  const audio = new AudioContext();

  function getExpectedForLevel(level) {
    const onBits = level
      .toString(2)
      .replaceAll('0', '')
      .length;

    const onBitsEven = (onBits % 2) === 0;

    return onBitsEven ? 'L' : 'R';
  }

  function getCoordsForLevel(level) {
    let bits = level.toString(2);
    if (bits.length % 2) bits = '0' + bits;

    let x = 0, y = 0;

    for (let pos = 0; pos*2 < bits.length; pos++) {
      const ind = bits.length - pos*2 - 1;
      x += (+bits[ind]) * Math.pow(2, pos);
    }

    for (let pos = 0; pos*2 + 1 < bits.length; pos++) {
      const ind = bits.length - pos*2 - 2;
      y += (+bits[ind]) * Math.pow(2, pos);
    }

    return [x, y];
  }

  function getScaleForLevel(level) {
    for (let pow = 0; true; pow++) {
      if (Math.pow(Math.pow(2, pow), 2) >= level+1) return Math.pow(2, pow);
    }
  }

  function beep() {
    const action = getExpectedForLevel(level);
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.connect(g);
    o.frequency.value = action === 'L' ? 200 : 500;
    o.type = 'square';
    g.connect(audio.destination);
    g.gain.value = 0.05;
    o.start(audio.currentTime);
    o.stop(audio.currentTime + 0.1);
    navigator.vibrate(action === 'L' ? 10 : 100);
  }

  function draw() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = 'rgb(127, 127, 127)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = size / getScaleForLevel(level);
    for (let point = 0; point < level; point++) {
      const expect = getExpectedForLevel(point);
      const [x, y] = getCoordsForLevel(point);
      ctx.fillStyle = expect === 'L'
        ? 'rgb(0, 0, 0)'
        : 'rgb(255, 255, 255)';
      ctx.fillRect(x*scale, y*scale, scale, scale);
    }
  }

  function reset() {
    level = 0;
    draw();
  }

  function advance() {
    // beep();
    level++;
    draw();
  }

  function handleKey(ev) {
    const leftKeyCodes = [37];
    const rightKeyCodes = [39];

    let handle = false;
    if (leftKeyCodes.includes(ev.keyCode)) {
      action = 'L';
      handle = true;
    }
    else if (rightKeyCodes.includes(ev.keyCode)) {
      action = 'R';
      handle = true;
    }

    if (!handle) return;

    ev.preventDefault();

    const expectedAction = getExpectedForLevel(level);

    if (action !== expectedAction) {
      over();
    }
    else {
      advance();
    }
  }

  function handleClick(ev) {
    const clickLocation = ev.clientX / window.innerWidth;
    let handle = false;
    if (clickLocation <= 0.4) {
      action = 'L';
      handle = true;
    }
    else if (clickLocation >= 0.6) {
      action = 'R';
      handle = true;
    }

    if (!handle) return;

    ev.preventDefault();

    const expectedAction = getExpectedForLevel(level);

    if (action !== expectedAction) {
      over();
    }
    else {
      advance();
    }
  }

  reset();
  window.onkeydown = handleKey;
  document.getElementById('game').onclick = handleClick;
}

function over() {
  document.getElementById('play').style.display = 'none';
  document.getElementById('help').style.display = 'none';
  document.getElementById('game').style.display = 'none';
  document.getElementById('over').style.display = 'block';

  const highscore = Math.max(
    +(localStorage.getItem('lrrl/highscore') || 0),
    level);
  localStorage.setItem('lrrl/highscore', highscore);
  document.getElementById('current-score').innerText = level;
  document.getElementById('highscore').innerText = highscore;
}