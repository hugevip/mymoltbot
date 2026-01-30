FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY quick-start.ts ./

# Create tsconfig.json
RUN echo '{ \
  "compilerOptions": { \
    "target": "ES2020", \
    "module": "commonjs", \
    "outDir": "./dist", \
    "rootDir": "./", \
    "strict": true, \
    "esModuleInterop": true, \
    "skipLibCheck": true, \
    "forceConsistentCasingInFileNames": true \
  }, \
  "include": ["**/*.ts"] \
}' > tsconfig.json

# Expose port
EXPOSE 3001

# Start the application
CMD ["npx", "ts-node", "quick-start.ts"]