FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npx drizzle-kit push:pg

EXPOSE 3000
CMD ["node", "dist/main.js"]
