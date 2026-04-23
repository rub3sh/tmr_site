import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-health';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  
  const status = {
    status: dbHealth.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  };
  
  return NextResponse.json(status, {
    status: dbHealth.connected ? 200 : 503,
  });
}
