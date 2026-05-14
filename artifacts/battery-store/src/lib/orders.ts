import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

export interface Order extends OrderData {
  id: string;
  items: CartItem[];
  subtotal: number;
  status: string;
  createdAt: unknown;
}

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
