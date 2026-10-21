# Copy at Cache Boundaries

A module-level cache that hands out mutable objects copies them on every path in and out: the hot read, the cold load, error recovery, and write-back. One uncopied path lets a caller's mutation corrupt the cache for everyone, and it is always the path nobody tested.

Prefer immutable values (frozen objects, value types) where the language makes that cheap; then no copy is needed.

*Source: learned regression (localhost — cache mutated through a reference returned on the cold path).*
