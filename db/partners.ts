import { getDb } from './db.ts';
import { Partner } from './types.ts';

// Return an array of the partners
export async function getPartners(): Promise<Partner[]> {
  const db = await getDb();
  return await db.collection<Partner>('partners').find().sort({ lastName: 1, firstName: 1 }).toArray();
}
