import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { Image, Text, View, type ImageSourcePropType } from "react-native";
import type { Technician } from "../../../domain/models/technician";
import { colors } from "../../../shared/theme";

// Portraits from the approved Stitch Customer Map Home export.
const portraits: Record<string, ImageSourcePropType> = {
  "tech-tariq-maqdisi": require("../../../../assets/technicians/tech-tariq-maqdisi.jpg"),
  "tech-mahmoud-khatib": require("../../../../assets/technicians/tech-mahmoud-khatib.jpg"),
  "tech-samer-halawani": require("../../../../assets/technicians/tech-samer-halawani.jpg")
};

export function TechnicianPortrait({ technician, size = 38, round = false }: { technician: Technician; size?: number; round?: boolean }) {
  return <View style={{ width: size, height: size, borderRadius: round ? size / 2 : 12, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <LocalizedText style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>{technician.name.charAt(0)}</LocalizedText>
    {portraits[technician.id] ? <Image source={portraits[technician.id]} style={{ position: "absolute", width: "100%", height: "100%" }} /> : null}
  </View>;
}
