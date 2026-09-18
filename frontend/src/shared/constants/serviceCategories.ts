import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

import type { ServiceCategoryId } from "../../domain/models/technician";

export interface ServiceCategory {
  id: ServiceCategoryId;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

export const serviceCategories: readonly ServiceCategory[] = [
  { id: "electrical", label: "كهرباء", icon: "flash-outline" },
  { id: "plumbing", label: "سباكة", icon: "water-outline" },
  { id: "ac", label: "تكييف", icon: "snow-outline" },
  { id: "appliances", label: "أجهزة منزلية", icon: "home-outline" },
  { id: "carpentry", label: "نجارة", icon: "hammer-outline" },
  { id: "electronics", label: "إلكترونيات", icon: "hardware-chip-outline" },
  { id: "general", label: "صيانة عامة", icon: "build-outline" }
] as const;
