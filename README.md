# SakuGwej API

## Introduction

This is a simple API for the SakuGwej project. It is built using [expressjs](https://expressjs.com/)

## API List

### GET /

Returns a simple message

### GET /test

Returns a simple test message

### POST /register

Registers a new user, for now doesn't return anything useful

Payload:

```json
{
    "username": "username",
    "password": "password"
}
```

### POST /login

Logs in a user, ~~returns a JWT token~~ doesn't return anything useful

Payload:

```json
{
    "username": "username",
    "password": "password"
}
```
