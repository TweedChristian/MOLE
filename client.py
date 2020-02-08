#!/usr/bin/env python3

import socket
import serial
import sys
import json


def parseCommandMessage(message):
    print("Command Message")
    # print(message['character'])
    # # 000
    # # msg = str(0b000)
    # # msg = msg + message['character']
    # # print(msg)
    # # b=msg.encode('ascii')
    # # print(b)
    # # arduino.write(b)

    # msg = 0b000
    # print("initial message", msg)
    # print("ord", ord(message['character']))
    # print("ord but its shifted", ord(message['character']) << 8)
    # msg |= (ord(message['character']) << 8)
    # print("message with data", msg)
    # data = ord(message['character'])
    # print("extracted message data",data)
    # # print(type(message['character']))
    # # print(type(message['character'].encode('ascii')))
    # print(type(data))
    # # arduino.write(msg)

    # Lets just ignore that stuff up there for a second
    # True format will be 
    # type: 'controls'
    # boringSpeed: int
    # extensionRate: int (?)
    # inflateFront: bool
    # inflateBack: bool
    # turningX: float
    # turningY: float
    # All values for analog control must be mapped from their values to a 0 - 255 scale
    # EG turning goes from -3.5 to 3.5 (i think) so balls out turning left (-3.5) will be 0, and balls out right (+3.5)will be 255

    charData = message['character']
    speedData = message['boringSpeed']

    print(type(charData))
    print(type(ord(charData)))
    print(type(chr(ord(charData))))
    print(type(speedData))
    arduino.write('0')
    arduino.write(chr(ord(charData)))
    arduino.write(chr(speedData))
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
    # print(x['character'])
    # print(repr(data).strip('\''))
    # arduino.write(repr(data).strip('\''))
    print("arduino says:", arduino.readline())
s.close()
