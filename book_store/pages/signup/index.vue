<template>
  <v-container class="h-screen position-relative" fluid>
    <!-- <v-img
      class="position-absolute h-100 w-100 top-0 left-0"
      style="filter: blur(3px)"
      src="/assets/background.jpg"
      cover
    /> -->

    <v-row class="h-100 d-flex justify-center align-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-6 rounded-lg bg-black">
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <span class="text-h4 font-weight-bold">Sign Up</span>
              <v-text-field
                v-model="username"
                label="Username"
                name="username"
                class="mt-4"
                variant="outlined"
                prepend-icon="mdi-account"
                type="text"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                variant="outlined"
                prepend-icon="mdi-email"
                type="email"
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
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <span>Already have an account?</span>
            <nuxt-link to="/login">
              <v-btn text color="primary">Sign In</v-btn>
            </nuxt-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
definePageMeta({
  layout: "auth",
});
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
