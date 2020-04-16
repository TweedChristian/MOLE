
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




ROUTES:



==== GETS ====


/downloadSummary
--Requests the CSV file for download


--These read the database {type: 'dbRequest', data: ___ }

/db/all

/db/controls

/db/status
    /db/status/imuAccX
    /db/status/imuAccY
    /db/status/imuAccZ
    /db/status/imuYaw
    /db/status/imuPitch
    /db/status/imuRoll
    /db/status/boringRPM
    /db/status/extensionRate
    /db/status/drillTemp
    /db/status/steeringPitch
    /db/status/steeringYaw
    /db/status/frontPSI
    /db/status/backPSI

/db/idealPathPoints

/db/paths

/db/pathStatus
    /db/pathStatus/driftX
    /db/pathStatus/driftY
    /db/pathStatus/driftZ

/db/obstacles

/db/correctedPaths

/db/errors

/db/lastUpdated



==== Posts ====

::types::

error

controls

path

pathInitialize

correctPath

addObstacle