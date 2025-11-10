import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface TreasuryUpdateEvent {
  totalUsdValue: number;
  timestamp: string;
  tokenCount: number;
}

export function useTreasuryWebSocket() {
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('treasury:update', (data: TreasuryUpdateEvent) => {
      console.log('Treasury update received:', data);

      queryClient.invalidateQueries({ queryKey: ['/api/treasury/snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/treasury/snapshots/history'] });

      toast({
        title: 'Treasury Updated',
        description: `New value: $${data.totalUsdValue.toLocaleString()}`,
        duration: 5000,
      });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  return socketRef.current;
}
