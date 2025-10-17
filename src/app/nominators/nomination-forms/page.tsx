'use client';

import React, { useState, useEffect } from "react";
import Section from "@/components/section";
import Button from "@/components/button";
import Input from "@/components/input";
import Dropdown from "@/components/dropdown";

export default function Page() {
  const [nomineeName, setNomineeName] = useState("");
  const [position, setPosition] = useState("");
  const [unit, setUnit] = useState("");
  const [length, setLength] = useState("");
  const [description, setDescription] = useState("");
  const [descWords, setDescWords] = useState(0);
  const [consentName, setConsentName] = useState("");
  const [nominatedBy, setNominatedBy] = useState("");
  const [fileName, setFileName] = useState("No file chosen");

  useEffect(() => {
    const words = description.trim() === "" ? 0 : description.trim().split(/\s+/).length;
    setDescWords(words);
  }, [description]);

  const categoryOptions = [
    { label: "Select Category", href: "#" },
    { label: "Category A", href: "#" },
    { label: "Category B", href: "#" },
  ];

  return (
    <Section width="w-full" height="min-h-screen" alignment="items-start p-10">
      <div className="w-full mx-auto">
          <div className="flex justify-between items-center mb-10 my-2">
            <h1 className="text-3xl font-bold">Nomination Form</h1>
            <Button size="sm" variant="secondary">
              <div className="px-4 py-1">Back to Dashboard</div>
            </Button>
          </div>

        <Section width="w-full" height="auto" alignment="items-start p-10">
          <form className="space-y-6">
            <div>
              <label className="block text-[15px] font-medium mb-2">Category</label>
              <Dropdown displayText="Select Category" options={categoryOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="nomineeName"
                label="Name of Nominee"
                placeholder="Full Name"
                value={nomineeName}
                onChange={setNomineeName}
                width="w-full"
              />
              <Input
                id="position"
                label="Position / Designation"
                placeholder="e.g. Admin Officer II"
                value={position}
                onChange={setPosition}
                width="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="unit"
                label="Unit / Office / College"
                placeholder="e.g. Office of the Dean"
                value={unit}
                onChange={setUnit}
                width="w-full"
              />
              <Input
                id="length"
                label="Length of Service with UP"
                placeholder="e.g. 10 years"
                value={length}
                onChange={setLength}
                width="w-full"
              />
            </div>

            <div>
              <label className="block text-[15px] font-medium mt-7 mb-2">Brief description of the outstanding achievements of the Nominee (max 250 words)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full border border-[var(--outline-grey)] rounded p-2 resize-none"
              />
              <div className="text-right text-xs text-gray-500">{descWords}/250 words</div>
            </div>

            <div>
              <label className="block text-[15px] font-medium mb-2">Attachments (PDF, DOCX, ZIP)</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center px-1.5 py-0.5 bg-[#EFEFEF] border border-[var(--outline-grey)] cursor-pointer text-[15px]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setFileName(
                          e.target.files && e.target.files.length ? e.target.files[0].name : "No file chosen"
                        )
                      }
                    />
                    Choose Files
                  </label>
                  <span className="text-sm text-[var(--dark-grey)]">{fileName}</span>
                  <p className="text-sm ml-auto">
                  You may attach Nomination Letter, CV, and Supporting Certificates
                </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-[var(--maroon)] rounded-lg p-6 pb-10 bg-[#F1F1F1]">
              <div className="text-[15px] font-medium mb-2">Nominee Consent</div>
              <p className="text-[15px] text-gray-700 mb-3">
                I give my consent for my name to be included in the list of qualified nominees and I am giving my consent for the HRDO to release to the nominating party the necessary documents needed for the nomination.
              </p>
              <Input
                id="consentName"
                label=""
                placeholder="Printed Name with Signature of the Nominee"
                value={consentName}
                onChange={setConsentName}
                width="w-full"
              />
            </div>

            <Input
              id="nominatedBy"
              label="Nominated By"
              placeholder="Your name"
              value={nominatedBy}
              onChange={setNominatedBy}
              width="w-full"
            />

            <div className="flex justify-end gap-3 mt-14 mb-2">
              <Button size="sm" variant="secondary">
                <div className="px-4 py-2">Cancel</div>
              </Button>
              <Button size="sm" variant="secondary">
                <div className="px-4 py-2">Save Draft</div>
              </Button>
              <Button size="sm" variant="primary">
                <div className="px-4 py-2">Submit Nomination</div>
              </Button>
            </div>
          </form>
        </Section>
        </div>
    </Section>
  );
}
