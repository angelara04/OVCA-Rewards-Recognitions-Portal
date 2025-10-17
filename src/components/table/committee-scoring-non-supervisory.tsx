"use client";
import React, { useState } from "react";
import Button from "../button";

export default function PerformanceEvaluationForm_NonSupervisory() {
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
                        className="flex flex-col items-center text-xs"
                      >
                        <input
                          type="radio"
                          name={`rating-${i}`}
                          value={j + 1}
                          checked={ratings[i] === j + 1}
                          onChange={() => handleRatingChange(i, j + 1)}
                          className="w-[17px] h-[17px] m-2 accent-[var(--maroon)] cursor-pointer"
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
                  className="w-[81%] border border-[var(--outline-grey)] bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--maroon)]"
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
        <Button size="md" variant="secondary" onClick={handleReset}>
          Reset Form
        </Button>
        <Button size="md" variant="submit">
          Submit Form
        </Button>
      </div>
    </div>
  );
}
