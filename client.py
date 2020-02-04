#!/usr/bin/env python3

import socket
import serial
import sys

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
    data = s.recv(1024)
    print('Received') 
    print(data)
    print(repr(data).strip('\''))
    arduino.write(repr(data).strip('\''))
    print("arduino says:", arduino.readline())
s.close()