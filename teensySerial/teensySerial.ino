char incomingByte = 0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  //int rand = random(10);
  //Serial.print(rand);
  //delay(1000);
  if (Serial.available() > 0) {
    incomingByte = Serial.read();
    if(incomingByte == 's'){
      digitalWrite(13, HIGH);
    }
    if(incomingByte == 'a'){
      digitalWrite(13, LOW);
    }
  }
}