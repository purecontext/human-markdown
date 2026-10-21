# Update Consumers When a Shape Changes

When a type, API response, event payload, or stored record changes shape, find every consumer before calling the change done: grep for the type name, the field names, and the event or route name. Update each consumer, its test mocks and fixtures, and any optimistic-update or merge logic that rebuilds the shape by hand, in the same change.

The compiler catches typed consumers. It misses untyped boundaries: JSON over the wire, mocks typed as `any`, string-keyed events, and code in another package.

*Source: learned regression (localhost — consumers and mocks left on the old shape).*
