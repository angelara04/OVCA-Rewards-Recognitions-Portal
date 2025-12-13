import React, { useState, useEffect } from "react";

interface ScoresJSON {
  ipcr?: number;
  meta_ipcr_breakdown?: {
    y2022?: number;
    y2023?: number;
    y2024?: number;
  };
  intervening?: number;
  innovations?: number;
  awards?: number;
  service?: number;
  punctuality?: number;
  quality?: number;
  teamwork?: number;
}

interface Nomination {
  category?: string;
}

interface ReviewContext {
  scores_json?: ScoresJSON;
  nomination?: Nomination | null;
  status?: "completed" | "in-progress";
}

// Updated Props Interface
interface PerformanceEvaluationFormProps {
  reviewContext: ReviewContext | null;
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ipcr: { y2022: string; y2023: string; y2024: string };
  setIpcr: React.Dispatch<
    React.SetStateAction<{ y2022: string; y2023: string; y2024: string }>
  >;
  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;
  isLocked: boolean;
}

export default function PerformanceEvaluationForm({
  reviewContext,
  scores,
  setScores,
  ipcr,
  setIpcr,
  comments,
  setComments,
  isLocked,
}: PerformanceEvaluationFormProps) {
  if (!reviewContext) return null;

  // Table descriptions
  const REFERENCE_TABLE_LINK = "https://l.messenger.com/l.php?u=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F10mbhlYnG9oHGCcdYw8ctIqB91NnqAl6eJzk5VLrGcv0%2Fedit%3Fusp%3Dsharing&h=AT18doMAplpCLgmC0RnDIBBVzw-IsPcBwNUwYvIihSnoj68W0u0IrxUYcHB0nj1YBuofvp9Cmy3fVn3IRVaHo2KTHoz5KJPRnJvbVS5rhTYQq7imao_Ls1vfe9Pbiuer7gvafu9nypRZ_gL6etpJ_A"
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

  // Maximum points
  const partAMax = 60;
  const partCMax = [5, 5, 5];
  const [partBMax, setPartBMax] = useState<number[]>([0, 0, 0, 0]);

  // Validation Error State
  const [errors, setErrors] = useState<{
    partA: boolean[];
    partB: boolean[];
    partC: boolean[];
  }>({
    partA: Array(partAKeys.length).fill(false),
    partB: Array(partBKeys.length).fill(false),
    partC: Array(partCKeys.length).fill(false),
  });

  // --- Mapping descriptions to scores keys ---
  const partBMapping: Record<string, string> = {
    "Intervening Activities": "intervening",
    "Significant innovations/contributions that improved the efficiency of unit operations":
      "innovations",
    "Awards received within the three-year period": "awards",
    "Community service in adherence to UP’s mandate and/or membership as a Public Service University (within the three-year period)":
      "service",
  };

  const partCMapping: Record<string, string> = {
    "Punctuality (refer Table PUNCTUALITY)": "punctuality",
    "Ability to deliver quality outputs on time (with certification from immediate supervisor) * (refer Table QUALITY/EFFICIENCY)":
      "quality",
    "Ability to work effectively with others as a team (with certification from immediate supervisor) * (refer Table QUALITY/EFFICIENCY)":
      "teamwork",
  };

  // --- Set Part B max points based on nomination category ---
  useEffect(() => {
    const category = reviewContext?.nomination?.category ?? "";

    if (category === "Non-Teaching Personnel (Senior Level)") {
      setPartBMax([10, 8, 4, 3]);
    } else if (
      [
        "Non-Teaching Personnel (Junior and Industrial Level)",
        "Industrial and Allied Professionals (SG 1 - 8)",
        "Junior Professionals (SG 1 - 8)",
      ].includes(category)
    ) {
      setPartBMax([12, 5, 2, 6]);
    } else {
      setPartBMax([0, 0, 0, 0]);
    }
  }, [reviewContext]);

  // --- Handlers ---

  const handleIpcrChange = (index: number, value: string) => {
    let numericVal = 0;
    if (value !== "") {
      numericVal = Number(value);
      if (numericVal < 0) numericVal = 0;
      if (numericVal > partAMax) numericVal = partAMax;
    }

    const key = index === 0 ? "y2022" : index === 1 ? "y2023" : "y2024";
    // Update parent state
    setIpcr((prev) => ({ ...prev, [key]: value }));

    // Local validation
    setErrors((prev) => {
      const updated = { ...prev };
      updated.partA[index] = numericVal > partAMax || numericVal < 0;
      return updated;
    });
  };

  const handleScoreChange = (
    part: "partB" | "partC",
    index: number,
    value: string,
    desc: string
  ) => {
    let max = 0;
    let min = 0;
    let mapping: Record<string, string> = {};

    if (part === "partB") {
      max = partBMax[index] ?? 0;
      mapping = partBMapping;
    }
    if (part === "partC") {
      max = partCMax[index];
      min = 1;
      mapping = partCMapping;
    }

    const key = mapping[desc];
    if (!key) return;

    let numericVal = 0;
    if (value !== "") {
      numericVal = Number(value);
      if (numericVal < min) numericVal = min;
      if (numericVal > max) numericVal = max;
    }

    // Update parent state
    setScores((prev) => ({ ...prev, [key]: numericVal }));

    // Local validation
    setErrors((prev) => {
      const updated = { ...prev };
      updated[part][index] = numericVal > max || numericVal < min;
      return updated;
    });
  };

  // --- Calculate totals for display ---
  const ipcrValues = [ipcr.y2022, ipcr.y2023, ipcr.y2024];
  const totalPartA = ipcrValues.reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
  const avgPartA = ipcrValues.every((v) => v === "")
    ? ""
    : (totalPartA / 3).toFixed(2); // Average of 3 periods

  const totalPartB = partBKeys.reduce((sum, desc) => {
    const key = partBMapping[desc];
    return sum + (scores[key] || 0);
  }, 0);

  const totalPartC = partCKeys.reduce((sum, desc) => {
    const key = partCMapping[desc];
    return sum + (scores[key] || 0);
  }, 0);

  const overallTotal = (Number(avgPartA) || 0) + totalPartB + totalPartC;

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
                    value={ipcrValues[idx]}
                    placeholder="0"
                    min={0}
                    max={partAMax}
                    disabled={isLocked}
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partA[idx] ? "border-red-500" : ""
                    }`}
                    onChange={(e) => handleIpcrChange(idx, e.target.value)}
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
                    value={scores[partBMapping[indicator]] ?? ""}
                    placeholder="0"
                    min={0}
                    max={partBMax[idx] ?? 0}
                    disabled={isLocked}
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partB[idx] ? "border-red-500" : ""
                    }`}
                    onChange={(e) =>
                      handleScoreChange("partB", idx, e.target.value, indicator)
                    }
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
                <td className="p-3">
                {indicator.includes("(refer") ? (
                  <>
                    {indicator.split(" (refer")[0]}{" "}
                    <a
                      href={REFERENCE_TABLE_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark-grey underline hover:text-blue-800"
                    >
                      (refer table)
                    </a>
                  </>
                ) : (
                  indicator
                )}
              </td>

                <td className="p-3">1–5</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={scores[partCMapping[indicator]] ?? ""}
                    placeholder="1"
                    min={1}
                    max={5}
                    disabled={isLocked}
                    className={`w-20 border rounded p-1 text-center ${
                      errors.partC[idx] ? "border-red-500" : ""
                    }`}
                    onChange={(e) =>
                      handleScoreChange("partC", idx, e.target.value, indicator)
                    }
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
        <span>Total Score: {overallTotal.toFixed(2)} Points</span>
        <span>Minimum score to qualify for the award: 70 points</span>
      </div>

      {/* Comments Section Added */}
      <div className="mt-6 bg-white p-6 rounded-lg border border-[var(--outline-grey)]">
        <label className="block font-bold mb-2">
          Overall Comments / Remarks
        </label>
        <textarea
          rows={4}
          disabled={isLocked}
          className="w-full p-3 border border-[var(--outline-grey)] rounded-lg resize-none"
          placeholder="Add justification or remarks here..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>
    </div>
  );
}
