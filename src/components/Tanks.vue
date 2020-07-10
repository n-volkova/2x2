<template>
    <div class="stretch">
        <slot name="progress"></slot>
        <logo-screen v-show="preload" game="tanks" @startGame="startGame" />

        <div v-show="!preload" class="tanks-game" @click="popupVisible && hidePopup(arguments[0])">
            <div class="text upper" :class="upperVisible ? 'visible' : ''">
                <span v-html="upperText"></span>
            </div>
            <div class="no-overflow">
                <slot name="canvas"></slot>
                
                <div class="popup" :class="popupVisible ? 'visible' : ''">
                    <div class="character" :class="character"></div>
                    <div class="typed"></div>
                </div>
                <transition name="fade">
                    <div v-if="ticketVisible" class="ticket"></div>
                </transition>
            </div>

            <transition name="fade">
                <div v-if="bottomVisible" class="bottom-controls">
                    <!-- <div v-if="isMobile && bottomVisible" class="bottom-controls"> -->

                    <div class="text">Запаркуйте свой танчик с помощью стрелочек.</div>
                    <div class="controls">
                        <div 
                            class="control-btn up" 
                            @mousedown="moveUp"
                            @touchstart="moveUp"
                            @mouseup="stopY"
                            @touchend="stopY">
                        </div>
                        <div 
                            class="control-btn down" 
                            @mousedown="moveDown"
                            @touchstart="moveDown"
                            @mouseup="stopY"
                            @touchend="stopY">
                        </div>
                        <div 
                            class="control-btn left" 
                            @mousedown="moveLeft"
                            @touchstart="moveLeft"
                            @mouseup="stopX"
                            @touchend="stopX">
                        </div>
                        <div 
                            class="control-btn right" 
                            @mousedown="moveRight"
                            @touchstart="moveRight"
                            @mouseup="stopX"
                            @touchend="stopX">
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { Application, Loader, Container, Texture, Sprite } from 'pixi.js'
import { TimelineLite } from 'gsap/TweenMax'
import Typed from 'typed.js'
import { setTimeout } from 'timers'
import { keyboard, tankContain } from '../utils'

import EventBus from '../eventBus'

import LogoScreen from '../partials/LogoScreen.vue'

const WIDTH = 648
const HEIGHT = 538

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
            character: 'strawberry',
            typed: null,
            keyboardStopped: false,
            keys: {
                up: null,
                down: null,
                left: null,
                right: null
            },
            space: null,
            upperVisible: false,
            upperText: 'Парковка торгового центра в будний день. Что может пойти не так?',
            parking: null,
            player: null,
            tanksArmy: [],
            tanksArmyVisible: false,
            popupVisible: false,
            bottomVisible: false,
            ticketVisible: false,
            polygonPoints: [
                {
                    x: 16, 
                    y: 457
                }, 
                {
                    x: 250, 
                    y: 457
                }, 
                {
                    x: 250, 
                    y: 300
                }, 
                {
                    x: 561,
                    y: 300
                }, 
                {
                    x: 561,
                    y: 213
                },  
                {
                    x: 165,
                    y: 213
                },
                {
                    x: 165,
                    y: 370
                },
                {
                    x: 12,
                    y: 370
                },
                {
                    x: 12,
                    y: 118
                },
                {
                    x: 370,
                    y: 118
                },
                {
                    x: 370,
                    y: 24
                },
                {
                    x: 456,
                    y: 24
                },
                {
                    x: 456,
                    y: 118
                },
                {
                    x: 631,
                    y: 118
                },
                {
                    x: 631, 
                    y: 368
                }, 
                {
                    x: 319, 
                    y: 368
                }, 
                {
                    x: 319, 
                    y: 526
                }, 
                {
                    x: 16, 
                    y: 526
                },
                
            ]
        }
    },
    computed: {
        isMobile() {
            return window.innerWidth < 880
        },
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
        this.stopKeyboardListeners()
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
                autoDensity: true, 
                resolution: 2,
                autoResize: true
            })

            this.loader = new Loader()
            this.loader 
                        .add('tilesets/tanks-tileset.json')
                        .load(() => {
                this.setup()
            })
        }, 

        drawStage() {
            let container = document.querySelector('.tanks-canvas')
            container.appendChild(this.app.view)

            this.parking = new Container()
            this.app.stage.addChild(this.parking)

            this.resize()
        },

        getTypedOptions(text) {
            return {
                strings: [text],
                typeSpeed: 20,
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

        setup() {
            let bg = this.getSprite('tanks-bg')
            bg.scale.set(.5, .5)

            let grass = this.getSprite('grass-tile')
            grass.scale.set(.5, .5)
            grass.position.set(556, 215)

            let grassCluster = this.getSprite('grass-cluster')
            grassCluster.scale.set(.5, .5)
            grassCluster.position.set(13, 218)

            this.player = this.getSprite('player-right')
            this.player.scale.set(.5, .5)
            this.player.position.set(19, 459)
            this.player.vy = 0
            this.player.vx = 0

            for (let i = 0; i < 2; i++) {
                this.tanksArmy.push(this.getSprite('tank-red'))
                this.tanksArmy.push(this.getSprite('tank-green'))
                this.tanksArmy.push(this.getSprite('tank-grey'))
            }

            this.tanksArmy.forEach((tank, index) => {
                tank.scale.set(.5, .5)
                tank.anchor.set(.5)

                if (index % 2) {
                    tank.rotation = -1.57
                    tank.position.set(716, 121)
                } else {
                    tank.rotation = 1.57
                    tank.position.set(-68, 121)
                }
            })

            this.parking.addChild(bg, this.player, grass, grassCluster, ...this.tanksArmy)

            window.addEventListener('resize', this.resize)
        },

        startGame() {
            this.preload = false
            setTimeout(() => {
                this.showPopup('strawberry', 'Почему я клубника? Куда я иду? Зачем парковать танки?')
                this.setSpaceSkipping()
            }, 200)
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
            }this.popupVisible = false

            if (this.currentStep === 'INTRO') {
                this.typed.destroy()

                this.bottomVisible = true
                this.upperVisible = true

                if (!this.isMobile) {
                    this.setKeyboard()
                }

                this.app.ticker.add(this.drive)

            } else if (this.currentStep === 'TICKET') {
                this.upperText = 'Штраф — это не конец.<br>Продолжайте играть, ведь с этой игрой вы справились.'
                this.upperVisible = true
                this.ticketVisible = false
                let self = this
                
                setTimeout(() => {
                    this.currentStep = 'GAME_OVER'
                    this.$audio.start('finish')
                    this.showPopup('strawberry', 'Я ничего не поняла! Но больше так не буду...')
                }, 200)
            }
        },

        onTypeComplete() {
            this.$audio.stop('typewriter')
            if (this.currentStep === 'GAME_OVER') {
                this.$emit('showNextBtn', 'ff')
            }
        },

        stopKeyboardListeners() {
            for (let key in this.keys) {
                if (this.keys[key]) {
                    this.keys[key].unsubscribe()
                }
            }
        },

        stopSpace() {
            this.space.unsubscribe()
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
        
        drive() {
            if (this.keyboardStopped) {
                return
            }
            
            this.player.y += this.player.vy
            this.player.x += this.player.vx

            tankContain(this.player, this.polygonPoints)

            if (this.player.x > 560 && !this.tanksArmyVisible) {
                this.app.ticker.remove(this.drive)
                this.player.vx = 0
                
                if (!this.isMobile) {
                    this.keyboardStopped = true
                }
                this.clogParking()

            } else if (this.player.y < 32) {
                this.app.ticker.remove(this.drive)
                this.player.vy = 0
                
                if (!this.isMobile) {
                    this.keyboardStopped = true
                }
                this.gameOver()
            }
        },

        clogParking() {
            setTimeout(() => {
                this.$audio.start('drift_1')
                setTimeout(() => {
                    this.$audio.start('drift_2')
                    setTimeout(() => {
                        this.$audio.start('drift_3')
                    }, 400)
                }, 600)
            }, 200)

            let animation = new TimelineLite({ onComplete: onComplete })  
            animation.to(this.tanksArmy[0], .3, { x: 155, ease: Linear.easeNone })
                    .to(this.tanksArmy[0], 0, { rotation: 0, ease: Linear.easeNone })
                    .to(this.tanksArmy[0], .3, { x: 155, y: 53, ease: Linear.easeNone })

                    .to(this.tanksArmy[1], .5, { x: 332, ease: Linear.easeNone }, 0.15)
                    .to(this.tanksArmy[1], 0, { rotation: 0, ease: Linear.easeNone })
                    .to(this.tanksArmy[1], .3, { x: 332, y: 62, ease: Linear.easeNone })

                    .to(this.tanksArmy[2], .6, { x: 250, ease: Linear.easeNone }, 0.7)
                    .to(this.tanksArmy[2], 0, { rotation: 0, ease: Linear.easeNone }, 1.3)
                    .to(this.tanksArmy[2], .3, { x: 250, y: 71, ease: Linear.easeNone }, 1.3)

                    .to(this.tanksArmy[3], .2, { x: 600, ease: Linear.easeNone }, 0.7)
                    .to(this.tanksArmy[3], 0, { rotation: 0, ease: Linear.easeNone }, 0.9)
                    .to(this.tanksArmy[3], .3, { x: 600, y: 72, ease: Linear.easeNone }, 0.9)

                    .to(this.tanksArmy[4], .2, { x: 73, ease: Linear.easeNone }, 0.4)
                    .to(this.tanksArmy[4], 0, { rotation: 0, ease: Linear.easeNone }, 0.6)
                    .to(this.tanksArmy[4], .3, { x: 73, y: 57, ease: Linear.easeNone }, 0.6)

                    .to(this.tanksArmy[5], .3, { x: 500, ease: Linear.easeNone }, 1.3)
                    .to(this.tanksArmy[5], 0, { rotation: 0, ease: Linear.easeNone }, 1.5)
                    .to(this.tanksArmy[5], .3, { x: 500, y: 60, ease: Linear.easeNone }, 1.6)

            let self = this

            function onComplete() {
                self.keyboardStopped = false
                self.tanksArmyVisible = true
                self.app.ticker.add(self.drive)
            }
        },

        gameOver() {
            this.bottomVisible = false
            this.upperVisible = false

            this.ticketVisible = true
            
            if (window.navigator.vibrate) {
                window.navigator.vibrate(200)
            }

            this.$audio.stop('tank')
            this.$audio.start('police')

            setTimeout(() => {
                this.showPopup('owl', 'Подозреваю нарушение! Почему нарушаете? Куда спешим?')
                this.currentStep = 'TICKET'
            }, 200)

        },  

        getSprite(sprite) {
            let id = this.loader.resources['tilesets/tanks-tileset.json'].textures
            return new Sprite(id[`${sprite}.png`])
        },

        getTexture(texture) {
            return this.loader.resources['tilesets/tanks-tileset.json'].textures[`${texture}.png`]
        },

        moveUp() {
            this.player.vy = -4
            this.player.vx = 0
            this.player.texture = this.getTexture('player-up')
            this.$audio.start('tank', true)
        },

        moveDown() {
            this.player.vy = 4
            this.player.vx = 0
            this.player.texture = this.getTexture('player-down')
            this.$audio.start('tank', true)
        },

        moveLeft() {
            this.player.vx = -4
            this.player.vy = 0
            this.player.texture = this.getTexture('player-left')
            this.$audio.start('tank', true)
        },

        moveRight() {
            this.player.vx = 4
            this.player.vy = 0
            this.player.texture = this.getTexture('player-right')
            this.$audio.start('tank', true)
        },

        stopX() {
            this.player.vx = 0
            this.$audio.stop('tank')
        },

        stopY() {
            this.player.vy = 0
            this.$audio.stop('tank')
        },

        setKeyboard() {
            this.keys.left = keyboard("ArrowLeft")
            this.keys.up = keyboard("ArrowUp")
            this.keys.right = keyboard("ArrowRight")
            this.keys.down = keyboard("ArrowDown")

            this.keys.left_a = keyboard("KeyA")
            this.keys.up_w = keyboard("KeyW")
            this.keys.right_d = keyboard("KeyD")
            this.keys.down_s = keyboard("KeyS")

            // Left
            this.keys.left.press = () => {
                this.moveLeft()
            }
            
            this.keys.left.release = () => {
                if (!this.keys.right.isDown && this.player.vy === 0) {
                    this.stopX()
                }
            }

            this.keys.left_a.press = () => {
                this.moveLeft()
            }
            
            this.keys.left_a.release = () => {
                if (!this.keys.right.isDown && this.player.vy === 0) {
                    this.stopX()
                }
            }

            // Up
            this.keys.up.press = () => {
                this.moveUp()
            }

            this.keys.up.release = () => {
                if (!this.keys.down.isDown && this.player.vx === 0) {
                    this.stopY()
                }
            }

            this.keys.up_w.press = () => {
                this.moveUp()
            }

            this.keys.up_w.release = () => {
                if (!this.keys.down.isDown && this.player.vx === 0) {
                    this.stopY()
                }
            }

            // Right
            this.keys.right.press = () => {
                this.moveRight()
            }

            this.keys.right.release = () => {
                if (!this.keys.left.isDown && this.player.vy === 0) {
                    this.stopX()
                }
            }

            this.keys.right_d.press = () => {
                this.moveRight()
            }
            
            this.keys.right_d.release = () => {
                if (!this.keys.left.isDown && this.player.vy === 0) {
                    this.stopX()
                }
            }

            // Down
            this.keys.down.press = () => {
                this.moveDown()
            }

            this.keys.down.release = () => {
                if (!this.keys.up.isDown && this.player.vx === 0) {
                    this.stopY()
                }
            }

            this.keys.down_s.press = () => {
                this.moveDown()
            }

            this.keys.down_s.release = () => {
                if (!this.keys.up.isDown && this.player.vx === 0) {
                    this.stopY()
                }
            }
        },
    }
}
</script>

<style lang="scss">
    .tanks-game {
        position: relative;
        .bottom-controls {
            padding: 20px;
        }
        .controls {
            position: relative; 
            margin: 20px auto 0;
            display: flex;
            // width: 150px;
            // height: 150px;
            justify-content: center;
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
        .popup {
            z-index: 2;
        }
        .ticket {
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
                background-image: url('~@/assets/tanks/ticket.png');
            }
            @media (max-width: 879px) {
                background-image: url('~@/assets/tanks/ticket-mobile.png');
            }
        }
    }
</style>