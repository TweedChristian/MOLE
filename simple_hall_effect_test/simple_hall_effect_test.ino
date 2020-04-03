int hallPin = 28;


void setup() {
 Serial.begin(9600);
 pinMode(hallPin, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:

if(digitalRead(hallPin)){//pin is pulled high
  Serial.println("no detect");
}else{
  Serial.println("detect");
}

delay(50);
  

}
