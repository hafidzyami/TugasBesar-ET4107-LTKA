import paho.mqtt.publish as publish
import random
import time

# MQTT broker details
broker_address = "broker.hivemq.com"
port = 1883
username = "Gcjp8ecOst4iy8Edj1lC"
topic = "v1/telemetry/bmp280arrifqi"

# Function to generate random temperature and pressure values
def generate_data():
    temperature = random.uniform(10, 40)  # Assuming temperature range
    pressure = random.uniform(900, 1100)   # Assuming pressure range
    altitude = random.uniform(1000, 10000)
    return temperature, pressure, altitude

# Publish loop
while True:
    temperature, pressure, altitude = generate_data()
    message = '{{"temperature": {}, "pressure": {}, "altitude" : {}}}'.format(temperature, pressure, altitude)
    try:
        publish.single(topic, message, hostname=broker_address, port=port, auth={'username': username})
        print("Message published successfully:", message)
    except Exception as e:
        print("Error:", e)
    time.sleep(3)  # Adjust the sleep duration as needed
