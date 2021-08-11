# Правила работы с библиотекой

## Как запускать либу и лк в режиме watch mode(остальные проекты по аналогии):

1. Отводим ветку от _branch-prod-fed_.
2. Делаем сборку либы и одновременно watch: `npm run lib-watch`.
3. Заходим в папку dist/epgu-lib и из под этого пути в терминале выполняем `npm link` (отлинковать можно так: `npm unlink`).
   После того как сборка прошла запускаем команду `npm run cp-lib-assets`
   (чтобы assets в dist подцепились - хорошо бы это сделать как-то по-другому - задача на подумать).
4. Открываем нужный проект, свою ветку, выполняем `npm i` (если нужно).
5. Из под корня epgu-app в терминале выполняем команду: `npm link @epgu/epgu-lib`
6. Запускаем проект как обычно (к примеру, `app-server:serve` и `lk-client:serve`)
7. Если все прошло успешно сейчас папка @epgu/epgu-lib в node_modules должна смотреть на проект @epgu/epgu-lib, тот, что в новом репозитории.
   Меняем что-нибудь в проекте @epgu/epgu-lib - выполняется автоматом била либы и изменения подтягиваются сразу в лк, так как там запущен serve и стоил link на @epgu/epgu-lib
8. Поднятие версий либы работает абсолютно также, но из под проекта @epgu/epgu-lib.
   Папка @epgu/epgu-lib в apgu-app более не нужна, поэтому я ее удалил в EPGUCORE-LIB.

## Как создать ветку по задаче:

1. Отводимся от _branch-prod-fed_ с продовой версией либы
2. Правим либу.
3. Публикуем из своей ветки.

## Как публиковать:

1.  Повышаем версию либы: в [package.json](package.json).
    1. Текущую версию можно посмотреть командой `npm view @epgu/epgu-lib versions` в основном приложении(не в либе). Последний номер X.X.X без дополнительных слешей и есть последняя версия.
1.  Билдим либу: `npm run lib-build:prod`
1.  Публикуем:
    1. переходим в _dist/epgu-lib_,
    2. выполняем `npm publish`
    3. Если в процессе публикации вылетела ошибка "Can not publish over existing version" - возвращаемся к п. 1
1.  Делаем коммит с указанием версии опубликованной либы и пуш.
    1. _Можно написать в чате, что повысили версию либы._
1.  В проекте в папке epgu-app в package.json в devDependencies меняем версию "@epgu/epgu-lib" на ту, что вы только что опубликовали (например "epgu-lib": 0.0.70 как в примере выше).
1.  Чтобы отлинковать либу в epgu-app `npm uninstall --no-save @epgu/epgu-lib && npm i`
