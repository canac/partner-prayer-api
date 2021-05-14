import { Collection, Db, MongoClient } from 'mongodb';
import {
  PartnerModel,
  PartnerRequestModel,
  ScheduleDayModel,
  ScheduleModel,
} from '../generated/graphql';

let db: Db | null = null;

const {
  DB_PROTOCOL: protocol,
  DB_HOST: host,
  DB_USER: user,
  DB_PASS: password,
} = process.env;

interface CollectionTypes {
  partner: PartnerModel;
  partnerRequest: PartnerRequestModel;
  schedule: ScheduleModel;
  scheduleDay: ScheduleDayModel;
}

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  if ((user && !password) || (!user && password)) {
    throw new Error(
      'Database user and password must either both be specified or neither',
    );
  }

  if (!protocol) {
    throw new Error('Database protocol was not specified');
  }

  if (!host) {
    throw new Error('Database host was not specified');
  }

  const auth = user && password ? `${user}:${password}@` : '';
  const uri = `${protocol}://${auth}${host}/partnerPrayer?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  db = client.db('partnerPrayer');
  return db;
}

export async function getCollection<Name extends keyof CollectionTypes>(
  collectionName: Name,
): Promise<Collection<CollectionTypes[Name]>> {
  return (await getDb()).collection(collectionName);
}
