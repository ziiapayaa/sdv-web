export type SdvEvent = 
  | "RESERVATION_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "RESERVATION_EXPIRED"
  | "WEBHOOK_DUPLICATE"
  | "INVALID_LIFECYCLE_ATTEMPT"
  | "CLEANUP_EXECUTED"
  | "ORDER_SHIPPED"
  | "ORDER_COMPLETED"
  | "PRODUCT_SOLD_OUT";

/**
 * PRODUCTION LOGGER
 * Consistent, structured logging output without exposing secrets.
 * Format: [ISO_TIMESTAMP] EVENT_TYPE | orderId | metadata
 */
export const sysLogger = {
  info: (event: SdvEvent, orderId: string | null = null, metadata: Record<string, unknown> = {}) => {
    const timestamp = new Date().toISOString();
    const orderStr = orderId ? ` | ${orderId}` : " | SYSTEM";
    const metaStr = Object.keys(metadata).length > 0 ? ` | ${JSON.stringify(metadata)}` : "";
    
    // Direct to stdout format
    console.log(`[${timestamp}] ${event}${orderStr}${metaStr}`);
  },

  error: (event: SdvEvent, orderId: string | null = null, error: Error | unknown, metadata: Record<string, unknown> = {}) => {
    const timestamp = new Date().toISOString();
    const orderStr = orderId ? ` | ${orderId}` : " | SYSTEM";
    
    let errStr = " | Unknown Error";
    if (error instanceof Error) {
      errStr = ` | ERROR: ${error.message}`;
    }

    const metaStr = Object.keys(metadata).length > 0 ? ` | METADATA: ${JSON.stringify(metadata)}` : "";
    
    // Direct to stderr format
    console.error(`[${timestamp}] ${event}${orderStr}${errStr}${metaStr}`);
  }
};
