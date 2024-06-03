from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mqtt import mqtt_client
import json
from datetime import datetime
import requests
from pydantic import BaseModel
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # List of allowed methods, or "*" to allow all methods
    allow_headers=["*"],  # List of allowed headers, or "*" to allow all headers
)

class PredictionInput(BaseModel):
    temperature: float
    pressure: float
    altitude: float

@app.get("/api/v1/data")
async def read_data():
    try:
        # Open and read data from data.json
        with open("data.json", "r") as json_file:
            data = json.load(json_file)
        def sort_by_timestamp_desc(item) -> int:
            return int(datetime.strptime(item['timestamp'], "%d/%m/%Y %H:%M:%S").timestamp())

        # Sort the data by timestamp in descending order
        sorted_data = sorted(data, key=sort_by_timestamp_desc, reverse=True)

        return sorted_data
    except FileNotFoundError:
        return {"error": "File not found"}
    except json.JSONDecodeError:
        return {}
    
@app.get("/api/v1/mlprediction")
async def get_predict():
    with open("data.json", "r") as json_file:
        data = json.load(json_file)
        def sort_by_timestamp_desc(item) -> int:
            return int(datetime.strptime(item['timestamp'], "%d/%m/%Y %H:%M:%S").timestamp())

        # Sort the data by timestamp in descending order
        sorted_data = sorted(data, key=sort_by_timestamp_desc, reverse=True)[0]
        instances = [
        [sorted_data['temperature'], sorted_data['pressure'], sorted_data['altitude']]  
        ]
        print(f"instances : {instances}")
        payload = json.dumps({"instances": instances})
        url = "https://mlarrifqi-p6wt6m5nea-et.a.run.app/v1/models/ml_arrifqi:predict"
        response = requests.post(url, data=payload)
        response_data = json.loads(response.text)
        print(f"response data: {response_data}")
        predictions = response_data['predictions'][0]
        print(f"predictions: {predictions}")
        index_of_max_value = predictions.index(max(predictions))
        return index_of_max_value
    
@app.post("/api/v1/manualmlprediction")
async def get_manual_predict(input_data : PredictionInput):
        instances = [
            [input_data.temperature, input_data.pressure, input_data.altitude]
        ]
        print(f"instances : {instances}")
        payload = json.dumps({"instances": instances})
        url = "https://mlarrifqi-p6wt6m5nea-et.a.run.app/v1/models/ml_arrifqi:predict"
        response = requests.post(url, data=payload)
        response_data = json.loads(response.text)
        print(f"response data: {response_data}")
        predictions = response_data['predictions'][0]
        print(f"predictions: {predictions}")
        index_of_max_value = predictions.index(max(predictions))
        return index_of_max_value
    
    
@app.delete("/api/v1/data")
async def delete_data():
    try:
        with open('data.json') as f:
            json_data = json.load(f)

        # Overwrite the JSON data with an empty list
        json_data = []

        # Save the modified JSON data to the file
        with open('data.json', 'w') as f:
            json.dump(json_data, f)
        return "Berhasil hapus data!"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    
    
