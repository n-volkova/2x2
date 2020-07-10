<template>
    <div class="logo-container" @click="startGame">
        <div class="grey-sheet">
            <div class="game-logo" :class="`${game}-logo`"></div>
            <div class="start-btn"></div>
            <div class="copyright">ROCKET GAMES PRODUCTION 2019</div>
        </div>
    </div>
</template>

<script>

export default {
    data () {
        return {
        }
    },
    props: {
        game: {
            type: String
        },
    },
    mounted() {
        this.$audio.start('startup')
    },
    methods: {
        startGame() {
            this.$emit('startGame')
            this.$audio.stop('startup')
        }
    }
}
</script>

<style lang="scss">
.logo-container {
    position: absolute;
    height: 542px;
    // height: 100%;
    width: 100%;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (min-width: 880px) {
        top: 50%;
        margin-top: -271px;
    }
    @media (max-width: 879px) {
        top: 20px;
        margin-top: 0;
    }
}

.grey-sheet {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    background-color: #0A0A0A;

    @media (max-width: 879px) {
        width: 648px;
        height: auto;
    }
    @media (min-width: 880px) {
        width: 648px;
        height: 542px;
    }
}

.beep-logo {
    margin-top: 151px;
    width: 566px;
    height: 172px;
    @media (min-width: 880px) {
        background-image: url('~@/assets/beep/beep-logo.png');
    }
    @media (max-width: 879px) {
        margin-top: 0;
        margin-bottom: 50px;
        background-image: url('~@/assets/beep/beep-logo-mobile.png');
    }
}

.tanks-logo {
    margin-top: 92px;
    width: 542px;
    height: 266px;
    @media (min-width: 880px) {
        background-image: url('~@/assets/tanks/tanks-logo.png');
    }
    @media (max-width: 879px) {
        margin-top: 0;
        margin-bottom: 30px;
        background-image: url('~@/assets/tanks/tanks-logo-mobile.png');
    }
}

.office-logo {
    margin-top: 192px;
    width: 536px;
    height: 96px;
    @media (min-width: 880px) {
        background-image: url('~@/assets/office/office-logo.png');
    }
    @media (max-width: 879px) {
        margin-top: 0;
        margin-bottom: 65px;
        background-image: url('~@/assets/office/office-logo-mobile.png');
    }
}

.pizza-logo {
    margin-top: 67px;
    width: 442px;
    height: 313px;
    @media (min-width: 880px) {
        background-image: url('~@/assets/pizza/pizza-logo.png');
    }
    @media (max-width: 879px) {
        margin-top: 0;
        margin-bottom: 40px;
        background-image: url('~@/assets/pizza/pizza-logo-mobile.png');
    }
}

.ff-logo {
    margin-top: 179px;
    width: 584px;
    height: 186px;
    @media (min-width: 880px) {
        background-image: url('~@/assets/ff/ff-logo.png');
    }
    @media (max-width: 879px) {
        margin-top: 0;
        margin-bottom: 25px;
        background-image: url('~@/assets/ff/ff-logo-mobile.png');
    }
}

.game-logo {
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    @media (max-width: 879px) {
        width: 90%;
    }
}

.start-btn {
    position: absolute;
    bottom: 13vw;
    width: 212px;
    height: 12px;
    margin: 0 auto;
    background-image: url('~@/assets/start-btn.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    visibility: visible;
    cursor: pointer;
    opacity: 1;
    animation: blink 1s linear .5s infinite;

    @media (min-width: 879px) {
        height: 22px;
        bottom: 75px;
    }
}
@keyframes blink {
    50% {
        opacity: 0;
    }
}

.copyright {
    position: absolute;
    bottom: 20px;
    text-align: center;
    font-size: 10px;
    color: #373737;
    letter-spacing: -.3px;
}

</style>