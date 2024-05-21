#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

Adafruit_BMP280 BMP; // I2C

#define SDA_PIN 26
#define SCL_PIN 27
#define SEALEVELPRESSURE_HPA (1013.25)

const char* ssid[] = {"KENARI LANTAI 3", "Bandung", "JOHNPARIS"};
const char* password[] = {"kenari851", "ybandung", "sambelterasi"};
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "v1/telemetry/bmp280arrifqi";

unsigned long prevMillis = 0;
int num_networks = 2;

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {

  delay(10);
  for (int i = 0; i < num_networks; i++) {
    Serial.print("Attempting to connect to ");
    Serial.println(ssid[i]);
    WiFi.begin(ssid[i], password[i]);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("");
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      break; // Exit the loop if successfully connected
    } else {
      Serial.println("");
      Serial.println("Failed to connect to WiFi network");
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      // ... and resubscribe
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.begin(115200);

  bool status = BMP.begin(0x76);  
  if (!status) {
    Serial.println("Could not find a valid BMP280 sensor, check wiring!");
    while (1);
  }

  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  unsigned long currentMillis = millis();

  if(currentMillis - prevMillis > 1000){
    float temperature = BMP.readTemperature();
    float pressure = BMP.readPressure();
    float altitude = BMP.readAltitude(SEALEVELPRESSURE_HPA);

    // Create JSON payload
    StaticJsonDocument<4> doc;
    doc["Temperature"] = temperature;
    doc["Pressure"] = pressure;
    doc["Altitude"] = altitude;
    char payload[200]; 
    serializeJson(doc, payload);
    client.publish(mqtt_topic, payload);
    prevMillis = currentMillis;
  }
  delay(100);
}
