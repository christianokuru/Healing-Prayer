// Homepage copy. Verses are King James Version (public domain).
// PLACEHOLDER: replace "about" and "ministries" with the church's own words.

export const HOME_COPY_IS_PLACEHOLDER = true;

export const HERO = {
  titleStart: "Bring what is on",
  titleEmphasis: "your heart.",
  text: "A quiet, one-on-one prayer session with our prayer team. Come as you are.",
  verse: { text: "Pray one for another, that ye may be healed.", reference: "James 5:16" },
};

export const ABOUT = {
  title: "A church that prays with you",
  paragraphs: [
    "Healing Prayer North-West is a family of believers who gather to worship, to learn and to pray together. We believe no one should carry their burdens alone, and that God still hears and heals.",
    "Every week our prayer team sets aside quiet time to sit with people one at a time. Whatever you are facing, you are welcome here.",
  ],
  verse: {
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28",
  },
};

export const SESSIONS = {
  title: "When we gather to pray",
  text: "Come as you are. A member of the prayer team will meet you at the church.",
};

export const STEPS = [
  {
    title: "Create an account",
    text: "Your name, email and phone number. It takes a minute.",
  },
  {
    title: "Choose a time",
    text: "Pick a free time from the upcoming session days.",
  },
  {
    title: "Share your prayer",
    text: "Tell us what is on your heart. Only church admins can read it.",
  },
] as const;

export const VERSE_BAND = {
  text: "He healeth the broken in heart, and bindeth up their wounds.",
  reference: "Psalm 147:3",
};

export const MINISTRIES = [
  { title: "One-on-one prayer", text: "A private session with a member of our prayer team." },
  { title: "Sunday worship", text: "Worship, the Word and fellowship every Sunday." },
  { title: "Bible study", text: "Small groups that read the Bible together midweek." },
  { title: "Care and support", text: "Visits, calls and practical help in hard seasons." },
] as const;
