#!/bin/bash

node server.js &
NODE_PID=$!

sleep 1

python client.py $1 &
PYTHON_PID=$!
while [ 1 ]
do
    read bop
    if [ "$bop" == "quit" ]
    then
        kill $NODE_PID
        kill $PYTHON_PID
        exit
    else 
    echo "pp"
fi
done