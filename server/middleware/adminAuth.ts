import type { Request, Response, NextFunction } from 'express';
import { verifyMessage } from 'viem';

const ADMIN_ADDRESSES = (process.env.ADMIN_ADDRESSES || '').toLowerCase().split(',').filter(Boolean);

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-wallet-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!walletAddress || !signature || !timestamp) {
      return res.status(401).json({
        success: false,
        message: 'Missing authentication headers',
      });
    }

    const timestampNum = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(currentTime - timestampNum) > fiveMinutes) {
      return res.status(401).json({
        success: false,
        message: 'Signature expired',
      });
    }

    const message = `KingDAO Admin Access\nTimestamp: ${timestamp}`;
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    const isAdmin = ADMIN_ADDRESSES.includes(walletAddress.toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required',
      });
    }

    next();
  } catch (error: any) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}
