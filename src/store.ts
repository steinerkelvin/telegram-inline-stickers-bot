type Db = import('mongodb').Db
type User = import('telegram-typings').User

export const add_sticker_tag = (db: Db) =>
    async (user: User, sticker_id: string) => {
        const col = db.collection('users')

        return await col.updateOne(
            {
                id: user.id,
            },
            {
                $addToSet: { stickers: sticker_id }
            },
            { upsert: true }
        )
    }

export const get_stickers = (db: Db) =>
    async (user: User) => {
        const col = db.collection('users')

        const userDoc = await col.findOne({
            id: user.id,
        })

        return userDoc && userDoc.stickers
    }
