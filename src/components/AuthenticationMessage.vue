<template>
  <p v-if="messages.length">
    <ul>
      <li
        v-for="(message, index) in messages"
        :key="index"
      >
        <div
          :class="alertType"
          class="alert alert-dismissible fade show"
          role="alert"
        >
          {{ message.msg ? message.msg : message }}
          <button
            type="button"
            class="close"
            data-dismiss="alert"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </li>
    </ul>
  </p>
</template>

<script>
export default {
  name: "AuthenticationMessage",
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    alertType: {
      type: String,
      default: ''
    },
  }
}
</script>

<style scoped>

ul {
  padding: 0;
}

li {
  list-style-type: none;
}

</style>
