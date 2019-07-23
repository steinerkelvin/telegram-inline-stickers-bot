// TODO add /cancel command

import Scene from 'telegraf/scenes/base'
import { dbAddSticker } from '../db'
import { Ctx } from '../common'

const redirectScene = (sceneName: string) => (ctx: Ctx) => ctx.scene.enter(sceneName)

const sc = {
    entry: new Scene('addSticker'),
    askingSticker: new Scene('addSticker_askingStiker'),
    askingAlias: new Scene('addSticker_askingAlias'),
}

sc.entry.enter(redirectScene('addSticker_askingStiker'))


// askingSticker

sc.askingSticker.enter((ctx: any) => {
    ctx.reply("Send sticker")
})

sc.askingSticker.on('sticker', (ctx: any) => {
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
