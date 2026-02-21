"use client";

import TagInput from "@/components/TagInput";

// Bubble pill colors for each filter dimension
const TYPE_COLORS: Record<string, { active: string; inactive: string }> = {
  task:     { active: "bg-purple-100 text-purple-800", inactive: "bg-gray-100 text-gray-400" },
  habit:    { active: "bg-green-100 text-green-800",   inactive: "bg-gray-100 text-gray-400" },
  reminder: { active: "bg-amber-100 text-amber-800",   inactive: "bg-gray-100 text-gray-400" },
  event:    { active: "bg-blue-100 text-blue-800",     inactive: "bg-gray-100 text-gray-400" },
};

const STATE_COLORS: Record<string, { active: string; inactive: string }> = {
  backlog:     { active: "bg-gray-200 text-gray-800",    inactive: "bg-gray-100 text-gray-400" },
  active:      { active: "bg-blue-100 text-blue-800",    inactive: "bg-gray-100 text-gray-400" },
  in_progress: { active: "bg-yellow-100 text-yellow-800",inactive: "bg-gray-100 text-gray-400" },
  completed:   { active: "bg-green-100 text-green-800",  inactive: "bg-gray-100 text-gray-400" },
};

const STATE_LABELS: Record<string, string> = {
  backlog: "Backlog",
  active: "Active",
  in_progress: "In Progress",
  completed: "Completed",
};

const TYPE_LABELS: Record<string, string> = {
  task: "Task",
  habit: "Habit",
  reminder: "Reminder",
  event: "Event",
};

const PRIORITY_OPTIONS = [
  { value: "high",   label: "High",   active: "bg-red-100 text-red-700",    inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",    active: "bg-orange-100 text-orange-700", inactive: "bg-gray-100 text-gray-400" },
  { value: "low",    label: "Low",    active: "bg-gray-200 text-gray-700",  inactive: "bg-gray-100 text-gray-400" },
];

const COMPLEXITY_OPTIONS = [
  { value: "easy",   label: "Easy",   active: "bg-green-100 text-green-700",  inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",    active: "bg-yellow-100 text-yellow-700",inactive: "bg-gray-100 text-gray-400" },
  { value: "hard",   label: "Hard",   active: "bg-red-100 text-red-600",      inactive: "bg-gray-100 text-gray-400" },
];

const ENERGY_OPTIONS = [
  { value: "high",   label: "High",   active: "bg-purple-100 text-purple-700",inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",    active: "bg-blue-100 text-blue-700",    inactive: "bg-gray-100 text-gray-400" },
  { value: "low",    label: "Low",    active: "bg-slate-100 text-slate-600",  inactive: "bg-gray-100 text-gray-400" },
];

/** Reusable bubble row: renders colored pill toggle buttons */
function BubbleRow<T extends { value: string; label: string; active: string; inactive: string }>({
  options,
  selected,
  onToggle,
}: {
  options: T[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onToggle(opt.value)}
          className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-colors ${
            selected.includes(opt.value) ? opt.active : opt.inactive
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export interface FilterPanelProps {
  /** Which item types are selected */
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  /** Which types to show (defaults to task/habit/reminder) */
  availableTypes?: string[];

  /** Optional — omit to hide the State row (e.g. calendar page) */
  selectedStates?: string[];
  onToggleState?: (state: string) => void;

  selectedPriorities: string[];
  onTogglePriority: (p: string) => void;

  selectedComplexities: string[];
  onToggleComplexity: (c: string) => void;

  selectedEnergies: string[];
  onToggleEnergy: (e: string) => void;

  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
}

/** Shared filter panel used by All page and Calendar page. All state is controlled externally. */
export default function FilterPanel({
  selectedTypes,
  onToggleType,
  availableTypes = ["task", "habit", "reminder"],
  selectedStates,
  onToggleState,
  selectedPriorities,
  onTogglePriority,
  selectedComplexities,
  onToggleComplexity,
  selectedEnergies,
  onToggleEnergy,
  selectedTags,
  onTagsChange,
  availableTags,
}: FilterPanelProps) {
  const typeOptions = availableTypes.map((t) => ({
    value: t,
    label: TYPE_LABELS[t] ?? t,
    active: TYPE_COLORS[t]?.active ?? "bg-gray-200 text-gray-800",
    inactive: TYPE_COLORS[t]?.inactive ?? "bg-gray-100 text-gray-400",
  }));

  const stateOptions = Object.entries(STATE_LABELS).map(([value, label]) => ({
    value,
    label,
    active: STATE_COLORS[value]?.active ?? "bg-gray-200 text-gray-800",
    inactive: STATE_COLORS[value]?.inactive ?? "bg-gray-100 text-gray-400",
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t mt-3">
      {/* Row 1: Type | State */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
        <BubbleRow options={typeOptions} selected={selectedTypes} onToggle={onToggleType} />
      </div>

      {selectedStates !== undefined && onToggleState ? (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">State</label>
          <BubbleRow options={stateOptions} selected={selectedStates} onToggle={onToggleState} />
        </div>
      ) : (
        // Spacer to maintain grid alignment when State row is hidden
        <div />
      )}

      {/* Row 2: Priority | Complexity */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Priority</label>
        <BubbleRow options={PRIORITY_OPTIONS} selected={selectedPriorities} onToggle={onTogglePriority} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Complexity</label>
        <BubbleRow options={COMPLEXITY_OPTIONS} selected={selectedComplexities} onToggle={onToggleComplexity} />
      </div>

      {/* Row 3: Energy | Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Energy</label>
        <BubbleRow options={ENERGY_OPTIONS} selected={selectedEnergies} onToggle={onToggleEnergy} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tags</label>
        <TagInput
          tags={selectedTags}
          availableTags={availableTags}
          onTagsChange={onTagsChange}
          placeholder={availableTags.length === 0 ? "No tags yet" : "Filter by tag..."}
          disabled={availableTags.length === 0}
        />
      </div>
    </div>
  );
}
