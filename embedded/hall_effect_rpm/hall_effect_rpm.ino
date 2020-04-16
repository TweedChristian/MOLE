int hallPin = 28;
bool detect = false;
unsigned long previous_detect = 0;
unsigned long detect_time = 0;
float elapsed_time = 0;
float shaft_radius = 10.5;
float rads = 0.0;
float RPMs = 0.0;
void setup() {
 Serial.begin(9600);
 pinMode(hallPin, INPUT);
 attachInterrupt(digitalPinToInterrupt(hallPin), magnetDetected, FALLING);//pin is pulled high to reduce noise
}

void loop() {
  // put your main code here, to run repeatedly:

if(detect){
  // Serial.println("detected");
    detect_time = micros();
   elapsed_time = detect_time - previous_detect;
   previous_detect = detect_time;

 

  rads = 6.28318530718/(elapsed_time/1000000.00);//elapsed_time is in microseconds

 RPMs = rads * 9.5492965964;
  Serial.println(RPMs);

   detect = false;
}

 

}

void magnetDetected() {
    detect = true;
   // detect_time = millis();
    
}
