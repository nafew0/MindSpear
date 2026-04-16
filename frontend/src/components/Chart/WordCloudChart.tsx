"use client";

import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import WordcloudModule from "highcharts/modules/wordcloud";



if (typeof Highcharts === "object" && WordcloudModule) {
  // (WordcloudModule as any).default(Highcharts);
}


interface WordData {
  name: string;
  weight: number;
}

export default function AnimatedWordCloud() {
  const [phrases, setPhrases] = useState<string[]>([
    "This",
    "Is",
    "Word",
    "Cloud",
  ]);
  console.log(setPhrases);
  
  const [data, setData] = useState<WordData[]>([]);
  const [chartKey, setChartKey] = useState(0); 
  // const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const counts: Record<string, number> = {};
    phrases.forEach((phrase) => {
      counts[phrase] = (counts[phrase] || 0) + 1;
    });

    const wordData = Object.entries(counts).map(([name, weight]) => ({
      name,
      weight,
    }));

    setData(wordData);


    setChartKey((prev) => prev + 1);
  }, [phrases]);

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     const value = e.currentTarget.value.trim();
  //     if (value !== "") {
  //       setPhrases((prev) => [...prev, value]);
  //       e.currentTarget.value = "";
  //     }
  //   }
  // };

  const options: Highcharts.Options = {
    chart: {
      type: "wordcloud",
      height: 300,
      animation: {
        duration: 800,
      },
    },
    title: {
      text: "",
    },
    series: [
      {
        type: "wordcloud",
        data: data.map((item) => [item.name, item.weight]),
        name: "Occurrences",
        animation: {
          duration: 800,
        },
        rotation: {
          from: -30,
          to: 30,
          orientations: 2,
        },
      },
    ],
  };

  return (
    <div>
      {/* <input
        type="text"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        placeholder="Type phrase and press Enter"
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          width: "100%",
          maxWidth: 300,
        }}
      /> */}

      <HighchartsReact key={chartKey} highcharts={Highcharts} options={options} />
    </div>
  );
}
