import TelegramBot from 'node-telegram-bot-api'
import './globals'
import * as cbu from './cbu'
import { downloadFile } from './telegram'

const token = process.env.LEEMEELCBU_TELEGRAM_TOKEN
if (['', undefined].includes(token)) {
  process.stderr.write('Missing LEEMEELCBU_TELEGRAM_TOKEN\n')
  process.exit(1)
}

const processPhoto = async (chatId: number, msg: TelegramBot.Message) => {
  bot.sendMessage(chatId, 'Procesando imagen...');
  try {
    const { file_id } = msg.photo[msg.photo.length - 1]
    const file = await downloadFile(bot, file_id)
    const cbus = await cbu.readFile(file)
    if (cbus.length === 0) {
      bot.sendMessage(chatId, 'No se encontró ningún CBU')
    } else {
      await bot.sendMessage(chatId, '¡CBU encontrado!')
      await Promise.all(cbus.map((cbu) => bot.sendMessage(chatId, cbu)))
    }
  } catch (e) {
    console.error(e)
    bot.sendMessage(chatId, 'Ocurrió un error');
  }
}

const processDocument = async (chatId: number, msg: TelegramBot.Message) => {
  bot.sendMessage(chatId, 'Procesando documento...');
  try {
    const { file_id } = msg.document;
    const file = await downloadFile(bot, file_id)
    const cbus = await cbu.readFile(file)
    if (cbus.length === 0) {
      bot.sendMessage(chatId, 'No se encontró ningún CBU')
    } else {
      await bot.sendMessage(chatId, '¡CBU encontrado!')
      await Promise.all(cbus.map((cbu) => bot.sendMessage(chatId, cbu)))
    }
  } catch (e) {
    console.error(e)
    bot.sendMessage(chatId, 'Ocurrió un error');
  }
}

const bot = new TelegramBot(token, {polling: true});
bot.on('message', (msg: TelegramBot.Message, metadata: TelegramBot.Metadata) => {
  const chatId = msg.chat.id;
  if (metadata.type === 'photo') {
    processPhoto(chatId, msg)
  } else if (metadata.type === 'document') {
    processDocument(chatId, msg)
  } else {
    bot.sendMessage(chatId, 'Tipo de mensaje no soportado');
  }
})

process.stdout.write('Receiving messages...\n')
