FROM node:20

ARG VUE_APP_IP_ADDRESS
ENV VUE_APP_IP_ADDRESS=${VUE_APP_IP_ADDRESS}

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD ["yarn", "dev", "--host"]
