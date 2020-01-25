#!/usr/bin/env python3

import socket

port = 7082

for i in range(0,10):
    print(i)

s = socket.socket()
s.connect(('0.0.0.0', port))
s.sendall('jef')
data = s.recv(1024)

print('Received', repr(data))
s.close()