## Description

Бэкенд проект на [Nest.js](https://github.com/nestjs/nest) + [Postgres](https://www.postgresql.org/), который позволяет пользователям регистрироваться, авторизовываться и просматривать список пользователей.

## Project setup and start (Docker)

Необходимо установить [Git](https://git-scm.com/downloads) и [Docker](https://www.docker.com/), затем:

```bash
# Клонировать репозиторий
$ git clone https://github.com/Zatopchy/backend_nestjs.git

# Перейти в директорию проекта
$ cd backend_nestjs

# Создать файл .env и указать переменные окружения (пример .env.example)
cp .env.example .env

# Собрать и запустить контейнеры
$ docker-compose up --build
```

## Swagger

Документация API's будет доступна после установки и запуска проекта.

По умолчанию путь: http://localhost:3000/docs/swagger/

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2eov
```
