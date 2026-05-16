import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  body: string;
  createdAt: Timestamp | null;
}

export interface NewReview {
  productId: string;
  author: string;
  rating: number;
  body: string;
}

export async function submitReview(review: NewReview): Promise<string> {
  if (!isFirebaseConfigured) {
    console.warn("[Reviews] Firebase not configured — review not saved.");
    return "demo-review-" + Date.now();
  }
  const docRef = await addDoc(collection(db, "reviews"), {
    ...review,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToReviews(
  productId: string,
  callback: (reviews: Review[]) => void,
  onError?: () => void
) {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const reviews = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Review)
      );
      callback(reviews);
    },
    (err) => {
      console.error("[Reviews] Firestore subscription error:", err.code, err.message);
      onError?.();
    }
  );
}
