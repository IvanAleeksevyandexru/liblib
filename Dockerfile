FROM registry.gosuslugi.local/build_images/node:14.17.5 as build

WORKDIR /opt
COPY *.json .npmrc ./
RUN npm i
COPY . .
RUN npm config set userconfig ./.npmrc
RUN npm run lib-release
