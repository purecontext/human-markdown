# Teardown Completes the Cleanup

When teardown cancels a timer, callback, subscription, or in-flight task, it also performs the cleanup that work would have done on completion: reset accumulators and flags, remove entries from sibling maps, release what it held. Cancelling the work without its cleanup leaves stale state that describes something that no longer exists.

Check by reading the cancelled callback's body: every side effect it would have had on shared state needs a counterpart in teardown, or a reason it doesn't.
