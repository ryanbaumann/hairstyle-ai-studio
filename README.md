# Hairstyle AI Studio

**Hairstyle AI Studio** is a modern, AI-powered web application that helps users discover and visualize new hairstyles. Built with React, Vite, and Google's Gemini AI, it offers a seamless experience for exploring various hair trends and getting personalized recommendations.

## ✨ Features

- **AI-Powered Recommendations**: Leverages Google's Gemini AI to analyze and suggest hairstyles.
- **Interactive UI**: A sleek, responsive interface built with React and Tailwind CSS.
- **Real-time Visualization**: Instantly see how different styles might look.
- **Curated Collection**: Browse through a variety of trending hairstyles for men and women.

## 📸 Screenshots

### Application Interface
![Hairstyle AI Studio UI](https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/optimized/ui-screenshot.jpg)

### Sample Hairstyles
<div align="center">
  <img src="https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/optimized/wolf-cut-balayage-woman.jpg" width="30%" alt="Wolf Cut" />
  <img src="https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/optimized/modern-mullet-man.jpg" width="30%" alt="Modern Mullet" />
  <img src="https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/optimized/sleek-glass-bob-woman.jpg" width="30%" alt="Glass Bob" />
</div>

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **AI Integration**: Google Generative AI (Gemini)
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ryanbaumann/hairstyle-ai-studio.git
   cd hairstyle-ai-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🎨 Image Generation & Optimization

The project includes scripts to generate new trending hairstyle images using Google's Gemini API and optimize them for the web.

### 1. Generate Images

To generate new images based on prompts in `scripts/generate_images_gemini.js`:

```bash
node scripts/generate_images_gemini.js
```

### 2. Optimize Images

To optimize PNG images to JPG and move them to the correct directory:

```bash
for f in public/images/*.png; do sips -s format jpeg -s formatOptions 80 "$f" --out "${f%.png}.jpg" && rm "$f"; done
mv public/images/*.jpg images/optimized/
```

## 📄 License

This project is licensed under the MIT License.

---
