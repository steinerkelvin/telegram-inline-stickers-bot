// TODO add /cancel command

const Scene = require('telegraf/scenes/base')
const {dbAddSticker} = require('../db')

const redirectScene = (sceneName) => (ctx) => ctx.scene.enter(sceneName)


const sc = {
    entry: new Scene('addSticker'),
    askingSticker: new Scene('addSticker_askingStiker'),
    askingAlias: new Scene('addSticker_askingAlias'),
}

sc.entry.enter(redirectScene('addSticker_askingStiker'))


// askingSticker

sc.askingSticker.enter((ctx) => {
    ctx.reply("Send sticker")
})

sc.askingSticker.on('sticker', (ctx) => {
    const sticker = ctx.message.sticker
    ctx.scene.enter('addSticker_askingAlias', {sticker})
})

sc.askingSticker.on('message', (ctx) => {
    ctx.reply('Not a sticker. Send a sticker plz')
})


// askingAlias

sc.askingAlias.enter((ctx) => {
    ctx.reply("Send sticker alias (any text)")
})

sc.askingAlias.on('text', (ctx) => {
    const alias = ctx.message.text.trim()
    ctx.reply(`Adding sticker with alias '${alias}'`)

    const sticker = ctx.scene.state.sticker
    sticker.alias = alias

    ctx.session.stickers = ctx.session.stickers || {}
    ctx.session.stickers[alias] = sticker

    dbAddSticker(ctx.db, ctx.from, sticker.file_id)

    ctx.scene.leave()
})


module.exports = Object.values(sc)
