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

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
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
}

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
  blink(spd);
  return;
}

void setExtensionRate(int rate){
  //Serial.print("set extension rate to :");
  //Serial.println(rate);
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
  return;
}

void setTurningZ(float angle){
  //Serial.print("set turing Z to: ");
  //Serial.println(angle);
  return;
}

void blink(int count){
  for(int i = 0; i < count; i ++){
    digitalWrite(13, HIGH);
    delay(250);
    digitalWrite(13, LOW);
    delay(250);
  }
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
