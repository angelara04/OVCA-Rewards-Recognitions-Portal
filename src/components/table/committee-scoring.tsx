import React, { useState, useEffect } from "react";
import Button from "../button";
import { Category } from "@/app/store/category";

export default function PerformanceEvaluationForm() {
  const { selectedCategory } = Category();

  const partAKeys = ["2022", "2023", "2024 (Jan–Jun)"];
  const partBKeys = [
    "Intervening Activities",
    "Significant innovations/contributions that improved the efficiency of unit operations",
    "Awards received within the three-year period",
    "Community service in adherence to UP’s mandate and/or membership as a Public Service University (within the three-year period)",
  ];
  const partCKeys = [
    "Punctuality (refer Table PUNCTUALITY)",
    "Ability to deliver quality outputs on time (with certification from immediate supervisor) * (refer Table QUALITY/EFFICIENCY)",
    "Ability to work effectively with others as a team (with certification from immediate supervisor) * (refer Table QUALITY/EFFICIENCY)",
  ];

  const partAMax = 60;
  const [partBMax, setPartBMax] = useState<number[]>([0, 0, 0, 0]);
  const partCMax = [5, 5, 5];

  // ✅ Automatically update partBMax when category changes
  useEffect(() => {
    if (selectedCategory === "Non-Teaching Personnel (Senior Level)") {
      setPartBMax([10, 8, 4, 3]);
    } else if (
      selectedCategory ===
      "Non-Teaching Personnel (Junior and Industrial Level)"
    ) {
      setPartBMax([12, 5, 2, 6]);
    } else {
      setPartBMax([0, 0, 0, 0]);
    }
  }, [selectedCategory]);

  type PartType = "partA" | "partB" | "partC";

  const [inputs, setInputs] = useState<{
    partA: string[];
    partB: string[];
    partC: string[];
  }>({
    partA: Array(partAKeys.length).fill(""),
    partB: Array(partBKeys.length).fill(""),
    partC: Array(partCKeys.length).fill(""),
  });

  const [errors, setErrors] = useState<{
    partA: boolean[];
    partB: boolean[];
    partC: boolean[];
  }>({
    partA: Array(partAKeys.length).fill(false),
    partB: Array(partBKeys.length).fill(false),
    partC: Array(partCKeys.length).fill(false),
  });

  const handleChange = (part: PartType, index: number, value: string) => {
    let max = 0;
    let min = 0;
    if (part === "partA") max = partAMax;
    if (part === "partB") max = partBMax[index] ?? 0;
    if (part === "partC") {
      max = partCMax[index];
      min = 1; // enforce minimum 1 for Part C
    }

    if (value === "") {
      setInputs((prev) => {
        const updated = { ...prev };
        updated[part][index] = "";
        return updated;
      });
      setErrors((prev) => {
        const updated = { ...prev };
        updated[part][index] = false;
        return updated;
      });
      return;
    }

    let numericVal = Number(value);
    if (numericVal < min) numericVal = min;
    if (numericVal > max) numericVal = max;

    setInputs((prev) => {
      const updated = { ...prev };
      updated[part][index] = numericVal.toString();
      return updated;
    });

    setErrors((prev) => {
      const updated = { ...prev };
      updated[part][index] = numericVal > max || numericVal < min;
      return updated;
    });
  };

  const totalPartA = inputs.partA.reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const avgPartA = (totalPartA / inputs.partA.length).toFixed(2);
  const totalPartB = inputs.partB.reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const totalPartC = inputs.partC.reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const overallTotal = totalPartA + totalPartB + totalPartC;

  return (
    <div>
      <div className="max-w-5xl mx-auto bg-[var(--white)] shadow-md rounded-t-2xl overflow-hidden outline-1 outline-[var(--outline-grey)]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--maroon)] text-white font-normal">
              <th className="p-3 text-left">Indicators</th>
              <th className="p-3 text-left">Max Points (for 2.5 years)</th>
              <th className="p-3 text-left">Points Earned (UPMin PRAISE)</th>
            </tr>
          </thead>
          <tbody>
            {/* Part A */}
            <tr className="bg-[var(--grey)]">
              <td colSpan={3} className="font-semibold p-3">
                Part A. (Maximum Points - 60)
              </td>
            </tr>
            <tr className="border-b border-[var(--outline-grey)]">
              <td className="p-3">IPCR (Indicate the average rating)</td>
              <td className="p-3"></td>
              <td className="p-3"></td>
            </tr>
            {partAKeys.map((year, idx) => (
              <tr key={year} className="border-b border-[var(--outline-grey)]">
                <td className="p-3">{year}</td>
                <td className="p-3">{partAMax}</td>
                <td className="p-3">
                  <input
                    type="number"
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partA[idx] ? "border-red-500" : ""
                    }`}
                    placeholder="0"
                    value={inputs.partA[idx]}
                    onChange={(e) => handleChange("partA", idx, e.target.value)}
                    min={0}
                    max={partAMax}
                  />
                  {errors.partA[idx] && (
                    <div className="text-red-500 text-xs">Max {partAMax}</div>
                  )}
                </td>
              </tr>
            ))}
            <tr className="border-b border-[var(--outline-grey)]">
              <td className="p-3 font-medium">Average:</td>
              <td className="p-3 bg-[var(--grey)] flex justify-center">
                {avgPartA}
              </td>
              <td className="p-3"></td>
            </tr>

            {/* Part B */}
            <tr className="bg-[var(--grey)]">
              <td colSpan={3} className="font-semibold p-3">
                Part B. (Maximum Points - 25)
              </td>
            </tr>
            {partBKeys.map((indicator, idx) => (
              <tr
                key={indicator}
                className="border-b border-[var(--outline-grey)]"
              >
                <td className="p-3">{indicator}</td>
                <td className="p-3">{partBMax[idx] ?? 0}</td>
                <td className="p-3">
                  <input
                    type="number"
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partB[idx] ? "border-red-500" : ""
                    }`}
                    placeholder="0"
                    value={inputs.partB[idx]}
                    onChange={(e) => handleChange("partB", idx, e.target.value)}
                    min={0}
                    max={partBMax[idx] ?? 0}
                  />
                  {errors.partB[idx] && (
                    <div className="text-red-500 text-xs">
                      Max {partBMax[idx] ?? 0}
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* Part C */}
            <tr className="bg-[var(--grey)]">
              <td colSpan={3} className="font-semibold p-3">
                Part C. (Maximum Points - 15)
              </td>
            </tr>
            {partCKeys.map((indicator, idx) => (
              <tr
                key={indicator}
                className="border-b border-[var(--outline-grey)]"
              >
                <td className="p-3">{indicator}</td>
                <td className="p-3">1–5</td>
                <td className="p-3">
                  <input
                    type="number"
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partC[idx] ? "border-red-500" : ""
                    }`}
                    placeholder="1"
                    value={inputs.partC[idx]}
                    onChange={(e) => handleChange("partC", idx, e.target.value)}
                    min={1}
                    max={5}
                  />
                  {errors.partC[idx] && (
                    <div className="text-red-500 text-xs">Range 1–5 only</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Points */}
      <div className="mt-4 p-3 font-semibold text-right w-full h-[111px] rounded-2xl bg-[var(--maroon)] text-[var(--white)] flex items-center justify-center flex-col gap-2">
        <span>Total Score: {overallTotal} Points</span>
        <span>Minimum score to qualify for the award: 70 points</span>
      </div>

      <div className="flex justify-end gap-2 items-center font-normal mt-4">
        <Button size="md" variant="secondary">
          Reset Form
        </Button>
        <Button size="md" variant="submit">
          Submit Form
        </Button>
      </div>
    </div>
  );
}
