FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]
