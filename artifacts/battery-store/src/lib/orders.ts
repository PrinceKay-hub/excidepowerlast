import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  FirestoreError,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { CartItem } from "@/context/CartContext";

export interface OrderData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order extends OrderData {
  id: string;
  items: OrderLineItem[];
  subtotal: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Timestamp | null;
}

export type OrderStatus = Order["status"];

export async function placeOrder(
  orderData: OrderData,
  items: CartItem[],
  subtotal: number
): Promise<string> {
  if (!isFirebaseConfigured) {
    console.warn("[Orders] Firebase not configured — order not saved to Firestore.");
    return "demo-order-" + Date.now();
  }
  if (items.length === 0) throw new Error("Cannot place an order with no items.");
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    items: items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
      lineTotal: item.product.price * item.quantity,
    })),
    subtotal,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: FirestoreError) => void
) {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      callback(orders);
    },
    (err) => {
      console.error("[Orders] Firestore subscription error:", err.code, err.message);
      onError?.(err);
    }
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, "orders", orderId), { status });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isFirebaseConfigured) return null;
  const { getDoc } = await import("firebase/firestore");
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const { where } = await import("firebase/firestore");
  const q = query(
    collection(db, "orders"),
    where("email", "==", email.toLowerCase().trim()),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}
