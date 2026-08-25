# Videoteca

> Simple platform with a custom auth system that manages a list of movies with metadata from IMDB.

[![Docker Image Size](https://badgen.net/docker/size/0xeabz/videoteca/main?icon=docker&label=image%20size)](https://hub.docker.com/r/0xeabz/videoteca/main)
![build](https://github.com/eabz/videoteca/actions/workflows/build.yml/badge.svg)

# Requirements

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (Postgres local)

## Installing

1. Clone the repository

```bash
git clone https://github.com/eabz/videoteca && cd videoteca
```

2. Copy the `.env.example` as `.env` file and fill `AUTH_SECRET` and `OMDB_API_TOKEN`.

3. Start Postgres, apply migrations, and run the app (port 3001)

```bash
bun run db:up
bun run migrate
bun run start
```

## Docker

App y Postgres juntos (puerto 3000):

```bash
docker compose --profile app up --build
```

O la imagen publicada, contra un Postgres alcanzable (no `127.0.0.1` desde el contenedor):

```bash
docker image pull 0xeabz/videoteca:main
docker run --env-file ./.env -p 3000:3000 0xeabz/videoteca:main
```