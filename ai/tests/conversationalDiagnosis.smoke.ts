import { diagnoseProblem } from "../src/engines/diagnosis/diagnosisEngine";
import { estimateFairPrice, evaluateOffer } from "../src/engines/fair-price/priceEngine";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const initial = diagnoseProblem({ category: "plumbing", description: "There is water leaking under my kitchen sink." });
assert(initial.followUpQuestions.length === 2, "Sink diagnosis should ask two useful questions");
assert(initial.refined === false, "Initial diagnosis should not claim to be refined");

const drain = diagnoseProblem({
  category: "plumbing",
  description: "There is water leaking under my kitchen sink.",
  answers: [
    { questionId: "leak_when_off", value: "no" },
    { questionId: "leak_source", value: "drain" }
  ]
});
assert(drain.issueTitle === "Drain connection leak", "Drain answer must refine the likely issue");
assert(drain.urgency === "medium", "Drain-only leak should have medium urgency");
assert(drain.estimatedDuration === "30–60 minutes", "Drain answer must refine duration");
assert(drain.followUpQuestions.length === 0 && drain.refined, "Answered diagnosis should be final");
assert(drain.routing.type === "NORMAL_TECHNICIAN", "Drain leak should use normal technician routing");

const supply = diagnoseProblem({
  category: "plumbing",
  description: "Water is leaking below the sink.",
  answers: [
    { questionId: "leak_when_off", value: "yes" },
    { questionId: "leak_source", value: "supply" }
  ]
});
assert(supply.issueTitle === "Water supply connection leak", "Supply answers must alter the diagnosis");
assert(supply.urgency === "high" && supply.routing.type === "URGENT_TECHNICIAN", "Pressurized supply leak should use urgent technician routing");

const emergency = diagnoseProblem({ category: "electrical", description: "There is fire and smoke from the breaker." });
assert(emergency.routing.type === "EMERGENCY_SERVICE", "Fire must route to emergency services");
assert(emergency.followUpQuestions.length === 0, "Fire must not delay emergency guidance with questions");

const publicService = diagnoseProblem({ category: "plumbing", description: "The public water main in the street has burst." });
assert(publicService.routing.type === "PUBLIC_SERVICE", "Public infrastructure must not create a technician-first route");

const social = diagnoseProblem({ category: "general", description: "A family needs emergency shelter and social support." });
assert(social.routing.type === "SOCIAL_ASSISTANCE", "Social assistance language must route to the appropriate category");

const fairPrice = estimateFairPrice({ category: drain.category, urgency: drain.urgency, ...drain.fairPriceContext });
assert(fairPrice.min < fairPrice.max, "Refined diagnosis should produce a fair range");
assert(evaluateOffer(fairPrice.min - 30, fairPrice).status === "low", "Low service price should be good value");
assert(evaluateOffer((fairPrice.min + fairPrice.max) / 2, fairPrice).status === "fair", "Mid-range service price should be fair");
assert(evaluateOffer(fairPrice.max + 5, fairPrice).status === "slightly_high", "Near-above service price should be slightly high");
assert(evaluateOffer(fairPrice.max + 100, fairPrice).status === "high", "High service price should be above expected");

console.log("Conversational diagnosis, fair price, and assistance routing smoke test passed.");
