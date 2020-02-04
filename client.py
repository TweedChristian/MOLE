#!/usr/bin/env python3

import socket
import serial
import sys
import json


def parseControlMessage(message):
    print("Control Message")
    print(message['character'])

def parseDesyncMessage(message):
    print("Desync Message")

def parseErrorMessage(message):
    print("Error Message")

def parsePathMessage(message):
    print("Path Message")

def emergencyStop():
    print("Bad things happening")

if(len(sys.argv) != 2):
    print("Usage: python client.py <serial port>")
    exit()
serialPort = sys.argv[1]
port = 7086
try:
    arduino = serial.Serial(serialPort, timeout = 1, baudrate = 9600)
except:
    print("Could not establish serial connection")
    exit()

s = socket.socket()
s.connect(('127.0.0.1', port))
s.sendall('jef')

while 1:
    try:
        data = s.recv(1024)
    except:
        print('Socket connection closed by server')
        exit()
    print('Received') 
    print(data)
    x = json.loads(data)
    try:
        messageType = x['type']
    except KeyError, e:
        print("Message has no type field")
        messageType = ''
    if(messageType == 'controls'):
        parseControlMessage(x)
    elif(messageType == 'desync'):
        parseDesyncMessage(x)
    elif(messageType == 'emergency'):
        emergencyStop()
    elif(messageType == 'Error'):
        parseErrorMessage(x)
    elif(messageType == 'path'):
        parsePathMessage(x)
    else:
        print("Malformed message of type " + messageType + " recieved")
    # print(x['character'])
    # print(repr(data).strip('\''))
    # arduino.write(repr(data).strip('\''))
    # print("arduino says:", arduino.readline())
s.close()
