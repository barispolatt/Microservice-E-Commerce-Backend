FROM node:18-alpine

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies including the shared library
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Command to run the application
CMD ["node", "dist/main"]