FROM node:current-alpine

ENV NODE_ENV=production

RUN mkdir /posts-service
WORKDIR /posts-service

RUN apk update && apk upgrade && \
    apk add --no-cache bash python3 git openssh

COPY package.json package-lock.json ./
RUN  npm install

COPY . .

RUN adduser -D myuser
USER myuser
EXPOSE 3456 
CMD ["npm", "start"]