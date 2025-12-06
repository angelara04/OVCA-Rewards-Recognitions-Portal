"use client";
import React from "react";

// Updated Props Interface: REMOVED IPCR
interface PerformanceEvaluationFormProps {
  reviewContext?: any | null;
  scores: Record<string, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;
  isLocked: boolean;
}

export default function PerformanceEvaluationForm_NonSupervisory({
  reviewContext,
  scores,
  setScores,
  comments,
  setComments,
  isLocked,
}: PerformanceEvaluationFormProps) {
  
  const indicators = [
    "Adopts new strategies in accomplishing work by completing tasks ahead of schedule (with certification from immediate supervisor)",
    "Ability to deliver quality outputs on time (with certification from immediate supervisor)",
    "Ability to work effectively with others as a team (with certification from immediate supervisor)",
  ];

  const handleRatingChange = (index: number, value: number) => {
    setScores((prev) => ({
      ...prev,
      [`rating_${index}`]: value,
    }));
  };

  const ratingsTotal = indicators.reduce((sum, _, i) => {
    return sum + (scores[`rating_${i}`] || 0);
  }, 0);

  return (
    <div>
      <div className="max-w-5xl mx-auto rounded-t-2xl overflow-hidden outline-1 outline-[var(--outline-grey)]">
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
            {/* INDICATORS SECTION */}
            <tr className="bg-[var(--grey)]">
              <td colSpan={2} className="font-semibold p-3">
                Behavioral Indicators
              </td>
            </tr>
            {indicators.map((indicator, i) => (
              <tr key={i} className="border-b border-[var(--outline-grey)]">
                <td className="p-4 align-top ">{indicator}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {[...Array(10)].map((_, j) => {
                      const val = j + 1;
                      const currentRating = scores[`rating_${i}`];
                      return (
                        <label
                          key={j}
                          className={`flex flex-col items-center text-xs ${
                            isLocked ? "opacity-60" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rating-${i}`}
                            value={val}
                            checked={currentRating === val}
                            onChange={() => handleRatingChange(i, val)}
                            disabled={isLocked}
                            className={`w-[17px] h-[17px] m-2 accent-[var(--maroon)] ${
                              isLocked ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                          />
                          {val}
                        </label>
                      );
                    })}
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
                  disabled={isLocked}
                  className={`w-[95%] border border-[var(--outline-grey)] bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--maroon)] ${
                    isLocked ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  rows={3}
                  placeholder="Enter remarks..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 font-semibold text-center w-full h-[111px] rounded-2xl bg-[var(--maroon)] text-[var(--white)] flex flex-col items-center justify-center gap-1 totalpoints">
        <span>Total Score: {ratingsTotal} Points</span>
        <span>Minimum score to qualify for the award: 70 points</span>
      </div>
    </div>
  );
}