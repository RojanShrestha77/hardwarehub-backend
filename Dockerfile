# FROM — pick a starting base image.
# "oven/bun:1-alpine" = official Bun runtime on Alpine Linux.
# Alpine is a tiny 5MB Linux distro — keeps your image small.

# alpine linus is a super tiny, lightweight linus distribution designed specifically for containers
FROM oven/bun:1-alpine

# WORKDIR — all following commands run from this folder inside the container.
WORKDIR /app

# COPY package files FIRST — before source code.
# WHY: Docker caches each layer. If package.json didn't change,
# the next "bun install" step is skipped on rebuild. Big time saver.
COPY package.json bun.lock ./

# RUN — executes a shell command while building the image.
# --frozen-lockfile = fail if bun.lock is out of sync (safe for production).
RUN bun install --frozen-lockfile

# Now copy the rest of your source code.
COPY . .

# EXPOSE — documents which port the app uses inside the container.
# (doesn't actually open the port — that's done in docker-compose)
EXPOSE 5000

# CMD — the command that runs when the container starts.
CMD ["sh", "entrypoint.sh"]
