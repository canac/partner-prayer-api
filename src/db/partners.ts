import { getDb } from './db';
import { ObjectId, PartnerModel, PartnerRequestModel } from './models';

// Return an array of all the partners
export async function getPartners(): Promise<PartnerModel[]> {
  const db = await getDb();
  return db.collection<PartnerModel>('partner').find().sort({ lastName: 1, firstName: 1 }).toArray();
}

// Find and return one partner by its id
export async function getPartner(partnerId: ObjectId): Promise<PartnerModel | null> {
  const db = await getDb();
  return db.collection<PartnerModel>('partner').findOne({ _id: partnerId });
}

// Return an array of the partner's requests
export async function getPartnerRequests(partnerId: ObjectId): Promise<PartnerRequestModel[]> {
  const db = await getDb();
  return db.collection<PartnerRequestModel>('partnerRequest').find({ partnerId }).sort({ createdAt: 1 }).toArray();
}

// Create a new partner request
export async function createPartnerRequest(partnerId: ObjectId, request: string): Promise<PartnerRequestModel> {
  const db = await getDb();
  const fields = { partnerId, createdAt: new Date(), request };
  const { insertedId } = await db.collection<PartnerRequestModel>('partnerRequest').insertOne(fields);
  return {
    _id: insertedId,
    ...fields,
  };
}

// Delete a partner request
export async function deletePartnerRequest(partnerRequestId: ObjectId): Promise<void> {
  const db = await getDb();
  const { deletedCount } = await db.collection<PartnerRequestModel>('partnerRequest')
    .deleteOne({ _id: partnerRequestId });
  if (deletedCount === 0) {
    throw new Error('Partner request was not deleted');
  }
}
