# FAQ

## Is it safe to share a snapshot?

It's designed to be, but read it first. It's plain JSON. See [Privacy](privacy.md).

## Does womm send anything over the network?

No.

## Is a guilty verdict proof?

No. It means a stated requirement is broken, or a known issue applies. See [How verdicts are reached](verdicts.md).

## Why does a tool show as not found?

It isn't installed, isn't on your `PATH`, or didn't answer within 15 seconds.

## Why is GNU sed "not found" on my Mac?

The system `sed` isn't the GNU version. That's normal, and it's a common reason scripts behave differently on macOS and Linux.

## How do I silence a charge that doesn't apply?

Add its id to `ignore` in [`.womm.yaml`](team-settings.md).
