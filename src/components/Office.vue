<template>
  <div class="stretch">
    <slot name="progress" />
    <logo-screen
      v-show="preload"
      game="office"
      @startGame="startGame"
    />

    <div
      v-show="!preload"
      class="office-game"
      @click="popupVisible && hidePopup(arguments[0])"
    >
      <div
        class="text upper"
        :class="upperVisible ? 'visible' : ''"
      >
        <span>{{ upperText }}</span>
      </div>
      <div class="no-overflow">
        <slot name="canvas" />
                
        <div
          class="popup"
          :class="popupVisible && 'visible'"
        >
          <div
            class="character"
            :class="character"
          />
          <div class="typed" />
        </div>
        <transition name="fade">
          <div
            v-if="uvolVisible"
            class="uvol"
          />
        </transition>
      </div>

      <transition name="fade">
        <div
          v-if="bottomVisible"
          class="bottom-controls"
        >
          <div class="text">
            Стрелки для ходьбы, кнопка для битья
          </div>
          <div class="controls">
            <div 
              class="control-btn left" 
              @mousedown="moveLeft"
              @touchstart="moveLeft"
              @mouseup="stopX"
              @touchend="stopX"
            />
            <div 
              class="control-btn right" 
              @mousedown="moveRight"
              @touchstart="moveRight"
              @mouseup="stopX"
              @touchend="stopX"
            />
            <div
              class="control-btn hit-btn" 
              :class="{
                'pressed': hitPressed,
                'disabled': hitDisabled
              }"
              @click="hitBoss"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { Application, Loader, Container, Texture, Sprite, AnimatedSprite } from 'pixi.js';
import { TimelineLite } from 'gsap/TweenMax';
import Typed from 'typed.js';
import { setTimeout } from 'timers';
import { keyboard } from '../utils';

import EventBus from '../eventBus';

import LogoScreen from '../partials/LogoScreen.vue';

const WIDTH = 648;
const HEIGHT = 538;

export default {
  components: {
    LogoScreen
  },
  data () {
    return {
      preload: true,
      app: null,
      loader: null,
      ratio: 1,
      currentStep: 'INTRO',
      character: 'elephant',
      health: null,
      miss: null,
      typed: null,
      keys: {
        left: null,
        right: null
      },
      space: null,
      upperVisible: false,
      upperText: 'Кабинет большого босса. Разговор не из приятных.',
      office: null,
      player: null,
      boss: null,
      popupVisible: false,
      bottomVisible: false,
      hitPressed: false,
      hitDisabled: false,
      uvolVisible: false,
    };
  },
  computed: {
    isMobile() {
      return window.innerWidth < 880;
    },
  },
  mounted() {
    this.init();
    EventBus.$on('containerClicked', () => {
      if (this.popupVisible) {
        this.hidePopup();
      }
    });
    this.$audio.start('startup');
  },
  beforeDestroy() {
    this.stopSpace();
  },
  methods: {
    init() {
      this.createApp();
      this.drawStage();
    }, 
    createApp() {
      this.app = new Application({
        width: WIDTH, 
        height: HEIGHT,
        transparent: false, 
        autoDensity: true, 
        resolution: 2,
        autoResize: true
      });

      this.loader = new Loader();
      this.loader 
        .add('tilesets/office-tileset.json')
        .add('tilesets/pig-tileset.json')
        .add('tilesets/elephant-tileset.json')
        .load(() => {
          this.setup();
        });
    }, 

    drawStage() {
      let container = document.querySelector('.office-canvas');
      container.appendChild(this.app.view);

      this.office = new Container();
      this.app.stage.addChild(this.office);

      this.resize();
    },

    getTypedOptions(text) {
      return {
        strings: [text],
        typeSpeed: 20,
        startDelay: 200,
        showCursor: false,
        onComplete: this.onTypeComplete
      };
    },

    setSpaceSkipping() {
      this.space = keyboard('Space');

      this.space.press = () => {
        if (this.popupVisible) {
          this.hidePopup();
        }
      };
    }, 

    stopSpace() {
      this.space.unsubscribe();
    },

    setup() {
      let bg = this.getSprite('office-bg');
      bg.scale.set(.5, .5);

      this.health = this.getSprite('health');
      this.health.position.set(91, 481);

      this.miss = this.getSprite('miss');
      this.miss.alpha = 0;

      this.setPlayer();
      this.setBoss();
      this.player.vx = 0;

      this.office.addChild(bg, this.health);
      this.app.stage.addChild(this.miss);
      window.addEventListener('resize', this.resize);
    },

    startGame() {
      this.preload = false;
      this.upperVisible = true;
      setTimeout(() => {
        this.showPopup('elephant', 'Ну здравствуй, сотрудник. Как объяснишь то, что ты не сможешь объяснить?');
        this.setSpaceSkipping();
      }, 200);
    },

    showPopup(character, text) {
      if (this.typed) this.typed.destroy();

      this.character = character;
      this.popupVisible = true;

      let options = this.getTypedOptions(text);

      this.typed = new Typed('.typed', options);
      this.$audio.start('typewriter', true);
    },

    completePopupText() {
      this.typed.typeSpeed = 0;
    },

    hidePopup() {
      if (!this.typed.typingComplete) {
        this.completePopupText();
        return;
      }
      this.popupVisible = false;
            
      if (this.currentStep === 'INTRO') {
        setTimeout(() => {
          this.showPopup('pig', 'Я не могу объяснить. Пора решить нашу проблему битвой!');
          this.currentStep = 'FIGHT';
        }, 200);
      } else if (this.currentStep === 'FIGHT') {
        // this.$audio.start('fatality')
        this.setKeyboard();
        this.app.ticker.add(this.move);
        this.bottomVisible = true;
      }
    },

    stopKeyboardListeners() {
      for (let key in this.keys) {
        if (this.keys[key]) {
          this.keys[key].unsubscribe();
        }
      }
    },
        
    resize() {
      let W = window.innerWidth;

      if (this.isMobile) {
        W = 320;
      }

      this.ratio = W / WIDTH;

      let H = HEIGHT * this.ratio;

      if (W < WIDTH) {
        this.app.renderer.resize(W, H);
        this.app.stage.scale.x = this.app.stage.scale.y = this.ratio;
      }
    },

    setPlayer() {
      const pigTextures = [];
      let i;

      for (i = 0; i < 5; i++) {
        let texture = Texture.from(`pig-${i + 1}.png`);
        pigTextures.push(texture);
      }
      this.player = new AnimatedSprite(pigTextures);
      this.player.loop = false;
      this.player.position.set(228, 395);
      this.player.scale.set(.6, .6);
      this.player.anchor.set(.5, .5);
      this.player.animationSpeed = .2;

      this.app.stage.addChild(this.player);
    },

    setBoss() {
      const elephantTextures = [];
      let i;

      for (i = 0; i < 6; i++) {
        let texture = Texture.from(`elephant-${i + 1}.png`);
        elephantTextures.push(texture);
      }
      this.boss = new AnimatedSprite(elephantTextures);
      this.boss.loop = false;
      this.boss.position.set(410, 380);
      this.boss.scale.set(.6, .6);
      this.boss.anchor.set(.5, .5);
      this.boss.animationSpeed = .2;

      this.app.stage.addChild(this.boss);
    },
        
    move() {
      if (this.player.x < 35) {
        this.player.x = 35;
        this.$audio.stop('1step_trimmed');

      } else if (this.player.x > 330) {
        this.player.x = 330;
        this.$audio.stop('1step_trimmed');
      }
      this.player.x += this.player.vx;
    },

    hitBoss() {
      let direction = this.player.scale.x > 0 ? 'right' : 'left';
      this.player.gotoAndPlay(0);

      if (!this.hitPressed) {
        this.hitPressed = true;
        this.$audio.start('miss');

        setTimeout(() => {
          this.hitPressed = false;
        }, 130);
      }
            
      this.player.onComplete = () => {
        if (this.player.x > 310 && direction === 'right') {
          this.stopKeyboardListeners();
          this.bottomVisible = false;
          setTimeout(() => {
            this.bossStrikesBack();
          }, 200);
        } else {
          this.showMiss(this.player.x, this.player.y, direction);
        }
      };
    },

    bossStrikesBack() {
      this.boss.play();

      this.boss.onComplete = () => {
        this.$audio.start('slap');
        if (window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }
        setTimeout(() => {
          this.showHit();
          this.pigFalling();
        }, 200);
      };
    },

    pigFalling() {
      let animation = new TimelineLite({ onComplete: onComplete });  
      animation.to(this.player, 1, { x: this.player.x - 30, y: this.player.y + 12, ease: Linear.easeNone })
        .to(this.player, 1, { rotation: -1.57, ease: Linear.easeNone }, 0)
        .to(this.health, .5, { width: 0, ease: Linear.easeNone }, 1);

      let self = this;

      function onComplete() {
        self.gameOver();
      }
    },

    showMiss(x, y, direction) {
      let missX = direction === 'right' ? x + 20 : x - this.player.width - 20;
      this.miss.position.set(missX, y - 55);
      this.miss.alpha = 1;

      setTimeout(() => {
        let animation = new TimelineLite();
        animation.to(this.miss, .2, { alpha: 0 });
      }, 300);
    },

    showHit() {
      let hit = this.getSprite('hit');
      hit.position.set(300, 335);
      this.app.stage.addChild(hit);
      hit.alpha = 1;

      setTimeout(() => {
        let animation = new TimelineLite();
        animation.to(hit, .2, { alpha: 0 });
      }, 600);
    },
        
    gameOver() {
      this.currentStep = 'GAME_OVER';

      this.app.ticker.destroy();

      this.upperText = 'Вы уволены. Такая вот взрослая жизнь. Двигайтесь дальше.';

      setTimeout(() => {
        this.uvolVisible = true;
        this.$audio.start('fatality');
        setTimeout(() => {
          this.showPopup('elephant', 'Я почти повержен, а ты совсем уволен. Игра окончена. И забери фикус!');
        }, 600);
      }, 400);
    },  

    onTypeComplete() {
      this.$audio.stop('typewriter');
      if (this.currentStep === 'GAME_OVER') {
        this.$audio.start('finish');
        this.$emit('showNextBtn', 'pizza');
      }
    },

    getSprite(sprite) {
      let id = this.loader.resources['tilesets/office-tileset.json'].textures;
      return new Sprite(id[`${sprite}.png`]);
    },

    moveLeft() {
      this.player.vx = -4;
      this.player.scale.set(-.6, .6);
      this.$audio.start('1step_trimmed', true);
    },

    moveRight() {
      this.player.vx = 4;
      this.player.scale.set(.6, .6);
      this.$audio.start('1step_trimmed', true);
    },

    stopX() {
      this.player.vx = 0;
      this.$audio.stop('1step_trimmed');
    },

    setKeyboard() {
      this.keys.left = keyboard('ArrowLeft');
      this.keys.right = keyboard('ArrowRight');

      this.keys.left_a = keyboard('KeyA');
      this.keys.right_d = keyboard('KeyD');

      // Left
      this.keys.left.press = () => {
        this.moveLeft();
      };
            
      this.keys.left.release = () => {
        if (!this.keys.right.isDown) {
          this.stopX();
        }
      };

      this.keys.left_a.press = () => {
        this.moveLeft();
      };
            
      this.keys.left_a.release = () => {
        if (!this.keys.right.isDown) {
          this.stopX();
        }
      };

      // Right
      this.keys.right.press = () => {
        this.moveRight();
      };

      this.keys.right.release = () => {
        if (!this.keys.left.isDown) {
          this.stopX();
        }
      };

      this.keys.right_d.press = () => {
        this.moveRight();
      };
            
      this.keys.right_d.release = () => {
        if (!this.keys.left.isDown) {
          this.stopX();
        }
      };
    },
  }
};
</script>

<style lang="scss">
    .office-game {
        position: relative;
        .bottom-controls {
            padding: 20px;
        }
        .controls {
            position: relative; 
            margin: 20px auto 0;
            display: flex;
            justify-content: center;
            user-select: none;
            .control-btn {
                width: 50px;
                height: 50px;
                margin-right: 20px;
                cursor: pointer;
                background-repeat: no-repeat;
                background-size: contain;
                &.left {
                    background-image: url('~@/assets/left.png');
                }
                &.right {
                    background-image: url('~@/assets/right.png');
                }
                &.hit-btn {
                    width: 65px;
                    height: 50px;
                    margin-right: 0;
                    background-image: url('~@/assets/office/hit-released.png');
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;
                    transition: filter .3s ease;
                    cursor: pointer;
                    &.pressed {
                        background-image: url('~@/assets/office/hit-pressed.png');
                        filter: drop-shadow(0 0 30px rgb(240, 67, 66));
                    }
                    &.disabled {
                        pointer-events: none;
                        cursor: initial;
                    }
                    @media (max-width: 879px) {
                        width: 59px;
                        height: 47px;
                    }
                }
            }
        }
       
        .text {
            text-align: center; 
            margin-bottom: 20px;
            &.upper {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 46px;
                padding: 0 10px;
                opacity: 0;
                transition: opacity .3 ease;
                @media (max-width: 879px) {
                    height: 38px;
                }
                &.visible {
                    opacity: 1;
                }
            }
            @media (max-width: 879px) {
                font-size: 16px;
            }
        }
        .uvol {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            pointer-events: none;
            z-index: 1;
            @media (min-width: 880px) {
                background-image: url('~@/assets/office/uvol.png');
            }
            @media (max-width: 879px) {
                background-image: url('~@/assets/office/uvol-mobile.png');
            }
        }
    }
</style>