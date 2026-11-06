import login from "./public/login.html"
import cadastro from "./public/cadastro.html"
import home from "./public/home.html"
import db from "./db"

const loggedUsers: any = {}

const srv = Bun.serve({
    port: 1337,
    routes: {
        "/": login,
        "/home": home,
        "/cadastro": cadastro,

       "/login": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`SELECT * FROM users WHERE username=:username LIMIT 1`)
                const data: any = query.get({ ":username": body.username })
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

        "/login/user": (req) => {
            const ses = req.cookies.get("ses") as string
            const data = loggedUsers[ses]
            if (!ses || !data)
                return Response.json({ msg: "usuário não esta logado" }, { status: 401 })
            return Response.json(data)
        },

        "/users": {
            POST: async (req) => {
                const body = await req.body?.json()
                const query = db.query(`INSERT INTO users(username, email, password_hash) VALUES(:username, :email, :password_hash)`)
                const hash = await Bun.password.hash(body.password)
                const data = query.run({ ":username": body.username, ":email": body.email, ":password_hash": hash })
                return Response.json(data)
            }
        },



        "/mesa": {
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
    }
})
console.log(`⚡ Servidor iniciado em ${srv.url}`);