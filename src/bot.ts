import { MongoClient, Db } from 'mongodb'

import * as telegraf from 'telegraf'
const LocalSession = require('telegraf-session-local')

import config from './config'
import { MyCtx } from "./common"
import scenes from './scenes'
import * as store from './store'

const inlineModeGetSessionKey =
    async (ctx: MyCtx) => {
        if (ctx.from && ctx.chat) {
            return `${ctx.from.id}:${ctx.chat.id}`
        } else if (ctx.from && ctx.inlineQuery) {
            return `${ctx.from.id}:${ctx.from.id}`
        }
        return null
    }

const stickerResult = (id: string, fileId: string) => ({
    type: 'sticker',
    id: id.slice(0, 64),
    sticker_file_id: fileId,
})

class Bot {
    db: Db
    bot: telegraf.Telegraf<MyCtx>
    stage: any

    constructor(tgToken: string, db: Db) {
        this.bot = new telegraf.Telegraf(tgToken)
        this.db = db

        this.bot.use((ctx, next) => {
            ctx.db = this.db
            if (next) next()
        })

        // this.bot.use(telegraf.session({
        //     getSessionKey: inlineModeGetSessionKey,
        // }))

        let local_session = new LocalSession({
            // storage: LocalSession.storageMemory,
            getSessionKey: inlineModeGetSessionKey,
        })
        this.bot.use(local_session.middleware())

        this.stage = new telegraf.Scenes.Stage(scenes)
        this.bot.use(this.stage.middleware())

        this.addHandlers()
    }

    addHandlers() {
        const bot = this.bot

        bot.start((ctx) => ctx.reply("Welcome. Send a sticker to add it to your library."))

        bot.on('sticker', (ctx) => {
            ctx.scene.session.sticker = ctx.message.sticker
            ctx.scene.enter("ask_sticker_tags")
        })

        bot.on('message', (ctx) => {
            ctx.reply("Send a sticker to add it to your library.")
        })

        bot.on('inline_query', async (ctx) => {
            console.log(`Received inline query.`)
            if (!ctx.from) return

            let user = ctx.from
            const stickersIds = await store.get_stickers(this.db)(user)
            if (stickersIds) {
                const queryResults = stickersIds.map((id: string) => stickerResult(id, id))
                queryResults.slice(0, 50)
                ctx.answerInlineQuery(queryResults, {
                    is_personal: true,
                    cache_time: 30,
                })
            }
        })
    }

    async start() {
        console.log("Starting bot")
        await this.bot.telegram.getMe().then((me) => {
            const username = me.username
            console.log(`bot username: @${username}`)
            // this.bot.username = username
        })
        await this.bot.launch()
    }
}

function main() {
    const tg_token = config.get('telegram_token')
    const mongo_uri = config.get('mongo_uri')
    const mongo_user = config.get('mongo_user')
    const mongo_pass = config.get('mongo_pass')
    const db_name = config.get('db_name')

    const client = new MongoClient(mongo_uri, {
        auth: {
            username: mongo_user,
            password: mongo_pass,
        }
    });

    client.connect((err) => {
        if (err) {
            console.log(err)
            return
        }
        const db = client.db(db_name)

        const bot = new Bot(tg_token, db)
        bot.start()
    })
}

// TODO app stop

main()
