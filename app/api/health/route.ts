import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sysLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check Database connection using a lightweight query
    await prisma.product.count();
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }, { status: 200 });

  } catch (error) {
    sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, error, { raw: "Health check failed (DB Disconnected)" });
    
    return NextResponse.json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    }, { status: 503 });
  }
}
