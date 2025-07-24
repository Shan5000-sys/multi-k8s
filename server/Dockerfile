FROM --platform=linux/amd64 node:16

WORKDIR /app

# 👇 Add the full path to server's package.json based on context
COPY package*.json ./

RUN npm install --omit=dev

COPY . . 

CMD ["node", "index.js"]