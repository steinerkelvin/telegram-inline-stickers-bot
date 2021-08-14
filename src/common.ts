import { Db } from "mongodb"
import * as telegraf from 'telegraf'

export interface Ctx extends telegraf.Context {
    db: Db,
    scene: any,
}
