import { OrderLifecycle } from "@prisma/client";

export class InvalidLifecycleTransitionError extends Error {
  constructor(public currentState: OrderLifecycle, public nextState: OrderLifecycle, public orderId?: string) {
    super(`Invalid lifecycle transition from ${currentState} to ${nextState} for order ${orderId || 'unknown'}`);
    this.name = "InvalidLifecycleTransitionError";
  }
}

/**
 * Validates state transitions enforcing a strict Directed Acyclic Graph.
 * Centralizing this logic ensures mathematically impossible state corruption.
 */
export function validateLifecycleTransition(currentState: OrderLifecycle, nextState: OrderLifecycle): void {
  // Define allowed transitions strictly
  const allowedTransitions: Record<OrderLifecycle, OrderLifecycle[]> = {
    RESERVED: ["PAID", "EXPIRED", "FAILED"],
    PAID: ["SHIPPED", "REFUNDED"],
    SHIPPED: ["COMPLETED", "REFUNDED"],
    COMPLETED: [], // Terminal State
    FAILED: [], // Terminal State
    EXPIRED: [], // Terminal State
    REFUNDED: [], // Terminal State
  };

  const validNextStates = allowedTransitions[currentState];

  if (!validNextStates || !validNextStates.includes(nextState)) {
    throw new InvalidLifecycleTransitionError(currentState, nextState);
  }
}
