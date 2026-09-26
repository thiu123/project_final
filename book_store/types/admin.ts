import type { Component } from "vue";

export interface AdminStat {
  label: string;
  value: string | number;
  icon?: Component;
  hint?: string;
}
