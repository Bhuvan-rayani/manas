// Local avatar images from pics folder
const BASE_PATH = import.meta.env.BASE_URL;
export const AVATARS = [
  { id: 'manas', image: `${BASE_PATH}pics/manas.png` },
  { id: 'avatar1', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184222.png` },
  { id: 'avatar2', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184242.png` },
  { id: 'avatar3', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184251.png` },
  { id: 'avatar4', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184317.png` },
  { id: 'avatar5', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184328.png` },
  { id: 'avatar6', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184347.png` },
  { id: 'avatar7', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184406.png` },
  { id: 'avatar8', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184426.png` },
  { id: 'avatar9', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184453.png` },
  { id: 'avatar10', image: `${BASE_PATH}pics/Screenshot 2026-01-05 184505.png` },
];

export const getAvatarById = (id: string) => {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
};
