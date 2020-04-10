#include <Honeywell_pressure_sensors.h>
#include <PID_v1.h>
#include <Wire.h>
#include <SPI.h>
#include <SparkFunLSM9DS1.h>
#include <SparkFunMAX31855k.h> // Using the max31855k driver

//IMU Stuff
LSM9DS1 imu;

//Thermocouple stuff
SparkFunMAX31855k probe(CHIP_SELECT_PIN, NONE, NONE, true);
float boringMotorTemp = 0;

//Comm stuff
char incomingByte = 0;
String message;
int boringSpeed;
int extensionRate;
int inflateFront;
int inflateBack;
float turningX;
float turningY;

//State variables
float robotPitch = 0.0;
float robotYaw = 0.0;


//Component pins
int frontSolenoid = 28;
int rearSolenoid = 28;

int frontPump = 2;
int rearPump = 3;

int boringTach = 4;
int extensionTach = 5;

int xPot = A9;
int yPot = A8;

int fullExtendSwitch = 7;
int fullRetractSwitch = 9;


//Motor Pins
  int motor1_ENA = 25;
  int motor1_IN1 = 4;
  int motor1_IN2 = 5;

  int motor2_ENA = 25;
  int motor2_IN1 = 4;
  int motor2_IN2 = 5;
  
  int extMotor_ENA = 24;
  int extMotor_IN1 = 2;
  int extMotor_IN2 = 3;
  
  int boringMotor_PWM = 25;


//Motor Controller Definition
struct MotorController{
  int enablePin;
  int in1Pin;
  int in2Pin;
  
};


//Tachometer Defintion

struct ShaftTachometer{
  int signalPin;
  int detect;
  unsigned long previous_detect;
  unsigned long detect_time;
  unsigned long elapsed_time;
  float RPM;
};


void setup() {
//Comm setup
Serial.begin(9600);  

//Motor Setup
 pinMode(motor1_ENA, OUTPUT);  // sets the pin as output
  pinMode(motor1_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor1_IN2, OUTPUT);  // sets the pin as output
  
  pinMode(motor2_ENA, OUTPUT);  // sets the pin as output
  pinMode(motor2_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor2_IN2, OUTPUT);  // sets the pin as output
  
 pinMode(extMotor_ENA, OUTPUT);  // sets the pin as output
  pinMode(extMotor_IN1, OUTPUT);  // sets the pin as output
  pinMode(extMotor_IN2, OUTPUT);  // sets the pin as output
 
  pinMode(boringMotor_PWM, OUTPUT);  // sets the pin as output

struct MotorController steeringMotor1;

  steeringMotor1.enablePin = motor1_ENA;
  steeringMotor1.in1Pin = motor1_IN1;
  steeringMotor1.in2Pin = motor1_IN2;

struct MotorController steeringMotor2;

  steeringMotor2.enablePin = motor2_ENA;
  steeringMotor2.in1Pin = motor2_IN1;
  steeringMotor2.in2Pin = motor2_IN2;
 
struct MotorController extensionMotor;

  extensionMotor.enablePin = extMotor_ENA;
  extensionMotor.in1Pin = extMotor_IN1;
  extensionMotor.in2Pin = extMotor_IN2;  

//Tach Setup
struct ShaftTachometer boringTach;
  boringTach.signalPin = 27777;
  boringTach.detect = 0;
  boringTach.previous_detect = 0;
  boringTach.detect_time = 0;
  boringTach.elapsed_time = 0;
  boringTach.RPM = 0;

  struct ShaftTachometer extensionTach;
  extensionTach.signalPin = 27777;
  extensionTach.detect = 0;
  extensionTach.previous_detect = 0;
  extensionTach.detect_time = 0;
  extensionTach.elapsed_time = 0;
  extensionTach.RPM = 0;
  
attachInterrupt(digitalPinToInterrupt(boringTach.signalPin), boringTachUpdate, FALLING);//pin is pulled high to reduce noise
attachInterrupt(digitalPinToInterrupt(extensionTach.signalPin), extensionTachUpdate, FALLING);

//Limit Switches
attachInterrupt(digitalPinToInterrupt(fullExtendSwitch), fullExtensionReached, RISING);
attachInterrupt(digitalPinToInterrupt(fullRetractSwitch), fullRetractionReached, RISING);


//Component Setup
 pinMode(frontSolenoid, OUTPUT);
 pinMode(rearSolenoid, OUTPUT);
 
 pinMode(frontPump, OUTPUT);
 pinMode(rearPump, OUTPUT);
}

void loop() {
//get steering postions
xSteering = analogRead(xPot);
ySteering = analogRead(yPot);

//get temperature of boring motor
boringMotorTemp = probe.readTempF();

imu.readAccel();//will update accelerometer values
computeAttitude2DOF(imu.ax, imu.ay, imu.az);//using another offsetted gyro could give roll

if(boringTach.detect){
  computeTachometer(boringTach);
}

if(extensionTach.detect){
    computeTachometer(extensionTach);
}

//update variables for ui
boringSpeed = boringTach.RPM;
extensionRate = extensionTach.RPM;


}//loop

void activateComponent(int pin){
  digitalWrite(pin, HIGH);
}

void deactivateComponent(int pin){
  digitalWrite(pin, LOW);
}

void driveMotor(MotorController motor, int motorDirection, int throttle){
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


void computeTachometer(ShaftTachometer tach){
  tach.detect_time = micros();

   tach.elapsed_time = tach.detect_time - tach.previous_detect;
   tach.previous_detect = tach.detect_time;

   tach.RPM = 1.0/(tach.elapsed_time/60000000.0);

   tach.detect = 0;
}

void boringTachUpdate() {
   boringTach.detect = 1;
    
}

void extensionTachUpdate() {
    extensionTach.detect = 1;
    
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
