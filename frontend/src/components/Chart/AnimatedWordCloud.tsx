/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import WordcloudModule from "highcharts/modules/wordcloud";

// Init the module once in the client
if (typeof Highcharts === "object" && typeof (WordcloudModule as any) === "function") {
  (WordcloudModule as any)(Highcharts);
}

interface WordData { name: string; weight: number }

interface Props {
  /** Array of phrases/words. Duplicates increase weight automatically */
  phrases: string[];
  /** Height of chart in px (default 300) */
  height?: number;
  /** Re-render animation duration */
  durationMs?: number;
  /** Show the input to add words locally (debug/demo). Default false. */
  editable?: boolean;
}

export default function AnimatedWordCloud({ phrases, height = 300, durationMs = 800, editable = false }: Props) {
  const [data, setData] = useState<WordData[]>([]);
  const [chartKey, setChartKey] = useState(0);
  const [localInput, setLocalInput] = useState("");

  useEffect(() => {
    const counts: Record<string, number> = {};
    (phrases || []).forEach((p) => {
      const k = String(p || "").trim();
      if (!k) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    const wordData = Object.entries(counts).map(([name, weight]) => ({ name, weight }));
    setData(wordData);
    setChartKey((prev) => prev + 1); // force layout recompute for smoother animation
  }, [phrases]);

  const options: Highcharts.Options = {
    chart: { type: "wordcloud", height, animation: { duration: durationMs } },
    title: { text: "" },
    tooltip: { pointFormat: '<span style="font-weight:600">{point.name}</span>: {point.weight}' },
    series: [
      {
        type: "wordcloud",
        data: data.map((item) => [item.name, item.weight]),
        name: "Occurrences",
        animation: { duration: durationMs },
        rotation: { from: -30, to: 30, orientations: 2 },
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div>
      {editable && (
        <input
          type="text"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && localInput.trim()) {
              // local additive input purely for demo; caller should generally control via props
              const next = [...phrases, localInput.trim()];
              const counts: Record<string, number> = {};
              next.forEach((p) => { counts[p] = (counts[p] || 0) + 1; });
              setData(Object.entries(counts).map(([name, weight]) => ({ name, weight })));
              setChartKey((k) => k + 1);
              setLocalInput("");
            }
          }}
          placeholder="Type phrase and press Enter"
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem", fontSize: "1rem", width: "100%", maxWidth: 300 }}
        />
      )}
      <HighchartsReact key={chartKey} highcharts={Highcharts} options={options} />
    </div>
  );
}
