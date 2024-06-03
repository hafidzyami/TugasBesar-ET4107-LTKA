"use client";

// Import necessary dependencies
import React, { useEffect, useState } from "react";
import NavigationBar from "../../../components/navbar";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import { Button } from "react-bootstrap";

function History() {
  // State to store fetched data
  const [data, setData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://tugasbesar-et4107-ltka-p6wt6m5nea-et.a.run.app/api/v1/data"
      );
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data from server on component mount
  useEffect(() => {

    fetchData();
  }, []);

  const handleDelete = async () => {
    try {
      const res = await fetch("https://tugasbesar-et4107-ltka-p6wt6m5nea-et.a.run.app/api/v1/data", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });
      if (res.ok) {
        // Refresh data after successful deletion
        fetchData();
      } else {
        console.error("Failed to delete data:", res.statusText);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Render blank table if data is null, empty, or not an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div>
        <NavigationBar />
        <div>No data available</div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 1;
  const currentData = data
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const paddedData = [...currentData];
  while (paddedData.length < itemsPerPage) {
    paddedData.push(null);
  }

  // Render table with data
  return (
    <div>
      <NavigationBar />
      <div style={{ height: "65vh" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temperature (°C)</th>
              <th>Pressure (Pa)</th>
              <th>Altitude (m)</th>
            </tr>
          </thead>
          <tbody>
            {paddedData.map((item: any, index: any) => {
              return item ? (
                <tr key={index}>
                  <td>{item.timestamp}</td>
                  <td>{Math.round(item.temperature * 100) / 100}</td>
                  <td>{Math.round(item.pressure * 100) / 100}</td>
                  <td>{Math.round(item.altitude * 100) / 100}</td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <div className="mt-5">
        <div>
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
      <div className="mt-1 ms-2">
        <Button className="btn-danger" onClick={handleDelete}>Delete Data</Button>
      </div>
    </div>
  );
}

export default History;
