############### FRONTEND BUILD ###############
FROM node:lts-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build


############### BACKEND BUILD ###############
FROM node:lts-alpine AS backend-builder

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server ./ 
RUN npm run build


############### FINAL RUNTIME IMAGE ###############
FROM node:lts-alpine

WORKDIR /app

# Install only backend production deps
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --only=production

# Copy compiled backend
COPY --from=backend-builder /app/server/dist ./server/dist

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

EXPOSE 3000

CMD ["node", "server/dist/index.js"]
