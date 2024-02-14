import { Pool } from "pg";

const database = new Pool({
  host: "db",
  user: "docker",
  database: "rinha",
  password: "docker",
});

export default database;
