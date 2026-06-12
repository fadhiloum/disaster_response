"use client";

import { useMemo, useState } from "react";
import { CommandLink, SecondaryLink } from "@/app/components/ui";
import { formatCurrency } from "@/app/lib/data";

const disasterTypes = [
  "flood",
  "earthquake",
  "landslide",
  "fire",
  "storm",
  "conflict",
  "other",
];

const currencies = ["MYR", "USD", "EUR", "GBP"];

const initialSubPrograms = [
  { id: "wash", name: "WASH", allocation: 0 },
  { id: "temporary-shelter", name: "Temporary Shelter", allocation: 0 },
  { id: "food-packs", name: "Food Packs", allocation: 0 },
  { id: "dignity-packs", name: "Dignity Packs", allocation: 0 },
];

type SubProgramInput = {
  id: string;
  name: string;
  allocation: number;
};

export function ProgramCreationForm() {
  const [currency, setCurrency] = useState("MYR");
  const [masterBudget, setMasterBudget] = useState(0);
  const [fundRequest, setFundRequest] = useState(0);
  const [fundRequestSubProgram, setFundRequestSubProgram] = useState("WASH");
  const [subPrograms, setSubPrograms] =
    useState<SubProgramInput[]>(initialSubPrograms);

  const allocatedBudget = useMemo(
    () =>
      subPrograms.reduce(
        (total, subProgram) => total + Number(subProgram.allocation || 0),
        0,
      ),
    [subPrograms],
  );
  const remainingAfterRequests = Math.max(masterBudget - fundRequest, 0);
  const allocationOverBudget = masterBudget > 0 && allocatedBudget > masterBudget;
  const requestOverBudget = masterBudget > 0 && fundRequest > masterBudget;
  const hasBudgetIssue = allocationOverBudget || requestOverBudget;

  function updateSubProgram(
    id: string,
    field: keyof Omit<SubProgramInput, "id">,
    value: string,
  ) {
    setSubPrograms((current) =>
      current.map((subProgram) =>
        subProgram.id === id
          ? {
              ...subProgram,
              [field]: field === "allocation" ? Number(value) : value,
            }
          : subProgram,
      ),
    );
  }

  return (
    <form className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      <Field label="Program title">
        <input
          className="input"
          name="title"
          placeholder="Riverside Flood Response"
          type="text"
        />
      </Field>

      <Field label="Disaster type">
        <select className="input" name="disasterType">
          {disasterTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </Field>

      <Field label="Location">
        <input
          className="input"
          name="location"
          placeholder="District, city, or operational area"
          type="text"
        />
      </Field>

      <Field label="Region">
        <input
          className="input"
          name="region"
          placeholder="Asia Pacific"
          type="text"
        />
      </Field>

      <Field label="Country">
        <input
          className="input"
          name="country"
          placeholder="Malaysia"
          type="text"
        />
      </Field>

      <Field label="State">
        <input className="input" name="state" placeholder="Sabah" type="text" />
      </Field>

      <Field label="Start date and time">
        <input className="input" name="startTime" type="datetime-local" />
      </Field>

      <Field label="Severity">
        <select className="input" name="severity">
          <option>low</option>
          <option>moderate</option>
          <option>high</option>
          <option>critical</option>
        </select>
      </Field>

      <Field label="Status">
        <select className="input" name="status">
          <option>monitoring</option>
          <option>active</option>
          <option>stabilizing</option>
          <option>closed</option>
        </select>
      </Field>

      <Field label="Program lead">
        <input className="input" name="lead" placeholder="Maya Chen" type="text" />
      </Field>

      <Field label="Latitude">
        <input className="input" name="latitude" placeholder="13.755" type="number" />
      </Field>

      <Field label="Longitude">
        <input className="input" name="longitude" placeholder="100.514" type="number" />
      </Field>

      <div className="lg:col-span-2">
        <Field label="Description">
          <textarea
            className="input min-h-32 resize-y"
            name="description"
            placeholder="Situation overview, known impact, immediate risks, and access constraints."
          />
        </Field>
      </div>

      <fieldset className="grid gap-5 border-t border-zinc-200 pt-6 lg:col-span-2 lg:grid-cols-2">
        <legend className="text-lg font-semibold text-zinc-950">
          Master Budget
        </legend>

        <Field label="Budget currency">
          <select
            className="input"
            name="budgetCurrency"
            onChange={(event) => setCurrency(event.target.value)}
            value={currency}
          >
            {currencies.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Master budget amount">
          <input
            className="input"
            min={0}
            name="masterBudgetAmount"
            onChange={(event) => setMasterBudget(Number(event.target.value))}
            placeholder="750000"
            type="number"
            value={masterBudget || ""}
          />
        </Field>

        <Field label="Budget holder">
          <input
            className="input"
            name="budgetHolder"
            placeholder="Program Finance Lead"
            type="text"
          />
        </Field>

        <Field label="Funding source">
          <input
            className="input"
            name="fundingSource"
            placeholder="Emergency response appeal"
            type="text"
          />
        </Field>

        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-zinc-700">
            Sub-program allocations
          </p>
          <div className="mt-3 grid gap-3">
            {subPrograms.map((subProgram) => (
              <div
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]"
                key={subProgram.id}
              >
                <input
                  className="input"
                  name={`subProgramName-${subProgram.id}`}
                  onChange={(event) =>
                    updateSubProgram(subProgram.id, "name", event.target.value)
                  }
                  type="text"
                  value={subProgram.name}
                />
                <input
                  className="input"
                  min={0}
                  name={`subProgramAllocation-${subProgram.id}`}
                  onChange={(event) =>
                    updateSubProgram(
                      subProgram.id,
                      "allocation",
                      event.target.value,
                    )
                  }
                  placeholder="0"
                  type="number"
                  value={subProgram.allocation || ""}
                />
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-5 border-t border-zinc-200 pt-6 lg:col-span-2 lg:grid-cols-2">
        <legend className="text-lg font-semibold text-zinc-950">
          Initial Fund Request
        </legend>

        <Field label="Sub-program">
          <select
            className="input"
            name="fundRequestSubProgram"
            onChange={(event) => setFundRequestSubProgram(event.target.value)}
            value={fundRequestSubProgram}
          >
            {subPrograms.map((subProgram) => (
              <option key={subProgram.id}>{subProgram.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Deployment team">
          <input
            className="input"
            name="fundRequestTeam"
            placeholder="Field Team North"
            type="text"
          />
        </Field>

        <Field label="Requested amount">
          <input
            className="input"
            max={masterBudget || undefined}
            min={0}
            name="fundRequestAmount"
            onChange={(event) => setFundRequest(Number(event.target.value))}
            placeholder="120000"
            type="number"
            value={fundRequest || ""}
          />
        </Field>

        <Field label="Purpose">
          <input
            className="input"
            name="fundRequestPurpose"
            placeholder="WASH supplies and shelter support"
            type="text"
          />
        </Field>

        <div className="grid gap-3 rounded-md bg-zinc-50 p-4 text-sm lg:col-span-2 md:grid-cols-3">
          <BudgetStat
            label="Master budget"
            value={formatCurrency(masterBudget, currency)}
          />
          <BudgetStat
            label="Allocated"
            value={formatCurrency(allocatedBudget, currency)}
          />
          <BudgetStat
            label="Remaining after request"
            value={formatCurrency(remainingAfterRequests, currency)}
          />
        </div>

        {allocationOverBudget ? (
          <p className="text-sm font-semibold text-red-700 lg:col-span-2">
            Sub-program allocations exceed the master budget.
          </p>
        ) : null}

        {requestOverBudget ? (
          <p className="text-sm font-semibold text-red-700 lg:col-span-2">
            Fund request must be within the master budget.
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap gap-3 lg:col-span-2">
        {hasBudgetIssue ? (
          <button
            className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-md bg-zinc-300 px-4 text-sm font-semibold text-zinc-600"
            disabled
            type="button"
          >
            Save draft
          </button>
        ) : (
          <CommandLink href="/incidents/flood-riverside">Save draft</CommandLink>
        )}
        <SecondaryLink href="/incidents">Cancel</SecondaryLink>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function BudgetStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
