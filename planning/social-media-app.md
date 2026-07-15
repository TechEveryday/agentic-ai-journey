# Social Media App

**Path:** `projects/social-media-app/` · **Status: BLOCKED — needs a differentiator**

## Why this is blocked

As listed in the README, "Social Media App" has no requirement that distinguishes it from work already planned:

- A photo feed with likes and comments → that is **Instagram Clone**.
- Direct messaging between users → that is **2-way Chat**.
- Profiles + a follow graph → the only genuinely new piece, and it's unstated.

Building it as specified would mean writing a third version of the same feed code. That's the "nine shallow MVPs" failure this batch is explicitly avoiding.

## What's needed before this gets a real plan

One line answering: **what does this do that Instagram Clone and 2-way Chat don't?** Candidates worth considering:

| Differentiator | What it would add |
|---|---|
| Text-first feed (Twitter/Mastodon-like) | Short posts, replies, reposts, threading — a genuinely different core model from a photo feed |
| Groups / communities | Membership, per-group feeds, roles/moderation |
| Threaded discussion (Reddit-like) | Nested comment trees, voting, sorting algorithms — real, testable domain logic |
| Follow graph + aggregated timeline | Follower/following edges, fan-out timeline assembly — the interesting algorithmic piece |

## Recommendation

Either:
1. **Fold into Instagram Clone** — add profiles and a follow graph there, and drop this entry; or
2. **Redefine as threaded discussion** — a nested comment tree with vote-based sorting is real domain logic worth unit-testing, and it doesn't duplicate anything else in the slate.

Option 2 is the better project if you want a distinct one. Option 1 is the better use of time.

Until one is chosen, this stays unplanned.
