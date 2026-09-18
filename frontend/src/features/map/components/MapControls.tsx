import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { CustomerLocation } from "../../../domain/models/location";
import type { ServiceCategoryId } from "../../../domain/models/technician";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { uiText } from "../../../shared/constants/uiText";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import type { CustomerMapFilters } from "../hooks/useCustomerMap";
import { FilterChip } from "./FilterChip";

interface MapControlsProps {
  filters: CustomerMapFilters;
  location: CustomerLocation;
  resultCount: number;
  onNotifications(): void;
  onTechnicianMode(): void;
  onVoice(): void;
  setAvailableOnly(value: boolean): void;
  setCategoryId(value?: ServiceCategoryId): void;
  setMaximumDistanceKm(value: number): void;
  setMinimumRating(value: number): void;
  setQuery(value: string): void;
}

export function MapControls({
  filters,
  location,
  resultCount,
  onNotifications,
  onTechnicianMode,
  onVoice,
  setAvailableOnly,
  setCategoryId,
  setMaximumDistanceKm,
  setMinimumRating,
  setQuery
}: MapControlsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const categoryOrder = ["plumbing", "electrical", "ac", "carpentry", "appliances", "electronics", "general"];
  const orderedCategories = [...serviceCategories].sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));
  const categoryColor = (id: string) => id === "electrical" ? "#E35D4F" : id === "ac" ? "#3B82B6" : id === "plumbing" ? "#2E81C7" : colors.textMuted;
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onTechnicianMode} style={styles.modeButton}>
          <Ionicons color={colors.primaryPressed} name="swap-horizontal" size={14} />
          <Text style={styles.modeLabel}>وضع الفني</Text>
        </Pressable>
        <Pressable accessibilityLabel="التنبيهات" onPress={onNotifications} style={styles.notificationButton}>
          <Ionicons color={colors.textMuted} name="notifications-outline" size={18} />
          <View style={styles.notificationDot} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View accessibilityLabel={location.label} style={styles.locationPill}>
          <View><Text style={styles.locationLabel}>عَمِّرها القدس</Text><Text style={styles.tagline}>من قلب القدس نبنيها بأيدينا</Text></View>
          <View accessibilityLabel="صورة صاحب الحساب الافتراضية" style={styles.accountAvatar}>
            <Ionicons color={colors.primaryPressed} name="person" size={17} />
          </View>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Pressable accessibilityLabel="فلاتر البحث" accessibilityState={{ expanded: showFilters }} onPress={() => setShowFilters(!showFilters)} style={styles.searchControl}><Ionicons color={colors.primaryPressed} name="search" size={18} /></Pressable>
        <TextInput
          onChangeText={setQuery}
          placeholder="ما المشكلة التي تريد إصلاحها في بيتك بالقدس؟"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={filters.query}
        />
        <Pressable accessibilityLabel="طلب بالصوت أو الصورة" onPress={onVoice} style={styles.voice}><Ionicons name="mic-outline" size={13} color={colors.primaryPressed} /><Text style={styles.voiceLabel}>صوتك</Text></Pressable>
      </View>

      <ScrollView style={styles.categoryScroll} contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FilterChip isSelected={!filters.categoryId} onPress={() => setCategoryId(undefined)}>
          {`${uiText.map.allCategories} ${resultCount} فني`}
        </FilterChip>
        {orderedCategories.map((category) => (
          <FilterChip
            icon={category.icon}
            iconColor={categoryColor(category.id)}
            isSelected={filters.categoryId === category.id}
            key={category.id}
            onPress={() => setCategoryId(category.id)}
          >
            {category.label}
          </FilterChip>
        ))}
      </ScrollView>

      {showFilters ? <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FilterChip isSelected={filters.availableOnly} onPress={() => setAvailableOnly(!filters.availableOnly)}>
          {filters.availableOnly ? uiText.map.availableNow : uiText.map.allAvailability}
        </FilterChip>
        {[0, 4.5, 4.8].map((rating) => (
          <FilterChip isSelected={filters.minimumRating === rating} key={rating} onPress={() => setMinimumRating(rating)}>
            {rating === 0 ? `${uiText.map.minimumRating}: ${uiText.map.allCategories}` : `★ ${rating}+`}
          </FilterChip>
        ))}
        {[2, 5, 10].map((distance) => (
          <FilterChip isSelected={filters.maximumDistanceKm === distance} key={distance} onPress={() => setMaximumDistanceKm(distance)}>
            {distance} {uiText.map.kilometers}
          </FilterChip>
        ))}
      </ScrollView> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingHorizontal: 12, paddingBottom: spacing.sm },
  topRow: { direction: "ltr", alignItems: "center", flexDirection: "row", gap: spacing.sm },
  modeButton: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: radius.round, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 10, paddingVertical: 7 },
  modeLabel: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: typography.weight.bold, writingDirection: "rtl" },
  notificationButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.round, height: 32, justifyContent: "center", width: 32 },
  notificationDot: { backgroundColor: colors.primary, borderColor: colors.background, borderRadius: radius.round, borderWidth: 1, height: 7, position: "absolute", right: 5, top: 5, width: 7 },
  locationPill: {
    ...shadows.subtle,
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: spacing.sm,
    justifyContent: "center",
    maxWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  locationLabel: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: typography.weight.bold, textAlign: "right", writingDirection: "rtl" },
  tagline: { color: "#B29243", fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" },
  accountAvatar: { alignItems: "center", backgroundColor: "#F6F1E4", borderColor: "#E8D8A5", borderRadius: 15, borderWidth: 1, height: 30, justifyContent: "center", width: 30 },
  voice: { flexDirection: "row-reverse", alignItems: "center", gap: 3, backgroundColor: "#FCF9F0", borderRadius: 12, borderWidth: 1, borderColor: colors.border, minHeight: 30, paddingHorizontal: 6 },
  voiceLabel: { color: colors.primaryPressed, fontSize: 11, fontFamily: typography.fontFamily },
  searchControl: { minHeight: 40, justifyContent: "center", width: 26, alignItems: "center" },
  searchBox: {
    ...shadows.subtle,
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: 8,
    direction: "ltr"
  },
  searchInput: { color: colors.text, flex: 1, minHeight: 32, paddingHorizontal: 4, borderWidth: 1, borderColor: "#D5DBE4", fontFamily: typography.fontFamily, fontSize: 11, textAlign: "right", writingDirection: "rtl" },
  categoryScroll: { direction: "rtl", flexGrow: 0 },
  chipRow: { flexDirection: "row", gap: 5, paddingVertical: 2 },
  fallback: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.xs, textAlign: "right", writingDirection: "rtl" }
});
