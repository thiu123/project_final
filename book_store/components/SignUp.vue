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

          <v-card-text class="w-50 d-flex flex-column justify-center pt-0">
            <v-form @submit.prevent="onSubmit">
              <div class="text-h4 mb-2">Welcome to my BookStore</div>
              <span class="text-h6">Sign Up</span>
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                class="mt-2"
                variant="outlined"
                prepend-icon="mdi-email"
                type="email"
              ></v-text-field>

              <v-text-field
                v-model="username"
                label="Username"
                name="login"
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

              <v-btn color="primary" type="submit" block>Sign Up</v-btn>
              <v-divider></v-divider>

              <v-card-actions class="justify-center">
                <span>Already have an account?</span>
                <nuxt-link to="/login">
                  <v-btn text color="primary">Sign In</v-btn>
                </nuxt-link>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Signup",
  data() {
    return {
      username: "",
      email: "",
      password: "",
    };
  },
  methods: {
    ...mapActions("auth", ["register"]),
    async onSubmit() {
      try {
        const data = await this.register({
          username: this.username,
          email: this.email,
          password: this.password,
        });
        this.$router.push("/login");
        return data;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
