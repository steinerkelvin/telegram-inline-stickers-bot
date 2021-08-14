// import { Db } from "mongodb"

type Db = import('mongodb').Db
type User = import('telegram-typings').User

// TODO store alias

export async function dbAddSticker(db: Db, user: User, stickerId: string) {
    const col = db.collection('users')

    return await col.updateOne(
        {
            id: user.id,
        },
        {
            $addToSet: {stickers: stickerId}
        },
        { upsert: true }
    )
}

export async function dbGetStickers(db: Db, user: User) {
    const col = db.collection('users')

    const userDoc = await col.findOne({
        id: user.id,
    })

    return userDoc && userDoc.stickers
}
