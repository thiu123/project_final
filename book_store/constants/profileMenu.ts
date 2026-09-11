import type { Component } from "vue";
import { Heart, Lock, Package, Star, User } from "lucide-vue-next";

/** Tabs of `/profiles`, as listed in the account dropdown. */
export const PROFILE_MENU: { tab: string; label: string; icon: Component }[] = [
  { tab: "personal", label: "Personal Info", icon: User },
  { tab: "orders", label: "Orders", icon: Package },
  { tab: "favorites", label: "Favorites", icon: Heart },
  { tab: "reviews", label: "My Reviews", icon: Star },
  { tab: "password", label: "Change Password", icon: Lock },
];
