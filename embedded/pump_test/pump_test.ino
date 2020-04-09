int solenoidSwitchPin = 28;


void setup() {

 pinMode(solenoidSwitchPin, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:

digitalWrite(solenoidSwitchPin, HIGH);//open solenoid
delay(10000);


digitalWrite(solenoidSwitchPin, LOW);//close solenoid
delay(5000);
  

}
