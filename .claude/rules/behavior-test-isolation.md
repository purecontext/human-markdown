# Test Isolation

Tests never read or write real user or project state. Every path, env var, or connection that resolves to a real database, config file, home-directory location, or service gets redirected to a temp location in setup, for every test in the file, not just the ones that failed last time.

Tear down shared state (sockets, timers, servers, open records) in `afterEach` or the framework's equivalent, not after the assertions, so one failure can't leak into the next test and make a mutation look caught.

Test-only surfaces (debug commands, test hooks, fixture endpoints) are gated at every entry point that could reach them in production, not only where they are registered. A hook gated at registration but not at its message handler still ships.

*Source: learned regressions (forge-recall — tests created real databases; purecontext-platform — leaked state across tests; human-markdown — test hook reachable in production).*
