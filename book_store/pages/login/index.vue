<template>
  <div class="w-full max-w-[1040px] sm:border sm:border-border">
    <Login
      v-if="view === 'login'"
      :notice="notice"
      @signed-in="onSignedIn"
      @toggle-sign-up="router.push('/signup')"
      @toggle-forgot-password="view = 'forgot'"
    />
    <ForgotPassword v-else @back-to-login="view = 'login'" />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();

const view = ref<"login" | "forgot">("login");

const notice = computed(() =>
  route.query.registered ? "Your account is ready. Sign in to continue." : ""
);

function onSignedIn() {
  const redirect = route.query.redirect;
  const isLocal =
    typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//");
  router.push(isLocal ? redirect : "/");
}
</script>
