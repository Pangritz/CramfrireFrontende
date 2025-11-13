FROM node:14 AS build

WORKDIR /app

COPY ./package-lock.json .
COPY ./package.json .
COPY ./.env.development .

RUN npm ci

COPY . . 

RUN npm run build-dev

# nginx
FROM nginx:latest

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
