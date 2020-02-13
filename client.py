#!/usr/bin/env python3

import socket
import serial
import sys
import json
import numpy as np

MAX_BORE = 2000
MIN_TURN = -3.5
MAX_TURN = 3.5

def scale(domainMin, domainMax, rangeMin, rangeMax, value):
    if(value < domainMin or value > domainMax):
        print("Cannot scale, value ", value, "is out of range")
        return
    if(domainMin < 0):
        scale = abs(domainMin)
        domainMin = domainMin + scale
        domainMax = domainMax + scale
        value = value + scale
    scaled = (float(value) / float(domainMax)) * float(rangeMax)
    return int(scaled)


def parseTestMessage(message):
    print("Test Message")
    # TODO


def parseCommandMessage(message):
    # 000
    # True format will be 
    # type: controls
    # boringSpeed: int
    # extensionRate: int (?)
    # inflateFront: bool
    # inflateBack: bool
    # turningX: float
    # turningY: float
    # All values for analog control must be mapped from their values to a 0 - 255 scale
    # EG turning goes from -3.5 to 3.5 (i think) so balls out turning left (-3.5) will be 0, and balls out right (+3.5)will be 255
    print("command message")

    # Get everything out of the message
    boringSpeed = int(message['boringSpeed'])
    extensionRate = int(message['extensionRate'])
    inflateFront = message['inflateFront']
    inflateBack = message['inflateBack']
    turningX = float(message['turningX'])
    turningZ = float(message['turningZ'])
    if(inflateFront == True):
        inflateFront = 1
    else:
        inflateFront = 0
    if(inflateBack == True):
        inflateBack = 1
    else:
        inflateBack = 0
    print(type(inflateFront))
    print(boringSpeed, extensionRate, inflateFront, inflateBack, turningX, turningZ)

    arduino.write('0')
    arduino.write(chr(boringSpeed))
    arduino.write(chr(extensionRate))
    arduino.write(chr(inflateFront))
    arduino.write(chr(inflateBack))
    arduino.write(chr(int(turningX*10)))
    arduino.write(chr(int(turningZ*10)))
    arduino.write('\n')

    

def parseDesyncMessage(message):
    print("Desync Message")
    # 010

def parseErrorMessage(message):
    print("Error Message")
    # 011

def parsePathMessage(message):
    print("Path Message")
    # 001

def emergencyStop():
    print("Bad things happening")
    # 111

def sendUpstream(message, socket):
    message = message.encode('ascii')
    try:
        socket.sendall(message)
        return 1
    except:
        return 0
        

if(len(sys.argv) != 2):
    print("Usage: python client.py <serial port>")
    exit()

serialPort = sys.argv[1]
port = 7086
try:
    arduino = serial.Serial(serialPort, timeout = 5, baudrate = 9600)
except:
    print("Could not establish serial connection to port " + serialPort)
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
    try:
        x = json.loads(data)
    except:
        if(data == ""):
            print("Empty message sent by server, closing")
            exit()
    try:
        messageType = x['type']
    except KeyError, e:
        print("Message has no type field")
        messageType = ''
    if(messageType == 'controls'):
        parseCommandMessage(x)
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
    reply = arduino.readline()
    print(type(reply))
    print("arduino says:", reply)
    okMessage = {
        'type': 'ok'
    }
    okJSON = json.dumps(okMessage)
    if(sendUpstream(okJSON,s)):
        print("sent ok message")
    else:
        print("error sending ok message")
s.close()
