// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useEffect, useMemo, useRef } from "react";

// // Type-safe, module-level d3 imports
// import { select } from "d3-selection";
// import { scaleLinear, scaleOrdinal } from "d3-scale";
// import { schemeTableau10 } from "d3-scale-chromatic";
// import { easeCubicOut } from "d3-ease";
// import "d3-transition"; // augments selection.transition() types

// // ✅ Use module namespace types from d3-cloud
// import type cloud from "d3-cloud";
// type CloudWord = cloud.Word;
// type CloudLayout<T extends CloudWord> = any;

// export type Word = { text: string; value: number };

// type Props = {
//   words: Word[];
//   width?: number;
//   height?: number;
//   minFont?: number; // px
//   maxFont?: number; // px
//   spiral?: "archimedean" | "rectangular";
//   rotate?: (d: Word) => number; // degrees
//   padding?: number; // px
//   onWordClick?: (w: Word) => void;
//   className?: string;
// };

// const D3WordCloud: React.FC<Props> = ({
//   words,
//   width = 700,
//   height = 420,
//   minFont = 12,
//   maxFont = 64,
//   spiral = "archimedean",
//   rotate = () => (Math.random() > 0.85 ? 90 : 0),
//   padding = 2,
//   onWordClick,
//   className,
// }) => {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const valueToSize = useMemo(() => {
//     if (!words?.length) return (_: number) => minFont;
//     const vals = words.map((w) => w.value);
//     const vmin = Math.min(...vals);
//     const vmax = Math.max(...vals);
//     if (vmin === vmax) {
//       const mid = Math.round((minFont + maxFont) / 2);
//       return (_: number) => mid;
//     }
//     const s = scaleLinear().domain([vmin, vmax]).range([minFont, maxFont]);
//     return (v: number) => Math.max(minFont, Math.round(s(v)));
//   }, [words, minFont, maxFont]);

//   const color = useMemo(() => scaleOrdinal<string, string>(schemeTableau10), []);

//   useEffect(() => {
//     let isCancelled = false;
//     let layout: CloudLayout<CloudWord> | null = null;

//     (async () => {
//       // ✅ Typed dynamic import
//       const mod = (await import("d3-cloud")) as unknown as {
//         default: typeof cloud;
//       };
//       const cloudFactory = mod.default;

//       if (isCancelled) return;

//       const node = containerRef.current;
//       if (!node) return;

//       // Clear previous SVG
//       select(svgRef.current).remove();

//       // Create fresh SVG
//       const svgSel = select(node).append("svg").attr("width", width).attr("height", height);
//       svgRef.current = svgSel.node() as SVGSVGElement;

//       const g = svgSel.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

//       // Prepare words for layout
//       const cloudWords: Array<CloudWord & { value: number }> = (words ?? []).map((w) => ({
//         text: w.text,
//         // keep extra "value" for click callback; not used by the layout itself
//         value: w.value,
//         size: valueToSize(w.value),
//       }));

//       const computedRotate =
//         cloudWords.length <= 1
//           ? () => 0
//           : (d: CloudWord & { value?: number }) =>
//               rotate({ text: String(d.text ?? ""), value: (d as any).value });

//       layout = cloudFactory<CloudWord>()
//         .size([width, height])
//         // Layout expects CloudWord[]; we’ve added "value" but that’s fine for our usage
//         .words(cloudWords as unknown as CloudWord[])
//         .padding(padding)
//         .rotate(computedRotate as any)
//         .font("sans-serif")
//         .fontSize((d: any) => d.size)
//         .spiral(spiral)
//         .on("end", (out: any[]) => {
//           // ENTER
//           const enter = g
//             .selectAll<SVGTextElement, any>("text")
//             .data(out, (d: any) => d.text)
//             .enter()
//             .append("text")
//             .attr("text-anchor", "middle")
//             .style("font-family", "sans-serif")
//             // Start small/centered for animation
//             .style("font-size", (d: any) => `${Math.max(10, Math.floor(d.size * 0.6))}px`)
//             .style("fill", (_d: any, i: number) => color(String(i)))
//             .style("opacity", 0)
//             .attr("transform", `translate(0,0) rotate(0)`)
//             .text((d: any) => d.text);

//           if (onWordClick) {
//             enter.style("cursor", "pointer").on("click", (_evt: any, d: any) => {
//               onWordClick({ text: d.text, value: d.value ?? d.size });
//             });
//           }

//           // Hover
//           enter
//             .on("mouseenter", function () {
//               select(this).transition().duration(150).style("opacity", 0.75);
//             })
//             .on("mouseleave", function () {
//               select(this).transition().duration(150).style("opacity", 1);
//             });

//           // Animate to final position/size
//           enter
//             .transition()
//             .duration(700)
//             .ease(easeCubicOut)
//             .delay((_, i) => i * 20)
//             .attr("transform", (d: any) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
//             .style("font-size", (d: any) => `${d.size}px`)
//             .style("opacity", 1);
//         });

//       layout.start();
//     })();

//     return () => {
//       isCancelled = true;
//       try {
//         layout?.stop?.();
//       } catch {}
//       select(svgRef.current).remove();
//     };
//   }, [words, width, height, minFont, maxFont, spiral, rotate, padding, valueToSize, color, onWordClick]);

//   return <div ref={containerRef} className={className} />;
// };

// export default D3WordCloud;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef } from "react";

// Type-safe, module-level d3 imports
import { select } from "d3-selection";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { schemeTableau10 } from "d3-scale-chromatic";
import { easeCubicOut } from "d3-ease";
import "d3-transition"; // augments selection.transition() types

// ✅ Use module namespace types from d3-cloud
import type cloud from "d3-cloud";
type CloudWord = cloud.Word;
type CloudLayout<T extends CloudWord> = any;

export type Word = { text: string; value: number };

type Props = {
  words: Word[];
  width?: number;
  height?: number;
  minFont?: number; // px
  maxFont?: number; // px
  spiral?: "archimedean" | "rectangular";
  rotate?: (d: Word) => number; // degrees
  padding?: number; // px
  onWordClick?: (w: Word) => void;
  className?: string;
};

const D3WordCloud: React.FC<Props> = ({
  words,
  width = 700,
  height = 420,
  minFont = 18,
  maxFont = 64,
  spiral = "archimedean",
  rotate = () => (Math.random() > 0.85 ? 90 : 0),
  padding = 2,
  onWordClick,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 🔁 Dedupe by text (case-insensitive), value = frequency
  const displayWords: Word[] = useMemo(() => {
    const counts = new Map<string, number>();
    const label = new Map<string, string>(); // preserve first-seen casing
    for (const w of words ?? []) {
      const key = (w.text ?? "").trim().toLowerCase();
      if (!key) continue;
      if (!label.has(key)) label.set(key, w.text);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([k, cnt]) => ({
      text: label.get(k) ?? k,
      value: cnt, // frequency
    }));
  }, [words]);

  const minFontEffective = Math.max(minFont, 28);
  const maxFontEffective = Math.max(maxFont, minFontEffective + 24);
  const valueToSize = useMemo(() => {
    if (!displayWords.length) return (_: number) => minFontEffective;
    const vmax = Math.max(...displayWords.map((w) => w.value)); // max frequency
    if (vmax <= 1) return (_: number) => minFontEffective;
    const s = scaleLinear()
      .domain([1, vmax])
      .range([minFontEffective, maxFontEffective]);
    return (v: number) => Math.max(minFontEffective, Math.round(s(v)));
  }, [displayWords, minFontEffective, maxFontEffective]);

  const color = useMemo(
    () => scaleOrdinal<string, string>(schemeTableau10),
    []
  );

  useEffect(() => {
    let isCancelled = false;
    let layout: CloudLayout<CloudWord> | null = null;

    (async () => {
      const mod = (await import("d3-cloud")) as unknown as {
        default: typeof cloud;
      };
      const cloudFactory = mod.default;

      if (isCancelled) return;

      const node = containerRef.current;
      if (!node) return;

      // 🔄 Clear previous SVG
      select(svgRef.current).remove();

      // 🖼️ Create fresh SVG (responsive + centered aspect)
      const svgSel = select(node)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      svgRef.current = svgSel.node() as SVGSVGElement;

      // Group that we’ll recenter after layout
      const g = svgSel.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

      // Prepare words for layout (value = frequency, size = by frequency)
      const cloudWords: Array<CloudWord & { value: number }> = (displayWords ?? []).map((w) => ({
        text: w.text,
        value: w.value,
        size: valueToSize(w.value),
      }));

      const computedRotate =
        cloudWords.length <= 1
          ? () => 0
          : (d: CloudWord & { value?: number }) =>
              rotate({
                text: String(d.text ?? ""),
                value: (d as any).value,
              });

      // Helper: recenters <g> so the cloud bbox is visually centered
      const recenter = (out: any[]) => {
        if (!out.length) return;

        // d3-cloud provides d.x, d.y as centers and d.width/d.height
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;

        for (const d of out) {
          const left = d.x - d.width / 2;
          const right = d.x + d.width / 2;
          const top = d.y - d.height / 2;
          const bottom = d.y + d.height / 2;
          if (left < minX) minX = left;
          if (right > maxX) maxX = right;
          if (top < minY) minY = top;
          if (bottom > maxY) maxY = bottom;
        }

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        // Move the entire group so (cx, cy) aligns with the view center
        g.attr("transform", `translate(${width / 2 - cx},${height / 2 - cy})`);
      };

      layout = cloudFactory<CloudWord>()
        .size([width, height])
        // .center([0, 0]) // make sure layout is around (0,0)
        .words(cloudWords as unknown as CloudWord[])
        .padding(padding)
        .rotate(computedRotate as any)
        .font("sans-serif")
        .fontSize((d: any) => d.size)
        .spiral(spiral)
        .on("end", (out: any[]) => {
          // ENTER
          const enter = g
            .selectAll<SVGTextElement, any>("text")
            .data(out, (d: any) => d.text)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .style("font-family", "sans-serif")
            // Start smaller for animation
            .style("font-size", (d: any) => `${Math.max(12, Math.floor(d.size * 0.8))}px`)
            .style("fill", (_d: any, i: number) => color(String(i)))
            .style("opacity", 0)
            .attr("transform", `translate(0,0) rotate(0)`)
            .text((d: any) => d.text);

          if (onWordClick) {
            enter
              .style("cursor", "pointer")
              .on("click", (_evt: any, d: any) => {
                onWordClick({
                  text: d.text,
                  value: d.value ?? d.size,
                }); // value = frequency
              });
          }

          // Hover
          enter
            .on("mouseenter", function () {
              select(this).transition().duration(150).style("opacity", 0.75);
            })
            .on("mouseleave", function () {
              select(this).transition().duration(150).style("opacity", 1);
            });

          // Animate to final position/size
          enter
            .transition()
            .duration(700)
            .ease(easeCubicOut)
            .delay((_, i) => i * 20)
            .attr("transform", (d: any) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .style("font-size", (d: any) => `${d.size}px`)
            .style("opacity", 1)
            // .on("end", (_: any, i: number, nodes: any[]) => {
            //   // Once the last transition batch finishes, recenter the cluster
            //   if (i === nodes.length - 1) recenter(out);
            // });

          // Also recenter immediately (covers zero-duration cases)
          recenter(out);
        });

      layout.start();
    })();

    return () => {
      isCancelled = true;
      try {
        layout?.stop?.();
      } catch {}
      select(svgRef.current).remove();
    };
  }, [
    displayWords,
    width,
    height,
    minFont,
    maxFont,
    spiral,
    rotate,
    padding,
    valueToSize,
    color,
    onWordClick,
  ]);

  return <div ref={containerRef} className={className} />;
};

export default D3WordCloud;

