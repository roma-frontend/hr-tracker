# ☁️ Настройка Cloudinary - Пошаговая инструкция

## 📋 Ваши данные для входа:
- **Email:** namelayout@gmail.com
- **Password:** Hovik-1970

---

## 🔧 Шаг 1: Войдите в Cloudinary

1. Откройте в браузере: **https://cloudinary.com/users/login**
2. Введите email: `namelayout@gmail.com`
3. Введите пароль: `Hovik-1970`
4. Нажмите **Log In**

---

## 🔧 Шаг 2: Узнайте ваш Cloud Name

После входа:

1. Посмотрите в **правый верхний угол** - там должно быть ваше имя и cloud name
2. ИЛИ посмотрите в URL строку - после `console/` будет ваш cloud name
   
   Пример: `https://console.cloudinary.com/console/c-abc123/...`
   
   Здесь `c-abc123` - это ваш cloud name (без `c-` префикса)

3. **ЗАПИШИТЕ** ваш Cloud Name (например: `abc123` или `dsfbt0q1y`)

---

## 🔧 Шаг 3: Создайте Upload Preset

1. В левом меню нажмите **Settings** (⚙️)
2. Перейдите на вкладку **Upload**
3. Прокрутите вниз до раздела **Upload presets**
4. Нажмите **Add upload preset**

### Настройки preset:

**Обязательные поля:**
- **Preset name:** `ml_default`
- **Signing mode:** **Unsigned** ⚠️ (ОЧЕНЬ ВАЖНО!)

**Дополнительные (опционально):**
- **Folder:** `hr-office/avatars`
- **Unique filename:** Yes
- **Overwrite:** Yes
- **Transformation:**
  - Width: 200
  - Height: 200
  - Crop: fill
  - Gravity: face

5. Нажмите **Save**

---

## 🔧 Шаг 4: Проверьте API Keys

1. В Settings перейдите на вкладку **API Keys**
2. Вы увидите:
   - **Cloud name:** (ваше имя облака)
   - **API Key:** (набор цифр)
   - **API Secret:** (скрыт, нажмите "Show" чтобы увидеть)

3. **ЗАПИШИТЕ** эти данные:
   - Cloud Name: _______________
   - API Key: _______________
   - API Secret: _______________

---

## 🔧 Шаг 5: Обновите .env.local

После того как у вас есть все данные, откройте файл `.env.local` и замените:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ВАШ_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_API_KEY=ВАШ_API_KEY
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
CLOUDINARY_API_SECRET=ВАШ_API_SECRET
CLOUDINARY_URL=cloudinary://ВАШ_API_KEY:ВАШ_API_SECRET@ВАШ_CLOUD_NAME
```

**Пример:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=abc123xyz
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789012345
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
CLOUDINARY_URL=cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@abc123xyz
```

---

## 🔧 Шаг 6: Перезапустите сервер

1. Остановите сервер Next.js (Ctrl+C)
2. Перезапустите:
```bash
npm run dev
```

---

## ✅ Проверка

После настройки:

1. Войдите в систему: http://localhost:3000/login
2. Перейдите в Settings
3. Попробуйте загрузить аватар
4. Должно работать! ✨

---

## 🐛 Если не работает

### Ошибка "Unknown API key"
- **Причина:** Upload preset не настроен как "Unsigned"
- **Решение:** Проверьте что Signing mode = Unsigned

### Ошибка "Invalid upload preset"
- **Причина:** Preset name неправильный
- **Решение:** Убедитесь что preset называется точно `ml_default`

### Ошибка "Invalid cloud name"
- **Причина:** Cloud name неверный в .env.local
- **Решение:** Проверьте cloud name в Cloudinary console

---

## 📞 Что нужно прислать:

После выполнения шагов 1-4, пришлите:

1. ✅ Ваш Cloud Name
2. ✅ Ваш API Key  
3. ✅ Ваш API Secret
4. ✅ Скриншот страницы с Upload Preset (опционально)

Я обновлю .env.local за вас!

---

**Дата:** 2026-02-23
