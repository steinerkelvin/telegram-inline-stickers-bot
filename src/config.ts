import dotenv from "dotenv"
import convict from "convict"

dotenv.config()

const config = convict({
    telegram_token: {
        doc: 'Telegram Bot Token',
        env: 'TELEGRAM_TOKEN',
        format: '*',
        default: '',
    },
    mongo_uri: {
        env: 'MONGO_URI',
        format: '*',
        default: '',
    },
    mongo_user: {
        env: 'MONGO_USER',
        format: '*',
        default: '',
    },
    mongo_pass: {
        env: 'MONGO_PASS',
        format: '*',
        default: '',
    },
    db_name: {
        env: 'DB_NAME',
        format: '*',
        default: 'stickersbot',
    }
})

export default config
