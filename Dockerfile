FROM node:lts-alpine3.14 as builder

WORKDIR /src

# Copy and download dependencies
COPY package.json ./
RUN yarn --frozen-lockfile

COPY --chown=node:node tsconfig.json ./

USER node
COPY --chown=node:node . .

# install and build the app
RUN npm install
RUN npm run build