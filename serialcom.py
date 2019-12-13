#serial communication testing

import serial
import socket
import json


class statusJSON:
    def __init__(self, temperature, torque, gyro):
        self.temperature = temperature
        self.torque = torque
        self.gyro = gyro
    def checkQuality(self):
        #0 is if the JSON object is missing fields
        if(self.temperature is None or self.torque is None or self.gyro is None):
            print('This is not a valid JSON file.')
            return 0
        else:
            return 1

class movementJSON:
    def __init__(self, yaw, pitch, distance):
        self.yaw = yaw
        self.pitch = pitch
        self.distance = distance
    def checkQuality(self):
        if(self.distance == 0 or self.distance is None or self.pitch is None or self.yaw is None):
            print('This is not a valid JSON file')
            return 0
        else:
            return 1    


def sendSerial():
    try:
        arduino = serial.Serial("COM4", timeout = 1, baudrate = 9600)
    except:
        print("Check port")
        exit()
    rawdata = []
    count = 0

# while count < 3:
#     rawdata.append(str(arduino.readline()))
#     count+=1
# print(rawdata)

    while True:
        print(str(arduino.readline()))


def main():
    global port
    global address
    port = 7084
    address = '0.0.0.0'
    print('Started data layer')
    if(startSocket() == 1):
        sendMessage(b'Im connecting')
    else:
        print('yikers batman')
    received = 0
    while(received == 0):
        data = sockClient.recv(1024)
        if(data):
            received = 1
            jsonString = json.loads(data) #Loading the received binary into a dict
            print(jsonString['yaw']) #Fetching the JSON value
            jsonString['yaw'] = 30 #Modifying the JSON
            newString = json.dumps(jsonString)
            #Sending a new JSON
            sendMessage(newString)
            data2 = sockClient.recv(1024)
            print("Response", repr(data2))
    print("made it")

def startSocket():
    global sockClient
    sockClient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sockClient.connect((address, port))
    except:
        print("Socket Connection Refused")
        return 0
    else:
        print("Socket connected")
        return 1


#Use non-blocking with the server to test it

def sendMessage(jargon):
    #Converting the String to a byte array
    sockClient.sendall(jargon)

main()