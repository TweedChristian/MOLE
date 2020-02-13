#!/bin/bash

node server.js &
NODE_PID=$!
sleep 1
python client.py $1 &
PYTHON_PID=$!

trap "kill $NODE_PID &>/dev/null; kill $PYTHON_PID &>/dev/null; exit" SIGINT

while [ 1 ]
do
    read bop
    if [ "$bop" == "quit" ]
    then
        kill $NODE_PID
        kill $PYTHON_PID
    else 
    echo "pp"
fi
done