# Use the official Node.js LTS Alpine image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Install http-server globally to serve static files
RUN npm install -g http-server

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run http-server to serve the built files
CMD ["http-server", "dist", "-p", "8080"]
