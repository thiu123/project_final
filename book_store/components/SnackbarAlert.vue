<template>
    <v-snackbar
      v-model="visible"
      :timeout="timeout"
      :color="color"
      location="bottom"
      rounded="pill"
      variant="elevated"
      class="text-center"
    >
      <div class="d-flex align-center">
        <v-icon
          :icon="color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
          class="mr-2"
        />
        <span>{{ text }}</span>
      </div>
  
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="close" />
      </template>
    </v-snackbar>
  </template>
  
  <script>
  export default {
    name: 'SnackbarAlert',
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: 'success',
      },
      timeout: {
        type: Number,
        default: 2000,
      },
    },
    computed: {
      visible: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        },
      },
    },
    methods: {
      close() {
        this.visible = false;
      },
    },
  };
  </script>
  