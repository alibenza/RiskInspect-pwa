import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useInspectionStore } from '../hooks/useInspectionStore';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RiskChart = () => {
  const { questionsConfig, responses } = useInspectionStore();

  // 1. Extraire dynamiquement les noms des sections et calculer leur score moyen
  const labels = questionsConfig.map(section => section.title.substring(0, 20) + "..."); // On tronque pour la lisibilité
  
  const dataValues = questionsConfig.map(section => {
    const rangeQuestions = section.questions.filter(q => q.type === 'range');
    
    if (rangeQuestions.length === 0) return 0;

    let totalPoints = 0;
    rangeQuestions.forEach(q => {
      totalPoints += parseFloat(responses[q.id]) || 0;
    });

    // Moyenne ramenée sur 100 pour le graphique
    return (totalPoints / (rangeQuestions.length * 5)) * 100;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Niveau de Conformité %',
        data: dataValues,
        backgroundColor: 'rgba(37, 99, 235, 0.2)', // Blue-600 avec transparence
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(37, 99, 235, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, display: false }
      },
    },
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  };

  return <Radar data={data} options={options} />;
};

export default RiskChart;
