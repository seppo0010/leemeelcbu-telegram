import TelegramBot from 'node-telegram-bot-api'

export const downloadFile = (bot: TelegramBot, fileId: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const _buf = [];
    const fileStream = bot.getFileStream(fileId);
    fileStream.on("data", (chunk) => _buf.push(chunk));
    fileStream.on("end", () => resolve(Buffer.concat(_buf)));
    fileStream.on('error', reject)
  });
}
