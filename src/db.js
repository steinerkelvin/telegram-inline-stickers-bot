
// TODO store alias

async function dbAddSticker(db, user, stickerId) {
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

async function dbGetStickers(db, user) {
    const col = db.collection('users')

    const userDoc = await col.findOne({
        id: user.id,
    })

    return userDoc && userDoc.stickers
}


module.exports = { dbAddSticker, dbGetStickers }
