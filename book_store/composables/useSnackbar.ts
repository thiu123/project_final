import { reactive } from "vue";
import type { SnackbarPayload } from "@/types";

export type SnackbarColor = NonNullable<SnackbarPayload["color"]>;

/**
 * Local state for one `<SnackbarAlert>`.
 *
 * Every screen that reports the outcome of an action used to hand-roll the same
 * three refs (`showSnackbar` / `snackbarText` / `snackbarColor`) plus a helper
 * that sets all three. This is that helper, once.
 *
 * It is deliberately per-component rather than a store: two screens showing a
 * toast at the same time is not a case worth coordinating, and a shared
 * singleton would make an unmounted page able to talk over the current one.
 *
 * ```vue
 * const { snackbar, notify, notifyError } = useSnackbar();
 * // <SnackbarAlert v-model="snackbar.show" :text="snackbar.message" :color="snackbar.color" />
 * ```
 */
export function useSnackbar() {
  const snackbar = reactive({
    show: false,
    message: "",
    color: "success" as SnackbarColor,
  });

  function notify(message: string, color: SnackbarColor = "success") {
    snackbar.message = message;
    snackbar.color = color;
    snackbar.show = true;
  }

  const notifyError = (message: string) => notify(message, "error");

  /** For `@show-snackbar` events, which carry a `SnackbarPayload`. */
  function notifyFromPayload(payload: SnackbarPayload) {
    notify(payload.message, payload.color ?? "success");
  }

  return { snackbar, notify, notifyError, notifyFromPayload };
}
