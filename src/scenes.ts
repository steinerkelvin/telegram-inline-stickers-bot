import { Scenes } from 'telegraf'
import { dbAddSticker } from './db'

type ScCtx = Scenes.SceneContext
const Scene = Scenes.BaseScene

const sc = {
    entry: new Scene<ScCtx>('addSticker'),
    askingSticker: new Scene<ScCtx>('addSticker_askingStiker'),
    askingAlias: new Scene<ScCtx>('addSticker_askingAlias'),
}

sc.entry.enter((ctx) => ctx.scene.enter('addSticker_askingStiker'))


// askingSticker

sc.askingSticker.enter((ctx) => {
    ctx.reply("Send sticker")
})

sc.askingSticker.on('sticker', (ctx) => {
    const sticker = ctx.message.sticker
    ctx.scene.enter('addSticker_askingAlias', {sticker})
})

sc.askingSticker.on('message', (ctx: any) => {
    ctx.reply('Not a sticker. Send a sticker plz')
})


// askingAlias

sc.askingAlias.enter((ctx: any) => {
    ctx.reply("Send sticker alias (any text)")
})

sc.askingAlias.on('text', (ctx: any) => {
    const alias = ctx.message.text.trim()
    ctx.reply(`Adding sticker with alias '${alias}'`)

    const sticker = ctx.scene.state.sticker
    sticker.alias = alias

    ctx.session.stickers = ctx.session.stickers || {}
    ctx.session.stickers[alias] = sticker

    dbAddSticker(ctx.db, ctx.from, sticker.file_id)

    ctx.scene.leave()
})


const scenes = Object.values(sc)
export default scenes
