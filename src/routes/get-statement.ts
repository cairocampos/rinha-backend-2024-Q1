import { Elysia, t } from "elysia";
import database from "../lib/database";

export async function getStatement(app: Elysia) {
  return app.get(
    "/:id/extrato",
    async ({ params, set }) => {
      const { id } = params;

      const customer = await database.query({
        text: "SELECT balance,max_limit FROM customers WHERE id = $1;",
        values: [id],
      });

      if (!customer?.rows.length) {
        set.status = 404;
        return;
      }

      const lastTransactions = await database.query({
        text: "SELECT * FROM transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10;",
        values: [id],
      });

      const result = {
        saldo: {
          total: customer.rows[0].balance,
          data_extrato: new Date(),
          limite: customer.rows[0].max_limit,
        },
        ultimas_transacoes: lastTransactions?.rows.map((transaction) => ({
          valor: transaction.amount,
          tipo: transaction.transaction_type,
          descricao: transaction.description,
          realizada_em: transaction.created_at,
        })),
      };

      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
}
