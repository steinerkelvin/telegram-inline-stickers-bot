const MongoClient = require('mongodb').MongoClient
const Telegraf = require('telegraf')
const tgSession = require('telegraf/session')
const Stage = require('telegraf/stage')

const config = require('./config')
const { dbGetStickers } = require('./db')
const addStickerScenes = require('./scenes/addSticker')

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

const scenes = [...addStickerScenes]

class Bot {
    constructor(tgToken, db) {
        this.bot = new Telegraf(tgToken)
        this.db = db

        this.bot.use((ctx, next) => {
            ctx.db = this.db
            next()
        })

        this.bot.use(tgSession({getSessionKey: inlineModeGetSessionKey}))

        this.stage = new Stage(scenes)
        this.bot.use(this.stage.middleware())

        this.addHandlers()
    }

    addHandlers() {
        const bot = this.bot

        bot.start((ctx) => ctx.reply('Welcome. Add a sticker with /addsticker'))

        bot.command('/addsticker', (ctx) => ctx.scene.enter('addSticker'))
    
        // TODO
        // bot.command('/list', (ctx) => {
        // })
    
        bot.on('message', (ctx) => {
            ctx.reply("Add a sticker with /addsticker")
        })
    
        bot.on('inline_query', async (ctx) => {
            const stickersIds = await dbGetStickers(this.db, ctx.from)
            if (stickersIds) {
                const queryResults = stickersIds.map((id) => stickerResult(id, id))
                queryResults.slice(0, 50)
                ctx.answerInlineQuery(queryResults, {
                    is_personal: true
                })
            }
        })
    }

    start() {
        console.log("Starting bot")
        this.bot.telegram.getMe().then((me) => {
            const username = me.username
            console.log(`bot username: @${username}`)
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
    })
}

// TODO app stop

main()
