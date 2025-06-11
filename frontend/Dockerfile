FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]