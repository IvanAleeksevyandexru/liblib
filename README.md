#**epgu-portal**

Сначала делаем билд портала:
```
npm run portal-build:prod
```
В файле config.js устанавливаем значение поля:
```
viewType: "PORTAL" 
```
Далее в зависимости от того какая часть нужна для разаработки клиентская или серверная, следуем одной из двух интсрукций:

1.Запуск серверной части и клиентской одновременно. при этом сервер nodejs полноценно отдает все данные через pug. Запускать необходимо при условии, что вам нужно делать изменения в серверной части express (при этом менять серверные файлы с последующим автоапдейтом можно только в dist...):
```
npm run app-server:serve
```
2.Запуск клиентской части и серверной части. При этом сервер nodejs будет работать как api. Запускать необходимо при условии, что вам нужно делать изменения в  клиентской части приложения:
```
npm run portal-client:serve
npm run app-server:serve
```
--------------------
Для production. 
Сборка production:
```
npm run portal-build:prod
```
Старт портала в режиме кластеризации в режиме production (нужен глобальный pm2):
```
npm run app-run
```
#**epgu-lk**

Сначала делаем билд лк:
```
npm run lk-build:prod
```
В файле config.js устанавливаем значение поля:
```
viewType: "LK" 
```
Далее в зависимости от того какая часть нужна для разаработки клиентская или серверная, следуем одной из двух интсрукций:

1.Запуск серверной части и клиентской одновременно. при этом сервер nodejs полноценно отдает все данные через pug. Запускать необходимо при условии, что вам нужно делать изменения в серверной части express:
```
npm run lk-client:watch
npm run app-server:watch
```
2.Запуск клиентской части и серверной части. При этом сервер nodejs будет работать как api. Запускать необходимо при условии, что вам нужно делать изменения в  клиентской части приложения:
```
npm run lk-client:serve
npm run app-server:serve
```
3.Для IE необходимо проделать следующее:
```
В файле проекта tsconfig.app.json добавить в compilerOptions 
"target": "es5"
!Затем вернуть как было!
```
--------------------
Для production. 
Сборка production:
```
npm run lk-build:prod
```
Старт портала в режиме кластеризации в режиме production (нужен глобальный pm2):
```
npm run app-run
```
Сборка для нескольких сред в режиме прод:
```
npm run build-all
```

#**epgu-partners**

Сначала делаем билд партнеров:
```
npm run partners-build:prod
```
В файле config.js устанавливаем значение поля:
```
viewType: "PARTNERS" 
```
Далее в зависимости от того какая часть нужна для разаработки клиентская или серверная, следуем одной из двух интсрукций:

1.Запуск серверной части и клиентской одновременно. при этом сервер nodejs полноценно отдает все данные через pug. Запускать необходимо при условии, что вам нужно делать изменения в серверной части express:
```
npm run partners-client:watch
npm run app-server:watch
```
2.Запуск клиентской части и серверной части. При этом сервер nodejs будет работать как api. Запускать необходимо при условии, что вам нужно делать изменения в  клиентской части приложения:
```
npm run partners-client:serve
npm run app-server:serve
```
--------------------
Для production. 
Сборка production:
```
npm run partners-build:prod
```
Старт портала в режиме кластеризации в режиме production (нужен глобальный pm2):
```
npm run app-run
```

#**epgu-payment**

Сначала делаем билд payment:
```
npm run payment-build:prod
```
В файле config.js устанавливаем значение поля:
```
viewType: "PAYMENT" 
```
Далее в зависимости от того какая часть нужна для разаработки клиентская или серверная, следуем одной из двух интсрукций:

1.Запуск серверной части и клиентской одновременно. при этом сервер nodejs полноценно отдает все данные через pug. Запускать необходимо при условии, что вам нужно делать изменения в серверной части express:
```
npm run payment-client:watch
npm run app-server:watch
```
2.Запуск клиентской части и серверной части. При этом сервер nodejs будет работать как api. Запускать необходимо при условии, что вам нужно делать изменения в  клиентской части приложения:
```
npm run payment-client:serve
npm run app-server:serve
```
3.Для IE необходимо проделать следующее:
```
В файле проекта tsconfig.app.json добавить в compilerOptions 
"target": "es5"
!Затем вернуть как было!
```

--------------------
Для production. 
Сборка production:
```
npm run payment-build:prod
```
Старт портала в режиме кластеризации в режиме production (нужен глобальный pm2):
```
npm run app-run
```

Сборка для нескольких сред в режиме прод:
```
npm run build-all-payment
```
