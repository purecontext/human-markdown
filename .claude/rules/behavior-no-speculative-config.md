# No Speculative Config

Never define a tuning parameter, exported variable, policy field, or config entry before the code that consumes it exists. Wire the consumer in the same change or leave the parameter out. Dead config reads as a promise the code does not keep.

Exception: an invariant constant an ADR requires to exist and to be asserted by its own test (an allowed-scopes list, a forbidden-actions set) lands with that test, ahead of its consumer. It is a guarantee, not a knob: it has no tuning surface and no config entry.

*Source: learned regression (vael — dead tuning exports, 3 occurrences; mailpulse — ADR invariant exception).*
