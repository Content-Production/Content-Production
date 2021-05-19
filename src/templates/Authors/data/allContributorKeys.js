// @flow

//Keys associated with Allcontributors Emoji Keys.
//Used to identify and filter contributions per author.
//Add your own if you want...
const keys = [
  'audio',
  'a11y',
  'bug',
  'blog',
  'business',
  'code',
  'content',
  'data',
  'doc',
  'design',
  'example',
  'eventOrganizing',
  'financial',
  'fundingFinding',
  'ideas',
  'infra',
  'maintenance',
  'platform',
  'plugin',
  'projectManagement',
  'question',
  'review',
  'security',
  'tool',
  'translation',
  'test',
  'tutorial',
  'talk',
  'userTesting',
  'video',
];

const emojis = {
  audio: '🔊',
  a11y: '♿️',
  bug: '🐛',
  blog: '📝',
  business: '💼',
  code: '💻',
  content: '🖋',
  data: '🔣',
  doc: '📖',
  design: '🎨',
  example: '💡',
  eventOrganizing: '📋',
  financial: '💵',
  fundingFinding: '🔍',
  ideas: '🤔',
  infra: '🚇',
  maintenance: '🚧',
  platform: '📦',
  plugin: '🔌',
  projectManagement: '📆',
  question: '💬',
  review: '👀',
  security: '🛡️',
  tool: '🔧',
  translation: '🌍',
  test: '⚠️',
  tutorial: '✅',
  talk: '📢',
  userTesting: '📓',
  video: '📹',
};

type TEmojis = {
  [string]: string,
};
type TContributorKeys = {
  contributionKeys: Array<string>,
  emojis: TEmojis,
};

const allContributorKeys: TContributorKeys = { contributionKeys: keys, emojis };

export default allContributorKeys;
