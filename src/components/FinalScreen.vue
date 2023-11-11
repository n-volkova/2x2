<template>
  <div class="final-message">
    <h2>Ура, все игры пройдены!</h2>
    <p class="share">
      Поделитесь с друзьями
    </p>

    <div class="social">
      <a
        :href="fbLink"
        alt="фейсбук"
        target="_blank"
      />
      <a
        :href="vkLink"
        alt="вконтакте"
        target="_blank"
      />
      <a
        :href="twitterLink"
        alt="твиттер"
        target="_blank"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinalScreen',

  data () {
    return {
      messageVisible: 'Скрестите пальцы, 9 января мы объявим победителей на этой страничке.'
    };
  },

  computed: {
    inviteUrl() {
      return 'https://n-volkova.github.io/2x2/';
    },

    fbLink() {
      return `https://www.facebook.com/sharer.php?u=${this.inviteUrl}&hashtag=%23рокетбанк_2х2`;
    },

    vkLink() {
      return `https://vk.com/share.php?url=${this.inviteUrl}&title=РОКЕТБАНК_2х2`;
    },

    twitterLink() {
      return (
        'https://twitter.com/intent/tweet?hashtags=рокетбанк_2х2,рокетбанк,2х2&&related=rocketbank' +
                `&text=РОКЕТБАНК_2х2&tw_p=tweetbutton&url=${this.inviteUrl}&via=rocketbank`
      );
    },
  },
};
</script>

<style lang="scss">
.final-message {
    width: 100%;
    font-family: 'pragmatica-extended', sans-serif;
    text-align: center;
    h2 {
        margin-bottom: 30px;
    }
    p {
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
        font-size: 18px;
        @media (max-width: 879px) {
            padding: 0 20px;
        }
    }
    .get-card-btn {
        display: block;
        width: 320px;
        height: 60px;
        margin: 20px auto 0;
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
            width: auto;
            margin-left: 20px;
            margin-right: 20px;
        }
    }

    p.share {
        margin-top: 40px;
    }

    .social {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        a {
            cursor: pointer;
        }

        a:nth-child(1) {
            display: block;
            width: 25px;
            height: 24px;
            background: url('~@/assets/social/s_fb.svg') no-repeat center center;
        }

        a:nth-child(2) {
            display: block;
            width: 33px;
            height: 20px;
            margin-left: 15px;
            background: url('~@/assets/social/s_vk.svg') no-repeat center center;
        }

        a:nth-child(3) {
            display: block;
            width: 28px;
            height: 22px;
            margin-left: 20px;
            background: url('~@/assets/social/s_tw.svg') no-repeat center center;
        }
    }
}
</style>