"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  expiresAt: Date;
  onRefreshStatus?: () => void;
}

export function CountdownTimer({ expiresAt, onRefreshStatus }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let statusRefreshTimer: NodeJS.Timeout;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        if (onRefreshStatus) onRefreshStatus();
        return;
      }
      
      setTimeLeft({
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Auto-refresh order status from server every 30 seconds
    if (onRefreshStatus) {
      statusRefreshTimer = setInterval(onRefreshStatus, 30000);
    }

    return () => {
      clearInterval(timer);
      if (statusRefreshTimer) clearInterval(statusRefreshTimer);
    };
  }, [expiresAt, onRefreshStatus]);

  if (isExpired) {
    return (
      <div className="text-center bg-red-50 text-red-800 border-l-2 border-red-500 p-4">
        <p className="text-xs uppercase tracking-widest font-medium">Reservation Expired</p>
        <p className="text-[10px] mt-1 tracking-wider opacity-80">This cart has been released.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center bg-zinc-50 border border-zinc-200 p-6 md:p-8"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">
        Time remaining to complete payment
      </span>
      <div className="flex flex-row items-center gap-4 text-4xl font-light font-mono text-zinc-900">
        <div className="flex flex-col items-center min-w-[3rem]">
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2">Minutes</span>
        </div>
        <span className="text-zinc-300 pb-5">:</span>
        <div className="flex flex-col items-center min-w-[3rem]">
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2">Seconds</span>
        </div>
      </div>
    </motion.div>
  );
}
