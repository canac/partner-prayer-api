import "https://deno.land/x/dotenv@v1.0.1/load.ts";
import { Application } from 'https://deno.land/x/oak@v6.4.1/mod.ts';

const app = new Application();

app.use(ctx => {
  ctx.response.body = 'Hello world';
});

const port = Deno.env.get('PORT');
await app.listen({ port: port ? parseInt(port, 10) : 8081 });
