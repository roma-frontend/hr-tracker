# 🖼️ Настройка Cloudinary для загрузки аватаров

## Проблема: "Unknown API key"

Эта ошибка возникает, когда **Upload Preset** не настроен как **unsigned** в Cloudinary.

---

## 📝 Шаги настройки:

### 1. Откройте Cloudinary Dashboard
Перейдите на: https://cloudinary.com/console

### 2. Создайте Unsigned Upload Preset

1. В левом меню нажмите на **Settings** (⚙️)
2. Перейдите на вкладку **Upload**
3. Прокрутите вниз до раздела **Upload presets**
4. Нажмите **Add upload preset**

### 3. Настройте Upload Preset

**Обязательные настройки:**
- **Preset name:** `hr_office_avatars` (должно совпадать с .env.local)
- **Signing mode:** **Unsigned** ⚠️ (ВАЖНО!)
- **Folder:** `hr-office/avatars`

**Рекомендуемые настройки:**
- **Access mode:** Public
- **Unique filename:** Yes (включить)
- **Overwrite:** Yes (включить)

**Трансформации (опционально):**
- Width: 200
- Height: 200
- Crop mode: Fill
- Gravity: Face

### 4. Сохраните
Нажмите **Save**

---

## 🔧 Проверка .env.local

Убедитесь, что ваш файл `.env.local` содержит:

```env
# Cloudinary — free 25GB avatar storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfbt0q1y
NEXT_PUBLIC_CLOUDINARY_API_KEY=963995227517392
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hr_office_avatars
CLOUDINARY_API_SECRET=KkGNfq5XkLZIIAqE1SSpoBsp6p4
CLOUDINARY_URL=cloudinary://963995227517392:KkGNfq5XkLZIIAqE1SSpoBsp6p4@dsfbt0q1y
```

**Важно:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` должен быть **dsfbt0q1y** (ваш cloud name)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` должен быть **hr_office_avatars**
- Preset должен быть **unsigned** в Cloudinary Dashboard

---

## 🧪 Тестирование

После настройки:

1. **Перезапустите сервер Next.js:**
   ```bash
   # Остановите сервер (Ctrl+C)
   # Затем запустите снова
   npm run dev
   ```

2. **Очистите кэш браузера:**
   - Нажмите `Ctrl+Shift+R` (Windows/Linux)
   - Или `Cmd+Shift+R` (Mac)

3. **Попробуйте загрузить аватар:**
   - Войдите в систему
   - Перейдите в Settings
   - Нажмите на иконку камеры
   - Выберите изображение

---

## ❌ Распространенные ошибки

### "Unknown API key"
**Причина:** Upload preset требует подписи (signed), а не unsigned.
**Решение:** Измените Signing mode на **Unsigned** в настройках preset.

### "Invalid upload preset"
**Причина:** Preset name не совпадает с тем, что в .env.local.
**Решение:** Убедитесь, что имя preset точно `hr_office_avatars`.

### "Upload failed"
**Причина:** Cloud name неверный.
**Решение:** Проверьте, что `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfbt0q1y`.

---

## 🔍 Альтернативный способ (если unsigned не работает)

Если unsigned upload не работает, можно использовать signed upload:

### Обновите `src/actions/cloudinary.ts`:

```typescript
"use server";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAvatarToCloudinary(
  base64Image: string,
  userId: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'hr-office/avatars',
      public_id: userId,
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload avatar');
  }
}
```

### Установите пакет:
```bash
npm install cloudinary
```

---

## ✅ Проверочный список

- [ ] Upload preset создан в Cloudinary Dashboard
- [ ] Signing mode установлен на **Unsigned**
- [ ] Preset name: `hr_office_avatars`
- [ ] Folder: `hr-office/avatars`
- [ ] `.env.local` содержит правильные значения
- [ ] Сервер Next.js перезапущен
- [ ] Кэш браузера очищен

---

**Дата:** 2026-02-23  
**Статус:** Настройка завершена ✅
