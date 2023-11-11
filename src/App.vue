<template>
  <div id="app">
    <img
      src="@/assets/logo.png"
      alt="Рокетбанк Х 2x2"
      class="logo"
    />
    <div class="container">
      <h1>Игры, которые<br />повзрослели</h1>
      <p class="subtitle">
        Сыграйте в&nbsp;5&nbsp;ретро-игр от&nbsp;Рокетбанка и&nbsp;2&times;2, чтобы получить самый уютный мерч этого года.
      </p>

      <section
        v-if="!showGames"
        class="info"
        @scroll.passive="onScroll"
      >
        <section class="row about">
          <div class="text">
            <h1>5&nbsp;простых игр&nbsp;&mdash; один мощный бокс</h1>
            <p>
              Мы&nbsp;с&nbsp;2&times;2 подготовили целую коробку подарков для всех ценителей комфорта, уюта и&nbsp;стиля. В&nbsp;ней вас ждут мягкий шарф, носки, огненная свечка, специальные спички и&nbsp;мыло. Всё это&nbsp;&mdash; в&nbsp;лимитированном дизайне в&nbsp;коллаборации Рокетбанка и&nbsp;2&times;2. 
              <br /><br /> А&nbsp;все новые клиенты получат в&nbsp;подарок ультраклассный стикерпак. 
              <br /><br />
              Нужно всего-то пройти 5&nbsp;наших игр!
            </p>
            <button @click="showGames = true">
              Начать
            </button>
          </div>
          <div class="images">
            <div class="game-img game-1" />
            <div class="game-img game-2" />
          </div>
        </section>
        <section class="prizes">
          <h1>Награды за прохождение</h1>
          <h2>Пройдите 5 игр и участвуйте в розыгрыше всего этого добра.</h2>
          <div class="prizes-img" />
          <button @click="showGames = true">
            Играть
          </button>
        </section>
      </section>

      <div
        v-else
        class="games-container"
        :class="verticalAlign"
        @click="containerClicked"
      >
        <transition
          name="fade"
          mode="out-in"
        >
          <component 
            :is="current"
            @changeScreen="(screen) => changeScreen(screen)"
            @showNextBtn="(nextGame) => showNextBtn(nextGame)"
          >
            <template
              v-if="levelsCompleted <= 6"
              #progress
            >
              <img
                :src="currentProgress"
                alt="Прогресс"
                class="progress-bar"
              />
            </template>

            <template #canvas>
              <div :class="`${current}-canvas`" />
            </template>
          </component>
        </transition>

        <div
          class="next-btn"
          :class="nextVisible ? 'visible' : ''"
          @click="changeScreen(nextGame)"
        />
      </div>
            
      <footer>КИВИ Банк (АО), qiwi.com, лицензия Банка России № 2241 от 22.01.2015 филиал Рокетбанк.</footer>
    </div>
  </div>
</template>

<script>
import InitialScreen from './components/InitialScreen.vue';
import Pizza from './components/Pizza.vue';
import Beep from './components/Beep.vue';
import Office from './components/Office.vue';
import Tanks from './components/Tanks.vue';
import ff from './components/ff.vue';
import FinalScreen from './components/FinalScreen.vue';

import EventBus from './eventBus';

import fancyLog from '@/utils/fancyLog';
import scroll from 'vue-scrollto';
import { setTimeout } from 'timers';

export default {
  name: 'App',
  components: {
    InitialScreen,
    Pizza,
    Beep,
    Office,
    Tanks,
    ff,
    FinalScreen
  },
  data () {
    return {
      current: 'initial-screen',
      levelsCompleted: 0,
      gameVisible: true,
      nextVisible: false,
      nextGame: '',
      showGames: false
    };
  },
  computed: {
    verticalAlign() {
      if (this.current === 'initial-screen' || this.current === 'final-screen') {
        return 'vertical-centered';
      } else {
        return '';
      }
    },
    currentProperties() {
      if (this.current === 'ff') {
        return { gameVisible: this.gameVisible };
      } else {
        return undefined;
      }
    },
    currentProgress() {
      return require(`@/assets/progress/${this.levelsCompleted}.png`);
    }
  },
  created() {
    fancyLog();
  },
  mounted() {
    window.addEventListener('touchstart', this.touchListener);
  },
  beforeDestroy() {
    window.removeEventListener('touchstart', this.touchListener);
  },
  methods: {
    touchListener(e) {
      e.preventDefault();
    },
    changeScreen(screen) {
      if (this.current !== 'initial-screen' && this.current !== 'final-screen') {
        this.$audio.stop('finish');
        this.$audio.start('button');
        this.levelsCompleted++;
      }
      scroll.scrollTo('.games-container', 300);
      this.nextVisible = false;
      if (this.nextGame === 'final-screen') {
        this.gameVisible = false;
        setTimeout(() => {
          this.current = screen;
        }, 100);
      } else {
        this.current = screen;
      }
    },

    showNextBtn(nextGame) {
      this.nextGame = nextGame;
      this.nextVisible = true;
    },

    containerClicked() {
      EventBus.$emit('containerClicked');
    }
  }
};
</script>

<style lang="scss">
    @import url('styles/fonts.scss');
    @import url('styles/reset.scss');
    @import url('styles/transitions.scss');

    body {
        font-family: "pragmatica", sans-serif;
        background-color: #000;
        color: #fff;
        font-weight: 400;
        font-size: 18px;
        letter-spacing: -0.55px;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        -webkit-overflow-scrolling: touch;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    #app {
        width: 100%;
        min-height: 100vh;
        background-repeat: no-repeat;
        position: relative;
        background-size: 100%;

        @media (min-width: 880px) {
            background-image: url('~@/assets/back.jpg');
        }
        @media (max-width: 879px) {
            background-image: url('~@/assets/back-mobile.jpg');
            background-size: contain;
            user-select: none;
        }
    }
    .logo {
        position: absolute;
        top: 34px;
        height: 46px;
        z-index: 1;
        height: 46px;

        @media (min-width: 880px) {
            left: 60px;
        }
        @media (max-width: 879px) {
            left: 0;
            right: 0;
            margin: 0 auto;
            height: 38px;
        }
    }
    .container {
        margin: 0 auto;
        color: #fff;
        @media (min-width: 880px) {
            width: 880px;
        }
        @media (max-width: 879px) {
            width: 320px;
        }
        h1 {
            margin-bottom: 20px;
            letter-spacing: -1px;
            font-weight: 700;
            text-align: center;

            @media (min-width: 880px) {
                padding-top: 230px;
                font-size: 96px;
                line-height: 76px;
            }

            @media (max-width: 879px) {
                padding-top: 120px;
                font-size: 45px;
                line-height: 43px;
            }
        }
        .subtitle {
            margin-bottom: 40px;
            font-weight: 400;
            line-height: 24px;
            font-size: 18px;
            text-align: center;
        }
    }
    .games-container {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding-top: 20px;
        user-select: none;
        font-family: 'vcr', sans-serif;
        background-color: rgba(0, 0, 0, .5);
        &.vertical-centered {
            justify-content: center;
            background-color: transparent;
        }
        @media (min-width: 880px) {
            height: 880px;
        }
        @media (max-width: 879px) {
            height: 600px;
        }

        img.progress-bar {
            margin: 0 auto;
            display: block;
            max-width: 100%;
        }
    }
    .stretch {
        @media (max-width: 879px) {
            width: 100%;
        }
    }
    .centered {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .no-overflow {
        position: relative;
        overflow-y: hidden;
    }
    .next-btn {
        width: 258px;
        height: 84px;
        margin: 20px auto 0;
        background-image: url('~@/assets/next-btn.png');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        opacity: 0;
        display: none;
        cursor: pointer;
        &.visible {
            display: block;
            visibility: visible;
            flex-shrink: 0;
            opacity: 1;
            animation: blink 1s .5s linear infinite;
        }
    }
    .popup {
        position: absolute;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        max-width: 750px;
        margin: 0 auto;
        background-color: #333;
        border-bottom: 5px #1e1e1e solid;
        border-radius: 5px;
        transition: transform .3s ease-out;
        pointer-events: none;
        font-family: 'vcr';
        text-align: left;
        @media (min-width: 880px) {
            width: 95%;
            height: 83px;
            font-size: 18px;
            line-height: 23px;
        }
        @media (max-width: 879px) {
            width: 96%;
            min-height: 67px;
            font-size: 14px;
        }
        &.visible {
            pointer-events: auto;
            transform: translateY(-120%);

            .character {
                opacity: 1;
            }
        }   
        .character {
            margin-top: -50px;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: bottom;
            opacity: 0;
            transition: opacity .3s;

            @media (min-width: 880px) {
                width: 128px;
                height: 133px;
                flex-shrink: 0;
            }
            @media (max-width: 879px) {
                width: 26%;
                height: 112px;
            }
        }
        .strawberry {
            background-image: url('~@/assets/tanks/strawberry.png');
            @media (max-width: 879px) {
                margin-top: -47px;
            }
        }
        .cucumber {
            background-image: url('~@/assets/pizza/cucumber.png');
            @media (max-width: 879px) {
                & + .typed {
                    margin-right: 12px;
                }
            }
        }
        .owl {
            background-image: url('~@/assets/tanks/owl.png');
            order: 1;

            & + .typed {
                width: 73%;
                margin-left: 26px;
            }
        }
        .elephant {
            background-image: url('~@/assets/office/elephant.png');
            order: 1;

            & + .typed {
                width: 73%;
                margin-left: 26px;
                margin-right: 0;
            }
        }
        .pig {
            background-image: url('~@/assets/office/pig.png');
        }
        .chupik {
            background-image: url('~@/assets/ff/chupik.png');
        }
        .walrus {
            background-image: url('~@/assets/ff/walrus.png');
            order: 1;
            flex-grow: 1;

            & + .typed {
                @media (max-width: 879px) {
                    width: 53%;
                }
                @media (min-width: 880px) {
                    width: 66%;
                }   
                margin-left: 26px;
            }
        }
        .typed {
            color: #fff;
            margin-left: 10px;
            margin-right: 20px;
            @media (max-width: 879px) {
                width: 73%;
            }
        }
    }
    @keyframes blink {
        50% {
            opacity: 0;
        }
    }

    section.info {
        .row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;

            @media (max-width:879px) {
                flex-direction: column;    
            }
        }
        section.about {
            margin-top: 150px;

            @media (max-width:879px) {
                margin-top: 50px;
            }

            .text {
                max-width: 407px;

                @media (max-width:879px) {
                    order: 2;
                    text-align: center;
                }
            }
            h1 {
                font-size: 44px;
                font-weight: 700;
                letter-spacing: -1px;
                line-height: 44px;
                margin-top: 0;
                padding-top: 0;

                text-align: left;
                @media (max-width:879px) {
                    text-align: center;
                }
            }
            p {
                font-size: 18px;
                font-weight: 400;
                line-height: 24px;
            }
            .images {
                max-width: 100%;
                width: 535px;
                position: relative;
                margin-left: 60px;

                @media (max-width:879px) {
                    order: 1;
                    height: 250px;
                    margin-left: 0;
                    margin-bottom: 50px;
                    overflow: hidden;
                }

                .game-img {
                    position: absolute;
                    background-size: contain;
                    background-repeat: no-repeat;
                }

                .game-img:nth-child(1) {
                    @media (min-width:880px) {
                        top: 217px;
                        width: 363px;
                        height: 240px;
                        background-image: url('~@/assets/game1.png');
                    }
                    @media (max-width:879px) {
                        top: 100px;
                        width: 210px;
                        height: 139px;
                        background-image: url('~@/assets/game1-mobile.png');
                    }
                }
                .game-img:nth-child(2) {
                    @media (min-width:880px) {
                        width: 565px;
                        height: 374px;
                        background-image: url('~@/assets/game2.png');
                    }
                    @media (max-width:879px) {
                        left: 38px;
                        width: 338px;
                        height: 224px;
                        background-image: url('~@/assets/game2-mobile.png');
                    }
                }
            }
        }

        section.prizes {
            text-align: center;
            margin-top: 120px;

            h1 {
                font-size: 36px;
                line-height: 36px;
                font-weight: 700;
                margin: 0;
                padding: 0;
            }
            h2 {
                font-size: 18px;
                font-weight: 400;
                line-height: 24px;
                margin-top: 10px;
            }

            .prizes-img {
                background-repeat: no-repeat;
                background-size: contain;
                margin-top: 30px;
                @media (min-width:880px) {
                    width: 800px;
                    height: 368px;
                    background-image: url('~@/assets/prizes.png');
                }
                @media (max-width:879px) {
                    width: 320px;
                    height: 147px;
                    background-image: url('~@/assets/prizes-mobile.png');
                }
            }

            button {
                margin-bottom: 30px;
            }

        }

        button {
            width: 205px;
            height: 68px;
            cursor: pointer;
            border-radius: 7px;
            font-size: 18px;
            font-weight: 600;
            color: black;
            background: white;
            margin-top: 40px;

            &:hover {
                background: rgba(255, 215, 13, 0.9);
            }
        }
    }

    footer {
        text-align: center;
        font-size: 11px;
        font-weight: 400;

        @media (min-width:880px) {
            margin: 6vh 0 50px;
        }
        @media (max-width:879px) {
            margin: 3vh 0 50px;
        }
    }
</style>