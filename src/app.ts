import 'dotenv/config';
import * as Application from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import { isValid, parseISO } from 'date-fns';
import { getLastCompletedDay, setLastCompletedDay } from './db/completedDays';
import { getPartners } from './db/partners';
import { generateSchedule, getSchedule } from './db/schedule';
import { setSkippedDayStatus } from './db/skippedDays';

const router = new Router();

router.get('/api/completedDay', async (context) => {
  context.response.body = { lastCompletedDay: await getLastCompletedDay() };
});

router.post('/api/completedDay', async (context) => {
  const body = context.request.body;
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
  const month: Date = parseISO(context.request.query.month);
  if (!isValid(month)) {
    context.throw(500, 'Invalid month');
  }

  context.response.body = await getSchedule(month);
});

router.put('/api/schedule/skippedDay', async (context) => {
  const body = context.request.body;
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
  console.log(`${context.request.method} ${context.request.url}`);

  const origin = process.env.FRONTEND_ORIGIN;
  if (origin) {
    // Add CORS headers
    context.set('Access-Control-Allow-Origin', origin);
    context.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    context.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }

  try {
    await next();
  } catch (err) {
    context.response.status = 500;
    context.response.body = err.message;
  }
});
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
const port = process.env.PORT;
app.listen({ port: port ? parseInt(port, 10) : 8081 });
