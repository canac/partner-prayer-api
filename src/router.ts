import Router from 'koa-router';
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

export default router;
