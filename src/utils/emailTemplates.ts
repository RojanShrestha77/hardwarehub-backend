import { FRONTEND_URL } from "../configs";

// ─── Order Confirmation ────────────────────────────────────────────────────────

export interface OrderEmailItem {
  productName:  string;
  productBrand?: string;
  quantity:     number;
  price:        number;
}

export function orderConfirmationTemplate(params: {
  customerName: string;
  orderNumber:  string;
  orderId:      string;
  items:        OrderEmailItem[];
  subtotal:     number;
  shippingCost: number;
  total:        number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    address:  string;
    city:     string;
    phone:    string;
  };
}): { subject: string; html: string } {
  const { customerName, orderNumber, orderId, items, subtotal, shippingCost, total, paymentMethod, shippingAddress } = params;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #1e1e1e; color: #ccc; font-size: 14px;">
          ${item.productName}${item.productBrand ? ` <span style="color:#555;font-size:12px;">(${item.productBrand})</span>` : ""}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #1e1e1e; color: #ccc; font-size: 14px; text-align: center;">
          ×${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #1e1e1e; color: #fff; font-size: 14px; text-align: right; font-weight: bold;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>`,
    )
    .join("");

  const paymentLabel: Record<string, string> = {
    cash_on_delivery: "Cash on Delivery",
    khalti:           "Khalti",
    esewa:            "eSewa",
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #1e1e1e;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1e1e1e;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;">
                      Hardware<span style="color:#e53e3e;">Hub</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#555;">
                      Order Confirmation
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="color:#e53e3e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">
                Order Placed Successfully
              </p>
              <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 8px;">
                Thanks, ${customerName}!
              </h1>
              <p style="color:#666;font-size:14px;margin:0;">
                Your order <strong style="color:#ccc;">#${orderNumber}</strong> has been confirmed and is being processed.
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="color:#555;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">
                Items Ordered
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;color:#444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding-bottom:8px;border-bottom:1px solid #1e1e1e;">Product</th>
                    <th style="text-align:center;color:#444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding-bottom:8px;border-bottom:1px solid #1e1e1e;">Qty</th>
                    <th style="text-align:right;color:#444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding-bottom:8px;border-bottom:1px solid #1e1e1e;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:16px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#666;font-size:13px;padding:4px 0;">Subtotal</td>
                  <td style="color:#999;font-size:13px;text-align:right;padding:4px 0;">Rs. ${subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:13px;padding:4px 0;">Shipping</td>
                  <td style="color:#999;font-size:13px;text-align:right;padding:4px 0;">
                    ${shippingCost === 0 ? '<span style="color:#22c55e;">Free</span>' : `Rs. ${shippingCost.toLocaleString()}`}
                  </td>
                </tr>
                <tr>
                  <td style="color:#fff;font-size:15px;font-weight:700;padding:12px 0 4px;border-top:1px solid #1e1e1e;">Total</td>
                  <td style="color:#e53e3e;font-size:15px;font-weight:900;text-align:right;padding:12px 0 4px;border-top:1px solid #1e1e1e;">
                    Rs. ${total.toLocaleString()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping + Payment -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:12px;">
                    <p style="color:#555;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Shipping To</p>
                    <p style="color:#ccc;font-size:13px;margin:0;line-height:1.6;">
                      ${shippingAddress.fullName}<br>
                      ${shippingAddress.address}<br>
                      ${shippingAddress.city}<br>
                      ${shippingAddress.phone}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:12px;">
                    <p style="color:#555;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Payment Method</p>
                    <p style="color:#ccc;font-size:13px;margin:0;">
                      ${paymentLabel[paymentMethod] ?? paymentMethod}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px;">
              <a href="${FRONTEND_URL}/orders/${orderId}"
                 style="display:inline-block;background:#e53e3e;color:#fff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                Track Your Order
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
              <p style="color:#444;font-size:12px;margin:0;line-height:1.6;">
                Questions? Reply to this email or visit
                <a href="${FRONTEND_URL}" style="color:#e53e3e;text-decoration:none;">hardwarehub.com</a><br>
                If you didn't place this order, please contact us immediately.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `Order Confirmed — #${orderNumber} | HardwareHub`, html };
}

// ─── Password Reset ────────────────────────────────────────────────────────────

export function passwordResetTemplate(params: {
  customerName: string;
  resetToken:   string;
}): { subject: string; html: string } {
  const { customerName, resetToken } = params;
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #1e1e1e;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1e1e1e;">
              <span style="font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;">
                Hardware<span style="color:#e53e3e;">Hub</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#e53e3e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">
                Password Reset Request
              </p>
              <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 16px;">
                Reset your password
              </h1>
              <p style="color:#666;font-size:14px;margin:0 0 32px;line-height:1.6;">
                Hi ${customerName}, we received a request to reset the password for your HardwareHub account.
                Click the button below to choose a new password. This link expires in <strong style="color:#ccc;">1 hour</strong>.
              </p>

              <a href="${resetLink}"
                 style="display:inline-block;background:#e53e3e;color:#fff;text-decoration:none;padding:14px 40px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                Reset Password
              </a>

              <p style="color:#444;font-size:12px;margin:32px 0 0;line-height:1.6;">
                Or copy this link into your browser:<br>
                <span style="color:#666;word-break:break-all;">${resetLink}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
              <p style="color:#444;font-size:12px;margin:0;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will not be changed.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: "Reset your HardwareHub password", html };
}
