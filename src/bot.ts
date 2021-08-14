import { MongoClient, Db } from "mongodb"

import Telegraf from 'telegraf'
import tgSession from 'telegraf/session'
import Stage from 'telegraf/stage'

import config from './config'
import { dbGetStickers } from './db'
import addStickerScenes from './scenes/addSticker'
import { Ctx } from './common'

const inlineModeGetSessionKey =
    (ctx: Ctx) => {
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

const scenes = [...addStickerScenes]

class Bot {
    db: Db
    bot: Telegraf<Ctx>
    stage: any

    constructor(tgToken: string, db: Db) {
        this.bot = new Telegraf(tgToken)
        this.db = db

        this.bot.use((ctx, next) => {
            ctx.db = this.db
            if (next) next()
        })

        this.bot.use(tgSession({ getSessionKey: inlineModeGetSessionKey }))

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
            console.log(`Received inline query.`)
            if (!ctx.from) return

            const stickersIds = await dbGetStickers(this.db, ctx.from)
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
