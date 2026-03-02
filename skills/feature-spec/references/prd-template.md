# PRD Structure Template

A well-structured PRD follows this template. Use this to ensure all aspects of a feature are covered before implementation begins.

## 1. Problem Statement
- Describe the user problem in 2-3 sentences.
- Who experiences this problem and how often?
- What is the cost of not solving it (user pain, business impact, competitive risk)?
- Ground this in evidence: user research, support data, metrics, or customer feedback.

## 2. Goals
- 3-5 specific, measurable outcomes this feature should achieve.
- Each goal should answer: "How will we know this succeeded?"
- Distinguish between user goals (what users get) and business goals (what the company gets).
- **Rule:** Goals should be outcomes, not outputs ("reduce time to first value by 50%" not "build onboarding wizard").

## 3. Non-Goals
- 3-5 things this feature explicitly will NOT do.
- Adjacent capabilities that are out of scope for this version.
- For each non-goal, briefly explain why it is out of scope (not enough impact, too complex, separate initiative, premature).
- **Rule:** Non-goals prevent scope creep during implementation and set expectations with stakeholders.

## 4. User Stories
- Refer to `user-stories-and-requirements.md` for formatting and breakdown.
- Order by priority — most important stories first.

## 5. Requirements
- Categorize by Must-Have (P0), Nice-to-Have (P1), and Future Considerations (P2).
- Write a clear, unambiguous description of the expected behavior.
- Include acceptance criteria.
- Note any technical considerations, constraints, or dependencies on other teams/systems.

## 6. Success Metrics
- Refer to `metrics-and-scope.md` for defining leading/lagging indicators.

## 7. Open Questions
- Questions that need answers before or during implementation.
- Tag each with who should answer (engineering, design, legal, data, stakeholder).
- Distinguish between blocking questions (must answer before starting) and non-blocking (can resolve during implementation).

## 8. Timeline Considerations
- Hard deadlines (contractual commitments, events, compliance dates).
- Dependencies on other teams' work or releases.
- Suggested phasing if the feature is too large for one release.