import { Elysia } from "elysia";
import { createTransaction } from "./routes/create-transaction";
import { getStatement } from "./routes/get-statement";

const app = new Elysia();
app.headers({
  "Content-Type": "application/json",
});

app.group("/clientes", (app) => app.use(createTransaction).use(getStatement));

app.listen(process.env.PORT || 3333, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
