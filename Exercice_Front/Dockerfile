# Dockerfile pour développement avec hot reload
FROM node:20-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
