import { getCollection } from './db';
import { ObjectId, PartnerModel, PartnerRequestModel } from './models';

// Return an array of all the partners
export async function getPartners(): Promise<PartnerModel[]> {
  return (await getCollection('partner')).find().sort({ lastName: 1, firstName: 1 }).toArray();
}

// Find and return one partner by its id
export async function getPartner(partnerId: ObjectId): Promise<PartnerModel | null> {
  return (await getCollection('partner')).findOne({ _id: partnerId });
}

// Return an array of the partner's requests
export async function getPartnerRequests(partnerId: ObjectId): Promise<PartnerRequestModel[]> {
  return (await getCollection('partnerRequest')).find({ partnerId }).sort({ createdAt: 1 }).toArray();
}

// Create a new partner request
export async function createPartnerRequest(partnerId: ObjectId, request: string): Promise<PartnerRequestModel> {
  const fields = { partnerId, createdAt: new Date(), request };
  const { insertedId } = await (await getCollection('partnerRequest')).insertOne(fields);
  return {
    _id: insertedId,
    ...fields,
  };
}

// Delete a partner request
export async function deletePartnerRequest(partnerRequestId: ObjectId): Promise<void> {
  const { deletedCount } = await (await getCollection('partnerRequest'))
    .deleteOne({ _id: partnerRequestId });
  if (deletedCount === 0) {
    throw new Error('Partner request was not deleted');
  }
}
