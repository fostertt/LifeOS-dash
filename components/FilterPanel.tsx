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
  backlog:     { active: "bg-gray-200 text-gray-800",     inactive: "bg-gray-100 text-gray-400" },
  active:      { active: "bg-blue-100 text-blue-800",     inactive: "bg-gray-100 text-gray-400" },
  in_progress: { active: "bg-yellow-100 text-yellow-800", inactive: "bg-gray-100 text-gray-400" },
  completed:   { active: "bg-green-100 text-green-800",   inactive: "bg-gray-100 text-gray-400" },
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
  { value: "high",   label: "High", active: "bg-red-100 text-red-700",        inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",  active: "bg-orange-100 text-orange-700",  inactive: "bg-gray-100 text-gray-400" },
  { value: "low",    label: "Low",  active: "bg-gray-200 text-gray-700",      inactive: "bg-gray-100 text-gray-400" },
];

const COMPLEXITY_OPTIONS = [
  { value: "easy",   label: "Easy", active: "bg-green-100 text-green-700",    inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",  active: "bg-yellow-100 text-yellow-700",  inactive: "bg-gray-100 text-gray-400" },
  { value: "hard",   label: "Hard", active: "bg-red-100 text-red-600",        inactive: "bg-gray-100 text-gray-400" },
];

const ENERGY_OPTIONS = [
  { value: "high",   label: "High", active: "bg-purple-100 text-purple-700",  inactive: "bg-gray-100 text-gray-400" },
  { value: "medium", label: "Med",  active: "bg-blue-100 text-blue-700",      inactive: "bg-gray-100 text-gray-400" },
  { value: "low",    label: "Low",  active: "bg-slate-100 text-slate-600",    inactive: "bg-gray-100 text-gray-400" },
];

/**
 * Renders a row of colored pill toggle buttons with an "All" pill at the start.
 * "All" is active when selected is empty. Clicking a specific value adds it to
 * the selection (deactivating "All"). Clicking "All" clears back to empty.
 */
function BubbleRow<T extends { value: string; label: string; active: string; inactive: string }>({
  options,
  selected,
  onToggle,
  onClearAll,
}: {
  options: T[];
  selected: string[];
  onToggle: (value: string) => void;
  onClearAll: () => void;
}) {
  const allActive = selected.length === 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* "All" pill — active when nothing specific is selected */}
      <button
        onClick={onClearAll}
        className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-colors ${
          allActive ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-400"
        }`}
      >
        All
      </button>
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
  /** Which item types are selected (empty = All) */
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  onClearTypes: () => void;
  /** Which types to show (defaults to task/habit/reminder) */
  availableTypes?: string[];

  /** Optional — omit to hide the State row (e.g. calendar page) */
  selectedStates?: string[];
  onToggleState?: (state: string) => void;
  onClearStates?: () => void;

  /** Empty = All */
  selectedPriorities: string[];
  onTogglePriority: (p: string) => void;
  onClearPriorities: () => void;

  selectedComplexities: string[];
  onToggleComplexity: (c: string) => void;
  onClearComplexities: () => void;

  selectedEnergies: string[];
  onToggleEnergy: (e: string) => void;
  onClearEnergies: () => void;

  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
}

/** Shared filter panel used by All page and Calendar page. All state is controlled externally. */
export default function FilterPanel({
  selectedTypes,
  onToggleType,
  onClearTypes,
  availableTypes = ["task", "habit", "reminder"],
  selectedStates,
  onToggleState,
  onClearStates,
  selectedPriorities,
  onTogglePriority,
  onClearPriorities,
  selectedComplexities,
  onToggleComplexity,
  onClearComplexities,
  selectedEnergies,
  onToggleEnergy,
  onClearEnergies,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t mt-2">
      {/* Row 1: Type | State */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
        <BubbleRow options={typeOptions} selected={selectedTypes} onToggle={onToggleType} onClearAll={onClearTypes} />
      </div>

      {selectedStates !== undefined && onToggleState && onClearStates ? (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">State</label>
          <BubbleRow options={stateOptions} selected={selectedStates} onToggle={onToggleState} onClearAll={onClearStates} />
        </div>
      ) : (
        <div />
      )}

      {/* Row 2: Priority | Complexity */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Priority</label>
        <BubbleRow options={PRIORITY_OPTIONS} selected={selectedPriorities} onToggle={onTogglePriority} onClearAll={onClearPriorities} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Complexity</label>
        <BubbleRow options={COMPLEXITY_OPTIONS} selected={selectedComplexities} onToggle={onToggleComplexity} onClearAll={onClearComplexities} />
      </div>

      {/* Row 3: Energy | Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Energy</label>
        <BubbleRow options={ENERGY_OPTIONS} selected={selectedEnergies} onToggle={onToggleEnergy} onClearAll={onClearEnergies} />
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
