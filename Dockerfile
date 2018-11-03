FROM node:8.12.0-alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

RUN apk --update add python ffmpeg build-base

COPY package.json /usr/src/bot
RUN npm install --production

COPY . /usr/src/bot

CMD ["npm", "start"]