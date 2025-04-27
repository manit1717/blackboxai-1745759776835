#!/bin/bash
# Script to run the Node.js server in the background

# Check if server.js is already running
if pgrep -f "node server.js" > /dev/null
then
    echo "Server is already running."
else
    # Run server.js in the background and redirect output to server.log
    nohup node server.js > server.log 2>&1 &
    echo "Server started in the background."
fi
