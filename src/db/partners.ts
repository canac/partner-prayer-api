import { getDb } from './db';
import { PartnerModel } from './types';

// Return an array of the partners
export async function getPartners(): Promise<PartnerModel[]> {
  const db = await getDb();
  return await db.collection<PartnerModel>('partners').find().sort({ lastName: 1, firstName: 1 }).toArray();
}
