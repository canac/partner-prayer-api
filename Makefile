run:
	deno run --allow-env --allow-net=0.0.0.0:8081,127.0.0.1:27017 --allow-read=.env,.env.defaults main.ts

run-watch:
	deno run --watch --unstable --allow-env --allow-net=0.0.0.0:8081,127.0.0.1:27017 --allow-read=.env,.env.defaults main.ts
