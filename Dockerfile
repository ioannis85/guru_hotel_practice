FROM node:latest
COPY . /app
WORKDIR /app
RUN npm i typescript -location=global
RUN npm i
RUN npx prisma generate
RUN tsc
RUN npm run seedData
EXPOSE 4000
 CMD ["node", "./dist/index.js"]
