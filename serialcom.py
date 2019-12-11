#serial communication testing

import serial

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
