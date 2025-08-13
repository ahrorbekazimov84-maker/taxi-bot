from aiogram import Bot, Dispatcher, types, executor

TOKEN = "8188404054:AAH2RmYeAL3V7glcXkZZH20I2PHjm5CECHw"
ADMIN_ID = 7823208267
GROUP_ID = -2876702277  # Guruh ID oldida minus bo'lishi kerak!

bot = Bot(token=TOKEN)
dp = Dispatcher(bot)

# Buyurtma ma'lumotlarini saqlash uchun
user_orders = {}

@dp.message_handler(commands=['start'])
async def start_command(message: types.Message):
    user_orders[message.from_user.id] = {}
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(types.KeyboardButton("📍 Lokatsiya yuborish", request_location=True))
    keyboard.add(types.KeyboardButton("📞 Telefon raqam yuborish", request_contact=True))
    await message.answer("Salom! Buyurtma berish uchun lokatsiyangiz va telefon raqamingizni yuboring.", reply_markup=keyboard)

@dp.message_handler(content_types=['contact'])
async def get_contact(message: types.Message):
    user_orders[message.from_user.id]['phone'] = message.contact.phone_number
    await message.answer("✅ Telefon raqamingiz qabul qilindi. Endi 📍 Lokatsiya yuboring yoki manzilingizni yozing.")

@dp.message_handler(content_types=['location'])
async def get_location(message: types.Message):
    lat = message.location.latitude
    lon = message.location.longitude
    user_orders[message.from_user.id]['location'] = (lat, lon)

    # Lokatsiyani tasdiqlash
    await message.answer("✅ Lokatsiya qabul qilindi. Endi agar kerak bo‘lsa, manzilingizni yozing.")

@dp.message_handler()
async def get_order(message: types.Message):
    user_id = message.from_user.id

    # Agar matn manzil sifatida yuborilgan bo'lsa
    user_orders[user_id]['address'] = message.text

    # Agar barcha ma'lumotlar to'plangan bo'lsa
    if 'phone' in user_orders[user_id] and ('location' in user_orders[user_id] or 'address' in user_orders[user_id]):
        order_text = f"🚖 Yangi buyurtma!\n👤 Mijoz: {message.from_user.full_name}\n📞 Tel: {user_orders[user_id]['phone']}"

        # Lokatsiya bo'lsa guruhga yuboramiz
        if 'location' in user_orders[user_id]:
            lat, lon = user_orders[user_id]['location']
            await bot.send_message(GROUP_ID, order_text)
            await bot.send_location(GROUP_ID, latitude=lat, longitude=lon)
        else:
            order_text += f"\n📍 Manzil: {user_orders[user_id]['address']}"
            await bot.send_message(GROUP_ID, order_text)

        await message.answer("✅ Buyurtmangiz qabul qilindi. Tez orada haydovchi bog‘lanadi.")
        user_orders[user_id] = {}  # Ma'lumotlarni tozalash

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
