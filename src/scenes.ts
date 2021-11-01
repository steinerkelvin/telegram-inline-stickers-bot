import { Scenes } from 'telegraf'
const Scene = Scenes.BaseScene

import { MyCtx } from './common'
import * as store from './store'

const sc = {
    ask_sticker_tags: new Scene<MyCtx>('ask_sticker_tags'),
}


// scene: ask_sticker_tags
// Asks for multiple tags to associate with the sticker.
// Stops when receive /done command.

sc.ask_sticker_tags.enter((ctx) => {
    ctx.reply("Send tags (any text, one tag per message):")
})

sc.ask_sticker_tags.leave((ctx) => {
    const tags = ctx.scene.session.tags ?? []
    let msg = `Added the following tags to the sticker:\n` +
        tags.map(t => '- `' + t + '`').join('\n')
    ctx.reply(msg)
})

sc.ask_sticker_tags.command('/done', (ctx) => {
    ctx.scene.leave()
})

sc.ask_sticker_tags.on('text', async (ctx) => {
    const sc_session = ctx.scene.session

    const user = ctx.from
    const tag = ctx.message.text.trim()

    const sticker = sc_session.sticker
    if (sticker == null) {
        let msg = "missing `sticker` on scene session data"
        console.error(`ERROR: ${msg}`)
        ctx.reply(`INTERNAL ERROR: ${msg}`)
        ctx.scene.leave()
        return
    }

    sc_session.tags ??= []
    sc_session.tags.push(tag)

    store.add_sticker_tag(ctx.db)(user.id, tag, sticker.file_id)
    // TODO only add on finish
    // TODO /cancel command

    await ctx.reply(`Send more tags or finish with /done.`)
})


const scenes = Object.values(sc)
export default scenes
