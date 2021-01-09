import 'https://deno.land/x/dotenv@v1.0.1/load.ts';
import { Application, Router, helpers } from 'https://deno.land/x/oak@v6.4.1/mod.ts';
import { endOfMonth, isValid, parseISO, startOfMonth } from 'https://cdn.skypack.dev/date-fns@2.16.1';
import { getDb } from './db/db.ts';
import { Settings, SkippedDay } from './db/types.ts';
import { getPartnerNames } from './db/partners.ts';
import { generateSchedule } from './schedule.ts';

const router = new Router();

router.get('/api/partners', async (context) => {
  context.response.body = await getPartnerNames();
});

router.get('/api/schedule', async (context) => {
  const month: Date = startOfMonth(parseISO(helpers.getQuery(context).month, {}));
  if (!isValid(month)) {
    context.throw(500, 'Invalid month');
  }

  const db = await getDb();
  const skippedDayDocs = await db.collection<SkippedDay>('skippedDays').find({
    date: {
      $gte: month,
      $lte: endOfMonth(month),
    },
    isSkipped: true,
  }).toArray();

  context.response.body = generateSchedule(month, skippedDayDocs.map(day => day.date), await getPartnerNames());
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
  try {
    await next();
  } catch (err) {
    context.response.status = 500;
    context.response.body = err.message;
  }
});
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
