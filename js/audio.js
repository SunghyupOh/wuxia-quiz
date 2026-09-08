/**
 * audio.js - Web Audio API 기반 무협 사운드 합성 모듈
 * 외부 mp3 파일 없이 코드로 직접 소리를 생성하여 로딩 딜레이가 전혀 없습니다.
 */
const WuxiaAudio = (() => {
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  }

  function isEnabled() {
    return soundEnabled;
  }

  // 1. 칼 뽑고 베는 소리 (정답 쾌도난마 이펙트)
  function playSwordSound() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      // 금속성 고음 공명
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // 화이트 노이즈 칼바람 소리
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      filter.Q.value = 3;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  // 2. 묵직한 타격음 (오답/내상)
  function playHitSound() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  // 3. 낙관 도장 찍는 소리 (탁!)
  function playStampSound() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  // 4. 장엄한 징/동종 소리 (결과 화면)
  function playGongSound() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      [110, 165, 230, 310].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  return {
    init: initAudio,
    toggleSound,
    isEnabled,
    playSword: playSwordSound,
    playHit: playHitSound,
    playStamp: playStampSound,
    playGong: playGongSound
  };
})();
