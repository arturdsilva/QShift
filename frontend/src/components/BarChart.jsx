import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
    LinearScale,
    BarElement } from 'chart.js';

ChartJS.register(
    LinearScale,
    BarElement
);

const BarChart = ({ data, options }) => {
  return <Bar data={data} options={options} />;
};

export default BarChart;