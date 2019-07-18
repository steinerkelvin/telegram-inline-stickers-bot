const MongoClient = require('mongodb').MongoClient
const Telegraf = require('telegraf')
const tgSession = require('telegraf/session')
const Stage = require('telegraf/stage')

const config = require('./config')
const actionAddSticker = require('./actions/addSticker')

const inlineModeGetSessionKey = 
    (ctx) => {
        if (ctx.from && ctx.chat) {
            return `${ctx.from.id}:${ctx.chat.id}`
        } else if (ctx.from && ctx.inlineQuery) {
            return `${ctx.from.id}:${ctx.from.id}`
        }
        return null
    }

const stickerResult = (id, fileId) => ({
    type: 'sticker',
    id:	id,
    sticker_file_id: fileId,
})

class Bot {
    constructor(tgToken, db) {
        this.bot = new Telegraf(tgToken)
        this.db = db

        this.bot.use(tgSession({getSessionKey: inlineModeGetSessionKey}))

        this.stage = new Stage()
        this.bot.use(this.stage.middleware())

        this.addHandlers()
    }

    addHandlers() {
        this.stage.register(...actionAddSticker)

        this.bot.start((ctx) => ctx.reply('Welcome'))

        this.bot.command('/addSticker', (ctx) => ctx.scene.enter('addSticker'))

        this.bot.command('/list', (ctx) => {
            ctx.session.stickers = ctx.session.stickers || {}
            let stickerNames = Object.keys(ctx.session.stickers)
            ctx.reply(`${stickerNames}`)
        })

        this.bot.on('inline_query', (ctx) => {
            const results = []
            for (const stickerName in ctx.session.stickers) {
                const sticker = ctx.session.stickers[stickerName]
                results.push(stickerResult(sticker.file_id, sticker.file_id))
            }

            ctx.answerInlineQuery(results)
        })
    }

    start() {
        this.bot.telegram.getMe().then((me) => {
            const username = me.username
            console.log(`username: ${username}`)
            this.bot.username = username
        })
        this.bot.launch()
    }
}

function main() {
    const tgToken = config.get('tgToken')

    const mongoHost = config.get('mongoHost')
    const mongoUser = config.get('mongoUser') 
    const mongoPass = config.get('mongoPass') 

    const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoHost}` // /test?retryWrites=true&w=majority
    const client = new MongoClient(uri, { useNewUrlParser: true });

    client.connect((err) => {
        if (err) {
            console.log(err)
            return
        }
        const db = client.db("adesivobot")

        const bot = new Bot(tgToken, db)
        bot.start()

        client.close();
    })    
}

main()
