<template>
  <v-container class="h-screen position-relative" fluid>
    <v-img
      class="position-absolute h-100 w-100 top-0 left-0"
      style="filter: blur(3px)"
      src="/assets/background.jpg"
      cover
    />

    <v-row class="h-100 d-flex justify-center align-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-6 rounded-lg bg-black">
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <span class="text-h4 font-weight-bold">Sign in</span>
              <v-text-field
                v-model="username"
                label="Username"
                name="login"
                class="mt-4"
                variant="outlined"
                prepend-icon="mdi-account"
                type="text"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                variant="outlined"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>

              <v-checkbox v-model="rememberMe" label="Ghi nhớ tôi"></v-checkbox>

              <v-btn color="primary" type="submit" block>Sign In</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn text color="primary">Forgot password?</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <span>Are you new ?</span>
            <nuxt-link to="/signup">
              <v-btn text color="primary">Sign Up</v-btn>
            </nuxt-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
definePageMeta({
  layout: "auth",
});
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
    };
  },
  computed: {
    ...mapState("auth", ["isFetching", "error", "currentUser"]),
  },
  methods: {
    ...mapActions("auth", ["login"]),
    async onSubmit() {
      try {
        // console.log("Attempting to login with:", this.username, this.password);
        const data = await this.login({
          username: this.username,
          password: this.password,
        });
        // console.log("Login success", data);
        this.$router.push("/");
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
  },
};
</script>

<style scoped></style>
