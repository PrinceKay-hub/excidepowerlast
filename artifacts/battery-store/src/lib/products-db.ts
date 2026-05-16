import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  FirestoreError,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { products as seedData, Product } from "@/data/products";

export type { Product };
export type NewProduct = Omit<Product, "id">;

let seeded = false;

export async function seedIfEmpty(): Promise<void> {
  if (!isFirebaseConfigured || seeded) return;
  try {
    const snapshot = await getDocs(collection(db, "products"));
    if (snapshot.empty) {
      const batch = writeBatch(db);
      seedData.forEach((p) => {
        const ref = doc(db, "products", p.id);
        batch.set(ref, p);
      });
      await batch.commit();
      console.info(`[Products] Seeded ${seedData.length} products to Firestore.`);
    }
    seeded = true;
  } catch (err) {
    console.warn("[Products] Could not seed Firestore — falling back to local data.", err);
  }
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (err?: FirestoreError) => void
) {
  if (!isFirebaseConfigured) {
    callback(seedData);
    return () => {};
  }
  return onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const list = snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id } as Product)
      );
      list.sort((a, b) => {
        const numA = parseInt(a.id, 10);
        const numB = parseInt(b.id, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.name.localeCompare(b.name);
      });
      callback(list);
    },
    (err) => {
      console.error("[Products] Firestore subscription error:", err.code, err.message);
      onError?.(err);
    }
  );
}

export async function addProduct(product: NewProduct): Promise<string> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  const ref = await addDoc(collection(db, "products"), product);
  return ref.id;
}

export async function updateProduct(
  id: string,
  product: Partial<NewProduct>
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await updateDoc(doc(db, "products", id), product as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, "products", id));
}

export async function setProductDoc(id: string, product: Product): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "products", id), product);
}
