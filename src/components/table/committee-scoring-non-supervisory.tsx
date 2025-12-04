"use client";
import React, { useState, useEffect } from "react";
import Button from "../button";

export default function PerformanceEvaluationForm_NonSupervisory({
  reviewContext,
}: {
  reviewContext?: any | null;
}) {
  // Treat completed status as read-only/disabled
  const isReadOnly =
    (reviewContext as any)?.status === "completed" ||
    (reviewContext as any)?.existingReview?.status === "completed";
  const indicators = [
    "Adopts new strategies in accomplishing work by completing tasks ahead of schedule (with certification from immediate supervisor)",
    "Ability to deliver quality outputs on time (with certification from immediate supervisor)",
    "Ability to work effectively with others as a team (with certification from immediate supervisor)",
  ];

  const [ratings, setRatings] = useState<number[]>(
    Array(indicators.length).fill(0)
  );
  const [comments, setComments] = useState("");
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    // Optionally prefill from existingReview.scores_json if present
    console.log("Non-supervisory: reviewContext prop:", reviewContext);
    const maybeExisting = (reviewContext as any)?.existingReview;
    const raw =
      maybeExisting?.scores_json ?? (reviewContext as any)?.scores_json;
    if (!raw) return;

    console.log("Non-supervisory: raw scores_json:", raw);
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      console.log("Non-supervisory: parsed scores_json:", parsed);

      // 1) If parsed contains an array 'ratings' use it directly
      if (Array.isArray(parsed.ratings)) {
        const vals = parsed.ratings.map((r: any) => Number(r) || 0);
        const padded = [...vals].slice(0, indicators.length);
        while (padded.length < indicators.length) padded.push(0);
        setRatings(padded);
        setTotalScore(padded.reduce((a, b) => a + b, 0));
      } else if (Array.isArray(parsed)) {
        // 2) If parsed itself is an array, use numeric entries
        const vals = parsed.map((r: any) => Number(r) || 0);
        const padded = [...vals].slice(0, indicators.length);
        while (padded.length < indicators.length) padded.push(0);
        setRatings(padded);
        setTotalScore(padded.reduce((a, b) => a + b, 0));
      } else if (parsed && typeof parsed === "object") {
        // 3) Extract numeric-like values from object in key order as a best-effort
        const numericValues: number[] = Object.keys(parsed)
          .sort()
          .map((k) => {
            const v = (parsed as any)[k];
            if (typeof v === "number") return v;
            if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)))
              return Number(v);
            return null;
          })
          .filter((v): v is number => v !== null)
          .map((n) => Math.max(0, Math.min(10, Math.round(n))));

        if (numericValues.length > 0) {
          const padded = numericValues.slice(0, indicators.length);
          while (padded.length < indicators.length) padded.push(0);
          setRatings(padded);
          setTotalScore(padded.reduce((a, b) => a + b, 0));
        }

        // also pick up comments if present
        if (typeof parsed.comments === "string") setComments(parsed.comments);
      }
    } catch (err) {
      console.warn("Failed to parse non-supervisory scores_json", err);
    }
  }, [reviewContext]);

  const handleRatingChange = (index: number, value: number) => {
    const updated = [...ratings];
    updated[index] = value;
    setRatings(updated);
    setTotalScore(updated.reduce((a, b) => a + b, 0));
  };

  const handleReset = () => {
    setRatings(Array(indicators.length).fill(0));
    setComments("");
    setTotalScore(0);
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto  rounded-t-2xl overflow-hidden outline-1 outline-[var(--outline-grey)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--maroon)] text-white">
              <th className="p-3 text-left w-[50%]">Indicators</th>
              <th className="p-3 text-center">
                Rating
                <br />
                (Select one, 1–10)
              </th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((indicator, i) => (
              <tr key={i} className="border-b border-[var(--outline-grey)]">
                <td className="p-4 align-top ">{indicator}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {[...Array(10)].map((_, j) => (
                      <label
                        key={j}
                        className={`flex flex-col items-center text-xs ${
                          isReadOnly ? "opacity-60" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`rating-${i}`}
                          value={j + 1}
                          checked={ratings[i] === j + 1}
                          onChange={() => handleRatingChange(i, j + 1)}
                          disabled={isReadOnly}
                          className={`w-[17px] h-[17px] m-2 accent-[var(--maroon)] ${
                            isReadOnly ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        />
                        {j + 1}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {/* Comments Section */}
            <tr>
              <td className="p-3 font-medium">
                Additional specific observations/comments
              </td>
              <td className="p-3 flex justify-center items-center">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={isReadOnly}
                  className={`w-[81%] border border-[var(--outline-grey)] bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--maroon)] ${
                    isReadOnly ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  rows={3}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total Points Section */}
      <div className="mt-4 p-3 font-semibold text-center w-full h-[111px] rounded-2xl bg-[var(--maroon)] text-[var(--white)] flex flex-col items-center justify-center gap-1 totalpoints">
        <span>Total Score: {totalScore} Points</span>
        <span>Minimum score to qualify for the award: 70 points</span>
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2 items-center font-normal mt-4 mb-4 px-3">
        <Button
          size="md"
          variant={isReadOnly ? "disabled" : "secondary"}
          onClick={handleReset}
          disabled={isReadOnly}
        >
          Reset Form
        </Button>
        <Button
          size="md"
          variant={isReadOnly ? "disabled" : "submit"}
          disabled={isReadOnly}
        >
          Submit Form
        </Button>
      </div>
    </div>
  );
}
