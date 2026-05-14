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
} from "firebase/firestore";
import { db } from "./firebase";
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
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), { status });
}
