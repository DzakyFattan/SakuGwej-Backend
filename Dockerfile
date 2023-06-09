FROM node:19-alpine as builder

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
RUN npm i

# Exports
EXPOSE 3001

CMD [ "npm", "run", "dev" ]