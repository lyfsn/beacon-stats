FROM node:20

ARG VITE_IP_ADDRESS
ENV VITE_IP_ADDRESS=${VITE_IP_ADDRESS}

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD ["yarn", "dev", "--host"]
