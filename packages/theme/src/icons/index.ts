import brick from './brick.png';
import creations from './creations.png';
import messages from './messages.png';
import profile from './profile.png';

export const Icons = {
  brick,
  creations,
  messages,
  profile,
} as const;

export type IconName = keyof typeof Icons;
