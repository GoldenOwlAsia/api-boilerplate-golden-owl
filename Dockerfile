FROM node:7.10-alpine

RUN apk add --no-cache libc6-compat

ADD package.json yarn.lock /tmp/

RUN set -x && \
  apk add --no-cache --virtual .build-dependencies \
    python \
    g++ \
    make && \
  cd /tmp && \
  yarn  && \
  yarn cache clean && \
  apk del .build-dependencies && \
  mkdir -p /app && \
  cp -a /tmp/node_modules /app/ && \
  rm -rf /tmp

WORKDIR /app
ADD . /app

EXPOSE 3000

ENTRYPOINT [ "node", "."]
