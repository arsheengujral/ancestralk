/** Tutorial library content (Feature Set D). */

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  href: string; // "Try it now" deep link
  icon: string;
  src: string; // placeholder MP4 in /public/tutorials/
  steps: string[];
  // The route(s) whose contextual "?" opens this tutorial.
  forRoutes: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'first-story',
    title: 'Record your first story in 3 minutes',
    description: 'Speak a few answers and watch a chapter take shape.',
    href: '/begin',
    icon: 'ti-microphone',
    src: '/tutorials/first-story.mp4',
    steps: ['Choose who you’re starting with', 'Add their name and a photo', 'Speak or type four short answers', 'Read the chapter and save it forever'],
    forRoutes: ['/begin'],
  },
  {
    id: 'elderly',
    title: 'Help an elderly parent use voice-only mode',
    description: 'Large text, one question at a time, just speaking.',
    href: '/elderly',
    icon: 'ti-accessible',
    src: '/tutorials/elderly.mp4',
    steps: ['Open voice-only mode', 'Hand them the phone', 'They tap the big button and speak', 'Tap through five gentle questions'],
    forRoutes: ['/elderly'],
  },
  {
    id: 'family-tree',
    title: 'Build your family tree',
    description: 'Add branches and watch the tree grow.',
    href: '/archive',
    icon: 'ti-git-fork',
    src: '/tutorials/family-tree.mp4',
    steps: ['Open your archive', 'Tap an empty “+” slot', 'Add that relative', 'Tap any branch to open their chapter'],
    forRoutes: ['/archive'],
  },
  {
    id: 'import-photos',
    title: 'Import your photos from Instagram or Google Photos',
    description: 'Bring your existing photos into the archive.',
    href: '/import',
    icon: 'ti-photo-down',
    src: '/tutorials/import-photos.mp4',
    steps: ['Open Import', 'Pick a source', 'Follow the export steps', 'Preview and confirm what comes in'],
    forRoutes: ['/import', '/album'],
  },
  {
    id: 'future-message',
    title: 'Write a future message',
    description: 'Seal a letter until a day you choose.',
    href: '/future',
    icon: 'ti-clock',
    src: '/tutorials/future-message.mp4',
    steps: ['Choose who it’s for', 'Choose when it opens', 'Write or speak your message', 'Seal it — only they can open it'],
    forRoutes: ['/future'],
  },
  {
    id: 'invite',
    title: 'Invite your family to contribute',
    description: 'Everyone adds their own chapter, in their own voice.',
    href: '/collaborate',
    icon: 'ti-users',
    src: '/tutorials/invite.mp4',
    steps: ['Open Invite family', 'Add a number, email, or name', 'Send the invite', 'They add their chapter; reminders do the rest'],
    forRoutes: ['/collaborate'],
  },
  {
    id: 'design',
    title: 'Choose your album design',
    description: 'Pick from 20 styles; the whole archive re-skins.',
    href: '/designs',
    icon: 'ti-palette',
    src: '/tutorials/design.mp4',
    steps: ['Open Album design', 'Browse the 20 styles', 'Tap one to select it', 'See your tree and book re-skin instantly'],
    forRoutes: ['/designs'],
  },
  {
    id: 'inheritance',
    title: 'Pass your archive to the next generation',
    description: 'Choose how the torch is carried on.',
    href: '/legacy',
    icon: 'ti-infinity',
    src: '/tutorials/inheritance.mp4',
    steps: ['Open the Legacy Plan', 'Choose how it passes down', 'Name keepers or set a handover', 'Rest easy — it will outlive us all'],
    forRoutes: ['/legacy'],
  },
  {
    id: 'printed-book',
    title: 'Order your printed book',
    description: 'Flip through the digital book, then order it in print.',
    href: '/book',
    icon: 'ti-book-2',
    src: '/tutorials/printed-book.mp4',
    steps: ['Open the Book Studio', 'Add photos and videos', 'Flip through the pages', 'Order hardcover, softcover, or PDF'],
    forRoutes: ['/book'],
  },
  {
    id: 'professional',
    title: 'Add your professional legacy from LinkedIn',
    description: 'Build the career chapter — what they built.',
    href: '/import',
    icon: 'ti-briefcase',
    src: '/tutorials/professional.mp4',
    steps: ['Open Import', 'Choose LinkedIn', 'Upload your data export', 'Your career timeline builds itself'],
    forRoutes: ['/business', '/profile'],
  },
];

export function tutorialForRoute(pathname: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.forRoutes.includes(pathname));
}
