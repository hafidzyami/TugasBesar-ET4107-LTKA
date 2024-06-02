"use client";

import React, { useState } from "react";
import NavigationBar from "../../../components/navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";

function Prediction() {
  const [predictResult, setPredictResult] = useState();
  const [loading, setLoading] = useState(false);
  const imageSources = [
    "/assets/sun.png", // predictResult = 0
    "/assets/cloudy.png", // predictResult = 1
    "/assets/rainy.png", // predictResult = 2
  ];

  const [temperature, setTemperature] = useState("");
  const [pressure, setPressure] = useState("");
  const [altitude, setAltitude] = useState("");
  const [errors, setErrors] = useState({ temperature: false, pressure: false, altitude: false });
  const handlePredict = async () => {
    const newErrors = {
      temperature: !temperature,
      pressure: !pressure,
      altitude: !altitude,
    };

    setErrors(newErrors);

    // If there are any errors, stop the submission
    if (newErrors.temperature || newErrors.pressure || newErrors.altitude) {
      alert("Please input all fields!")
      return;
    }
    const data = {
      temperature: parseFloat(temperature),
      pressure: parseFloat(pressure),
      altitude: parseFloat(altitude),
    };
    try {
      const response = await fetch(
        "https://tugasbesar-et4107-ltka-p6wt6m5nea-et.a.run.app/api/v1/manualmlprediction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("result : ", result);
      setPredictResult(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleTemperatureChange = (e: any) => {
    setTemperature(e.target.value);
  };

  const handlePressureChange = (e: any) => {
    setPressure(e.target.value);
  };

  const handleAltitudeChange = (e: any) => {
    setAltitude(e.target.value);
  };
  console.log("predict result code :", predictResult);
  const imageSrc =
    predictResult !== undefined ? imageSources[predictResult] : "";
  return (
    <div>
      <NavigationBar />
      <div className="text-center mt-4 mb-5">
        <h4>Manual Prediction</h4>
      </div>
      <Container>
        <Row style={{}}>
          <Col xs={7}>
            <div className="mb-4">
              <h5>Input Data : </h5>
            </div>
            <InputGroup className="mb-5">
              <InputGroup.Text>Temperature</InputGroup.Text>
              <Form.Control
                aria-label="Temperature"
                value={temperature}
                onChange={handleTemperatureChange}
                isInvalid={errors.temperature}
              />
              <InputGroup.Text>°C</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-5">
              <InputGroup.Text>Pressure</InputGroup.Text>
              <Form.Control
                aria-label="Pressure"
                value={pressure}
                onChange={handlePressureChange}
                isInvalid={errors.pressure}
              />
              <InputGroup.Text>Pa</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-5">
              <InputGroup.Text>Altitude</InputGroup.Text>
              <Form.Control
                aria-label="Altitude"
                value={altitude}
                onChange={handleAltitudeChange}
                isInvalid={errors.altitude}
              />
              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Col>
          <Col className="d-flex flex-column align-items-center">
            <h5 className="mb-5">Hasil Prediksi:</h5>
            {predictResult && (
              <Image
                src={imageSrc}
                width={150}
                height={150}
                className="mb-5"
              ></Image>
            )}
            <Button variant="outline-success" onClick={handlePredict}>
              Predict
            </Button>

            {loading && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Prediction;
