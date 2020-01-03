FROM node:13.5.0-alpine3.10

WORKDIR /app

COPY . .

EXPOSE 8000

CMD [ "node", "index.js" ]
