import { Elysia, t } from "elysia";
import database from "../lib/database";

enum TransactionType {
  CREDIT = "c",
  DEBIT = "d",
}

export async function createTransaction(app: Elysia) {
  return app.post(
    "/:id/transacoes",
    async ({ params, set, body }) => {
      const { id } = params;
      const client = await database.connect();

      try {
        await client.query("BEGIN");
        const customer = await client.query(
          "SELECT max_limit,balance FROM customers WHERE id = $1 FOR UPDATE",
          [id]
        );

        if (!customer?.rows?.length) {
          set.status = 404;
          throw new Error("Customer not found");
        }
        let newBalance = customer.rows[0].balance;
        if (body.tipo === TransactionType.CREDIT) {
          newBalance += body.valor;
        } else {
          newBalance -= body.valor;
        }

        if (newBalance < -customer.rows[0].max_limit) {
          set.status = 422;
          throw new Error("Insufficient balance");
        }

        await Promise.all([
          client.query(
            "INSERT INTO transactions (customer_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)",
            [id, body.valor, body.tipo, body.descricao]
          ),
          client.query("UPDATE customers SET balance = $1 where id = $2;", [
            newBalance,
            id,
          ]),
        ]);

        await client.query("COMMIT");
        return {
          limite: customer.rows[0].max_limit,
          saldo: newBalance,
        };
      } catch (error) {
        await client.query("ROLLBACK");
      } finally {
        client.release();
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        valor: t.Integer(),
        tipo: t.Enum(TransactionType),
        descricao: t.String({
          minLength: 1,
          maxLength: 10,
        }),
      }),
      error({ set, error }) {
        set.status = 422;
        return error.message;
      },
    }
  );
}
