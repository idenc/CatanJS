<template>
  <div id="container">
    <button
      id="road-button"
      class="btn btn-primary btn-block animatedFadeInUp"
      @click="buildRoadClicked"
    >
      road
    </button>
    <button
      id="settlement-button"
      class="btn btn-primary btn-block animatedFadeInUp"
      @click="buildSettlementClicked"
    >
      settle
    </button>
    <button
      id="build-button"
      class="btn btn-primary btn-block sidebar-main-button"
      @click="buildClicked"
    >
      Build
    </button>
  </div>
</template>

<script>
export default {
  name: "BuildButton",
  props: {
    isTurn: Boolean(false),
  },
  mounted: function () {
    document.addEventListener('click', (e) => {
      if (this.$route.name === 'Game' && e.target.id !== 'build-button') {
        this.closeBuildButton();
      }
    });
  },
  methods: {
    closeBuildButton() {
      const roadButton = document.getElementById('road-button');
      const settlementButton = document.getElementById('settlement-button');

      roadButton.classList.remove("animated", "fadeInUp");
      settlementButton.classList.remove("animated", "fadeInUp");
    },
    buildClicked() {
      if (this.isTurn) {
        const buildButton = document.getElementById('build-button');
        const buffer = 10;
        let settlementBtnPosition = buildButton.offsetLeft + buildButton.offsetWidth / 2 + buffer;
        const roadBtnPosition = window.innerWidth - buildButton.offsetLeft - (buildButton.offsetWidth / 2) + buffer;

        const roadButton = document.getElementById('road-button');
        roadButton.style.right = `${roadBtnPosition}px`;
        roadButton.classList.add("animated", "fadeInUp");

        const settlementButton = document.getElementById('settlement-button');
        settlementButton.style.left = `${settlementBtnPosition}px`;
        settlementButton.classList.add("animated", "fadeInUp");
      }
    },
    buildRoadClicked() {
      this.$emit('buildStarted', 'road');
    },
    buildSettlementClicked() {
      this.$emit('buildStarted', 'settlement');
    }
  }
}
</script>

<style scoped>
#build-button {
  height: 100%;
}

#container {
  position: relative;
}

.btn-block + .btn-block {
  margin: 0;
}

@keyframes fadeInUp {
  from {
    transform: translate3d(0, 0, 0)
  }

  to {
    transform: translate3d(0, -50px, 0);
    opacity: 1
  }
}

@-webkit-keyframes fadeInUp {
  from {
    transform: translate3d(0, 0, 0)
  }

  to {
    transform: translate3d(0, -50px, 0);
    opacity: 1
  }
}

.animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
  -webkit-animation-duration: 0.5s;
  -webkit-animation-fill-mode: both
}

.animatedFadeInUp {
  display: none;
  position: absolute;
  width: min-content;
}

.fadeInUp {
  display: block;
  opacity: 0;
  animation-name: fadeInUp;
  -webkit-animation-name: fadeInUp;
}

@media (max-width: 768px) {
  /* #build-button button {
    margin: 0;
    width: 30%;
    padding: 0.25rem 0.25rem;
  } */
}

</style>
