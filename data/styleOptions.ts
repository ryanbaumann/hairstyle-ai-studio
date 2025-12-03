import { Scissors, Palette, Waves, Sparkles } from 'lucide-react';

export const STYLE_PRINCIPLES = [
  {
    id: 'cut',
    label: 'Cut & Shape',
    icon: Scissors,
    options: ['Pixie', 'Bob', 'Lob', 'Shag', 'Wolf Cut', 'Mullet', 'Layered', 'Blunt', 'Undercut', 'Fade']
  },
  {
    id: 'color',
    label: 'Color & Tone',
    icon: Palette,
    options: ['Platinum', 'Balayage', 'Money Piece', 'Copper', 'Espresso', 'Pastel', 'Neon', 'Silver', 'Ombre']
  },
  {
    id: 'texture',
    label: 'Texture & Finish',
    icon: Waves,
    options: ['Messy', 'Sleek', 'Wavy', 'Curly', 'Coily', 'Braided', 'Glass Hair', 'Voluminous']
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    icon: Sparkles,
    options: ['Y2K', 'Old Money', 'Clean Girl', 'Edgy', 'Soft Girl', 'Cyberpunk', 'Boho']
  }
];

export const STYLES = [
  {
    category: "Trending Women",
    items: [
      {
        id: 'wolf-cut',
        label: 'Wolf Cut',
        desc: 'Textured layers with balayage highlights',
        img: 'images/optimized/wolf-cut-balayage-woman.jpg'
      },
      {
        id: 'copper-shag',
        label: 'Copper Shag',
        desc: 'Textured copper shag hairstyle',
        img: 'images/optimized/copper-shag-woman.jpg'
      },
      {
        id: 'glass-bob',
        label: 'Glass Bob',
        desc: 'Sleek, espresso glass-hair bob',
        img: 'images/optimized/sleek-glass-bob-woman.jpg'
      },
    ]
  },
  {
    category: "Trending Men",
    items: [
      {
        id: 'modern-mullet',
        label: 'Modern Mullet',
        desc: 'Textured back, shorter sides, contemporary fade',
        img: 'images/optimized/modern-mullet-man.jpg'
      },
      {
        id: 'textured-crop',
        label: 'Textured Crop',
        desc: 'Skin fade with choppy, matte textured top',
        img: 'images/optimized/textured-crop-man.jpg'
      },
      {
        id: 'the-flow',
        label: 'The Flow',
        desc: 'Medium length, pushed back, natural waves',
        img: 'images/optimized/long-flow-man.jpg'
      },
    ]
  }
];

export const LUCKY_PROMPTS = [
  "A futuristic cyberpunk bob with neon blue streaks",
  "Vintage 1950s hollywood glamour waves",
  "A wild, textured wolf cut with silver tips",
  "Braided crown with loose wisps framing the face"
];
