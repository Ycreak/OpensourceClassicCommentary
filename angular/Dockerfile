# Use the official Node.js image as the base image
FROM node:22

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install dependencies
RUN npm install

# Copy the rest of the Angular application code
COPY . .

# Expose the port that Angular will serve on
EXPOSE 4200

# Run the Angular development server (ng serve)
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

