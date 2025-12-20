# ---- Build stage ---------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production
# or: ng build --configuration production

# ---- Nginx runtime stage -------------------------------------------------
FROM nginx:1.27-alpine

# Remove default Nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular dist (adjust app name if needed)
COPY --from=build /usr/src/app/dist/news-viewer/browser /usr/share/nginx/html

# Optional basic SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
