import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Define the mock functions BEFORE importing the service
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();

vi.mock('@google/genai', async (importOriginal) => {
  const original = await importOriginal<typeof import('@google/genai')>();
  return {
    ...original,
    GoogleGenAI: vi.fn().mockImplementation(function () {
      return {
        models: {
          generateContent: mockGenerateContent,
          generateContentStream: mockGenerateContentStream
        }
      };
    })
  };
});

// Import service after mocking
import {
  generateTitleFromPrompt,
  analyzeUserImage,
  generateStyleSuggestions,
  generateHairstyleImage,
  refineHairstyleImage
} from '../geminiService';

import { TEXT_FAST_MODEL } from '../geminiModels';

describe('geminiService', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
    mockGenerateContent.mockReset();
    mockGenerateContentStream.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateTitleFromPrompt', () => {
    it('successfully generates a title', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '  "Beautiful Bob"  '
      });

      const title = await generateTitleFromPrompt('A very beautiful bob cut for summer');
      expect(title).toBe('Beautiful Bob');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: TEXT_FAST_MODEL,
        contents: 'Summarize this hairstyle description into a catchy, specific title of 4 words or less. Description: "A very beautiful bob cut for summer"',
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'text/plain',
        }
      });
    });

    it('returns default title on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));
      const title = await generateTitleFromPrompt('A very beautiful bob cut for summer');
      expect(title).toBe('New Hairstyle');
    });
  });

  describe('analyzeUserImage', () => {
    it('analyzes image and returns gender recommendation', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          gender: 'Female',
          recommendedStyleId: 'textured_bob'
        })
      });

      const base64Image = 'data:image/png;base64,abcdef';
      const result = await analyzeUserImage(base64Image);

      expect(result).toEqual({
        gender: 'Women',
        recommendedStyleId: 'textured_bob'
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
        model: TEXT_FAST_MODEL,
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        }),
      }));

      // Verify the prompt contents and base64 parsing
      const callArg = mockGenerateContent.mock.calls[0][0] as any;
      expect(callArg.contents[0]).toEqual({
        inlineData: {
          mimeType: 'image/png',
          data: 'abcdef'
        }
      });
      expect(callArg.contents[1].text).toContain('Analyze the person in this photo.');
    });

    it('defaults to All when API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));
      const result = await analyzeUserImage('data:image/png;base64,abcdef');
      expect(result).toEqual({
        gender: 'All',
        recommendedStyleId: null
      });
    });
  });

  describe('generateStyleSuggestions', () => {
    it('returns style suggestions matching the schema', async () => {
      const mockSuggestions = [
        { id: '1', label: 'Style A', description: 'Desc A', category: 'style' },
        { id: '2', label: 'Style B', description: 'Desc B', category: 'COLOR' } // Test case normalization
      ];
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockSuggestions)
      });

      const suggestions = await generateStyleSuggestions('curly hair');
      expect(suggestions).toEqual([
        { id: '1', label: 'Style A', description: 'Desc A', category: 'style' },
        { id: '2', label: 'Style B', description: 'Desc B', category: 'color' }
      ]);

      const callArg = mockGenerateContent.mock.calls[0][0] as any;
      expect(callArg.model).toBe(TEXT_FAST_MODEL);
      expect(callArg.config.responseMimeType).toBe('application/json');
      expect(callArg.config.responseSchema).toBeDefined();
    });

    it('returns fallback data on API failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));
      const suggestions = await generateStyleSuggestions('curly hair');
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].label).toBe('Textured Bob');
    });
  });

  describe('generateHairstyleImage', () => {
    const mockImages = {
      front: 'data:image/png;base64,front_data',
      side: 'data:image/png;base64,side_data',
      back: 'data:image/png;base64,back_data'
    };

    it('streams response and generates image correctly in fast mode', async () => {
      const mockStream = async function* () {
        yield {
          candidates: [
            {
              content: {
                parts: [
                  {
                    thought: true,
                    text: 'Analyzing subject'
                  }
                ]
              }
            }
          ]
        };
        yield {
          candidates: [
            {
              content: {
                parts: [
                  {
                    thought: true,
                    text: 'Applying hairstyle'
                  }
                ]
              }
            }
          ]
        };
        yield {
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: 'transformed_data'
                    }
                  }
                ]
              }
            }
          ]
        };
      };

      mockGenerateContentStream.mockResolvedValue(mockStream());

      const thoughts: string[] = [];
      const onThinking = (t: string) => thoughts.push(t);

      const result = await generateHairstyleImage(
        mockImages,
        'Short curly bob',
        'data:image/jpeg;base64,ref_data',
        'http://example.com/ref',
        onThinking,
        'fast',
        'single',
        '1K'
      );

      expect(result).toBe('data:image/png;base64,transformed_data');
      expect(thoughts).toEqual(['Analyzing subject', 'Applying hairstyle']);

      const callArg = mockGenerateContentStream.mock.calls[0][0] as any;
      expect(callArg.model).toBe('gemini-3.1-flash-lite-image');
      expect(callArg.config.imageConfig).toEqual({
        aspectRatio: '16:9',
        imageSize: '1K'
      });

      // Verify the inputs: front, side, back, style ref, then prompt text
      expect(callArg.contents).toHaveLength(5);
      expect(callArg.contents[0]).toEqual({ inlineData: { mimeType: 'image/png', data: 'front_data' } });
      expect(callArg.contents[1]).toEqual({ inlineData: { mimeType: 'image/png', data: 'side_data' } });
      expect(callArg.contents[2]).toEqual({ inlineData: { mimeType: 'image/png', data: 'back_data' } });
      expect(callArg.contents[3]).toEqual({ inlineData: { mimeType: 'image/jpeg', data: 'ref_data' } });
      expect(callArg.contents[4].text).toContain('Short curly bob');
      expect(callArg.contents[4].text).toContain('STYLE INSPIRATION URL: http://example.com/ref');
    });

    it('throws error if no image is produced by stream', async () => {
      const mockStream = async function* () {
        yield {
          candidates: [
            {
              content: {
                parts: [
                  {
                    thought: true,
                    text: 'Thinking only'
                  }
                ]
              }
            }
          ]
        };
      };
      mockGenerateContentStream.mockResolvedValue(mockStream());

      await expect(
        generateHairstyleImage(mockImages, 'Short curly bob')
      ).rejects.toThrow('No image generated.');
    });
  });

  describe('refineHairstyleImage', () => {
    it('refines hairstyle image with correct parameters', async () => {
      const mockStream = async function* () {
        yield {
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: 'refined_data'
                    }
                  }
                ]
              }
            }
          ]
        };
      };
      mockGenerateContentStream.mockResolvedValue(mockStream());

      const result = await refineHairstyleImage(
        'data:image/png;base64,current_data',
        'Make the bangs shorter',
        'data:image/png;base64,ref_data',
        null,
        undefined,
        'studio',
        'salon-sheet',
        '0.5K'
      );

      expect(result).toBe('data:image/jpeg;base64,refined_data');

      const callArg = mockGenerateContentStream.mock.calls[0][0] as any;
      expect(callArg.model).toBe('gemini-3.1-flash-image'); // studio mode
      expect(callArg.config.imageConfig.imageSize).toBe('1K');
      expect(callArg.contents[0]).toEqual({ inlineData: { mimeType: 'image/png', data: 'current_data' } });
      expect(callArg.contents[1]).toEqual({ inlineData: { mimeType: 'image/png', data: 'ref_data' } });
      expect(callArg.contents[2].text).toContain('Make the bangs shorter');
      expect(callArg.contents[2].text).toContain('Model quality mode: studio');
      expect(callArg.contents[2].text).toContain('output layout (salon-sheet)');
    });
  });
});
