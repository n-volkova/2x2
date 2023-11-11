<template>
  <div
    v-if="messageVisible"
    class="message-wrapper"
  >
    <transition
      name="fade"
      mode="out-in"
    >
      <stampede
        v-if="stampedeVisible"
        :fixedutm="utm"
        @codeSent="onCodeSent($event)"
      />

      <div
        v-else
        class="message"
      >
        <p v-if="isClient">
          Вы в игре! Пройдите все 6 уровней и участвуйте в розыгрыше топового мерча в лимитированном дизайне от Рокетбанка и 2х2.
          <br /> Погнали?
        </p>
        <p v-else>
          Вы ещё не клиент! Нужно срочно это исправить. Закажите карту Рокетбанка, получите вместе с ней ультраклассный стикерпак и участвуйте в розыгрыше топового мерча в лимитированном дизайне от Рокетбанка и 2х2.
        </p>
        <div
          class="play-btn"
          @click="startGame"
        >
          Играть!
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  data () {
    return {
      messageVisible: false,
      stampedeVisible: true,
      isClient: false,
    };
  },
  computed: {
    utm() {
      return window.location.search;
    }
  },
  mounted() {
    this.startGame();
  },
  methods: {
    startGame() {
      this.$audio.start('button');
      this.messageVisible = false;
      setTimeout(() => {
        this.$emit('changeScreen', 'beep');
      }, 100);
    }
  }
};
</script>

<style lang="scss">
@media (min-width: 880px) {
    .stampede-wrapper {
        width: 400px !important;
    }
}
.container .stampede-wrapper {
    flex-direction: column;
    min-height: auto;
    .input-container {
        width: 100%;
    }
    form {
        width: 100%;
    }
    .text {
        display: flex;
        align-items: flex-end;
        max-width: 100% !important;
        min-height: 82px;
        margin-bottom: 20px;
    }
    input.code {
        width: 100%;
    }
    .input-container input {
        width: auto !important;
    }
    p {
        line-height: 24px;
        font-size: 18px;
        font-weight: 700;
    }
}
.message p {
    max-width: 500px;
    width: 100%;
    font-family: 'pragmatica-extended', sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
    font-size: 18px;
    @media (max-width: 879px) {
        padding: 0 20px;
        font-size: 17px;
    }
}
.play-btn {
    height: 60px;
    margin-top: 20px;
    line-height: 50px;
    font-size: 18px;
    font-weight: 700;
    line-height: 60px;
    border-radius: 10px;
    background-color: #fff;
    color: #000;
    font-family: 'pragmatica-extended', sans-serif;
    text-align: center;
    transition: background-color .3s ease;
    cursor: pointer;
    &:hover {
        background-color: rgba(255, 215, 13, 0.9);
    }
    @media (max-width: 879px) {
        margin-left: 20px;
        margin-right: 20px;
    }
}
.get-card-btn {
    display: block;
    height: 60px;
    margin-top: 20px;
    line-height: 50px;
    font-size: 18px;
    font-weight: 700;
    line-height: 60px;
    border-radius: 10px;
    background-color: #fff;
    color: #000;
    font-family: 'pragmatica-extended', sans-serif;
    text-align: center;
    transition: background-color .3s ease;
    text-decoration: none;
    outline: none;
    cursor: pointer;
    &:hover {
        background-color: rgba(255, 215, 13, 0.9);
    }
    @media (max-width: 879px) {
        margin-left: 20px;
        margin-right: 20px;
    }
}
</style>