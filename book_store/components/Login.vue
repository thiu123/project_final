<template>
  <v-container class="h-screen position-relative" fluid>
    <v-row class="h-100 d-flex justify-center align-center">
      <v-col cols="12" sm="8" md="6" lg="8">
        <v-card
          class="elevation-6 rounded-lg bg-white d-flex"
          style="height: 75vh"
        >
          <div class="w-50 h-100">
            <img
              src="assets/bg.jpg"
              class="w-100 h-100"
              style="object-fit: cover"
            />
          </div>

          <v-card-text class="w-50 d-flex flex-column justify-center">
            <v-form @submit.prevent="onSubmit">
              <div class="text-h4 mb-2">Welcome to my BookStore</div>
              <span class="text-h6">Sign in</span>
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

              <v-checkbox v-model="rememberMe" label="Remember me"></v-checkbox>

              <v-btn color="primary" type="submit" block>Sign In</v-btn>

              <v-card-actions class="justify-center">
                <v-btn text color="primary">Forgot password?</v-btn>
              </v-card-actions>

              <v-divider></v-divider>

              <v-card-actions class="justify-center">
                <span>Are you new?</span>
                <div @click="$emit('toggleLinkSignUp', 'sign-up')">
                  <v-btn text color="primary">Sign Up</v-btn>
                </div>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
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
