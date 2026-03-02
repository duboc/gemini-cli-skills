# User Stories and Requirements

## Writing User Stories
Write user stories in standard format: **"As a [user type], I want [capability] so that [benefit]"**

### Guidelines
- **User Type:** Be specific ("enterprise admin", not just "user").
- **Capability:** Describe what they want to accomplish, not how (e.g., avoid prescribing specific UI widgets).
- **Benefit:** Explain the "why" — what value does this deliver?
- **Completeness:** Include edge cases, error states, and empty states. Include different user types if the feature serves multiple personas.

### Good Examples
- "As a team admin, I want to configure SSO for my organization so that my team members can log in with their corporate credentials."
- "As a team member, I want to be automatically redirected to my company's SSO login so that I do not need to remember a separate password."

### Common Mistakes
- **Too vague:** "As a user, I want the product to be faster." (What specifically?)
- **Solution-prescriptive:** "As a user, I want a dropdown menu." (Describe the need, not the widget).
- **No benefit:** "As a user, I want to click a button." (Why?)
- **Internal focus:** "As the engineering team, we want to refactor the database." (This is a technical task, not a user story).

---

## Acceptance Criteria
Cover the happy path, error cases, and edge cases. Be specific about behavior, not implementation. Include what should NOT happen.

### Given/When/Then Format
- **Given** [precondition or context]
- **When** [action the user takes]
- **Then** [expected outcome]

*Example:* Given the admin has configured SSO, When a team member visits the login page, Then they are automatically redirected to the organization's SSO provider.

### Checklist Format
- [ ] Admin can enter SSO provider URL in organization settings
- [ ] Team members see "Log in with SSO" button on login page
- [ ] Failed SSO attempts show a clear error message

---

## Requirements Categorization (MoSCoW)

- **Must-Have (P0):** The feature cannot ship without these. Minimum viable version. Ask: "If we cut this, does the feature still solve the core problem?" If no, it is P0. Be ruthless.
- **Should-Have / Nice-to-Have (P1):** Significantly improves the experience, but the core works without them. High-priority fast follows.
- **Could-Have:** Desirable if time permits.
- **Won't-Have / Future Considerations (P2):** Explicitly out of scope for v1. Documenting these prevents accidental architectural decisions that make them hard later.