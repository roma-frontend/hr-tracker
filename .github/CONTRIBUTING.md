# Commit Message Guidelines

Этот проект использует Conventional Commits. Commitlint проверяет каждый коммит.

## Формат

```
<type>: <subject>
```

Максимальная длина заголовка: **100 символов**.

## Типы

| Тип        | Описание                                                        |
| ---------- | --------------------------------------------------------------- |
| `feat`     | Новая функциональность                                          |
| `fix`      | Исправление бага                                                |
| `docs`     | Изменение документации                                          |
| `style`    | Форматирование, пробелы, точки с запятой (без изменения логики) |
| `refactor` | Рефакторинг кода (не фича, не фикс)                             |
| `perf`     | Улучшение производительности                                    |
| `test`     | Добавление/изменение тестов                                     |
| `build`    | Изменения сборки, зависимостей, конфигов                        |
| `ci`       | Изменения CI/CD pipelines                                       |
| `chore`    | Прочее (не меняет src/)                                         |
| `revert`   | Откат предыдущего коммита                                       |

## Примеры

✅ **Правильно:**

```
feat: add driver shift management
fix: prevent duplicate ShieldLoader on dashboard
docs: update API endpoint documentation
refactor: extract RBAC helpers from users.ts
ci: add env vars to build job
test: add coverage threshold to jest config
```

❌ **Неправильно:**

```
update files
fix stuff
WIP
asdf
```

## Scope (опционально)

Можно добавить область для уточнения:

```
feat(drivers): add shift management
fix(i18n): merge duplicate superadmin keys
refactor(convex): split drivers.ts into modules
```
