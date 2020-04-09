#include <PID_v1.h>
//Define Variables we'll be connecting to
double SM1Setpoint, SM1Input, SM1Output;

//Specify the links and initial tuning parameters
PID SM1PID(&SM1Input, &SM1Output, &SM1Setpoint,7.75,0,0, DIRECT);


  int motor1_ENA = 5;
  int motor1_IN1 = 24;
  int motor1_IN2 = 25;

  int motor2_ENA = 6;
  int motor2_IN1 = 26;
  int motor2_IN2 = 27;

struct MotorController{
  int enablePin;
  int in1Pin;
  int in2Pin;
  
};


  struct MotorController steeringMotor1;
  struct MotorController steeringMotor2;


void setup()
{

analogWriteFrequency(2,20000);
SM1PID.SetSampleTime(10);
SM1PID.SetOutputLimits(-255,255);
    Serial.begin(9600);

    steeringMotor1.enablePin = motor1_ENA;
  steeringMotor1.in1Pin = motor1_IN1;
  steeringMotor1.in2Pin = motor1_IN2;
  
     steeringMotor2.enablePin = motor2_ENA;
  steeringMotor2.in1Pin = motor2_IN1;
  steeringMotor2.in2Pin = motor2_IN2;
  
  //initialize the variables we're linked to

  SM1Setpoint = 750;
  
 // SM1Input = analogRead(A9);
  //turn the PID on
  SM1PID.SetMode(AUTOMATIC);

    pinMode(motor1_ENA, OUTPUT);  // sets the pin as output
  pinMode(motor1_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor1_IN2, OUTPUT);  // sets the pin as output

     pinMode(motor2_ENA, OUTPUT);  // sets the pin as output
  pinMode(motor2_IN1, OUTPUT);  // sets the pin as output
  pinMode(motor2_IN2, OUTPUT);  // sets the pin as output

}

void loop()
{
  SM1Input = analogRead(A9);
  SM1PID.Compute();

Serial.println(SM1Output);

  //Serial.println(SM1Input);  
//  Serial.println(SM1Setpoint);  
 //Serial.println(SM1Output);  

  driveMotor(steeringMotor1, SM1Output);
  
}

void driveMotor(MotorController motor, int motorInput){//input from -1 to 1

  //motorInput = motorInput * 255;

  if(motorInput < 0){

    //Serial.println("Reverse");
    digitalWrite(motor.in1Pin, LOW);
    digitalWrite(motor.in2Pin, HIGH);
    motorInput = -motorInput;

  }else{
    
    //Serial.println("Forward");
    digitalWrite(motor.in1Pin, HIGH);
    digitalWrite(motor.in2Pin, LOW);

  }

  analogWrite(motor.enablePin, motorInput);


}
