"use client";

import { useState } from "react";
import NavigationBar from "../../components/navbar";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";

export default function Home() {
  const [predictResult, setPredictResult] = useState();
  const [loading, setLoading] = useState(false);
  const imageSources = [
    "/assets/sun.png",    // predictResult = 0
    "/assets/cloudy.png", // predictResult = 1
    "/assets/rainy.png"   // predictResult = 2
  ];
  const handlePredict = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://tugasbesar-et4107-ltka-p6wt6m5nea-et.a.run.app/api/v1/mlprediction");
      const result = await res.json();
      setPredictResult(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log("predict result code :", predictResult)
  const imageSrc = predictResult !== undefined ? imageSources[predictResult] : "";
  return (
    <div>
      <NavigationBar />
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginTop: "36px",
        }}
      >
        <div style={{ borderRadius: "16px", overflow: "hidden" }}>
          <embed
            src="https://thingsboard.cloud/dashboard/b1cb7060-1696-11ef-a03d-1735cad43e87?publicId=0f9381a0-1698-11ef-bf00-a758a0264872"
            height={500}
            width={1000}
          ></embed>
        </div>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ marginTop: "-10vh", borderRadius : "16px", borderBlockColor : "black"}}
        >
          <h4 className="mb-5">Hasil Prediksi:</h4>
          {predictResult && <Image src={imageSrc} width={150} height={150} className="mb-5"></Image>}
          <Button variant="outline-success" onClick={handlePredict}>
            Predict
          </Button>

          {loading && (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
        </div>
      </div>
    </div>
  );
}
