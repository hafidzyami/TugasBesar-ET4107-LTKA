import paho.mqtt.client as mqtt
import json
from datetime import datetime

data = []

# Define MQTT callback functions
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code " + str(rc))
    client.subscribe("v1/telemetry/bmp280arrifqi")

def on_message(client, userdata, msg):
    print("Received message on topic " + msg.topic + ": " + msg.payload.decode())
    payload = json.loads(msg.payload.decode())
    payload["timestamp"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    data.append(payload)
    save_to_json()

def save_to_json():
    try:
        with open("data.json", "w") as json_file:
            json.dump(data, json_file, indent=4)
    except Exception as e:
        print("Error:", e)

# Create MQTT client instance
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Connect to MQTT broker
mqtt_client.connect("broker.hivemq.com", 1883, 60)

# Start MQTT client loop
mqtt_client.loop_start()
