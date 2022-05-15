FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
COPY yarn.lock .

RUN yarn install

# Bundle app source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN yarn build

EXPOSE 8002

CMD ["yarn", "start"]