import { AudioContext as sAudioContext } from 'standardized-audio-context';

import BufferLoader from '@/modules/audio/BufferLoader';

const volume = .85;

class Synth {
  constructor() {

    try {
      this.context = window.webkitAudioContext
        ? new sAudioContext()
        : new AudioContext();

      document.body.addEventListener('touchstart', () => this.resumeAudio());
      document.body.addEventListener('mousedown', () => this.resumeAudio());
      document.body.addEventListener('keydown', () => this.resumeAudio());
    }
    catch (e) {
      console.log('Web Audio API is not supported in this browser');
      return false;
    }

    this.loader = new BufferLoader(this.context);

    this.init();
  }

  async preload(url) {
    this.loader = new BufferLoader(this.context);
		
    this.loaded = await this.loader.load(url);

    return Object.keys(this.loaded).reduce((acc, key) => ({
      ...acc,
      [key]: this.createAudio(key)
    }), {});
  }

  createAudio(key) {
    let source = this.context.createBufferSource();
    source.buffer = this.loaded[key];

    source.connect(this.overallGain);

    source.isPlaying = false;
    source.onended = () => source.played = true;

    return source;
  }

  start(name, loop = false) {
    if (this.sounds[name].played) {
      this.stop(name);
      this.sounds[name] = this.createAudio(name);
    }

    this.sounds[name].loop = loop;
    this.sounds[name].start(0);
    this.sounds[name].played = true;
  }

  stop(name) {
    this.sounds[name].stop(0);
  }

  set(name, value) {
    ({
      'gain': () => this.overallGain.gain.value = value
    })[name]();
  }

  async init() {

    this.overallGain = this.context.createGain();
    this.overallGain.gain.value = volume;

    this.sounds = await this.preload({
      '1step_trimmed': require('@/assets/audio/1step_trimmed.mp3'),
      'button': require('@/assets/audio/button.mp3'),
      'car_1': require('@/assets/audio/car_1.mp3'),
      'car_2': require('@/assets/audio/car_2.mp3'),
      'car_3': require('@/assets/audio/car_3.mp3'),
      'coin': require('@/assets/audio/coin.mp3'),
      'damage': require('@/assets/audio/damage.mp3'),
      'dialup': require('@/assets/audio/dialup.mp3'),
      'drift_1': require('@/assets/audio/drift_1.mp3'),
      'drift_2': require('@/assets/audio/drift_2.mp3'),
      'drift_3': require('@/assets/audio/drift_3.mp3'),
      'fatality': require('@/assets/audio/fatality.mp3'),
      'finish': require('@/assets/audio/finish.mp3'),
      'forest': require('@/assets/audio/forest.mp3'),
      'honk': require('@/assets/audio/honk.mp3'),
      'knock': require('@/assets/audio/knock.mp3'),
      'miss': require('@/assets/audio/miss.mp3'),
      'owl_run_trimmed': require('@/assets/audio/owl_run_trimmed.mp3'),
      'police': require('@/assets/audio/police.mp3'),
      'slap': require('@/assets/audio/slap.mp3'),
      'startup': require('@/assets/audio/startup.mp3'),
      'tank': require('@/assets/audio/tank.mp3'),
      'typewriter': require('@/assets/audio/typewriter.mp3'),
    });

    // connections
    this.overallGain.connect(this.context.destination);
  }

  resumeAudio() {
    if (this.context.state === 'running') return;
	
    this.context.resume().then(() => {
      console.log('Playback resumed successfully');
    });
  }

  on() {
    this.overallGain.gain.value = volume;
  }

  off() {
    this.overallGain.gain.value = 0;
  }
}

let audio = new Synth();

export default audio;
