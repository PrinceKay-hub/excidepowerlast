import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  FirestoreError,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryEntry {
  productId: string;
  status: StockStatus;
}

export async function setStockStatus(
  productId: string,
  status: StockStatus
): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn("[Inventory] Firebase not configured — stock status not saved.");
    return;
  }
  await setDoc(doc(db, "inventory", productId), {
    productId,
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToInventory(
  callback: (inventory: Record<string, StockStatus>) => void,
  onError?: (err: FirestoreError) => void
) {
  if (!isFirebaseConfigured) {
    callback({});
    return () => {};
  }
  return onSnapshot(
    collection(db, "inventory"),
    (snapshot) => {
      const map: Record<string, StockStatus> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data() as { status: StockStatus };
        map[d.id] = data.status;
      });
      callback(map);
    },
    (err) => {
      console.error("[Inventory] Firestore subscription error:", err.code, err.message);
      onError?.(err);
    }
  );
}
