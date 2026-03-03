"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusFormProps {
  orderId: string;
  currentLifecycle: string;
}

export function OrderStatusForm({ orderId, currentLifecycle }: OrderStatusFormProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (nextState: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextState, trackingNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      router.refresh();
    } catch (error) {
      const err = error as Error;
      // Use internal custom alert component logic, replacing native alert conceptually
      // We will fallback to alert for emergency in this simple form 
      // but in a real app, rely on a toast system. 
      alert(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  if (currentLifecycle !== "PAID" && currentLifecycle !== "SHIPPED") {
    return null; // Actions only available for PAID or SHIPPED
  }

  return (
    <div className="border border-[#e8e8e8] bg-white p-6 shadow-sm mt-6 mb-6 flex flex-col gap-4">
      <h3 className="text-xs tracking-widest text-[#666666] uppercase border-b border-[#e8e8e8] pb-2">Operational Controls</h3>
      
      {currentLifecycle === "PAID" && (
        <div className="flex flex-col gap-4">
          <label className="text-xs font-medium uppercase tracking-widest">Mark as Shipped</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Tracking Number (Optional)" 
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 border border-[#e8e8e8] px-4 py-2 text-sm focus:outline-none focus:border-black"
            />
            <button 
              onClick={() => handleUpdate("SHIPPED")}
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-800 disabled:opacity-50"
            >
              Ship
            </button>
          </div>
        </div>
      )}

      {currentLifecycle === "SHIPPED" && (
        <div className="flex flex-col gap-4">
          <label className="text-xs font-medium uppercase tracking-widest">Mark as Completed</label>
          <button 
            onClick={() => handleUpdate("COMPLETED")}
            disabled={isLoading}
            className="w-max px-6 py-2 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-800 disabled:opacity-50"
          >
            Complete Order
          </button>
        </div>
      )}
    </div>
  );
}
