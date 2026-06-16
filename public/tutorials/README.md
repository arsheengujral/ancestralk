# Tutorial recordings

Real screen-recordings for the in-app "How it works" library (Feature Set D)
go here, as MP4 files matching the `src` paths in `lib/tutorials.ts`:

- `first-story.mp4`
- `elderly.mp4`
- `family-tree.mp4`
- `import-photos.mp4`
- `future-message.mp4`
- `invite.mp4`
- `design.mp4`
- `inheritance.mp4`
- `printed-book.mp4`
- `professional.mp4`

Until a recording is dropped in, the `VideoTutorial` player shows a branded
placeholder surface and degrades gracefully (it won't error on the missing file).

Optional: add a matching poster image and a captions track (`<track kind="captions">`)
per video for accessibility.
