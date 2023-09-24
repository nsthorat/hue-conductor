#!/bin/bash

export NODE_ENV=development


# Start the vite devserver.
npm run dev -- --open &
pid[1]=$!

# Run the node server.
bun server.ts
pid[0]=$!

# When control+c is pressed, kill all process ids.
trap "kill ${pid[0]} ${pid[1]};  exit 1" INT
wait
