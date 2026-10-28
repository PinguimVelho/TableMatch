import login from "./public/login.html"
import cadastro from "./public/cadastro.html"
import db from "./db"

const loggedUsers: any = {}

const srv = Bun.serve({
    port: 1337,
    routes: {
        "/": login,
        "/cadastro": cadastro,

        "/users": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    INSERT INTO users(username, email, password_hash)
                    VALUES(:username, :email, :password_hash)
                `)
                const hash = await Bun.password.hash(body.password)
                const data = query.run({
                    ':username': body.username,
                    ':email': body.email,
                    ':password_hash': hash
                })
                return Response.json(data)
            },
        },

        "/login": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`SELECT * FROM users WHERE username=:username LIMIT 1`)
                const data: any = query.get({ 
                    ":username": body.username,
                    ":email": body.email
                })
                if (!data)
                    return Response.json({ msg: "usuário não encontrado" }, { status: 404 })
                const hash = data.password_hash
                const isMatch = await Bun.password.verify(body.password, hash)
                if (!isMatch)
                    return Response.json({ msg: "senha incorreta" }, { status: 401 })
                const uuid = crypto.randomUUID()
                delete data.password_hash
                loggedUsers[uuid] = data
                req.cookies.set("ses", uuid)
                return Response.json(isMatch)
            }
        },

        "/users/:id": {
            GET: (req) => {
                const id = req.params.id
                const query = db.query(`SELECT * FROM users WHERE id=:id`)
                const data = query.get({ ':id': id })
                return Response.json(data)
            },

            PUT: async(req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    UPDATE users SET 
                    username = :username, 
                    email = :email, 
                    password_hash = :password 
                    WHERE id = :id`)
                const dbResp = query.run({
                    ':username': body.username,
                    ':email': body.email,
                    ':password': body.password,
                    ':id': req.params.id
                })
                return Response.json(dbResp)
            },

            DELETE: (req) => {
                const query = db.query(`DELETE FROM users WHERE id=:id`)
                const data = query.run({ ':id': req.params.id })
                return Response.json(data)
            },
        },

        "/mesa": {
            GET: () => {
                const query = db.query(`SELECT * FROM mesas`)
                const data = query.all()
                return Response.json(data)
            },
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    INSERT INTO mesas(nome, descricao, tematica, horario, plataformas, vagas)
                    VALUES(:nome, :descricao, :tematica, :horario, :plataformas, :vagas)
                `)
                const dbResp = query.run({
                    ':nome': body.nome,
                    ':descricao': body.descricao,
                    ':tematica': body.tematica,
                    ':horario': body.horario,
                    ':plataformas': body.plataformas,
                    ':vagas': body.vagas
                })
                return Response.json({
                    "message": "Funcionou!",
                    dbResp
                })
            },
        },

        "/mesa/:id": {
            GET: (req) => {
                const query = db.query(`SELECT * FROM mesas WHERE id=:id`)
                const data = query.get({ ":id": req.params.id })
                return Response.json(data)
            },
            PUT: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`
                    UPDATE mesas SET 
                        nome = :nome, 
                        descricao = :descricao, 
                        tematica = :tematica, 
                        horario = :horario, 
                        plataformas = :plataformas, 
                        vagas = :vagas 
                        WHERE id = :id
                    `)
                    
                const dbResp = query.run({
                    ':nome': body.nome,
                    ':descricao': body.descricao,
                    ':tematica': body.tematica,
                    ':horario': body.horario,
                    ':plataformas': body.plataformas,
                    ':vagas': body.vagas,
                    ':id': req.params.id
                })
                return Response.json({
                    "message": "Funcionou o PUT ID!",
                    dbResp
                })
            },
            DELETE: (req) => {
                const query = db.query(`DELETE FROM mesas WHERE id=:id`)
                const data = query.run({ ':id': req.params.id })
                return Response.json(data)
            },
        }
    }
})
console.log(`⚡ Servidor iniciado em ${srv.url}`);