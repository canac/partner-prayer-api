import 'dotenv/config';
import * as Application from 'koa';
import * as bodyParser from 'koa-bodyparser';
import router from './router';

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
