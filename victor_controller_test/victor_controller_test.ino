 #include <Servo.h>                           // Include servo library
 
Servo boringMotor;                             // Declare motor

  int boringMotor_PWM = 14;

  
void setup()                                 
{
 boringMotor.attach(boringMotor_PWM);             // Attach signal to pin
  boringMotor.writeMicroseconds(1500);         // 1.5 ms stay still signal
}  
  
  

void loop() {
  

}
