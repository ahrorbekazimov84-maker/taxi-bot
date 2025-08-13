import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.enums import ParseMode
from aiogram.types import Message

# Siz bergan ma'lumotlar
TOKEN = "8188404054:AAH2RmYeAL3V7glcXkZZH20I2PHjm5CECHw"
ADMIN_ID = 7823208267
GROUP_ID = -2876702277  # Guruh ID manfiy bo‘lishi kerak

bot = Bot(token=TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()

@dp.message()
async def forward_to_group(message: Message):
    # Faqat admin yozgan bo‘lsa — guruhga yuborish
    if message.from_user.id == ADMIN_ID:
        await bot.send_message(GROUP_ID, message.text)
        await message.answer("Xabar guruhga yuborildi ✅")
    else:
        await message.answer("Sizga ruxsat yo‘q ❌")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
