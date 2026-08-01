FROM node:24-slim

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY push.js .
COPY node.js .

ENV GRAM_PUSH_PORT=9099
ENV GRAM_PUSH_DATA=/data
EXPOSE 9099
CMD ["node", "push.js"]
