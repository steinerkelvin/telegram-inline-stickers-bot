import * as telegraf from 'telegraf'
import {Db} from 'mongodb'

export interface MyCtx extends telegraf.Context {
    // scene type
    scene: telegraf.Scenes.SceneContextScene<MyCtx>
    db: Db,
}
