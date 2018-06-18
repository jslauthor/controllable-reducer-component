- Start Date: (fill me in with today's date, YYYY-MM-DD)
- RFC PR: (to be filled with the RFC PR once opened)
- Implementation PR: (to be filled with the RFC implementation PR once opened)

# Summary

The goal is to produce sane controllable components and to avoid all the pitfalls of [reconciling props with internal state](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

I propose a `StateProvider` component that uses a reducer to house State, implement Logic, and enable Behavior, while also defining a set of "controllable" keys that a parent may supply. 

# Motivation

Developer Experience for the _consumption_ of the common, reusable components is the highest priority. Only "smart" components will require `StateProvider`. 

# Basic example

If the proposal involves a new or changed API, include a basic code example.
Omit this section if it's not applicable.

# Guide-level explanation

Explain the proposal as if it was already included in the codebase and you were
teaching it to another Webflow programmer. That generally means:

- Introducing new named concepts.
- Explaining the feature largely in terms of examples.
- Explaining how Webflow programmers should *think* about the feature, and how
  it should impact the way they develop the product. It should explain the impact
  as concretely as possible.
- If applicable, provide sample error messages, deprecation warnings, or
  migration guidance.

# Reference-level explanation

This is the technical portion of the RFC. Explain the design in sufficient detail that:

- Its interaction with other features is clear.
- It is reasonably clear how the feature would be implemented.
- Corner cases are dissected by example.

The section should return to the examples given in the previous section, and
explain more fully how the detailed proposal makes those examples work.

# Drawbacks

Why should we *not* do this? Please consider:

- implementation cost, both in term of code size and complexity
- whether the proposed feature can be implemented in user space
- the impact on onboarding new team members into the codebase
- integration of this feature with other existing and planned features
- cost of migrating existing Webflow sites (if applicable)

There are tradeoffs to choosing any path. Attempt to identify them here.

# Alternatives

What other designs have been considered? What is the impact of not doing this?

# Prior Art

Is there prior art in relation to this proposal? Discuss both the good and the
bad. A few examples of what this can include are:

* Is this done by some other community and what were their experiences with it?
* What lessons can we learn from what other communities have done here?
* Are there any published papers or great posts that discuss this? If you have
  some relevant papers to refer to, this can serve as a more detailed
  theoretical background.

This section is intended to encourage us to think about the lessons from other
languages and communities.

# Adoption strategy

If we implement this proposal, how will existing Webflow developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with
other projects or libraries? Should we migrate all impacting callsites at once?

# Unresolved questions

Optional, but suggested for first drafts. What parts of the design are still
TBD?
