const TelegramApi = require('node-telegram-bot-api')
const askFromGemini = require("./test-gemini-ai")
const token = '8348005128:AAHK9BD4nuBrqBwSxFpKf_2LsC52tS3N3bk'

const bot = new TelegramApi(token, {polling: true})
const chats = {}

const startGame = async (chatId) => {
    chats[chatId] = { inGame: true }

    await bot.sendMessage(chatId, 'Сейчас напиши слово — найдем рифмы!')

    const handler = async (msg) => {
        if (msg.chat.id !== chatId) return
        if (!chats[chatId]?.inGame) return

        const word = msg.text.trim()
        const answer = await askFromGemini(word)

        const replyText = answer && answer.length > 0
            ? `Рифмы: ${answer.join(', ')}`
            : 'Не нашёл рифм'

        await bot.sendMessage(chatId, replyText)

        await bot.sendMessage(chatId, 'Ещё слово?', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Да', callback_data: 'again' }],
                    [{ text: 'Нет', callback_data: 'stop' }]
                ]
            }
        })
    }

    bot.on('message', handler)
    chats[chatId].handler = handler
}

bot.on('callback_query', async (msg) => {
    if (!msg.data) return

    const data = msg.data
    const chatId = msg.message.chat.id

    await bot.answerCallbackQuery(msg.id)

    if (data === 'again') {
        if (chats[chatId]?.handler) {
            bot.removeListener('message', chats[chatId].handler)
        }
        delete chats[chatId]
        return startGame(chatId)
    }

    if (data === 'stop') {
        if (chats[chatId]?.handler) {
            bot.removeListener('message', chats[chatId].handler)
        }
        delete chats[chatId]
        return bot.sendMessage(chatId, 'Игра окончена!')
    }
})

const start = async () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра рифме'},
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        try {
            if (chats[chatId]?.inGame) return

            if (text === '/start') {
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                return bot.sendMessage(chatId, `Добро пожаловать в телеграм бот о рифме слов /info - про тебя и /game - игра о рифме о слов`)
            }
            if (text === '/info') {
                console.log(chatId, msg.from.first_name)
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)')
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)')
        }
    })
}

start()