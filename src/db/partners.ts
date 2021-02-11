import { getDb } from './db';
import { ObjectId, PartnerModel, PartnerRequestModel } from './models';

// Return an array of the partners
export async function getPartners(): Promise<PartnerModel[]> {
  const db = await getDb();
  return db.collection<PartnerModel>('partner').find().sort({ lastName: 1, firstName: 1 }).toArray();
}

// Return an array of the partner's requests
export async function getPartnerRequests(partnerId: ObjectId): Promise<PartnerRequestModel[]> {
  const db = await getDb();
  return db.collection<PartnerRequestModel>('partnerRequest').find({ partnerId }).sort({ createdAt: 1 }).toArray();
}
