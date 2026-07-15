# Instagram Clone

**Path:** `projects/instagram-clone/` · **Branch:** `feature/instagram-clone` · **Stack:** Frontend-only, localStorage

## Scope decision

Frontend-only, no backend. Real image upload and storage is the genuinely hard part of an Instagram clone, and it belongs in a dedicated full-stack pass — not smuggled into an MVP. Images are held as data URLs in localStorage, behind an `IImageStore` port so a real blob store (S3, Azure Blob) can replace it without touching the UI.

**Sequencing:** build this *before* Social Media App. The two overlap heavily; this one's core (`Post`, `Comment`, feed) should be the reusable base.

## Core (`src/core/`, pure)

```ts
interface Post { id: string; imageRef: string; caption: string;
  createdAt: string; likedBy: string[]; }
interface Comment { id: string; postId: string; author: string;
  text: string; createdAt: string; }

function createPost(imageRef: string, caption: string): Post
function validateCaption(caption: string): ValidationResult   // max 2200 chars, matching Instagram
function validateComment(text: string): ValidationResult
function toggleLike(post: Post, userId: string): Post          // pure, returns new
function likeCount(post: Post): number
```

`likedBy` as a string array (not a counter) makes like/unlike idempotent and unit-testable — a counter can drift.

## Application

- `IPostRepository` — `getAll/getById/save/delete`, all async.
- `ICommentRepository` — `getByPost/save/delete`, all async.
- `IImageStore` — `put(file: File): Promise<string>` returning a ref; `get(ref): Promise<string|null>`. **This is the seam that makes a real backend possible later.**
- `usePosts(postRepo, imageStore)`, `useComments(commentRepo)`.

## Infrastructure

- `LocalStoragePostRepository` — key `instagram-clone:posts`.
- `LocalStorageCommentRepository` — key `instagram-clone:comments`.
- `DataUrlImageStore` — reads the `File` via `FileReader`, stores the data URL under `instagram-clone:images:{ref}`.
  **Known limit:** localStorage caps at ~5MB, so a handful of photos will fill it. Downscale images to max 1080px on the long edge via a canvas before storing, and surface a clear quota-exceeded error. Document this limit in the README — do not pretend it scales.

## Presentation

`FeedPage` (composition root), `PostCard`, `PostComposer` (file input + caption + preview), `CommentList`, `CommentForm`, `LikeButton`, `EmptyState`.

## Tests

- **Unit:** `createPost`, both validators (boundaries: 2200-char caption, empty), `toggleLike` (like, unlike, idempotency, immutability), `likeCount`.
- **Unit (infra):** each repository incl. corrupt JSON; `DataUrlImageStore` round-trip; quota-exceeded path.
- **Integration:** composer validation, feed renders posts, like toggles, comment appears. Mock repos + mock image store.
- **E2E:** `create-post.spec.ts` (upload a small fixture image), `like-post.spec.ts`, `comment-on-post.spec.ts`.

## MVP vs deferred

**MVP:** upload from file input, caption, feed (newest first), like/unlike, comment.
**Deferred:** filters, stories, following/followers, real auth, multi-user, video, explore/search.
