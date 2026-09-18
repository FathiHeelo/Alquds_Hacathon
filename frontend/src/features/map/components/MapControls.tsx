import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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
  setAvailableOnly,
  setCategoryId,
  setMaximumDistanceKm,
  setMinimumRating,
  setQuery
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.locationRow}>
        <View style={styles.locationIcon}>
          <Ionicons color={colors.primaryPressed} name="location" size={18} />
        </View>
        <View style={styles.locationText}>
          <Text style={styles.eyebrow}>{location.source === "device" ? uiText.map.currentLocation : uiText.map.demoLocation}</Text>
          <Text numberOfLines={1} style={styles.locationLabel}>{location.label}</Text>
        </View>
        <Text style={styles.resultCount}>{resultCount} {uiText.map.techniciansFound}</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons color={colors.textMuted} name="search" size={20} />
        <TextInput
          onChangeText={setQuery}
          placeholder={uiText.map.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={filters.query}
        />
      </View>

      <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
        <FilterChip isSelected={!filters.categoryId} onPress={() => setCategoryId(undefined)}>{uiText.map.allCategories}</FilterChip>
        {serviceCategories.map((category) => (
          <FilterChip
            isSelected={filters.categoryId === category.id}
            key={category.id}
            onPress={() => setCategoryId(category.id)}
          >
            {category.label}
          </FilterChip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
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
      </ScrollView>

      {location.source === "demo" ? <Text style={styles.fallback}>{uiText.map.locationFallback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  locationRow: {
    ...shadows.subtle,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: spacing.sm,
    padding: spacing.sm
  },
  locationIcon: { alignItems: "center", backgroundColor: "#F5E6BE", borderRadius: radius.md, height: 36, justifyContent: "center", width: 36 },
  locationText: { flex: 1 },
  eyebrow: { color: colors.primaryPressed, fontFamily: typography.fontFamily, fontSize: typography.size.xs, fontWeight: typography.weight.bold, textAlign: "right" },
  locationLabel: { color: colors.text, fontFamily: typography.fontFamily, fontSize: typography.size.sm, textAlign: "right", writingDirection: "rtl" },
  resultCount: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.xs, textAlign: "left" },
  searchBox: {
    ...shadows.subtle,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md
  },
  searchInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: typography.size.sm, textAlign: "right", writingDirection: "rtl" },
  chipRow: { flexDirection: "row-reverse", gap: spacing.sm, paddingHorizontal: spacing.xs },
  fallback: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.xs, textAlign: "right", writingDirection: "rtl" }
});
