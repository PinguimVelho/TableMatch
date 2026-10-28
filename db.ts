import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

const query = db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT NOT NULL UNIQUE,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL
    );
`);

// const query1 = db.query(`
//     CREATE TABLE IF NOT EXISTS mesas (
//         id              INTEGER PRIMARY KEY AUTOINCREMENT,
//         nome            TEXT NOT NULL UNIQUE,
//         descricao       TEXT NOT NULL,
//         tematica        TEXT NOT NULL,
//         horario         TEXT NOT NULL,
//         plataformas      TEXT NOT NULL,
//         vagas           INTEGER NOT NULL
//     );
// `);

query.run();
// query1.run();

export { db }
export default db