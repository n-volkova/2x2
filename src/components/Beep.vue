<template>
    <div class="stretch">
        <slot name="progress"></slot>
        <logo-screen v-show="preload" game="beep" @startGame="startGame" />

        <div v-show="!preload" class="beep-game" @click="popupVisible && hidePopup(arguments[0])">
            <div class="text upper" :class="upperVisible ? 'visible' : ''">
                <span v-html="upperText"></span>
            </div>
            <div class="no-overflow">
                <div class="progress" :class="progressVisible ? 'visible' : ''">
                    <div class="bar">
                        <div class="green" :style="`width: ${beepCounter * 10}%`"></div>
                    </div>
                </div>
                <slot name="canvas"></slot>
                <div class="popup" :class="popupVisible ? 'visible' : ''">
                    <div class="character strawberry"></div>
                    <div class="typed"></div>
                </div>
            </div>
            <transition name="fade">
                <div v-if="bottomVisible" class="bottom-controls">
                    <div class="text">Есть только одна кнопка.<br>Однокнопочная игра. С одной кнопкой.</div>
                    <div class="beep-btn" 
                        :class="{
                            'pressed': beepPressed,
                            'disabled': beepDisabled
                        }"
                        @click="makeNoise">
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>

import * as PIXI from 'pixi.js-legacy';
global.PIXI = PIXI;
require('pixi-projection');
import CustomEase from '../utils/CustomEase'
import Typed from 'typed.js'
import { TimelineLite } from 'gsap/TweenMax'
import { setTimeout } from 'timers'
import { keyboard } from '../utils'

import EventBus from '../eventBus'

import LogoScreen from '../partials/LogoScreen.vue'


let WIDTH = 681
let HEIGHT = 564

export default {
    components: {
        LogoScreen
    },
    data () {
        return {
            webglEnabled: false,
            preload: true,
            app: null,
            loader: null,
            ratio: 1,
            skipped: false,
            currentStep: 'INTRO',
            typed: null,
            landscape: null,
            space: null,
            bottomVisible: false,
            upperVisible: false,
            upperText: 'Вы едете на работу. Чтобы работать. Включите звук.',
            beepPressed: false,
            beepDisabled: false,
            player: null,
            grassLeft: null,
            grassRight: null,
            road: null,
            trees: [],
            treePositions: [
                {
                    x: 300,
                    y: 300,
                    scale: .2,
                    deltaX: 1400,
                    deltaY: 200
                },
                {
                    x: 370,
                    y: 300,
                    scale: .2,
                    deltaX: -1100,
                    deltaY: 200
                },
            ],
            beepPressed: false,
            beepCounter: 0,
            popupVisible: false,
            progressVisible: false,
        }
    },
    computed: {
        isMobile() {
            return window.innerWidth < 880
        },
    },
    watch: {
        beepCounter(newVal) {
            if (newVal === 3 && !this.skipped) {
                this.drawCarArmy()
                this.beepDisabled = true
            } else if (newVal === 10) {
                this.stopAnimations()
                this.$audio.stop('car_1')
                this.$audio.stop('car_2')
                this.$audio.stop('car_3')

                this.beepDisabled = true
                this.upperText = '09:01, вы опоздали на работу. Поздравляем.<br>Игра пройдена!'
                this.bottomVisible = false
                this.progressVisible = false
                
                setTimeout(() => {
                    this.showPopup('Опять!? Похоже, шеф останется без клубничного смузи!')
                    this.$audio.start('finish')
                }, 200)
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
            this.app = new PIXI.Application({
                width: WIDTH, 
                height: HEIGHT,
                transparent: false,
                resolution: 2,
                autoResize: true,
            })

            this.webglEnabled = !!this.app.renderer.gl

            this.loader = new PIXI.Loader()
            this.loader 
                        .add('tilesets/beep-tileset.json')
                        .load(() => {
                this.setup()
            })

            window.ffLoader = new PIXI.Loader()
            window.ffLoader.add('tilesets/ff-tileset.json')
                        .add('tilesets/chupik-tileset.json')
                        .load(() => {
            })
        }, 

        drawStage() {
            let container = document.querySelector('.beep-canvas')
            container.appendChild(this.app.view)

            if (this.isMobile) {
                this.app.renderer.plugins.interaction.destroy()
            }

            this.landscape = new PIXI.Container()

            this.app.stage.addChild(this.landscape)
            this.resize()
        },

        startGame() {
            this.preload = false
            this.$audio.start('startup')
            setTimeout(() => {
                this.showPopup('Надо мчать на работу что есть мочи! Вжжжж!')
                this.setSpaceSkipping()
            }, 200)
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

        onTypeComplete() {
            this.$audio.stop('typewriter')
            if (this.currentStep === 'GAME_OVER') {
                this.$emit('showNextBtn', 'office')
            }
        },

        setSpaceSkipping() {
            this.space = keyboard("Space")

            this.space.press = (e) => {
                if (this.popupVisible) {
                    this.hidePopup()
                }
            }
        }, 

        stopSpace() {
            this.space.unsubscribe()
        },

        setup() {
            CustomEase.create('tree', '.96,.06,.98,.17')

            let sky = this.getSprite('sky')
            sky.scale.set(.5, .5)
            sky.position.set(0, 0)

            let city = this.getSprite('city')
            city.scale.set(.5, .5)
            city.position.set(0, 240)

            this.landscape.addChild(sky, city)

            this.player = this.getSprite('car-red')
            this.player.scale.set(.5, .5)
            this.player.position.set(410, 451)

            let road = this.webglEnabled ? 
                new PIXI.projection.TilingSprite2d(this.getTexture('road'), 682, 249) :
                new PIXI.projection.TilingSprite2d(this.getTexture('road-canvas'), 682, 249)

            road.position.set(0, 316)
            road.tileScale.y = 10

            let grassLeft = this.webglEnabled ? 
                new PIXI.projection.TilingSprite2d(this.getTexture('grass'), 310, 400) :
                new PIXI.projection.TilingSprite2d(this.getTexture('grass-canvas'), 310, 400)

            grassLeft.position.set(0, 316)
            grassLeft.skew.x = -.89
            grassLeft.tileScale.y = 10

            let grassRight = this.webglEnabled ? 
                new PIXI.projection.TilingSprite2d(this.getTexture('grass'), 310, 400) :
                new PIXI.projection.TilingSprite2d(this.getTexture('grass-canvas'), 310, 400)

            grassRight.position.set(373, 316)
            grassRight.skew.x = .89
            grassRight.tileScale.y = 10

            this.landscape.addChild(road, grassLeft, grassRight)

            let roadPoints = [
                { x: -50, y: 316 },
                { x: 731, y: 316 },
                { x: 1054, y: 600 },
                { x: -373, y: 600 }
            ]

            let grassLeftPoints = [
                { x: -60, y: 316 },
                { x: 731, y: 316 },
                { x: 1054, y: 600 },
                { x: -373, y: 600 }
            ]

            let grassRightPoints = [
                { x: -60, y: 316 },
                { x: 731, y: 316 },
                { x: 1054, y: 600 },
                { x: -373, y: 600 }
            ]

            grassLeft.tileProj.mapSprite(grassLeft, grassLeftPoints)
            grassRight.tileProj.mapSprite(grassRight, grassRightPoints)
            road.tileProj.mapSprite(road, roadPoints)

            this.grassLeft = grassLeft
            this.grassRight = grassRight
            this.road = road

            this.setTrees()

            this.app.stage.addChild(this.player)

            window.addEventListener('resize', this.resize)
        },
        
        resize() {
            let W = window.innerWidth

            if (W > WIDTH && !this.isMobile) {
                this.ratio = .9
                W = WIDTH * this.ratio
            } else if (this.isMobile) {
                W = 320
                this.ratio = W / WIDTH
            } else {
                this.ratio = W / WIDTH
            }

            let H = HEIGHT * this.ratio

            if (W < WIDTH) {
                this.app.renderer.resize(W, H)
                this.app.stage.scale.x = this.app.stage.scale.y = this.ratio
            }
        },

        showPopup(text) {
            if (this.typed) this.typed.destroy()

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
                this.typed.destroy()
                this.play()

            } else if (this.currentStep === 'TRAFFIC_JAM') {
                setTimeout(() => {
                    this.showPopup('Если не получается жать на газ, надо жать на клаксон сильнее.')

                    this.currentStep = 'BEEP_UNTIL_LATE'
                }, 200)
            } else if (this.currentStep === 'BEEP_UNTIL_LATE') {
                this.$audio.start('car_1', true)
                this.$audio.start('car_2', true)
                this.$audio.start('car_3', true)
                this.slowDownAnimations()
                this.bottomVisible = true
                this.beepDisabled = false
                this.currentStep = 'GAME_OVER'
            }
        },

        play() {
            this.upperVisible = true
            this.bottomVisible = true
            this.progressVisible = true

            this.drawTreePair(0)
            this.app.ticker.add(this.playAnimations)

            this.$audio.start('car_1', true)

            setTimeout(() => {
                if (this.beepCounter < 3) {
                    this.skipped = true
                    this.drawCarArmy()
                    this.beepDisabled = true
                }
            }, 15000)
        },

        getSprite(sprite) {
            let id = this.loader.resources['tilesets/beep-tileset.json'].textures
            return new PIXI.Sprite(id[`${sprite}.png`])
        },

        getTexture(texture) {
            return this.loader.resources['tilesets/beep-tileset.json'].textures[`${texture}.png`]
        },

        setTrees() {
            let tree
            let pair = []

            for (let i = 0; i < 3; i++) {
                pair = []
                this.treePositions.forEach(position => {
                    if (i % 2) {
                        tree = this.getSprite('tree-left')
                    } else {
                        tree = this.getSprite('tree-right')
                    }
                    
                    tree.position.set(position.x, position.y)
                    tree.scale.set(position.scale, position.scale)
                    tree.visible = false

                    tree.animation = new TimelineLite({ paused: true })

                    tree.animation.to(tree, 4.9, {  x: position.x - position.deltaX, y: position.y + position.deltaY, ease: 'tree' })
                            .to(tree.scale, 4.9, { x: 9, y: 9, ease: 'tree' }, 0)
                    
                    pair.push(tree)
                })

                this.landscape.addChild(...pair)
                this.trees.push(pair)
            }
        },

        drawTreePair(pairIndex) {
            this.trees[pairIndex].forEach((tree, i) => {
                tree.visible = true
                this.moveTree(tree)
            })
        },

        playAnimations(delta) {
            if (this.road.tilePosition.y < this.road.height * this.road.tileScale.y * 2) {
                this.road.tilePosition.y += 30 * delta
                this.grassLeft.tilePosition.y += 30 * delta
                this.grassRight.tilePosition.y += 30 * delta
            } else {
                this.road.tilePosition.y = 0
                this.grassLeft.tilePosition.y = 0
                this.grassRight.tilePosition.y = 0
            }

            if (this.trees[0][0].y.toFixed() == 306 && !this.trees[1][0].visible) {
                this.trees[1].forEach((tree, i) => {
                    this.drawTreePair(1)
                })
            } else if (this.trees[1][0].y.toFixed() == 306 && !this.trees[2][0].visible) {
                this.trees[2].forEach((tree, i) => {
                    this.drawTreePair(2)
                })
            } else if (this.trees[2][0].y === 306 && !this.trees[2][0].visible) {
                this.trees[0].forEach((tree, i) => {
                    this.restartTreeAnimation(tree, this.treePositions[i])
                })
            } else if (this.trees[0][0].y === 500) {
                this.trees[0].forEach((tree, i) => {
                    this.restartTreeAnimation(tree, this.treePositions[i])
                })
            } else if (this.trees[1][0].y === 500) {
                this.trees[1].forEach((tree, i) => {
                    this.restartTreeAnimation(tree, this.treePositions[i])
                })
            } else if (this.trees[2][0].y === 500) {
                this.trees[2].forEach((tree, i) => {
                    this.restartTreeAnimation(tree, this.treePositions[i])
                })
            }
        },

        moveTree(tree) {
            tree.animation.resume()
        },

        drawCarArmy() {
            let carMapRight = ['violet', 'grey', 'brown']
            let carMapLeft = ['grey', 'brown', 'violet', 'grey']
            let carArmy = []
            let carSprite

            carMapRight.forEach(color => {
                carSprite = this.getSprite(`car-${color}`)
                carSprite.position.set(351, 313)
                carSprite.scale.set(0)

                this.landscape.addChild(carSprite)
                carArmy.push(carSprite)
            })

            carMapLeft.forEach(color => {
                carSprite = this.getSprite(`car-${color}`)
                carSprite.position.set(341, 313)
                carSprite.scale.set(0)

                this.landscape.addChild(carSprite)
                carArmy.push(carSprite)
            })
            
            let violetRightCar = carArmy[0]
            let greyRightCar = carArmy[1]
            let brownRightCar = carArmy[2]

            let greyLeftCar = carArmy[3]
            let brownLeftCar = carArmy[4]
            let violetLeftCar = carArmy[5]
            let lastLeftCar = carArmy[6]

            setTimeout(() => {
                this.$audio.start('car_2', true)
                setTimeout(() => {
                    this.$audio.start('car_3', true)
                }, 400)
            }, 200)

            let self = this
            let carAnimation = new TimelineLite({ autoRemoveChildren: true, onComplete: onComplete })

            carAnimation.to(violetRightCar, 2, { x: 371, y: 393, ease: Power1.easeOut })
                    .to(violetRightCar.scale, 2, { x: .7, y: .7, ease: Power1.easeOut }, 0)

                    .to(greyRightCar, 1.7, { x: 361, y: 355, ease: Power1.easeOut }, .4)
                    .to(greyRightCar.scale, 1.7, { x: .4, y: .4, ease: Power1.easeOut }, .4)

                    .to(brownRightCar, 1.4, { x: 350, y: 325, ease: Power1.easeOut }, .6)
                    .to(brownRightCar.scale, 1.4, { x: .2, y: .2, ease: Power1.easeOut }, .6)

                    .to(greyLeftCar, 2, { x: 201, y: 405, ease: Power1.easeOut }, 0)
                    .to(greyLeftCar.scale, 2, { x: .8, y: .8, ease: Power1.easeOut }, 0)

                    .to(brownLeftCar, 1.7, { x: 250, y: 365, ease: Power1.easeOut }, .3)
                    .to(brownLeftCar.scale, 1.7, { x: .5, y: .5, ease: Power1.easeOut }, .3)

                    .to(violetLeftCar, 1.4, { x: 290, y: 335, ease: Power1.easeOut }, .5)
                    .to(violetLeftCar.scale, 1.4, { x: .3, y: .3, ease: Power1.easeOut }, .5)

                    .to(lastLeftCar, 1.2, { x: 315, y: 315, ease: Power1.easeOut }, .6)
                    .to(lastLeftCar.scale, 1.2, { x: .15, y: .15, ease: Power1.easeOut }, .6)

            function onComplete() {
                carAnimation.kill()
                carAnimation = null
                self.stopAnimations()
                self.trafficJam()
            }
        },
        
        trafficJam() {
            this.bottomVisible = false

            this.$audio.stop('car_1')
            this.$audio.stop('car_2')
            this.$audio.stop('car_3')

            this.currentStep = 'TRAFFIC_JAM'

            this.showPopup('Пробка… Очень неожиданно, такое не каждый день встретишь.')
        },

        restartTreeAnimation(tree, options) {
            this.revertTree(tree, options)
            tree.animation.restart()
        },

        revertTree(tree, options) {
            tree.position.set(options.x, options.y)
            tree.scale.set(options.scale, options.scale)
        },

        stopAnimations() {
            this.app.ticker.stop()
            this.trees.forEach(pair => {
                pair.forEach((tree, i) => {
                    tree.animation.pause()
                })
            })
        },

        slowDownAnimations() {
            this.trees.forEach(pair => {
                pair.forEach((tree, i) => {
                    tree.animation.duration(30).resume()
                })
            })

            this.app.ticker.speed = .1
            this.app.ticker.start()
        },

        makeNoise() {
            if (!this.beepPressed) {
                this.$audio.start('honk')
                this.beepPressed = true
                this.beepCounter++
                setTimeout(() => {
                    this.beepPressed = false
                }, 130)
            }
        },
    }
}
</script>

<style lang="scss">
    .beep-game {
        .no-overflow {
            position: relative;
            width: 100%;
            overflow: hidden;
        }
        .cursor-invisible {
            cursor: none;
        }
        .bottom-controls {
            padding: 20px 20px 0;
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
        .beep-btn {
            margin: 0 auto;
            width: 101px;
            height: 81px;
            background-image: url('~@/assets/beep/beep-released.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            transition: filter .3s ease;
            cursor: pointer;
            &.pressed {
                background-image: url('~@/assets/beep/beep-pressed.png');
                filter: drop-shadow(0 0 30px rgb(240, 67, 66));
            }
            &.disabled {
                pointer-events: none;
                cursor: initial;
            }
            @media (max-width: 879px) {
                width: 80px;
                height: 60px;
            }
        }
        .progress {
            position: absolute;
            top: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 0 50px;
            color: #ED766E;
            font-size: 32px;
            opacity: 0;
            transition: opacity .3s;
            @media (max-width: 879px) {
                padding: 0 20px;
                font-size: 20px;
            }
            &.visible {
                opacity: 1;
            }
            .bar {
                position: relative;
                width: 100%;
                height: 29px;
                background-image: url('~@/assets/beep/progressbar.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 29px;
                // overflow: hidden;
                border: 1px solid #fff;
                box-sizing: content-width;
                .green {
                    position: absolute;
                    top: 1px;
                    bottom: 1px;
                    left: 1px;
                    right: 1px;
                    width: 0;
                    background-color: #8EED6E;
                }
            }
        }
    }
</style>