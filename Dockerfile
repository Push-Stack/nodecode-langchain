FROM node:20.12.2-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD [ "node", "index.mjs" ]