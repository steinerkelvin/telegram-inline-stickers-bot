FROM node:16 AS build

COPY ./src /app/src 
COPY ./package.json ./yarn.lock ./tsconfig.json /app/

WORKDIR /app

RUN yarn install
RUN yarn build


FROM node:16-alpine AS app

COPY --from=build /app/build /app/build
COPY ./package.json ./yarn.lock /app/

WORKDIR /app
RUN yarn install --prod

CMD ["node", "./build/bot.js"]
