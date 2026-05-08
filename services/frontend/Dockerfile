FROM node:20-alpine

WORKDIR /app

# Copy package.json AND package-lock.json
COPY package*.json ./

# Install dependencies in the container during build
# Using --legacy-peer-deps to avoid potential conflicts with older React versions if they arise
RUN npm install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Ensure permissions are correct
RUN chmod -R 777 node_modules

EXPOSE 3000

# Set environment to prevent some Vite issues in Docker
ENV VITE_HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
