import { Db } from "mongodb"
import * as telegraf from 'telegraf'

export interface Ctx extends telegraf.ContextMessageUpdate {
    db: Db,
    scene: any,
}
