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
    }
    seeded = true;
  } catch {
    // Firestore not yet configured — ignore, fall back to hardcoded data
  }
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: () => void
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
    () => {
      onError?.();
    }
  );
}

export async function addProduct(product: NewProduct): Promise<string> {
  const ref = await addDoc(collection(db, "products"), product);
  return ref.id;
}

export async function updateProduct(
  id: string,
  product: Partial<NewProduct>
): Promise<void> {
  await updateDoc(doc(db, "products", id), product as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function setProductDoc(id: string, product: Product): Promise<void> {
  await setDoc(doc(db, "products", id), product);
}
