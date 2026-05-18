import emailjs from "@emailjs/browser";
import { CartItem } from "@/context/CartContext";
import { OrderData } from "./orders";

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const ADMIN_TEMPLATE = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
const CUSTOMER_TEMPLATE = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function isConfigured(): boolean {
  const ok = !!(PUBLIC_KEY && SERVICE_ID && ADMIN_TEMPLATE && CUSTOMER_TEMPLATE && ADMIN_EMAIL);
  if (!ok) {
    console.warn("[EmailJS] Missing env vars:", {
      VITE_EMAILJS_PUBLIC_KEY: !!PUBLIC_KEY,
      VITE_EMAILJS_SERVICE_ID: !!SERVICE_ID,
      VITE_EMAILJS_ADMIN_TEMPLATE_ID: !!ADMIN_TEMPLATE,
      VITE_EMAILJS_CUSTOMER_TEMPLATE_ID: !!CUSTOMER_TEMPLATE,
      VITE_ADMIN_EMAIL: !!ADMIN_EMAIL,
    });
  }
  return ok;
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

  const shippingAddress = `${order.address}, ${order.city}, ${order.state} ${order.zip}`;

  // Build orders array for the {{#orders}}...{{/orders}} Mustache loop in the template
  const orders = items.map((i) => ({
    items_list: i.product.name,
    units: i.quantity,
    total: (i.product.price * i.quantity).toFixed(2),
  }));

  // Shared shape — matches both customer and admin templates
  const baseParams = {
    order_id: orderId,
    orders,
    total: subtotal.toFixed(2),
    cost: {
      shipping: "0.00",
      tax: "0.00",
    },
  };

  const customerParams = {
    ...baseParams,
    to_email: order.email,
    email: order.email,         // used in footer: "This email was sent to {{email}}"
    customer_name: order.customerName,
  };

  const adminParams = {
    ...baseParams,
    to_email: ADMIN_EMAIL,
    email: order.email,         // customer email shown in admin notification footer
    customer_name: order.customerName,
    customer_phone: order.phone,
    shipping_address: shippingAddress,
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
