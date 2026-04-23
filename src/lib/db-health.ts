import { prisma } from './prisma';

export interface DBHealthStatus {
  connected: boolean;
  latency?: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DBHealthStatus> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const health = await checkDatabaseHealth();
    
    if (health.connected) {
      return;
    }
    
    console.warn(`Database connection attempt ${attempt}/${maxRetries} failed: ${health.error}`);
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw new Error('Failed to establish database connection after multiple attempts');
}
