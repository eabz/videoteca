# Videoteca

> Simple platform with a custom auth system that manages a list of movies with metadata from IMDB.

[![Docker Image Size](https://badgen.net/docker/size/0xeabz/videoteca/main?icon=docker&label=image%20size)](https://hub.docker.com/r/0xeabz/videoteca/main)
![build](https://github.com/eabz/videoteca/actions/workflows/build.yml/badge.svg)

# Requirements

- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/)

## Installing

1. Clone the repository

```bash
git clone https://github.com/eabz/videoteca && cd videoteca
```

2. Copy the `.env.example` as `.env` file and modify it with your environment variables.

3. Start the app

```bash
bun run start
```

## Docker

1. Download the public docker image

```bash
docker image pull 0xeabz/videoteca:main
```

2. Copy the `.env.example` as `.env` file and modify it with your environment variables.

3. Start the docker container

```bash
docker run --env-file ./.env -p 3000:3000 0xeabz/videoteca:main 
```