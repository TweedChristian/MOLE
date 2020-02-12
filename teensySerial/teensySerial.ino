
char incomingByte = 0;
String message;
int boringSpeed;
int extensionRate;
int inflateFront;
int inflateBack;
float turningX;
float turningY;

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
//      Serial.print(message);
      if(message[0] == '0'){
        boringSpeed = (int)message[1];
        extensionRate = (int)message[2];
        inflateFront = (int)message[3];
        inflateBack = (int)message[4];
        turningX = (float)((float)(int)message[5]/10.0);
        turningY = (float)((float)(int)message[6]/10.0);
        Serial.print(boringSpeed);
        Serial.write(',');
        Serial.print(extensionRate);
        Serial.write(',');
        Serial.print(inflateFront);
        Serial.write(',');
        Serial.print(inflateBack);
        Serial.write(',');
        Serial.print(turningX);
        Serial.write(',');
        Serial.print(turningY);
        Serial.write('\n');
      }
      message = "";
//      analogWrite(30, 20);
    }
  }
}

void blink(int count){
  for(int i = 0; i < count; i ++){
    digitalWrite(13, HIGH);
    delay(250);
    digitalWrite(13, LOW);
    delay(250);
  }
}
