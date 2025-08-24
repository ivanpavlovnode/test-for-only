# Исторические даты, познавательный веб-ресурс - тестовое задание (React/TS)
# [🌐Ссылка на рабочий проект](https://testforonly.website)
## Использованные технологии/библиотеки: React 19.1, TypeScript, styled-components, swiper/react, Webpack.
## Локальный запуск
### Вам потребуется клонировать этот репозиторий и запустить Webpack сервер.
Для этого необходимы Node.js (версия 16+), npm и Git.
#### Инструкция для Visual Studio Code
1. Создайте удобную директорию, откройте терминал в ней (ПКМ => Open in Integrated Terminal).
2. Клонируйте репозиторий
```bash
git clone https://github.com/ivanpavlovnode/test-for-only
```
3. Перейдите в папку src
```bash
cd src
```
4. Запустите сервер для разработки, выполнив стандартный скрипт React
```bash
npm start
```
5. Автоматически откроется ваш браузер по умолчанию с приложением. Если этого не произошло, введите в адресной строке localhost:3000 вручную.
### Как проверить с разным количеством временных интервалов:
1. Откройте файл /test-for-only/src/components/AppBlock.tsx
2. Найдите строку 100 и замените SixIntervals на TwoIntervals или FourIntervals, если вам нужны 2 или 4 промежутка соответственно.
3. Если вам нужны 3 или 5 промежутков, тогда нужно открыть /test-for-only/src/components/subcomponents/ArtificialData.tsx
4. В нем нужно создать и экспортировать новый массив объектов
```tsx
export const NewArrayName: Interval[] = [
//Ваши объекты в соответствии с интерфейсом Interval
];
```
5. После этого вписать имя нового массива в AppBlock.tsx в строку 100.
