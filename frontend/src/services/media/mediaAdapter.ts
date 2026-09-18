import * as ImagePicker from "expo-image-picker";
import type { RequestMedia } from "../../domain/models/repairRequest";
import { AppError } from "../../shared/errors/AppError";

export async function pickRequestMedia(): Promise<RequestMedia[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"], allowsMultipleSelection: true, quality: 0.8
    });
    if (result.canceled) return [];
    return result.assets.map((asset) => ({ type: asset.type === "video" ? "video" : "image",
      uri: asset.uri, name: asset.fileName ?? undefined, mimeType: asset.mimeType ?? undefined }));
  } catch (cause) {
    throw new AppError("UNKNOWN_ERROR", "تعذر إرفاق الملف. حاول مجدداً؛ تفاصيل طلبك محفوظة.", cause);
  }
}
