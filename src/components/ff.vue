<template>
  <div class="stretch">
    <slot
      v-if="gameVisible"
      name="progress"
    />
    <logo-screen
      v-show="preload"
      game="ff"
      @startGame="startGame"
    />

    <div
      v-show="!preload && gameVisible"
      class="ff-game"
      @click="popupVisible && hidePopup(arguments[0])"
    >
      <div
        class="text upper"
        :class="upperVisible ? 'visible' : ''"
      >
        <span v-html="upperText" />
      </div>
      <div
        class="no-overflow"
        :class="shake ? 'shake' : ''"
      >
        <slot name="canvas" />
                
        <div
          class="popup"
          :class="popupVisible ? 'visible' : ''"
        >
          <div
            class="character"
            :class="character"
          />
          <div class="typed" />
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="bottomVisible"
          class="bottom-controls"
        >
          <div class="text">
            Доберитесь Чупиком до ЖЭКа при помощи стрелочек.
          </div>
          <div class="controls">
            <div 
              class="control-btn up" 
              @mousedown="moveUp"
              @touchstart="moveUp"
              @mouseup="stopY"
              @touchend="stopY"
            />
            <div 
              class="control-btn down" 
              @mousedown="moveDown"
              @touchstart="moveDown"
              @mouseup="stopY"
              @touchend="stopY"
            />
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
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { Application, Loader, Container, Texture, Sprite, AnimatedSprite } from 'pixi.js';
import { TimelineMax } from 'gsap/TweenMax';
import Typed from 'typed.js';
import { setTimeout } from 'timers';
import { keyboard, random } from '../utils';

import EventBus from '../eventBus';

import LogoScreen from '../partials/LogoScreen.vue';

const WIDTH = 677;
const HEIGHT = 572;
const TREE_POSITIONS = [[
  {
    x: 48,
    y: 16
  },
  {
    x: 159,
    y: 16
  },
  {
    x: 220,
    y: 80
  },
  {
    x: 339,
    y: 41
  },
  {
    x: 506,
    y: 26
  },
  {
    x: 618,
    y: 26
  },
  {
    x: 30,
    y: 121
  },
  {
    x: 448,
    y: 115
  },
  {
    x: 339,
    y: 167
  },
  {
    x: 535,
    y: 173
  },
  {
    x: 18,
    y: 226
  },
  {
    x: 135,
    y: 209
  },
  {
    x: 247,
    y: 226
  },
  {
    x: 419,
    y: 245  
  },
  {
    x: 531,
    y: 281
  },
  {
    x: 165,
    y: 314
  },
  {
    x: 376,
    y: 325
  },
  {
    x: 48,
    y: 366
  },
  {
    x: 230,
    y: 391
  },
  {
    x: 427,
    y: 407
  },
  {
    x: 618,
    y: 407
  }
],
[
  {
    x: 76,
    y: 0
  },
  {
    x: 194,
    y: 11
  },
  {
    x: 309,
    y: 26
  },
  {
    x: 459,
    y: 69
  },
  {
    x: 538,
    y: 16
  },
  {
    x: 13,
    y: 108
  },
  {
    x: 171,
    y: 123
  },
  {
    x: 380,
    y: 135
  },
  {
    x: 9,
    y: 250
  },
  {
    x: 155,
    y: 226
  },
  {
    x: 258,
    y: 281
  },
  {
    x: 436,
    y: 226
  },
  {
    x: 597,
    y: 176
  },
  {
    x: 607,
    y: 281
  },
  {
    x: 9,
    y: 407
  },
  {
    x: 76,
    y: 314
  },
  {
    x: 313,
    y: 407
  },
  {
    x: 376,
    y: 325
  },
  {
    x: 444,
    y: 407
  },
  {
    x: 607,
    y: 281
  },
  {
    x: 597,
    y: 191
  },
]
];

export default {
  components: {
    LogoScreen
  },
  props: {
    gameVisible: {
      type: Boolean,
      default: true
    },
  },
  data () {
    return {
      preload: true,
      app: null,
      loader: null,
      ratio: 1,
      currentStep: 'INTRO',
      character: 'chupik',
      typed: null,
      keys: {
        up: null,
        down: null,
        left: null,
        right: null,
      },
      space: null,
      shake: false,
      upperVisible: false,
      upperText: 'Мусор сам себя не вывезет. Нужно пожаловаться на беспредел!',
      bg: null,
      player: null,
      dumpSlimes: [],
      trees: [],
      slimeArmy: [],
      slimeArmyVisible: false,
      lights: null,
      popupVisible: false,
      bottomVisible: false,
      currentScreen: 0,
      keyboardStopped: false
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
    this.stopKeyboardListeners();
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

      this.loader = window.ffLoader;

      // this.loader = new Loader()
      this.loader 
      //             .add('tilesets/ff-tileset.json')
      //             .add('tilesets/chupik-tileset.json')
        .load(() => {
          this.setup();
        });
    }, 

    drawStage() {
      let container = document.querySelector('.ff-canvas');
      container.appendChild(this.app.view);

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

    setup() {
      this.bg = this.getSprite('ff-bg-first');
      this.bg.scale.set(.5, .5);

      this.dumpSlimes.push(this.getSprite('slime'), this.getSprite('slime'));
            
      this.dumpSlimes[0].position.set(182, 376);
      this.dumpSlimes[1].position.set(186, 417);

      this.dumpSlimes.forEach((slime, i) => {
        slime.scale.set(.5, .5);
        slime.anchor.set(0, 1);
        this.setSlimeAnimation(slime, i);
      });

      this.setTrees();
      this.setLights();
      this.setPlayer();

      this.app.stage.addChild(this.bg, ...this.trees, this.lights, this.player, ...this.dumpSlimes, );

      window.addEventListener('resize', this.resize);
    },

    startGame() {
      this.preload = false;
            
      setTimeout(() => {
        this.showPopup('chupik', 'Мусор не вывозят. Совсем уже! Пойду прогуляюсь до ЖЭКа.');
        this.setSpaceSkipping();
      }, 200);
    },

    shakeScene() {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
      this.$audio.stop('1step_trimmed');
      this.shake = true;
      setTimeout(() => this.shake = false, 500);
    }, 

    showPopup(character, text) {
      if (this.typed) this.typed.destroy();

      this.character = character;
      this.popupVisible = true;

      let options = this.getTypedOptions(text);

      this.typed = new Typed('.typed', options);
      this.$audio.start('typewriter', true);
            
      if (this.bottomVisible) this.bottomVisible = false;

      if (this.player !== null) {
        this.stopX();
      }
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

      if (this.currentStep === 'REALLY_OVER') return;

      if (this.currentStep === 'INTRO' && !this.currentScreen) {
        this.typed.destroy();

        this.bottomVisible = true;
        this.upperVisible = true;

        if (!this.isMobile) {
          this.setKeyboard();
        }

        this.$audio.start('forest', true);
        this.app.ticker.add(this.play);

      } else if (this.currentScreen > 0 && this.currentScreen < 7) {
        this.app.ticker.start();
        if (!this.bottomVisible) this.bottomVisible = true;

      } else if (this.currentScreen === 7 && this.currentStep !== 'GAME_OVER') {
        setTimeout(() => {
          this.showPopup('walrus', 'Заявка принята. Разберёмся в течение 3289746 лет. Уходите.');
          this.currentStep = 'GAME_OVER';
        }, 200);

      } else if (this.currentStep === 'GAME_OVER') {
        setTimeout(() => {
          this.currentStep = 'REALLY_OVER';

          this.$audio.start('finish');
          this.upperText = 'Больше похоже на жизнь, чем на игру. Отстой, но игра пройдена!';
          this.showPopup('chupik', '3289746 лет — это всего 1200757290 дней. Я подожду!');
        }, 200);
      }
    },

    onTypeComplete() {
      this.$audio.stop('typewriter');
      if (this.currentStep === 'REALLY_OVER') {
        this.$emit('showNextBtn', 'final-screen');
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
      const chupikTextures = [];
      let i;

      for (i = 0; i < 3; i++) {
        let texture = Texture.from(`chupik-${i + 1}.png`);
        chupikTextures.push(texture);
      }
      this.player = new AnimatedSprite(chupikTextures);
      this.player.loop = true;
      this.player.position.set(433, 437);
      this.app.stage.addChild(this.player);
      this.player.animationSpeed = .2;
      this.player.anchor.set(.5, 0);
      this.player.scale.set(-.65, .65);

      this.player.vy = 0;
      this.player.vx = 0;
    },

    setLights() {
      this.lights = this.getSprite('lights');
      this.lights.scale.set(.5, .5);
      this.lights.position.set(0, 381);
      this.lights.visible = false;
      this.app.stage.addChild(this.lights);
    },

    setTrees() {
      let tree;
      for (let i = 0; i < TREE_POSITIONS[0].length; i++) {
        tree = this.getSprite('tree');
        tree.scale.set(.5, .5);
        tree.visible = false;
        tree.position.set(TREE_POSITIONS[0][i].x, TREE_POSITIONS[0][i].y);
        this.trees.push(tree);
      }
    },

    moveTrees(index) {
      this.trees.forEach((tree, i) => {
        tree.position.set(TREE_POSITIONS[index][i].x, TREE_POSITIONS[index][i].y);
      });
    },

    showTrees() {
      this.trees.forEach((tree) => {
        tree.visible = true;
      });
    }, 

    hideTrees() {
      this.trees.forEach((tree) => {
        tree.visible = false;
      });
    },

    setSlimes() {
      let slimePositions = [
        {
          x: 232,
          y: 59 
        },
        {
          x: 490,
          y: 170
        },
        {
          x: 139,
          y: 442
        },
        {
          x: 423,
          y: 335
        },
        {
          x: 58,
          y: 249
        }
      ];

      let slime;

      for (let i = 0; i < slimePositions.length; i++) {
        slime = this.getSprite('slime');
        slime.scale.set(.5, .5);
        slime.anchor.set(0, 1);
        slime.position.set(slimePositions[i].x, slimePositions[i].y);
        this.setSlimeAnimation(slime, i);
        this.slimeArmy.push(slime);
      }

      this.app.stage.addChild(...this.slimeArmy);
    },

    setSlimeAnimation(slime, i) {
      slime.animation = new TimelineMax({ yoyo: true, repeat: -1, repeatDelay: 0 });
      let speed = (i + 2) / 10;
      slime.animation.to(slime, 0, { width: slime.width + 10, height: slime.height, ease: Linear.easeNone }, 0)
        .to(slime, speed, { width: slime.width, height: slime.height + 10, ease: Linear.easeNone }, 0)
        .to(slime, speed, { width: slime.width + 10, height: slime.height , x: slime.x + 15, ease: Linear.easeNone }, '+=.1')
        .to(slime, speed, { width: slime.width, height: slime.height + 10, x: slime.x + 30, ease: Linear.easeNone }, '+=.1')
        .to(slime, speed, { width: slime.width + 10, height: slime.height , x: slime.x + 45, ease: Linear.easeNone }, '+=.1')
        .to(slime, speed, { width: slime.width, height: slime.height + 10, x: slime.x + 50, ease: Linear.easeNone }, '+=.1');
    },

    hideSlimes() {
      this.slimeArmy.forEach(slime => {
        slime.visible = false;
      });
    },

    showSlimes() {
      this.slimeArmy.forEach(slime => {
        slime.visible = true;
      });
    },
        
    play() {
      this.player.y += this.player.vy;
      this.player.x += this.player.vx;

      if (this.player.x > WIDTH) {
        this.changeScreen('next');
      } else if (this.player.x < 0) {
        this.changeScreen('prev');
      }

      if (this.currentScreen === 0) {
        if (this.player.x < 345) {
          this.player.x = 345;
          this.shakeScene();
        } else if (this.player.y > 437) {
          this.player.y = 437;
          this.shakeScene();
        } else if (this.player.y < 320) {
          this.player.y = 320;
          this.shakeScene();
        } else if (this.player.y < 437 && this.player.x > 345) {
          if (this.player.x - 345 > 5) {
            this.player.y = 437;
            this.shakeScene();
          } else {
            this.player.x = 345;
            this.shakeScene();
          }
        }
      } else if (this.currentScreen > 0 && this.currentScreen < 6) {
        if (this.player.y < 437 || this.player.y > 437) {
          this.player.y = 437;
          this.shakeScene();
        }
      } else if (this.currentScreen == 6) {
        if (this.player.y < 313) {
          this.changeScreen('next');
        } else if (this.player.x > 340) {
          this.player.x = 340;
          this.shakeScene();
        } else if (this.player.y < 437 && this.player.x < 340) {
          if (340 - this.player.x > 5) {
            this.player.y = 437;
            this.shakeScene();
          } else {
            this.player.x = 340;
            this.shakeScene();
          }
        } else if (this.player.y > 437) {
          this.player.y = 437;
          this.shakeScene();
        }
      }
    },

    changeScreen(direction) {
      if (direction === 'next') {
        this.currentScreen++;
        this.player.x = 0;
      } else {
        this.currentScreen--;
        this.player.x = WIDTH;
      }

      switch (this.currentScreen) {
        case 0: 
          this.bg.texture = this.getTexture('ff-bg-first');

          this.lights.visible = false;
          this.dumpSlimes.forEach((slime) => {
            slime.visible = true;
          });

          this.hideTrees();

          break;
        case 1: 
          this.bg.texture = this.getTexture('ff-bg-middle');

          this.showTrees();

          this.lights.visible = true;

          this.moveTrees(0);

          this.dumpSlimes.forEach((slime) => {
            slime.visible = false;
          });

                
          if (direction === 'next') {
            setTimeout(() => {
              this.app.ticker.stop();
              this.showPopup('chupik', 'Ла-ла-ла! Надо выпить молочка!');
            }, 500);
          }
          break;

        case 2: 
          if (this.slimeArmy.length) {
            this.hideSlimes();
          }
          this.lights.visible = true;

          this.moveTrees(1);

          if (direction === 'next') {
            setTimeout(() => {
              this.app.ticker.stop();
              this.showPopup('chupik', 'Я всем там всыплю, я им устрою 4 июня!');
            }, 500);
          }
          break;

        case 3: 
          this.lights.visible = false;

          this.moveTrees(0);

          if (!this.slimeArmy.length) {
            this.setSlimes();
          } else {
            this.showSlimes();
          }
          if (direction === 'next') {
            setTimeout(() => {
              this.app.ticker.stop();
              this.showPopup('chupik', 'Что за зелёная жижа? Что за гейм-дизайнер это придумал??');
            }, 500);
          }
          break;

        case 4: 
          this.showSlimes();
          this.lights.visible = false;

          this.moveTrees(1);
                    
          if (direction === 'next') {
            setTimeout(() => {
              this.app.ticker.stop();
              this.showPopup('chupik', 'Мусор надо вывозить, а то я уже не вывожу. Хороший каламбур.');
            }, 500);
          }
          break;

        case 5: 
          this.bg.texture = this.getTexture('ff-bg-middle');
                    
          this.moveTrees(0);
          this.showTrees();

          this.lights.visible = true;
          this.hideSlimes();

          if (direction === 'next') {
            setTimeout(() => {
              this.app.ticker.stop();
              this.showPopup('chupik', 'Или плохой. Скорее бы дойти, но не до ручки. Вот этот каламбур хорош!');
            }, 500);
          }
          break;

        case 6: 
          this.bg.texture = this.getTexture('ff-bg-last');
          this.hideTrees();

          this.lights.visible = false;
          setTimeout(() => {
            this.app.ticker.stop();
            this.showPopup('chupik', 'РЭП-4 — странное названия для ЖЭКа');
          }, 500);
          break;

        case 7: 
          this.bg.texture = this.getTexture('ff-bg-room');
          this.$audio.stop('forest');

          this.bottomVisible = false;
          this.app.ticker.stop();

          this.keyboardStopped = true;

          this.player.position.set(350, 220);

          setTimeout(() => {
            this.showPopup('chupik', 'Я пришёл в ЖЭК. Решите проблему с вывозом мусора. Пожалуйста.');
          }, 500);
          break;

      }
    },

    getSprite(sprite) {
      let id = this.loader.resources['tilesets/ff-tileset.json'].textures;
      return new Sprite(id[`${sprite}.png`]);
    },

    getTexture(texture) {
      return this.loader.resources['tilesets/ff-tileset.json'].textures[`${texture}.png`];
    },

    moveUp() {
      this.player.vy = -4;
      this.player.vx = 0;
      this.$audio.start('1step_trimmed', true);
    },

    moveDown() {
      this.player.vy = 4;
      this.player.vx = 0;
      this.$audio.start('1step_trimmed', true);
    },

    moveLeft() {
      this.player.vx = -4;
      this.player.vy = 0;
      this.player.scale.set(.65, .65);
      this.player.play();
      this.$audio.start('1step_trimmed', true);
    },

    moveRight() {
      this.player.vx = 4;
      this.player.vy = 0;
      this.player.scale.set(-.65, .65);
      this.player.play();
      this.$audio.start('1step_trimmed', true);
    },

    stopX() {
      this.player.vx = 0;
      this.player.stop();
      this.$audio.stop('1step_trimmed');
    },

    stopY() {
      this.player.vy = 0;
      this.player.stop();
      this.$audio.stop('1step_trimmed');
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

    setKeyboard() {
      this.keys.left = keyboard('ArrowLeft');
      this.keys.up = keyboard('ArrowUp');
      this.keys.right = keyboard('ArrowRight');
      this.keys.down = keyboard('ArrowDown');

      this.keys.left_a = keyboard('KeyA');
      this.keys.up_w = keyboard('KeyW');
      this.keys.right_d = keyboard('KeyD');
      this.keys.down_s = keyboard('KeyS');

      // Left
      this.keys.left.press = () => {
        this.moveLeft();
      };
            
      this.keys.left.release = () => {
        if (!this.keys.right.isDown && this.player.vy === 0) {
          this.stopX();
        }
      };

      this.keys.left_a.press = () => {
        this.moveLeft();
      };
            
      this.keys.left_a.release = () => {
        if (!this.keys.right.isDown && this.player.vy === 0) {
          this.stopX();
        }
      };

      // Up
      this.keys.up.press = () => {
        this.moveUp();
      };

      this.keys.up.release = () => {
        if (!this.keys.down.isDown && this.player.vx === 0) {
          this.stopY();
        }
      };

      this.keys.up_w.press = () => {
        this.moveUp();
      };

      this.keys.up_w.release = () => {
        if (!this.keys.down.isDown && this.player.vx === 0) {
          this.stopY();
        }
      };

      // Right
      this.keys.right.press = () => {
        this.moveRight();
      };

      this.keys.right.release = () => {
        if (!this.keys.left.isDown && this.player.vy === 0) {
          this.stopX();
        }
      };

      this.keys.right_d.press = () => {
        this.moveRight();
      };
            
      this.keys.right_d.release = () => {
        if (!this.keys.left.isDown && this.player.vy === 0) {
          this.stopX();
        }
      };

      // Down
      this.keys.down.press = () => {
        this.moveDown();
      };

      this.keys.down.release = () => {
        if (!this.keys.up.isDown && this.player.vx === 0) {
          this.stopY();
        }
      };

      this.keys.down_s.press = () => {
        this.moveDown();
      };

      this.keys.down_s.release = () => {
        if (!this.keys.up.isDown && this.player.vx === 0) {
          this.stopY();
        }
      };
    },
  }
};
</script>

<style lang="scss">
    .ff-game {
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
                text-align: center;
                line-height: 50px;
                cursor: pointer;
                background-repeat: no-repeat;
                background-size: contain;
                &.up {
                    background-image: url('~@/assets/up.png');
                }
                &.down {
                    background-image: url('~@/assets/down.png');
                }
                &.left {
                    background-image: url('~@/assets/left.png');
                }
                &.right {
                    background-image: url('~@/assets/right.png');
                    margin-right: 0;
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
                height: 23px;
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
    }
</style>