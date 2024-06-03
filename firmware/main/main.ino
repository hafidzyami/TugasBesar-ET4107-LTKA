#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

Adafruit_BMP280 BMP; // I2C

#define SDA_PIN 21
#define SCL_PIN 22
#define SEALEVELPRESSURE_HPA (1013.25)

const char* ssid[] = {"KENARI LANTAI 3", "Bandung", "JOHNPARIS"};
const char* password[] = {"kenari851", "ybandung", "sambelterasi"};
const char* mqtt_server_Backend = "broker.hivemq.com";
const char* mqtt_server_Tb = "mqtt.thingsboard.cloud";
const int mqtt_port = 1883;
const char* mqtt_topic_Backend = "v1/telemetry/bmp280arrifqi";
const char* mqtt_topic_Tb = "v1/devices/me/telemetry";
const char* access_token_Tb = "mXIaKVQeECPIcYaMTplD";

unsigned long prevMillis = 0;
int num_networks = 3;

WiFiClient espClientBackend;
WiFiClient espClientTb;
PubSubClient clientBe(espClientBackend);
PubSubClient clientTb(espClientTb);

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

void reconnect(PubSubClient& client, const char* mqtt_topic, const char* token) {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), token, "")) {
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
  clientTb.setServer(mqtt_server_Tb, mqtt_port);
  clientBe.setServer(mqtt_server_Backend, mqtt_port);
}

void loop() {
  if (!clientTb.connected()) {
    reconnect(clientTb, mqtt_topic_Tb, access_token_Tb);
  }
  if (!clientBe.connected()) {
    reconnect(clientBe, mqtt_topic_Backend, "");
  }
  clientBe.loop();
  clientTb.loop();
  
  unsigned long currentMillis = millis();

  if(currentMillis - prevMillis > 1000){
    float temperature = BMP.readTemperature();
    float pressure = BMP.readPressure();
    float altitude = BMP.readAltitude(SEALEVELPRESSURE_HPA);

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" *C");

    Serial.print("Pressure: ");
    Serial.print(pressure);
    Serial.println(" Pa");

    Serial.print("Altitude: ");
    Serial.print(altitude);
    Serial.println(" m");

    // Create JSON payload
    char payload[256];
    snprintf(payload, sizeof(payload), "{\"temperature\": %.2f, \"pressure\": %.2f, \"altitude\": %.2f}", temperature, pressure, altitude);
    
    // Print the payload
    Serial.print("Publishing payload: ");
    Serial.println(payload);
    clientBe.publish(mqtt_topic_Backend, payload);
    clientTb.publish(mqtt_topic_Tb, payload);
    prevMillis = currentMillis;
  }
  delay(100);
}
