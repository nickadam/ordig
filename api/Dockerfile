FROM debian:buster AS build

RUN echo "deb http://deb.debian.org/debian/ unstable main" > /etc/apt/sources.list.d/unstable.list && \
  printf 'Package: *\nPin: release a=unstable\nPin-Priority: 90\n' > /etc/apt/preferences.d/limit-unstable && \
  apt-get update && \
  apt-get install -y wireguard

FROM node:14

LABEL maintainer="@nickadam"

ENV TZ America/New_York

ENV DEBIAN_FRONTEND noninteractive

RUN npm i -g nodemon

COPY --from=build /usr/bin/wg /usr/bin/wg

COPY ./ /home/node/app/

USER root

RUN mkdir /data

WORKDIR /home/node/app

RUN npm install
