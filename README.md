This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
npm run dev --port 3001
# or
yarn install
yarn dev --port 3001
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Run this NextJS app with Docker (WIP)

- Download the Lendo Polling service from:
  docker pull lendo-poller-service
- Run the Lendo Polling service:
  docker run -p 3001:3001 lendo-poller-service:latest
- Once you have the Lendo Polling service container up and running you can access from http://localhost:3001
  or if you are running docker for windows from http://<docker-machine-ip>:3001
