import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export type UploadProgress = { state: "running"; percent: number } | { state: "done"; url: string } | { state: "error"; message: string };

export function uploadProductImage(
  file: File,
  onProgress: (p: UploadProgress) => void
): () => void {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  task.on(
    "state_changed",
    (snap) => {
      const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      onProgress({ state: "running", percent });
    },
    (err) => {
      if (err.code === "storage/unauthorized") {
        onProgress({ state: "error", message: "Storage permission denied — update Firebase Storage rules to allow writes." });
      } else {
        onProgress({ state: "error", message: err.message });
      }
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      onProgress({ state: "done", url });
    }
  );

  return () => task.cancel();
}
