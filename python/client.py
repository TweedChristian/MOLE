#!/usr/bin/env python3

import socket
import serial
import sys
import json
import numpy as np
import time


MAX_BORE = 2000
MIN_TURN = -3.5
MAX_TURN = 3.5

'''
* Regularizes a value between the given domain to be within the given range
* @Param {number} domainMin 
* @Param {number} domainMax
* @Param {number} rangeMin
* @Param {number} rangeMax
* @Param {number} value
'''
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
'''
* DEPRECATED 
* Passes a command message JSON to the ardunio, values encoded as characters
* @Param {dict} message JSON object/dictionanry containing message keys defined in MOLES API
'''
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
    boringScaled = scale(0, 20, 0, 255, boringSpeed)
    extensionScaled = scale(0, 20, 0, 255, extensionRate)
    turningXScaled = scale(-3.5, 3.5, 0, 255, turningX)
    turningZScaled = scale(-3.5, 3.5, 0, 255, turningZ)
    print(boringScaled, extensionScaled, inflateFront, inflateBack, turningXScaled, turningZScaled)
    arduino.write('0')
    arduino.write(chr(boringScaled))
    arduino.write(chr(extensionScaled))
    arduino.write(chr(inflateFront))
    arduino.write(chr(inflateBack))
    arduino.write(chr(turningXScaled))
    arduino.write(chr(turningZScaled))
    arduino.write('\n')
'''
* Parses a command message JSON object/Dictionary and passes it to arduino over serial
* @Param {dict} message ditcionary containing keys defined for command messages in MOLES API
'''
def parseCommandMessageStr(message):
    # Sends the command message as a string instead of chars.
    # Get everything out of the message
    boringSpeed = float(message['boringSpeed'])
    extensionRate = float(message['extensionRate'])
    inflateFront = message['inflateFront']
    inflateBack = message['inflateBack']
    turningX = float(message['turningX'])
    turningZ = float(message['turningZ'])
    sMesg = "0,"
    sMesg += str(boringSpeed)
    sMesg += ','
    sMesg += str(extensionRate)
    sMesg += ','
    sMesg += str(inflateFront)
    sMesg += ','
    sMesg += str(inflateBack)
    sMesg += ','
    sMesg += str(turningX)
    sMesg += ','
    sMesg += str(turningZ)
    sMesg += '!'
    print("Sending to arduino: ",sMesg)
    arduino.write(sMesg.encode('utf-8'))
    
def parseDesyncMessage(message):
    print("Desync Message")
    # 010
    arduino.write('2')
    arduino.write('!')

def parseErrorMessage(message):
    print("Error Message")
    arduino.write('3,')
    arduino.write('!')
    # 011

def parsePathMessage(message):
    print("Path Message")
    # 001
    # Extract Message Data
    yaw = message['yaw']
    pitch = message['pitch']
    roll = message['roll']
    distance = message['distance']
    pathMessage = '1,'
    pathMessage += str(yaw)
    pathMessage += ','
    pathMessage += str(pitch)
    pathMessage += ','
    pathMessage += str(roll)
    pathMessage += ','
    pathMessage += str(distance)
    pathMessage += '!'
    print("sending path message to arduino ", pathMessage)
    arduino.write(pathMessage.encode('utf-8'))
'''
* Sends a special message to the arduino to inidcate it should halt
'''
def emergencyStop():
    print("Bad things happening")
    arduino.write("3,!")
    # 111
'''
* Sends a message to the Node server via socket connection
* @param {message} JSON String message to send to server
* @param {socket} socket connection object, connected to node server
* @returns 1 if successful, 0 otherwise
'''
def sendUpstream(message, socket):
    message = message.encode('ascii')
    try:
        socket.sendall(message)
        return True
    except:
        print("Error sending upstream")
        return False
'''
* Parses the comma-separated string from the arduino into a JSON object to send to the node server
* @param replyString {str} the comma separated string from arduino
* Stub for now with dummy data, sue me
'''
def parseReply(replyString):
    splitString = replyString.split(',')
    print(splitString)
    if(splitString[0] == 'status'):
        replyJSON = {
            'type': splitString[0],
            'imuAccX': splitString[1],
            'imuAccY': splitString[2],
            'imuAccZ': splitString[3],
            'imuYaw': splitString[4],
            'imuPitch': splitString[5],
            'imuRoll': splitString[6], #we are not controlling roll, maybe dont need
            'boringRPM': splitString[7],
            'extensionRPM': splitString[8],
            'drillTemp': splitString[9],
            'steeringYaw': splitString[10],
            'steeringPitch': splitString[11],
            'frontPSI': splitString[12],
            'backPSI': splitString[13]
        }
    elif(splitString[0] == 'pathStatus'):
        replyJSON ={
            'type': splitString[0],
            'driftX': splitString[1],
            'driftY': splitString[2],
            'driftZ': splitString[3]
        }
    elif(splitString[0] == 'error'):
        #THIS IS A PLACEHOLDER FOR NOW
        replyJSON = {
            'type': splitString[0],
            'message': 'resolved'
        }
    return replyJSON


class arduinoStub():
    def __init__(self):
        self.sentReply = False
        self.messageInType = None
    def readline(self):
        if(self.sentReply == False):
            self.sentReply = True
            if(self.messageInType == 'controls'):
                print("reading controls status from arduino stub")
                return 'status,1.1,2.2,3.3,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0'
            elif(self.messageInType == 'path'):
                print("reading path status from arduino stub")
                return 'pathStatus,1.5,2.5,3.5'
            elif(self.messageInType == 'error'):
                print('reading error status from arduino stub')
                return 'error,received'
        else:
            self.sentReply = False
            return '~\r\n'
    def write(self, message):
        if(message[0] == '0'):
            if(len(message.split(',')) == 7):
                print("Control Message Recieved")
                self.messageInType = "controls"
                pass
            else:
                print("Bad Control Message Recieved")
        elif(message[0] == '1'):
            print("path message recieved")
            self.messageInType = 'path'
            pass
        elif(message[0] == '3'):
            self.messageInType = 'error'
            print("Error Message Recieved")
            print("TESTING")
            pass
        else:
            print("Unknown message type sent to arduino")

if __name__ == "__main__":

    print("Python Data Layer Started")

    if(len(sys.argv) != 2):
        print("Usage: python client.py <serial port>")
        exit()

    serialPort = sys.argv[1]
    port = 7086
    if(serialPort == "test"):
        print('test init')
        arduino = arduinoStub()
    else:
        try:
            arduino = serial.Serial(serialPort, timeout = 1, baudrate = 9600)
        except:
            print("Could not establish serial connection to port " + serialPort)
            exit()
    try:
        s = socket.socket()
        s.connect(('127.0.0.1', port))
    except:
        print("Could not establish socket connection to server")
        exit()
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
        except:
            print("Malformed or Empty Message Recieved")
            messageType = ''
        if(messageType == 'controls'):
            parseCommandMessageStr(x)
        elif(messageType == 'desync'):
            parseDesyncMessage(x)
        elif(messageType == 'emergency'):
            emergencyStop()
        elif(messageType == 'error'):
            parseErrorMessage(x)
        elif(messageType == 'path'):
            parsePathMessage(x)
        else:
            print("Malformed message of type " + messageType + " recieved")
        while(1):
            reply = arduino.readline()
            if(len(reply) != 0):
                if(reply == "~\r\n"):
                    print("Parsed Arduino reply")
                    break
                print("Arduino says: " + reply)
                replyJSON = parseReply(reply)
        print(json.dumps(replyJSON))
        if(sendUpstream(json.dumps(replyJSON),s)):
            print("sent status")
        else:
            print("error sending message")
