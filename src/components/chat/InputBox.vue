<template>
  <!-- Modified from  https://codepen.io/visualcookie/pen/kkwxPm-->
  <div>
    <input
      type="text"
      :value="value"
      class="form__field"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
    >
    <button
      type="submit"
      class="btn btn--primary btn--inside uppercase"
    >
      Send
    </button>
  </div>
</template>

<script>
export default {
  name: "InputBox",
  props: ['placeholder', 'value']
}
</script>

<style scoped>
:root {
  background: #f5f6fa;
  color: #9c9c9c;
  font: 1rem "PT Sans", sans-serif;
}

a {
  color: inherit;
}

a:hover {
  color: #7f8ff4;
}

.uppercase {
  text-transform: uppercase;
}

.btn {
  display: inline-block;
  background: transparent;
  color: inherit;
  font: inherit;
  border: 0;
  outline: 0;
  padding: 0;
  -webkit-transition: all 200ms ease-in;
  transition: all 200ms ease-in;
  cursor: pointer;
}

.btn--primary {
  background: #6465e9;
  color: #fff;
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  padding: 12px 36px;
}

.btn--primary:hover {
  background: #6c7ff2;
}

.btn--primary:active {
  background: #7f8ff4;
  box-shadow: inset 0 0 10px 2px rgba(0, 0, 0, 0.2);
}

.btn--inside {
  margin-left: -96px;
}

.form__field {
  background: #fff;
  flex: 1;
  color: #5b5a5a;
  font: inherit;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
  border: 0;
  outline: 0;
  padding: 22px 18px;
}

@media (max-height: 600px) {
  .form__field {
    padding: 0.25rem 1rem;
    width: 0;
  }

  .btn {
    padding: 0.25rem 1rem;
  }

  .btn--inside {
    margin-left: 0;
  }

}

</style>
