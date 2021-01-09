import { getDb } from './db.ts';
import { Partner } from './types.ts';

// Return an array of the partners' names
export async function getPartnerNames(): Promise<string[]> {
  const db = await getDb();
  const partnerDocs: Partner[] = await db.collection<Partner>('partners').find().toArray();
  return partnerDocs.map((partner: Partner) => partner.name);
}
