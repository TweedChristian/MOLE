#!/usr/bin/env python3

import socket
import serial


serialPort = "/dev/ttyACM1"
port = 7086
# try:
arduino = serial.Serial(serialPort, timeout = 1, baudrate = 9600)
# except:
#     print("Invalid Serial Port")

s = socket.socket()
s.connect(('0.0.0.0', port))
s.sendall('jef')

while 1:
    data = s.recv(1024)
    print('Received') 
    print(repr(data).strip('\''))
    arduino.write(repr(data).strip('\''))
s.close()