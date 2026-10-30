# Library Defaults on Untrusted Input

A parser or converter pointed at input from outside the user's control (email HTML, headers, URLs, uploaded or scanned files, fetched pages) runs on its defaults unless every limit and transform is set on purpose. Defaults are tuned for friendly input; hostile input finds the bound nobody set, and the failure is a hang or a crash in production.

Before wiring the library in:

- **Set every limit explicitly:** recursion depth, input size, iteration counts. Do it even when the default looks fine, so the bound is visible in the code.
- **Turn off content-changing transforms** (case, wrapping, whitespace, truncation) unless the reader needs them.
- **Measure adversarial shapes** (deep nesting, huge input, short repeated tags) before choosing a cap. A limit on a converter does not bound a superlinear parser underneath it; cap the input instead and state the measured worst case.
- **One hostile-input test per limit**, each failing when its limit is removed.

The bound is per call. A caller that loops over attacker-controlled items needs its own budget.

Doesn't apply to input the project itself produced (its own config, generated files).
