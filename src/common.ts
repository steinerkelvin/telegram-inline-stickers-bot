type Sticker = import('telegram-typings').Sticker
import * as telegraf from 'telegraf'
import { Db } from 'mongodb'

interface MySceneSession extends telegraf.Scenes.SceneSessionData {
    // will be available under `ctx.scene.session`
    sticker?: Sticker,
    tags?: string[],
}

export interface MyCtx extends telegraf.Context {
    // scene type
    scene: telegraf.Scenes.SceneContextScene<MyCtx, MySceneSession>
    db: Db,
}
