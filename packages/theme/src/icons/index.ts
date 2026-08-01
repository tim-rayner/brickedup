export const Icons = {
  brick: require('./brick.png'),
  creations: require('./creations.png'),
  messages: require('./messages.png'),
  profile: require('./profile.png'),
} as const;

export type IconName = keyof typeof Icons;
