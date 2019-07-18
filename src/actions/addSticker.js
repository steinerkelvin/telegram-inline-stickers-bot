const Scene = require('telegraf/scenes/base')

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
    console.log(ctx.message.sticker)
    const sticker = ctx.message.sticker
    ctx.scene.enter('addSticker_askingAlias', {sticker})
})

sc.askingSticker.on('message', (ctx) => {
    ctx.reply('Not a sticker. Send a sticker plz')
})


// askingAlias

sc.askingAlias.enter((ctx) => {
    ctx.reply("Send sticker alias")
})

sc.askingAlias.on('text', (ctx) => {
    const sticker = ctx.scene.state.sticker
    const alias = ctx.message.text.trim()
    ctx.reply(`Adding sticker with alias ${alias}`)
        // .then(() => ctx.replyWithSticker(sticker.file_id))
    ctx.session.stickers = ctx.session.stickers || {}
    ctx.session.stickers[alias] = sticker
    ctx.scene.leave()
})


module.exports = Object.values(sc)
