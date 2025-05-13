FROM node:18-alpine AS build

WORKDIR /app


ARG VITE_MODE=production
ARG VITE_API_URL

ENV VITE_MODE=$VITE_MODE
ENV VITE_API_URL=$VITE_API_URL



COPY package*.json ./
RUN npm install

COPY . .


RUN npm run build -- --mode $VITE_MODE


FROM nginx:stable-alpine


COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]