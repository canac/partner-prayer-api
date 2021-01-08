import "https://deno.land/x/dotenv@v1.0.1/load.ts";
import { Application, Router } from 'https://deno.land/x/oak@v6.4.1/mod.ts';
import { getDb } from './db.ts';
import { Partner, Settings, SkippedDay } from './dbTypes.ts';

const router = new Router();

router.get('/api/partners', async (context) => {
  const db = await getDb();

  const partnerDocs: Partner[] = await db.collection<Partner>('partners').find().toArray();
  const partners = partnerDocs.map((partner: Partner) => partner.name);

  context.response.body = partners;
});

router.get('/api/settings', async (context) => {
  const settings: any = {};

  const db = await getDb();

  const lastCompletedDayDoc = await db.collection<Settings>('settings').findOne();
  settings.lastCompletedDay = lastCompletedDayDoc?.lastCompletedDay || new Date(0);

  settings.skippedDays = {};
  const skippedDays = db.collection<SkippedDay>('skippedDays').find();
  for (const doc of await skippedDays.toArray()) {
    settings.skippedDays[doc.date.toISOString()] = doc.isSkipped;
  }

  context.response.body = settings;
});

router.post('/api/settings', async (context) => {
  const newSettings: any = await context.request.body({ type: 'json' }).value;

  const db = await getDb();

  if (newSettings.lastCompletedDay) {
    const lastCompletedDay = new Date(newSettings.lastCompletedDay)
    await db.collection('settings').updateOne({}, { $set: { lastCompletedDay } }, { upsert: true });
  }

  if (newSettings.skippedDays) {
    for (const [date, isSkipped] of Object.entries(newSettings.skippedDays)) {
      await db.collection('skippedDays').updateOne({ date: new Date(date) }, { $set: { isSkipped } }, { upsert: true });
    }
  }

  context.response.body = {};
});

const app = new Application();
app.use(async (context, next) => {
  const origin = Deno.env.get('FRONTEND_ORIGIN');
  if (origin) {
    // Add CORS headers
    context.response.headers.append('Access-Control-Allow-Origin', origin);
    context.response.headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
const port = Deno.env.get('PORT');
await app.listen({ port: port ? parseInt(port, 10) : 8081 });
