# Docker file for containerize fragment microservice

# Use node version 16.15.
FROM node:16.15.0

LABEL maintainer="Louis Amoah-Nuamah <lamoah-nuamah@myseneca.ca>" \
    description="Fragment node.js microservice"

# We default to use port 8080 in our service.
ENV PORT=8080

# Reduce npm span when installing with Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to /app
COPY package.json package-lock.json ./

# Install node dependencies defined in package.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copymour HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
