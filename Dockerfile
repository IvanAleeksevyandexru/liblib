FROM registry.gosuslugi.local/build_images/node:12.11.1 as build

WORKDIR /opt
COPY *.json .npmrc ./
RUN npm i
COPY . .
RUN npm run lib-release
