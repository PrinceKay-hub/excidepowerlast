import emailjs from "@emailjs/browser";
import { CartItem } from "@/context/CartContext";
import { OrderData } from "./orders";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const ADMIN_TEMPLATE = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
const CUSTOMER_TEMPLATE = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;

function isConfigured(): boolean {
  const ok = !!(PUBLIC_KEY && SERVICE_ID && ADMIN_TEMPLATE && CUSTOMER_TEMPLATE);
  if (!ok) {
    console.warn("[EmailJS] Missing env vars:", {
      VITE_EMAILJS_PUBLIC_KEY: !!PUBLIC_KEY,
      VITE_EMAILJS_SERVICE_ID: !!SERVICE_ID,
      VITE_EMAILJS_ADMIN_TEMPLATE_ID: !!ADMIN_TEMPLATE,
      VITE_EMAILJS_CUSTOMER_TEMPLATE_ID: !!CUSTOMER_TEMPLATE,
    });
  }
  return ok;
}

function buildItemsList(items: CartItem[]): string {
  return items
    .map((i) => `${i.product.name} x${i.quantity} — GHS ${(i.product.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

export async function sendOrderEmails(
  order: OrderData,
  items: CartItem[],
  subtotal: number,
  orderId: string
): Promise<void> {
  if (!isConfigured()) {
    console.warn("[EmailJS] Not configured — skipping email notifications.");
    return;
  }

  const itemsList = buildItemsList(items);
  const shippingAddress = `${order.address}, ${order.city}, ${order.state} ${order.zip}`;

  const adminParams = {
    order_id: orderId,
    customer_name: order.customerName,
    customer_email: order.email,
    customer_phone: order.phone,
    shipping_address: shippingAddress,
    items_list: itemsList,
    total: `GHS ${subtotal.toFixed(2)}`,
  };

  const customerParams = {
    order_id: orderId,
    customer_name: order.customerName,
    to_email: order.email,
    shipping_address: shippingAddress,
    items_list: itemsList,
    total: `GHS ${subtotal.toFixed(2)}`,
  };

  console.log("[EmailJS] Sending emails for order:", orderId);

  const [adminResult, customerResult] = await Promise.allSettled([
    emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, adminParams, { publicKey: PUBLIC_KEY }),
    emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE, customerParams, { publicKey: PUBLIC_KEY }),
  ]);

  if (adminResult.status === "rejected") {
    console.error("[EmailJS] Admin email FAILED:", adminResult.reason);
  } else {
    console.log("[EmailJS] Admin email sent. Status:", adminResult.value.status, adminResult.value.text);
  }

  if (customerResult.status === "rejected") {
    console.error("[EmailJS] Customer email FAILED:", customerResult.reason);
  } else {
    console.log("[EmailJS] Customer email sent. Status:", customerResult.value.status, customerResult.value.text);
  }
}
