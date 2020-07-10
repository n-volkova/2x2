<template>
    <div class="stretch">
        <slot name="progress"></slot>
        <logo-screen v-show="preload" game="pizza" @startGame="startGame" />

        <div v-show="!preload" class="pizza-game">
            <div class="text upper" :class="upperVisible ? 'visible' : ''">
                <transition name="fade" mode="out-in">
                    <span v-html="upperText" :key="upperText"></span>
                </transition>
            </div>
            <div class="no-overflow" :class="shake ? 'shake' : ''">
                <slot name="canvas"></slot>

                <div class="popup" :class="popupVisible ? 'visible' : ''">
                    <div class="character" :class="character"></div>
                    <div class="typed"></div>
                </div>
            </div>
            <transition name="fade">
                <div v-if="bottomVisible && progressVisible" class="progress">
                    <div class="coin"></div>
                    Собрано:
                    <div class="bar">
                        <div class="red" :style="`width: ${coinCounter * 10}%`"></div>
                    </div>
                </div>
            </transition>
            <transition name="fade">
                <div v-if="bottomVisible" class="text">Тапайте на все подряд, чтобы найти монетки.</div>
            </transition>
        </div>
    </div>
</template>

<script>
import { Application, Loader, Container, Graphics, Texture, Sprite, AnimatedSprite } from 'pixi.js'
import { TimelineLite } from 'gsap/TweenMax'
import Typed from 'typed.js'
import { setTimeout } from 'timers'
import { keyboard } from '../utils'

import EventBus from '../eventBus'

import LogoScreen from '../partials/LogoScreen.vue'

const MOBILE_WIDTH = 500

const WIDTH = window.innerWidth < MOBILE_WIDTH ? 616 : 814
const HEIGHT = 496

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
            space: null,
            currentStep: 'INTRO',
            character: 'strawberry',
            owl: null,
            owlRunning: null,
            typed: null,
            room: null,
            hitboxes: [],
            coin: null,
            knock: null,
            hand: null,
            shake: false,
            coinCounter: 0,
            popupVisible: false,
            progressVisible: false,
            upperVisible: false,
            bottomVisible: false,
            upperText: '',
        }
    },
    computed: {
        isMobile() {
            return window.innerWidth < MOBILE_WIDTH
        }
    },
    watch: {
        coinCounter(newVal) {
            if (newVal === 10) {
                this.end()
            }
        }
    },
    mounted() {
        this.init()

        EventBus.$on('containerClicked', () => {
            if (this.popupVisible) {
                this.hidePopup()
            }
        })
        this.$audio.start('startup')
    },
    beforeDestroy() {
        this.stopSpace()
    },
    methods: {
        init() {
            this.createApp()
            this.drawStage()
        },
        createApp() {
            this.app = new Application({
                width: WIDTH, 
                height: HEIGHT,
                transparent: false, 
                resolution: 2,
                autoResize: true
            })

            this.loader = new Loader()
            this.loader 
                        .add('tilesets/pizza-tileset.json')
                        .add('tilesets/owl-tileset.json')
                        .add('singles/hand.png')
                        .load(() => {
                this.setup()
            })
        }, 

        drawStage() {
            let container = document.querySelector('.pizza-canvas')
            container.appendChild(this.app.view)

            this.room = new Container()
            this.app.stage.addChild(this.room)
            this.resize()
        },

        startGame() {
            this.preload = false
            this.setSpaceSkipping()
            this.intro()
        },

        getTypedOptions(text) {
            return {
                strings: [text],
                typeSpeed: 15,
                startDelay: 200,
                showCursor: false,
                onComplete: this.onTypeComplete
            }
        },

        setSpaceSkipping() {
            this.space = keyboard("Space")

            this.space.press = () => {
                if (this.popupVisible) {
                    this.hidePopup()
                }
            }
        }, 

        stopSpace() {
            this.space.unsubscribe()
        },

        setup() {
            let bg
            
            if (this.isMobile) {
                bg = this.getSprite('pizza-mobile-bg')
            } else {
                bg = this.getSprite('pizza-bg')
            }
            bg.scale.set(.5, .5)

            this.knock = this.getSprite('knock')
            this.knock.scale.set(.5, .5)
            this.knock.position.set(156, 308)
            this.knock.alpha = 0

            this.coin = this.getSprite('coin')
            this.coin.scale.set(.5, .5)
            this.coin.anchor.set(.5, .5)
            this.coin.alpha = 0

            const cursorIcon = "url('singles/hand.png'),auto"
            this.app.renderer.plugins.interaction.cursorStyles.pointer = cursorIcon

            this.room.addChild(bg, this.coin, this.knock)

            window.addEventListener('resize', this.resize)
        },

        showPopup(character, text) {
            if (this.typed) this.typed.destroy()

            this.character = character
            this.popupVisible = true

            let options = this.getTypedOptions(text)

            this.typed = new Typed('.typed', options)

            this.$audio.start('typewriter', true)
        },
 
        completePopupText() {
            this.typed.typeSpeed = 0
        },

        hidePopup() {
            if (!this.typed.typingComplete) {
                this.completePopupText()
                return
            }
            this.popupVisible = false

            if (this.currentStep === 'INTRO') {
                setTimeout(() => {
                    this.showPopup('owl', 'Только не это! У меня нет сколько-то денег! Я буду искать сколько-то денег!')
                    this.currentStep = 'PLAY'
                }, 200)

            } else if (this.currentStep === 'PLAY') {
                setTimeout(() => {
                    this.setWalkingOwl()
                }, 200)

            }
        },
        
        resize() {
            let W = window.innerWidth
            
            if (this.isMobile) {
                W = 320
            }

            this.ratio = W / WIDTH

            let H = HEIGHT * this.ratio

            if (W < WIDTH) {
                this.app.renderer.resize(W, H)
                this.app.stage.scale.x = this.app.stage.scale.y = this.ratio
            }
        },

        intro() {
            try {
                let animation = new TimelineLite({ onComplete: onKnockComplete })
                    animation.to(this.knock, .2, { alpha: 1 })
                        .to(this.knock, .5, { alpha: 0 })
                        .to(this.knock, .2, { alpha: 1 })
                        .to(this.knock, .9, { alpha: 0 })
                        // .to(this.knock, .2, { alpha: 1 })
                        // .to(this.knock, .5, { alpha: 0 })
                        // .to(this.knock, .2, { alpha: 1 })
                        // .to(this.knock, .5, { alpha: 0 })

                this.$audio.start('knock')

                let self = this

                function onKnockComplete() {
                    if (typeof self === 'undefined') return
                    self.showPopup('cucumber', 'Мистер Сова, для вас мясная веганская пицца с мясом! С вас сколько-то денег!')
                }
            } catch (e) {
                this.showPopup('cucumber', 'Мистер Сова, для вас мясная веганская пицца с мясом! С вас сколько-то денег!')
            }
        },

        play() {
            this.popupVisible = false
            this.upperText = 'Надо найти наличку. Она же потерялась!'
            this.upperVisible = true
            this.bottomVisible = true
            this.progressVisible = true

            this.room.interactive = true
            this.room.cursor = 'pointer'
            this.setHitboxes()
        },

        end() {
            this.hitboxes.forEach(hitbox => {
                hitbox.off('mousedown', this.dropCoin)
                hitbox.off('touchstart', this.dropCoin)
                this.owlRunning.stop()
                this.$audio.stop('owl_run_trimmed')
                this.owl.gotoAndStop(1)
                this.bottomVisible = false
            })

            let self = this

            setTimeout(() => {
                this.upperText = 'Пицца остыла...<br>Грустно, но можно погреть в микроволновке. Игра пройдена!'
                this.currentStep = 'GAME_OVER'

                setTimeout(() => {
                    this.$audio.start('finish')
                    this.showPopup('owl', 'Ууух, трудно вертеть головой на 270 градусов! Слишком много градусов!')
                }, 200)
            }, 400)
        },

        onTypeComplete() {
            this.$audio.stop('typewriter')
            if (this.currentStep === 'GAME_OVER') {
                this.$emit('showNextBtn', 'tanks')
            }
        },

        getSprite(sprite) {
            let id = this.loader.resources['tilesets/pizza-tileset.json'].textures
            return new Sprite(id[`${sprite}.png`])
        },

        setHitboxes() {
            let self = this
            let boxMetrics = [
                {
                    x: 28,
                    y: 180,
                    width: 115,
                    height: 261
                },
                {
                    x: 237,
                    y: 186,
                    width: 114,
                    height: 255
                },
                {
                    x: 343,
                    y: 253,
                    width: 112,
                    height: 190
                },
                {
                    x: 626,
                    y: 215,
                    width: 111,
                    height: 224
                },
                {
                    x: 92,
                    y: 53,
                    width: 113,
                    height: 58
                },
                {
                    x: 486,
                    y: 110,
                    width: 132,
                    height: 145
                },
                {
                    x: 735,
                    y: 367,
                    width: 31,
                    height: 75
                }
            ]

            let box = null

            for (let i = 0; i < boxMetrics.length; i++) {
                box = boxMetrics[i]

                let hitbox = new Graphics()
                hitbox.beginFill(0xFFFFFF)
                hitbox.drawRect(box.x, box.y, box.width, box.height)
                hitbox.endFill()
                hitbox.alpha = 0

                hitbox.interactive = true
                hitbox.buttonMode = true
                hitbox.on('touchstart', self.dropCoin)
                hitbox.on('mousedown', self.dropCoin)

                this.hitboxes.push(hitbox)

                this.room.addChild(hitbox)
            }
        },

        setWalkingOwl() {
            const owlTextures = []
            let i

            for (i = 0; i < 4; i++) {
                let texture = Texture.from(`owl-${i + 1}.png`)
                owlTextures.push(texture)
            }
            this.owl = new AnimatedSprite(owlTextures)
            this.owl.loop = true
            this.owl.position.set(70, 315)
            this.app.stage.addChild(this.owl)
            this.owl.animationSpeed = .2
            this.owl.scale.set(-1, 1)
            this.owl.play()

            let animation = new TimelineLite({ onComplete: restartAnimation })
            animation.to(this.owl, 1.5, { x: WIDTH - 70, ease: Linear.easeOut })
                    .to(this.owl.scale, 0, { x: 1, y: 1, ease: Linear.easeNone }, 1.5)
                    .to(this.owl, 1.5, { x: 70, ease: Linear.easeOut }, 1.5)
                    .to(this.owl.scale, 0, { x: -1, y: 1, ease: Linear.easeNone }, 3)

            this.$audio.start('owl_run_trimmed', true)

            this.owlRunning = animation

            let self = this

            function restartAnimation() {
                animation.time(0)
            }

            this.play()
        },

        dropCoin(event) {
            this.shake = true
            
            if (window.navigator.vibrate) {
                window.navigator.vibrate(200)
            }
            
            let e = event.data.global

            if (this.coinCounter === 0 || Math.random() * 100 <= 30) {
                let x = this.ratio < 1 ? e.x / this.ratio : e.x
                let y = this.ratio < 1 ? e.y / this.ratio : e.y

                this.animateCoin(x, y)
                this.$audio.start('coin')
                
                this.coinCounter++

                if (this.coinCounter === 1) {
                    this.bottomVisible = true
                }

            }

            setTimeout(() => this.shake = false, 500)
        },
        
        animateCoin(x, y) {
            this.coin.position.set(x, y)
            let animation = new TimelineLite()
            animation.to(this.coin, .2, { y: y - 100, alpha: 1, ease: Back.easeOut })
                    .to(this.coin.scale, .2, { x: .8, y: .8 })
                    .to(this.coin, .2, { y: 420, ease: Back.easeIn })
                    .to(this.coin.scale, .2, { x: .5, y: .5 })
                    .to(this.coin, .1, { alpha: 0 })
        },
    }
}
</script>

<style lang="scss">
    .pizza-game {
        @media (max-width: 879px) {
            padding-top: 20px;
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
                    height: 57px;
                }
                &.visible {
                    opacity: 1;
                }
            }
            @media (max-width: 879px) {
                padding: 0 10px;
                font-size: 16px;
            }
        }
        .progress {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ED766E;
            @media (min-width: 879px) {
                padding: 27px 10px;
                font-size: 32px;
            }
            @media (max-width: 879px) {
                padding: 10px;
                font-size: 20px;
            }
            .coin {
                width: 40px;
                height: 40px;
                margin-right: 10px;
                background-image: url('~@/assets/pizza/coin.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
            }
            .bar {
                position: relative;
                height: 17px;
                margin-top: 7px;
                margin-left: 22px;
                background-image: url('~@/assets/pizza/progressbar.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 17px;
                overflow: hidden;
                border: 1px solid #fff;
                box-sizing: content-width;
                @media (min-width: 880px) {
                    width: 358px;
                }
                @media (max-width: 879px) {
                    width: 100%;
                    max-width: 358px;
                }
                .red {
                    position: absolute;
                    top: 1px;
                    bottom: 1px;
                    left: 1px;
                    right: 1px;
                    width: 0;
                    background-color: #ed776e;
                }
            }
        }
    }
</style>