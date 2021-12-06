FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

HEALTHCHECK --interval=3s --timeout=3s --start-period=3s CMD wget -O - -q -Y off http://127.0.0.1:3000 || exit 1

EXPOSE 3000

CMD [ "npm", "start" ]
