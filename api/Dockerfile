FROM node:13

LABEL maintainer="Nick Vissari <nvissari@hcpss.org>"

ENV TZ America/New_York

ENV DEBIAN_FRONTEND noninteractive

RUN npm i -g nodemon

COPY ./ /home/node/app/

RUN mkdir /data && \
    chown 1000:1000 /data

WORKDIR /home/node/app

RUN npm install
