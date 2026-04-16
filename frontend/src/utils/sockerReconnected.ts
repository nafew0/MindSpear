import { getSocket } from '@/socket/quest-socket';
import { useState, useEffect, useRef } from 'react';

export const useSocketStatusComparison = () => {
  const [statusAfter2Sec, setStatusAfter2Sec] = useState<boolean | undefined>();
  const currentStatusRef = useRef<boolean | undefined>(undefined);
  const socket = getSocket();
    currentStatusRef.current = socket?.connected;
  useEffect(() => {
    const timer = setTimeout(() => {
      const socketAfter2Sec = getSocket();
      const newStatus = socketAfter2Sec?.connected;
      setStatusAfter2Sec(newStatus);
      
      //console.log("🟢 Status after 2 seconds:", newStatus);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  console.log(statusAfter2Sec, "statusAfter2SecstatusAfter2Sec");
  

  return {
    currentStatus: currentStatusRef.current,
    statusAfter2Sec,
    isStable: currentStatusRef.current === statusAfter2Sec
  };
};