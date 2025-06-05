FROM node:22 AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20 AS run

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
RUN ulimit -c unlimited
EXPOSE 3000
ENTRYPOINT ["node", "build"]
