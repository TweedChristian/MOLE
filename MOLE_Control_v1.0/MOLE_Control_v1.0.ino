#include <Servo.h>
#include <Wire.h>
#include <SPI.h>
#include <Honeywell_pressure_sensors.h>

#include <PID_v1.h>

#include <LSM9DS1_Registers.h>
#include <LSM9DS1_Types.h>
#include <SparkFunLSM9DS1.h>

#include <SparkFunMAX31855k.h> // Using the max31855k driver

//IMU Stuff
LSM9DS1 imu;
float DECLINATION = -14.0; //of Worcester MA

//PID stuff
//steering motor 1
double SM1Setpoint, SM1Input, SM1Output;
PID SM1PID(&SM1Input, &SM1Output, &SM1Setpoint,6,0,0, REVERSE);
//steering motor 2
double SM2Setpoint, SM2Input, SM2Output;
PID SM2PID(&SM2Input, &SM2Output, &SM2Setpoint,6,0,0, REVERSE);
//extension motor
double EXMSetpoint, EXMInput, EXMOutput;
PID EXMPID(&EXMInput, &EXMOutput, &EXMSetpoint,0,1.25,0, DIRECT);
//boring motor
double boringSetpoint, boringInput, boringOutput, previousBoringOutput;
PID boringPID(&boringInput, &boringOutput, &boringSetpoint,0,1.05,0, DIRECT);


//Thermocouple stuff

int THERMO_CHIP_SELECT_PIN = 15;
SparkFunMAX31855k probe(THERMO_CHIP_SELECT_PIN);
float boringMotorTemp = 0;

//Comm stuff
float data;
boolean newData = false;
String message[6];
boolean messageEnd = false;
String inFrag;
String messageFrag;
char inByte;
int messageIndex = 0;

int boringSpeed;
int extensionRate;
boolean inflateFront;
boolean inflateBack;
float turningX;
float turningZ;
String statusMessage;

//State variables
float robotPitch = 0.0;
float robotYaw = 0.0;

//Loop timer stuff
int loopInterval = 5;//in ms
int previousMillis = 0;

//Component pins
//int frontSolenoid = 28;
//int rearSolenoid = 28;

//int frontPump = 2;
//int rearPump = 3;

int boringTachPin = 20;
int extensionTachPin = 21;

int yawPot = A8;
int pitchPot = A9;

int fullExtendSwitch = 39;
int fullCompressSwitch = 38;


//PWM timers
//FTM0 extensionMotor
//FTM1 motor1,yaw
//FTM2 motor2, pitch
//FTM3 boring motor
//TPM1 unused

//Motor Pins
  int motor1_ENA = 3;
  int motor1_IN1 = 24;
  int motor1_IN2 = 25;

  int motor2_ENA = 30;
  int motor2_IN1 = 26;
  int motor2_IN2 = 27;
  
  int extMotor_ENA = 6;
  int extMotor_IN1 = 28;
  int extMotor_IN2 = 29;

  Servo boringMotor;
  int boringMotor_PWM = 14;


//Motor Controller Definition
struct MotorController{
  int enablePin;
  int in1Pin;
  int in2Pin;
  
};
//motor controller intialization

//yaw
MotorController steeringMotor1;
//pitch
MotorController steeringMotor2;

MotorController extensionMotor;

int extensionDirection;

//Tachometer Defintion

struct ShaftTachometer{
  int signalPin;
  volatile int detect;
  volatile unsigned long previous_detect;
  volatile unsigned long detect_time;
  volatile unsigned long elapsed_time;
  volatile float RPM;
};
//tach intialization
ShaftTachometer extensionTach;
ShaftTachometer boringTach;

void setup() {
//Comm setup
Serial.begin(9600);  

Wire.begin();// begin i2c bus

imu.begin();//begin talking to imu

//Motor Setup
 pinMode(motor1_ENA, OUTPUT);  // sets the pin as output
 analogWriteFrequency(motor1_ENA, 10000);//max frequency for motor controller
  pinMode(motor1_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor1_IN2, OUTPUT);  // sets the pin as output
  
  pinMode(motor2_ENA, OUTPUT);  // sets the pin as output
  analogWriteFrequency(motor2_ENA, 10000);////max frequency for motor controller
  pinMode(motor2_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor2_IN2, OUTPUT);  // sets the pin as output
  
 pinMode(extMotor_ENA, OUTPUT);  // sets the pin as output
 analogWriteFrequency(extMotor_ENA, 10000);//max frequency for motor controller
  pinMode(extMotor_IN1, OUTPUT);  // sets the pin as output
  pinMode(extMotor_IN2, OUTPUT);  // sets the pin as output
 
  pinMode(boringMotor_PWM, OUTPUT);  // sets the pin as output
  analogWriteFrequency(boringMotor_PWM, 15000);//max frequency for SPX
  boringMotor.attach(boringMotor_PWM);   // Attach signal to pin

  steeringMotor1.enablePin = motor1_ENA;
  steeringMotor1.in1Pin = motor1_IN1;
  steeringMotor1.in2Pin = motor1_IN2;

  steeringMotor2.enablePin = motor2_ENA;
  steeringMotor2.in1Pin = motor2_IN1;
  steeringMotor2.in2Pin = motor2_IN2;
 
  extensionMotor.enablePin = extMotor_ENA;
  extensionMotor.in1Pin = extMotor_IN1;
  extensionMotor.in2Pin = extMotor_IN2;  

//Tach Setup

  boringTach.signalPin = boringTachPin;
  boringTach.detect = 0;
  boringTach.previous_detect = 0;
  boringTach.detect_time = 0;
  boringTach.elapsed_time = 0;
  boringTach.RPM = 0;

  extensionTach.signalPin = extensionTachPin;
  extensionTach.detect = 0;
  extensionTach.previous_detect = 0;
  extensionTach.detect_time = 0;
  extensionTach.elapsed_time = 0;
  extensionTach.RPM = 0;
  
attachInterrupt(digitalPinToInterrupt(boringTach.signalPin), boringTachUpdate, FALLING);//pin is pulled high to reduce noise
attachInterrupt(digitalPinToInterrupt(extensionTach.signalPin), extensionTachUpdate, FALLING);
//
////Limit Switches

pinMode(fullExtendSwitch, INPUT_PULLUP);
pinMode(fullCompressSwitch, INPUT_PULLUP);
attachInterrupt(digitalPinToInterrupt(fullExtendSwitch), extensionLimitDetected, FALLING);
attachInterrupt(digitalPinToInterrupt(fullCompressSwitch), extensionLimitDetected, FALLING);


//PIDs
//steering motor 1
SM1PID.SetSampleTime(10);
SM1PID.SetOutputLimits(-255,255);
SM1PID.SetMode(AUTOMATIC);
//steering motor 2
SM2PID.SetSampleTime(10);
SM2PID.SetOutputLimits(-255,255);
SM2PID.SetMode(AUTOMATIC);
//extension motor
EXMPID.SetSampleTime(10);
EXMPID.SetOutputLimits(0,255);
EXMPID.SetMode(AUTOMATIC);
//boring motor
boringPID.SetSampleTime(10);
boringPID.SetOutputLimits(0,500);
boringPID.SetMode(AUTOMATIC);


//Component Setup
//pinMode(frontSolenoid, OUTPUT);
 //pinMode(rearSolenoid, OUTPUT);
 
 //pinMode(frontPump, OUTPUT);
 //pinMode(rearPump, OUTPUT);

 //for RPM test

 //driveVictor(0, 100);
//driveMotor(steeringMotor1, 0, 200);
//driveMotor(steeringMotor2, 0, 200);
//driveMotor(extensionMotor, 1, 20);//1 is extend 0 is compress

//initial values so nothing moves unless told to
boringSetpoint = 0;
EXMSetpoint = 0;
SM1Setpoint = analogRead(yawPot);
SM2Setpoint = analogRead(pitchPot);

}

void loop() {
//loop timer
//if((millis() - previousMillis) > loopInterval){
  //previousMillis = millis();//for next loop
  if(Serial.available()){
    while(!messageEnd){
      parseMessage();
      if(newData == true){
        newData = false;
        message[messageIndex] = messageFrag;
        messageIndex ++;
       messageFrag = "";
      }
    }
    messageEnd = false;
    messageIndex = 0;
    if(message[0] == "0"){
      parseCommandMessage();
    }
    else if(message[0] == "3"){
      parseErrorMessage();
    }
  }
  

//get steering postions
SM1Input = analogRead(yawPot);
  SM1PID.Compute();

SM2Input = analogRead(pitchPot);
SM2PID.Compute();

// PIDdriveMotor(steeringMotor1,SM1Output);
 //PIDdriveMotor(steeringMotor2,SM2Output);
//  Serial.print("input: ");
//  Serial.println(SM1Input);
//  Serial.print("output: ");
//Serial.println(SM1Output);


//boring motor
//get temperature of boring motor
boringMotorTemp = probe.readTempF();
//Serial.print("Boring Motor Temp:");
//Serial.println(boringMotorTemp);

if(predictCurrentRPM(boringTach) < boringTach.RPM){//if our predicted RPM is lower than the last recorded, 
  boringInput = predictCurrentRPM(boringTach);     //we should use that as the shaft could have stopped
}else{                                             //and may never update
  boringInput = boringTach.RPM;
}


 //Serial.print("RPM:");
 //Serial.println(boringTach.RPM);
 boringPID.Compute();
// Serial.print("out:");
 //Serial.println(boringOutput);
 driveVictor(0, boringOutput);



//extension motor
if(predictCurrentRPM(extensionTach) < extensionTach.RPM){//if our predicted RPM is lower than the last recorded, 
  EXMInput = predictCurrentRPM(extensionTach);     //we should use that as the shaft could have stopped
}else{                                             //and may never update
  EXMInput = extensionTach.RPM;
}
EXMPID.Compute();
//Serial.println(EXMOutput);
extensionDirection = determineExtDirection(EXMSetpoint);

if(extensionMotorLimitCheck(extensionDirection)){
  //driveMotor(extensionMotor, extensionDirection, abs(EXMOutput));
  
}else{
  EXMSetpoint = 0;
}


imu.readAccel();//will update accelerometer values
imu.readMag();
//printAttitude(imu.ax, imu.ay, imu.az,-imu.my, -imu.mx, imu.mz);

if(boringTach.detect){
  computeTachometer(boringTach);
  //Serial.println(boringTach.RPM);
}

if(extensionTach.detect){
    computeTachometer(extensionTach);
    //Serial.println(extensionTach.RPM);
}

////update variables for ui
//boringSpeed = boringTach.RPM;
//extensionRate = extensionTach.RPM;
//


 
//}//loop timer

}//loop

void activateComponent(int pin){
  digitalWrite(pin, HIGH);
}

void deactivateComponent(int pin){
  digitalWrite(pin, LOW);
}


int extensionMotorLimitCheck(int motorDirection){
  int allowedMovement = 1;
  
  if((!digitalRead(fullExtendSwitch)) && motorDirection){//if we are extended and want to extend
      allowedMovement = 0;
     Serial.println("Already extended");
  }

   if((!digitalRead(fullCompressSwitch)) && !motorDirection){//if we are compressed and want to compress
      allowedMovement = 0;
      Serial.println("Already compressed");
  }

  return allowedMovement;

}


int determineExtDirection(double EXMSetpoint){
  //0 is compress       1 is extend
  
  int extDirection = 0;//a negative setpoint compresses

  if (EXMSetpoint > 0){//a positive setpoint extends
  extDirection = 1;
  }

  return extDirection;
}

void PIDdriveMotor(MotorController motor, int PIDOutput){//PIDOutput is -255 to 255

  if(PIDOutput > 0){
    digitalWrite(motor.in1Pin, LOW);
    digitalWrite(motor.in2Pin, HIGH);
  
  }else{
    
    digitalWrite(motor.in1Pin, HIGH);
    digitalWrite(motor.in2Pin, LOW);
    PIDOutput = -PIDOutput;

  }

  analogWrite(motor.enablePin, PIDOutput);
}

void driveMotor(MotorController motor, int motorDirection, int throttle){//throttle is 0 to 255
//direction = 0, forward
//direction = 1, reverse
  if(motorDirection){
    digitalWrite(motor.in1Pin, LOW);
    digitalWrite(motor.in2Pin, HIGH);
  
  }else{
    digitalWrite(motor.in1Pin, HIGH);
    digitalWrite(motor.in2Pin, LOW);

  }

  analogWrite(motor.enablePin, throttle);

}


void driveVictor(int motorDirection, int throttle){//throttle is 0 to 500
  int adjustmentVar = 1500;
//direction = 0, forward
//direction = 1, reverse
 
 if(motorDirection){
  adjustmentVar += throttle;
}else{

  adjustmentVar -= throttle;
 }
  
boringMotor.writeMicroseconds(adjustmentVar);// 1.5 ms stay still signal
  
}


void computeTachometer(ShaftTachometer &tach){
  
   tach.elapsed_time = tach.detect_time - tach.previous_detect;
   tach.previous_detect = tach.detect_time;

   tach.RPM = 1.0/(tach.elapsed_time/60000000.0);

   tach.detect = 0;
   
}


unsigned long predictCurrentRPM(ShaftTachometer &tach){
  
  unsigned long currentRPM = 0;
  unsigned long currentElapsed = 0;

  currentElapsed = micros() - tach.previous_detect;

   currentRPM = 1.0/(currentElapsed/60000000.0);

   return currentRPM;
   
}

void boringTachUpdate() {
   boringTach.detect = 1;
   boringTach.detect_time = micros();
    
}

void extensionTachUpdate() {
    extensionTach.detect = 1;
    extensionTach.detect_time = micros(); 
}

void extensionLimitDetected(){
    digitalWrite(extensionMotor.in1Pin, LOW);//put motor controller in brake
    digitalWrite(extensionMotor.in2Pin, LOW);
 
}


//calculate pitch and roll
// Pitch/roll calculations take from this app note:
// http://cache.freescale.com/files/sensors/doc/app_note/AN3461.pdf?fpsp=1

//our gyro is mounted perpendicular which makes 
//roll is robotPitch and pitch is robotYaw

void computeAttitude2DOF(float ax, float ay, float az)
{
  float roll = atan2(ay, az);
  float pitch = atan2(-ax, sqrt(ay * ay + az * az));

  // Convert everything from radians to degrees:
  pitch *= 180.0 / PI;
  roll  *= 180.0 / PI;

robotPitch = roll;
robotYaw = pitch;

  Serial.print("Pitch, Roll: ");
  Serial.print(pitch, 2);
  Serial.print(", ");
  Serial.println(roll, 2);

}

// Calculate pitch, roll, and heading.
// Pitch/roll calculations take from this app note:
// http://cache.freescale.com/files/sensors/doc/app_note/AN3461.pdf?fpsp=1
// Heading calculations taken from this app note:
// http://www51.honeywell.com/aero/common/documents/myaerospacecatalog-documents/Defense_Brochures-documents/Magnetic__Literature_Application_notes-documents/AN203_Compass_Heading_Using_Magnetometers.pdf
void printAttitude(float ax, float ay, float az, float mx, float my, float mz)
{
  float roll = atan2(ay, az);
  float pitch = atan2(-ax, sqrt(ay * ay + az * az));

  float heading;
  
  if (my == 0){
    heading = (mx < 0) ? PI : 0;
  }else{
    heading = atan2(my, mx);
  }
  
  heading -= DECLINATION * PI / 180;

  if (heading > PI){
    heading -= (2 * PI);
  }else if (heading < -PI){
    heading += (2 * PI);
  }

  // Convert everything from radians to degrees:
  heading *= 180.0 / PI;
  pitch *= 180.0 / PI;
  roll  *= 180.0 / PI;
//
  Serial.print("Pitch, Roll: ");
  Serial.print(pitch, 2);
  Serial.print(", ");
  Serial.println(roll, 2);
  Serial.print("Heading: "); Serial.println(heading, 2);
}
void rampRoutine(){
 for (int value = 0; value <= 255; value++) {
    driveMotor(steeringMotor1, 0, value);
    driveMotor(steeringMotor2, 0, value);
    delay(10);
  }

  for (int value = 255; value >= 0; value--) {
    driveMotor(steeringMotor1, 0, value);
    driveMotor(steeringMotor2, 0, value);
    delay(10);
  }

  delay(500);

   for (int value = 0; value <= 255; value++) {
    driveMotor(steeringMotor1, 1, value);
    driveMotor(steeringMotor2, 1, value);
    delay(10);
  }

  for (int value = 255; value >= 0; value--) {
    driveMotor(steeringMotor1, 1, value);
    driveMotor(steeringMotor2, 1, value);
    delay(10);
  }

  delay(500);


  for (int value = 0; value <= 255; value++) {
    driveMotor(extensionMotor, 0, value);
    delay(10);
  }

  for (int value = 255; value >= 0; value--) {
    driveMotor(extensionMotor, 0, value);
    delay(10);
  }
  
 delay(500);


  for (int value = 0; value <= 255; value++) {
    driveMotor(extensionMotor, 1, value);
    delay(10);
  }

  for (int value = 255; value >= 0; value--) {
    driveMotor(extensionMotor, 1, value);
    delay(10);
  }

delay(500);

for (int value = 0; value <= 500; value++) {
    driveVictor(0, value);
    delay(10);
  }

  for (int value = 500; value >= 0; value--) {
    driveVictor(0, value);
    delay(10);
  }

  delay(500);

for (int value = 0; value <= 500; value++) {
    driveVictor(1, value);
    delay(10);
  }

  for (int value = 500; value >= 0; value--) {
    driveVictor(1, value);
    delay(10);
  }
}

//comm helpers

void parseMessage(){
  while(Serial.available() > 0 && newData == false){
    inByte = Serial.read();
    if(inByte == '!'){
      messageEnd = true;
      newData = true;
    }
    else if(inByte == ','){
      newData = true;
    }
    else{
      messageFrag += inByte;
    }
  }
}

void parseCommandMessage(){
  setBoringSpeed(atoi(message[1].c_str()));
  setExtensionRate(atoi(message[2].c_str()));
  if(message[3] == "true"){
    inflate('f');
  }
  if(message[4] == "true"){
    inflate('b');
  }
  setTurningX(atof(message[5].c_str()));
  setTurningZ(atof(message[6].c_str()));
  sendStatus();
}

void parseErrorMessage(){
  setBoringSpeed(0);
  setExtensionRate(0);
  //Serial.write("Shutting Down");
  //Serial.write("~");
}

void setBoringSpeed(int spd){
  //Serial.print("set boring speed to: ");
  //Serial.println(spd);
  blinkLED(spd);

  boringSetpoint = spd;
  
  return;
}

void blinkLED(int count){
  for(int i = 0; i < count; i ++){
    digitalWrite(13, HIGH);
    delay(250);
    digitalWrite(13, LOW);
    delay(250);
  }
}

void setExtensionRate(int rate){
  //Serial.print("set extension rate to :");
  //Serial.println(rate);

  EXMSetpoint = rate;
  
  return;
}

void inflate(char module){
  switch(module){
    case 'f':
      //code for inflating front goes here
      //Serial.println("inflating front");
      break;
    case 'b':
      //code for inflating back goes here
      //Serial.println("inflating rear");
      break;
  }
  return;
}

void setTurningX(float angle){
  //Serial.print("set turing X to: ");
  //Serial.println(angle);
  SM2Setpoint = angle;
  
  return;
}

void setTurningZ(float angle){
  //Serial.print("set turing Z to: ");
  //Serial.println(angle);
  SM1Setpoint = angle;
  return;
}

/*
 * Reads sensor values and pushes up a status message to python layer
 * Any sensors which were not fully implemented are left as dummy data to not confuse the python 
 * parser
 */
void sendStatus(){
//  String statusMessage = "status,"; //Type
//  statusMessage += String(readImu('x'))+ ','; //imuAccX
//  statusMessage += String(readImu('y')) + ','; //imuAccY
//  statusMessage += String(readImu('z')) + ','; //ImuAccZ
//  statusMessage += String(1.23) + ','; //imuYaw
//  statusMessage += String(9.21) + ','; //imuPitch
//  statusMessage += String(6.31) + ','; //imuRoll
//  statusMessage += String(41) + ','; // boringRPM
//  statusMessage += String(22) + ','; //extensionRPM
//  statusMessage += String(76) + ','; //drillTemp
//  statusMessage += String(0.12) + ','; //steering X
//  statusMessage += String(0.25) + ','; //steering Z
//  statusMessage += String(0.1) + ','; //front PSI
//  statusMessage += String(0) + ','; //back PSI
  statusMessage = "status,1.1,2.2,3.3,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0~";
  Serial.println(statusMessage);
}

float readImu(char axis){
  switch (axis){
    case 'x':
      return 1.11;
    case 'y':
      return 2.22;
    case 'z':
      return 3.33;
    default:
      return 6.66;
  }
}
