* Start Date: 2018-04-09
* RFC PR: (to be filled with the RFC PR once opened)
* Implementation PR: (to be filled with the RFC implementation PR once opened)

# Summary

Please visit this github repo for demos, code samples, and docco docs.

# Motivation

This is the first of many RFCs that will define our UI Standards. I've begun
with state management as it it the trickiest to get right and the most hotly
contested. You will find here a proposal for `ControlledReducerProvider`, which
refines and improves what `syncPropsToState` initially set out to do. Before we
dive into `ControlledReducerProvider`'s specifics, I propose we first align on
the following:

1. Agree that internal state is sometimes necessary for many types of
   components. The rule should be: "Is this piece of state persisted? If not,
   feel free to use internal state as long as it can be elevated\* when needed."
1. _Leverage_ our existing state management reducer pattern at the component _as
   well as_ global level (flux).
1. Align on the API for a reducer based render-prop component that reconciles
   internal state with external props.

\*By "elevated," I mean a parent should be able to take "control" of the prop
and persist it if desired.

### The problem

What does it mean to "reconcile internal state with external props?" Let us take
a look at React's `<input />`
[for inspiration](https://reactjs.org/docs/forms.html) (I like how `input`
approaches reconciliation. `ControlledReducerProvider` expands on it). `input`
is a native control that maintains internal state, such as the caret position
and input text. React wraps it with a reconciliation container and makes only
the [useful portion of that state](L140) available to the outside world via
callbacks and props (in this case `value` and `onChange`).

If a parent component
[wants to take "control"](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMFiberInput.js#L42-L57)
of the input, it must supply a `value` prop _and_ listen for `onChange` events.
This enables the parent to grab the new `value` and resupply it back to the
`input`, thus "controlling" it. Beneath the hood, `input` checks if `value`
[is "controlled"](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMFiberInput.js#L37-L40),
or available in the props, and uses that `value` in lieu of the node's internal
`value`.

### Reusable Components vs Composable Components

Whew! The aforementioned section explained some tricky state/prop business, but
that business is all together necessary for resuable components like `input`.
What's a "reusable component"? I like to classify our components into two major
categories:

1. Reusable Components, or the "atoms" and "molecules" that compose into larger
   components. These tend to be "smart" components, and require APIs that
   reconcile props with state.
2. Composed Components, or the "organisms" which are comprised of reusable
   components. These tend to be "dumb" components, and require a much smaller
   subset of APIs than Reusable components.

This isn't to say all Resuable Components will require
`ControlledReducerProvider`, or that our Composed Components won't leverage it,
but it is much likelier that Reusasble components will.

### Some History

My first attempt at reconciling props with state began with `syncPropsToState`.
While it did the job well enough, it suffered from a lack of structure for
handling logic which made refactoring efforts difficult. When I first proposed
`syncPropsToState`, @lou suggested the use of a reducer to manage logic. It was
a great idea, but I'd had no time to explore it. `syncPropsToState` is also an
Higher Order Component, and time has proven HOCs difficult to debug, so, armed
with all that criteria, I created `ControlledReduderProvider` which

1. Requires a specified set of keys that can be "controlled" (merged into
   internal state) and naming convention for default value and change handlers
2. Uses a reducer to manage its logic
3. Uses render props instead of an HOC
4. Does not use deprecated React lifecycle methods (instead relies on
   `getDerivedStateFromProps`)

### Use Cases

Leverage `ControlledReducerProvider` whenever a component requires internal
state that may be of interest to its ecosystem. These types of coponents are
considered "smart" and are hard to express as simple functional components.

Bear in mind that controllable props should be concerned with logic more than
with visual states. Be wary of exposing controllable boolean flags that toggle
visual states -- in that situation, a state machine might be a more appropriate
abstraction.

### Interface vs Implementation

`ControlledReducerProvider` is an opinionated implementation detail designed to reduce coginitive overhead when one needs to build and maintain a controllable component. At the interface level, it does not matter how this is implemented as long as the component allows the consumer to take control of a set number of properties. This is traditionally difficult, however, and can cause refactoring nightmares if too many implementations arise. 

The opinions here leverage existing patterns in our codebase, namely `dispatch` and `reducer`. The goal of the UI Standards are to address _both_ the interface (controllable props) and the implementation (`ControllableReducerProvider`), and give our developers the tools they need as they stumble across the challenging domains of component development.

### Why multiple controlled props instead of a single state value

If reconciling props with state is so difficult, why not encapsulate all of the
component's state into a single prop to limit the number of `isControlled`
checks in the reducer? We must keep in mind who benefits from this line of
thinking. Is it the author? Or, the developer who must use the component?

First, let's take a look at a couple starstudded examples:

* React `<input>` (2 controllable props)
* Downshift (4 [controllable props](https://github.com/paypal/downshift#control-props) and an overridable reducer)

Neither have a single prop as they optimize the DX for the consumer and not the
author. I suggest we optimize the same pathway.

A single value controlled component is more difficult to manage than a
controlled component with multiple values. If a developer takes control of a
single value that happens to be a complicated piece of state, then they must
reimplement all the logic to control it. So, the primary reason is the DX is
better when multiple values are available.

It _is_ worth noting that if a component can get away with a single controllable
value, it will be much easier to maintain and refactor, so we should strive to
keep our APIs simple.

# Basic examples

Several examples and documentation can be found [here]() that demonstrate
`ControlledReducerProvider`. Included in the examples is a bi-directional
Temperature Converter and is from
[7 GUIs](http://eugenkiss.github.io/7guis/tasks/), which is a list of components
that, while simple in theory validate robust system architectures in the
component's implementation. There's an autonomous version (Just Works™), a fully
controlled version, a partially controlled version, a default value version, and
several versions that throw warnings if the control rules are not met.

For simple components, I've also included a `SimpleValueComponent` that exposes
a single `value` (I don't recommend this unless the state and logic are
relatively simple) through `ControlledReducerProvider`.

# Guide-level explanation

`ControlledReducerProvider` can be used to create

1. Autonomous (Just Works™) components. A Just Works™ component can be dropped
   into another component with zero configuration, and it should operate as
   expected.
2. Partially or Fully Controlled components. These are components that require
   internal state, but allow a parent to take control of relevant portions of
   that state via props and callbacks.

It looks like this: 

```
+------------------------------------+
|                                    |
|       Constructor (call            |
|       reducer and establish        |
|       initial state)               |
|                                    |
+------------------+-----------------+
                   |
+------------------+-----------------+
|                                    |
|     getDerivedPropsFromState       |
|     (Merge props and provide       +---------+
|     rule warnings)                 |         |
|                                    |         |
+------------------+-----------------+         |
                   |                           |
+------------------+-----------------+         |
|                                    |         |
|                                    |         |
|            render(state)           +---------+
|                                    |         |
|                                    |         |
+------------------+-----------------+         |
                   |                           |
+------------------+-----------------+         |
|                                    |         |
|       Dispatch (call reducer       |         |
|       and set new state)           +---------+
|                                    |
|                                    |
+------------------------------------+
```

### How

`ControlledReducerProvider` (CRP) accepts an array of `controlledProps` keys
(`string[]`). Whenever CRP receives `nextProps`, it ensures that its parent
satisfies the "controlled" rules, and if so, automatically merges\* the
`controlledProps` into its internal state. This internal state is the single
source of truth for the children of CRP, is merged with all other incoming
props, and is supplied via a render prop on every render.

CRP's calls its reducer on construction and for every dispatch, which returns
its internal state and passes that state into its children. It also incudes in
every dispatch's `action.metadata` the `nextProps` and the control status for
each key in `controlledProps` (if there are 5 keys, only 1 might be controlled)
so that the reducer is able to judiciously select which state to apply.

For every "controlled" key in `controlledProps`, CRP expects a change handler
_or_ default value for those keys. The change handler is called _whenever_ a change occurs inside a reducer, which means if one prop's change happens to change another controlled prop's value, both change handlers will be called if they are both controlled.

> \*See Control Rules below for the rules that a consuming component must
> satisfy when interfacing with a controlled component.

> \*See the Reference-level Explanation for a more detail explanation. If one
> does not want CRP to automatically merge the props, and would prefer to merge
> them in the reducer, set `autoMergeProps` to false.

### Control Rules

There are a few rules, which I've adopted from React's `input`, that determine
how a parent component may take "control" of a controllable prop. In the rules
below, let us assume `controlledProps = ['value', 'selectedItem']`.

To take control of the `value` prop in `ControlledReducerProvider`, the parent
must

1. Pass in `value`
2. Pass in `onValueChange`
3. Avoid supplying `onDefaultValue`
4. Must never relinquish control of `value` and `onDefaultValue` -- CRP tracks
   which props a parent has controlled

As you can see, `ControlledReducerProvider` expects a `camelCased` change
handler based on the prop's name -- this is automatically derived and expected
for all controlled props, e.g. for `selectedItem`, it would expect
`onSelectedItemChange`. If both the prop _and_ the handler are not supplied
together, CRP will elicit a console warning (non-throwing). It will also elicit
a warning if `value` is supplied, and then, in a subsequent render, is
`undefined` or `null`. The parent must always retain control of the controlled
prop.

To supply a default `value` for an autonomous component, the parent must

1. Pass in `defaultValue`
2. Avoid supplying `value` and `onValueChange`

If `defaultValue` and `value` and/or `onValueChange` are supplied together, CRP
will elicit a console warning. This applies to autonomous components only. A
"default" value can also be supplied via controlled props via `initialState`

Several examples of the above are located in the referenced examples site.

### Render props

Render props are a compositional design pattern that has gained traction over
higher order components. If you are unfamiliar with render props, here is
[React's explanation](https://reactjs.org/docs/render-props.html), but I also
recommend you view
[Ryan Florence's lesson](https://courses.totalreact.com/courses/advanced-react-free/lectures/3897316)
(free, thanks @lou). Simply put, render props treat React children as functions
and pass all their prop data via the function's arguments. There are two common
ways to create a render prop.

1. Pass a functional component as a render prop:

```jsx
<Component renderChild={state => <Child />} />
```

2. Use `children` as the render prop:

```jsx
<Component>{state => <Child />}</Component>
```

CRP uses the second method. Both allow the consumer to compose their component's
children and share state across them.

# Reference-level explanation

### API

| prop              | type                                | Description                                                                                                                                                                            |
| ----------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| initialState?     | object                              | The initial state from which to hydrate the reducer                                                                                                                                    |
| reducer?          | (state, action) => state            | The reducer that generates the internal state                                                                                                                                          |
| controlledProps   | string[]                            | An array of keys that are controllable. Think of them as "promote-able" to external state.                                                                                             |
| autoMergeProps    | bool = true                         | Whether or not ControlledReducerProvider should merge the incoming props, or give the author manual control to do so in the reducer                                                    |
| dispatch          | (...args) => void = this.dispatch   | The dispatch function which runs the action through the reducer and triggers setState inside the component                                                                             |
| internalState?    | object                              | Supplying an external dispatch and internalState circumvents the reducer/setState cycle and give the parent component absolute control over all internal state [NOT IMPLEMENTATED YET] |

### Action Metadata (data auto-appended to all actions)

| action.metadata   | type           | Description                                                                                         |
| ----------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| isControlled      | bool = false   | True is _any_ props are controlled in the component                                                 |
| controlledProps   | string[]       | A list of keys that are under the parent's control. If no keys, then the component is autonomous.   |
| props             | object         | The current props from the parent component (useful is autoMergeProps is false)                     |

# Drawbacks

1. Render props could be the next higher order components (proved an ill decision). That said, `PseudoProvider` has remained a consistently reliable pattern in our codebase and uses the same render prop pattern as `ControllableReducerProvider`.
2. `setState` is much simpler than using a reducer
3. Refactoring existing components is a large undertaking.
4. Committing to a Just Works™ philosophy is intrisically difficult and isn't necessarily required, though it vastly helps the DX of component consumers.

# Alternatives

### What other designs have been considered?

1. Create a subscription system in our Flux implementation that provides all internal state via pure mechanisms that obviate the need for `setState` all together.
2. Rely on another simpler pattern where all state is encapsulated in `value` and `onChange`. 
3. Use RxJS to create a reactive state API
4. Use MobX to manage internal state
5. Use an Engine to manage state for every component.
6. We _could_ create components that require significant boilerplate.

### What is the impact of not doing this?

If we don't align on a standard, Webflow's codebase will remain fragmented and relatively difficult to code in. Standards reduce congnitive overhead and onboarding challenges.

# Prior Art

* [React Input](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMFiberInput.js)
* [Reason React's ReducerComponent](https://reasonml.github.io/reason-react/docs/en/state-actions-reducer.html)
* [Downshift](https://github.com/paypal/downshift)
* [Ryan Florence's Render Props tutorial](https://courses.totalreact.com/courses/advanced-react-free/lectures/3897316)
* [React Render Props documentation](https://reactjs.org/docs/render-props.html)

# Adoption strategy

The adoption strategy begins with our UI Standards of which `ControlledReducerProvider` is a crucial piece and will inform a larger adoption strategy that is forthcoming. That said, all new components that require internal state should be built with ControlledReducerProvider. 

If we implement this proposal, how will existing Webflow developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with other
projects or libraries? Should we migrate all impacting callsites at once?

# Unresolved questions

I have not yet implemented the `internalState` feature which will allow a parent component to completely override the internal state.
