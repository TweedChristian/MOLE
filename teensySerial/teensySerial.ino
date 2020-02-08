
char incomingByte = 0;
String message;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(13, OUTPUT);
//  pinMode(30, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  while(Serial.available() > 0){
    incomingByte = Serial.read();
    message += incomingByte;
    if(incomingByte == '\n'){
      Serial.print(message);
      if(message[1] == 'a'){
        blink(2);
      }
      if(message[1] == 's') {
        blink(3);
      }
      if(message[1] == 'd'){
        blink((int)message[2]);
      }
      message = "";
//      analogWrite(30, 20);
    }
  }
//  if (Serial.available() > 0) {
//    analogWrite(30, 25);
//    incomingByte = Serial.read();
//    if(incomingByte == '\n'){
//      Serial.write(message[1]);
//      if(message[1] == 'a'){
//        digitalWrite(13, HIGH);
//      }
//    }
//    else{
//      message += incomingByte;
//    }
//  }
}

void blink(int count){
  for(int i = 0; i < count; i ++){
    digitalWrite(13, HIGH);
    delay(250);
    digitalWrite(13, LOW);
    delay(250);
  }
}
