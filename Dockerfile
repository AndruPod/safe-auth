#FROM node:20-alpine AS build
#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build
#
#FROM node:20-alpine
#WORKDIR /usr/src/app
#COPY --from=build /usr/src/app/package*.json ./
#COPY --from=build /usr/src/app/dist ./dist
#RUN npm install --production
#EXPOSE 3000
#CMD ["node", "dist/main.js"]

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npx drizzle-kit push:pg

EXPOSE 3000
CMD ["node", "dist/main.js"]
