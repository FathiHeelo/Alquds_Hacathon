export const oldCityPlumbingLeakScenario = {
  id: "old_city_plumbing_leak",
  category: "plumbing",
  customerInput: "There is water leaking under the kitchen sink in the Old City.",
  expectedFlow: [
    "voice_input",
    "diagnosis",
    "fair_price",
    "technician_matching",
    "offers",
    "accepted_job",
    "chat",
    "tracking",
    "completion",
    "rating",
    "reward_points"
  ]
} as const;
