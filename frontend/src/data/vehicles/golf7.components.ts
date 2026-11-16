import type { AutomotiveComponent } from '../../types/automotive'

export const golf7Components: AutomotiveComponent[] = [
  {
    id: 'hood',
    name: 'Hood',
    category: 'body',
    meshNames: ['bonnet_ok1']
  },
  {
    id: 'front-left-door',
    name: 'Front Left Door',
    category: 'body',
    meshNames: ['door_lf_ok1']
  },
  {
    id: 'front-bumper',
    name: 'Front Bumper',
    category: 'body',
    meshNames: ['bump_fro01_1']
  },
  {
    id: 'rear-bumper',
    name: 'Rear Bumper',
    category: 'body',
    meshNames: ['bump_rea01_1']
  },
  {
    id: 'windshield',
    name: 'Windshield',
    category: 'glass',
    meshNames: ['windscre01_1']
  }
]