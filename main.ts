import 'https://deno.land/x/dotenv@v1.0.1/load.ts';
import { Application, Router, helpers } from 'https://deno.land/x/oak@v6.4.1/mod.ts';
import { isValid, parseISO } from 'https://cdn.skypack.dev/date-fns@2.16.1';
import { getLastCompletedDay, setLastCompletedDay } from './db/completedDays.ts';
import { getPartners } from './db/partners.ts';
import { generateSchedule, getSchedule } from './db/schedule.ts';
import { setSkippedDayStatus } from './db/skippedDays.ts';

const router = new Router();

router.get('/api/completedDay', async (context) => {
  context.response.body = { lastCompletedDay: await getLastCompletedDay() };
});

router.post('/api/completedDay', async (context) => {
  const body = await context.request.body({ type: 'json' }).value;
  const lastCompletedDay: Date = new Date(body.lastCompletedDay);
  if (!isValid(lastCompletedDay)) {
    context.throw(500, 'Invalid day');
  }

  await setLastCompletedDay(lastCompletedDay);
  context.response.body = {};
});

router.get('/api/partners', async (context) => {
  const partners = await getPartners();
  context.response.body = partners;
});

router.get('/api/schedule', async (context) => {
  const month: Date = parseISO(helpers.getQuery(context).month, {});
  if (!isValid(month)) {
    context.throw(500, 'Invalid month');
  }

  context.response.body = await getSchedule(month);
});

router.put('/api/schedule/skippedDay', async (context) => {
  const body = await context.request.body({ type: 'json' }).value;
  const date: Date = new Date(body.date);
  const isSkipped: boolean = body.isSkipped;
  if (!isValid(date)) {
    context.throw(500, 'Invalid date');
  }
  if (typeof isSkipped !== 'boolean') {
    context.throw(500, 'isSkipped is not a boolean');
  }

  await setSkippedDayStatus(date, isSkipped);

  context.response.body = await generateSchedule(date);
});

const app = new Application();
app.use(async (context, next) => {
  console.log(`${context.request.method} ${context.request.url.href}`);

  const origin = Deno.env.get('FRONTEND_ORIGIN');
  if (origin) {
    // Add CORS headers
    context.response.headers.append('Access-Control-Allow-Origin', origin);
    context.response.headers.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    context.response.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }

  try {
    await next();
  } catch (err) {
    context.response.status = 500;
    context.response.body = err.message;
  }
});
app.use(router.routes());
app.use(router.allowedMethods());
const port = Deno.env.get('PORT');
await app.listen({ port: port ? parseInt(port, 10) : 8081 });
