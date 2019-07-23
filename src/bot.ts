import { MongoClient, Db } from "mongodb"

import * as telegraf from 'telegraf'
import Telegraf, { ContextMessageUpdate } from 'telegraf'
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
    id:	id,
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
            if (!ctx.from) return

            const stickersIds = await dbGetStickers(this.db, ctx.from)
            if (stickersIds) {
                const queryResults = stickersIds.map((id: string) => stickerResult(id, id))
                queryResults.slice(0, 50)
                ctx.answerInlineQuery(queryResults, {
                    is_personal: true
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
