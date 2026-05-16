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
import { db } from "./firebase";

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
  const docRef = await addDoc(collection(db, "reviews"), {
    ...review,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToReviews(
  productId: string,
  callback: (reviews: Review[]) => void
) {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Review)
    );
    callback(reviews);
  });
}
