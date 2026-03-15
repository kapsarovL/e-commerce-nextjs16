export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  imageUrl: string | null;
}

export interface OrderConfirmationParams {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: OrderConfirmationItem[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Sends an order confirmation email to the customer.
 * Wire up a real provider (Resend, Postmark, etc.) here.
 */
export async function sendOrderConfirmation(params: OrderConfirmationParams): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] order-confirmation suppressed in dev', {
      to: params.customerEmail,
      orderId: params.orderId,
    });
    return;
  }

  // Email sending is intentionally not implemented in this reference project.
  // To add it, install an email provider and replace this block. Example with Resend:
  //
  //   import { Resend } from 'resend';
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: 'orders@yourdomain.com',
  //     to: params.customerEmail,
  //     subject: `Order confirmed — #${params.orderId.slice(0, 8).toUpperCase()}`,
  //     html: buildOrderEmailHtml(params),
  //   });
  console.warn('[email] sendOrderConfirmation: no email provider configured — order', params.orderId);
}
