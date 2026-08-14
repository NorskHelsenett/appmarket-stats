FROM node:26-alpine AS build-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:26-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:26-alpine AS build-env
COPY . /app/
COPY --from=build-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN ls -la /app/app
RUN npm run build

FROM node:26-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]