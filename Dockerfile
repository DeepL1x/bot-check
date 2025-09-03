# Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the NestJS app
RUN yarn build

# Expose API port
EXPOSE 3000

# Start the app
CMD ["yarn", "start:prod"]