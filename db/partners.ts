import { getDb } from './db.ts';
import { Partner } from './types.ts';

// Return an array of the partners' names
export async function getPartnerNames(): Promise<string[]> {
  const db = await getDb();
  const partnerDocs: Partner[] = await db.collection<Partner>('partners').find().sort({ lastName: 1, firstName: 1 }).toArray();
  return partnerDocs.map(({ firstName, lastName }) => `${firstName} ${lastName}`);
}
