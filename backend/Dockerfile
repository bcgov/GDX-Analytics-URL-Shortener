# Use the official Node.js LTS (16.x) image as a base image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Fix npm cache ownership issue
USER root
RUN chown -R node:node /.npm

# Switch back to the node user
USER node

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
