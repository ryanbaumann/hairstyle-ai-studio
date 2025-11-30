#!/bin/bash

# Load API Key
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

API_KEY=$VITE_GEMINI_API_KEY

if [ -z "$API_KEY" ]; then
    echo "Error: VITE_GEMINI_API_KEY not found in .env"
    exit 1
fi

MODEL="gemini-3-pro-image-preview"
API_URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}"

generate_image() {
    local prompt=$1
    local filename=$2
    
    echo "Generating image for: $prompt"
    
    # Create JSON body
    cat > body.json <<EOF
{
  "contents": [
    {
      "parts": [
        {
          "text": "$prompt"
        }
      ]
    }
  ],
  "generationConfig": {
    "imageConfig": {
      "aspectRatio": "4:3",
      "imageSize": "1K"
    }
  }
}
EOF

    # Call API
    response=$(curl -s -X POST -H "Content-Type: application/json" -d @body.json "$API_URL")
    
    # Extract base64 image using python (since jq might not be available)
    python3 -c "import sys, json; data = json.load(sys.stdin); print(data['candidates'][0]['content']['parts'][0]['inlineData']['data'])" <<EOF > image.base64 2>/dev/null
$response
EOF

    if [ -s image.base64 ]; then
        mkdir -p public/images
        base64 -d image.base64 > "public/images/$filename"
        echo "Successfully saved image to public/images/$filename"
    else
        echo "Failed to generate image or parse response."
        echo "Response was: $response"
    fi
    
    # Clean up
    rm body.json image.base64
}

# Images to generate
generate_image "A high-quality, professional portrait of a woman with a sleek, glass-hair bob cut, deep espresso color. Photorealistic, studio lighting, fashion photography style." "sleek-glass-bob-woman.png"
sleep 10
generate_image "A high-quality, professional portrait of a woman with a textured copper shag hairstyle. Photorealistic, studio lighting, fashion photography style." "copper-shag-woman.png"
sleep 10
generate_image "A high-quality, professional portrait of a man with a textured crop hairstyle and a skin fade. Photorealistic, studio lighting, fashion photography style." "textured-crop-man.png"
sleep 10
generate_image "A high-quality, professional portrait of a man with long, flowing natural waves. Photorealistic, studio lighting, fashion photography style." "long-flow-man.png"
sleep 10
generate_image "A high-quality, professional portrait of a man with a modern, textured mullet hairstyle. Photorealistic, studio lighting, fashion photography style." "modern-mullet-man.png"
