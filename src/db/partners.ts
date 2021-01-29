import { getDb } from './db';
import { PartnerModel } from './models';

// Return an array of the partners
// eslint-disable-next-line import/prefer-default-export
export async function getPartners(): Promise<PartnerModel[]> {
  const db = await getDb();
  return db.collection<PartnerModel>('partners').find().sort({ lastName: 1, firstName: 1 }).toArray();
}
