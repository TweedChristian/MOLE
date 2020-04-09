
error
arduino dead

controls loop

client (controlsJSON) 
-> node (controlsJSON)
-> python (controlsSerial)
-> arduino (statusSerial)
-> python (statusJSON)
-> node (statusJSON)
-> datavisClient ()

pathing loop

same as above, expect pathJSON
pathSerial
receive pathStatus

add type 'localization' for pathing loop
light up line segment that updates

(pathStatus)
driftX
driftY
driftZ

loop: {
    1.) send path
    2.) receive status
    3.) path 
}


spencer will handle values of yaw, pitch, roll, distance

JSON Command
type: 'done'