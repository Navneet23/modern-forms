import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractFormId, parseGoogleFormHtml, submitFormResponse } from './formParser';

describe('Form Parser', () => {
  describe('extractFormId', () => {
    it('should extract form ID from standard viewform URL', () => {
      const url = 'https://docs.google.com/forms/d/e/1FAIpQLSf123abc_XYZ/viewform';
      expect(extractFormId(url)).toBe('1FAIpQLSf123abc_XYZ');
    });

    it('should extract form ID from edit URL format', () => {
      const url = 'https://docs.google.com/forms/d/1a2b3c4d5e6f/edit';
      expect(extractFormId(url)).toBe('1a2b3c4d5e6f');
    });

    it('should extract form ID from short URL format', () => {
      const url = 'https://docs.google.com/forms/1a2b3c4d5e6f';
      expect(extractFormId(url)).toBe('1a2b3c4d5e6f');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/not-a-form';
      expect(extractFormId(url)).toBeNull();
    });

    it('should handle URL with query parameters', () => {
      const url = 'https://docs.google.com/forms/d/e/1FAIpQLSf123abc/viewform?usp=sf_link';
      expect(extractFormId(url)).toBe('1FAIpQLSf123abc');
    });
  });

  describe('parseGoogleFormHtml', () => {
    const createMockFormHtml = (formData: unknown[]) => {
      return `
        <html>
        <head></head>
        <body>
        <script>FB_PUBLIC_LOAD_DATA_ = ${JSON.stringify(formData)};</script>
        </body>
        </html>
      `;
    };

    it('should parse form title and description', () => {
      const formData = [
        null,
        [
          'This is the form description',
          [
            // Need at least one valid question
            [
              12345,
              'Sample Question',
              null,
              0, // short answer
              [[67890]],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form Title',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.title).toBe('Test Form Title');
      expect(result.description).toBe('This is the form description');
    });

    it('should parse short answer question', () => {
      const formData = [
        null,
        [
          '', // description
          [
            [
              12345, // question ID (internal)
              'What is your name?', // question title
              null, // question description
              0, // question type (0 = short answer)
              [[67890]], // entry info
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].title).toBe('What is your name?');
      expect(result.questions[0].type).toBe('short_answer');
      expect(result.questions[0].entryId).toBe('entry.67890');
    });

    it('should parse multiple choice question with options', () => {
      const formData = [
        null,
        [
          '',
          [
            [
              12345,
              'Choose your favorite color',
              null,
              2, // multiple choice
              [
                [
                  67890,
                  [['Red'], ['Green'], ['Blue']],
                ],
              ],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe('multiple_choice');
      expect(result.questions[0].options).toHaveLength(3);
      expect(result.questions[0].options?.[0].label).toBe('Red');
      expect(result.questions[0].options?.[1].label).toBe('Green');
      expect(result.questions[0].options?.[2].label).toBe('Blue');
    });

    it('should parse checkbox question', () => {
      const formData = [
        null,
        [
          '',
          [
            [
              12345,
              'Select all that apply',
              null,
              4, // checkboxes
              [
                [
                  67890,
                  [['Option A'], ['Option B'], ['Option C']],
                ],
              ],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions[0].type).toBe('checkboxes');
      expect(result.questions[0].options).toHaveLength(3);
    });

    it('should parse dropdown question', () => {
      const formData = [
        null,
        [
          '',
          [
            [
              12345,
              'Select your country',
              null,
              3, // dropdown
              [
                [
                  67890,
                  [['USA'], ['UK'], ['Canada']],
                ],
              ],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions[0].type).toBe('dropdown');
    });

    it('should parse linear scale question', () => {
      const formData = [
        null,
        [
          '',
          [
            [
              12345,
              'Rate your experience',
              null,
              5, // linear scale
              [
                [
                  67890,
                  [['1'], ['2'], ['3'], ['4'], ['5']],
                  null,
                  ['Poor', 'Excellent'],
                ],
              ],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions[0].type).toBe('linear_scale');
      expect(result.questions[0].scaleStart).toBe(1);
      expect(result.questions[0].scaleEnd).toBe(5);
      expect(result.questions[0].scaleLabels?.low).toBe('Poor');
      expect(result.questions[0].scaleLabels?.high).toBe('Excellent');
    });

    it('should parse paragraph question', () => {
      const formData = [
        null,
        [
          '',
          [
            [
              12345,
              'Tell us more',
              'Please provide details',
              1, // paragraph
              [[67890]],
            ],
          ],
          null,
          null,
          null,
          null,
          null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.questions[0].type).toBe('paragraph');
      expect(result.questions[0].description).toBe('Please provide details');
    });

    it('should generate correct submit URL', () => {
      const formData = [
        null,
        [
          '',
          [[12345, 'Question', null, 0, [[67890]]]],
          null, null, null, null, null,
          'Test Form',
        ],
      ];

      const html = createMockFormHtml(formData);
      const result = parseGoogleFormHtml(html, 'https://docs.google.com/forms/d/e/123/viewform');

      expect(result.submitUrl).toBe('https://docs.google.com/forms/d/e/123/formResponse');
    });

    it('should throw error when form data is not found', () => {
      const html = '<html><body>No form data here</body></html>';

      expect(() => parseGoogleFormHtml(html, 'https://example.com')).toThrow(
        'Could not find form data in the page'
      );
    });

    it('should throw error when form data is invalid JSON', () => {
      const html = '<script>FB_PUBLIC_LOAD_DATA_ = {invalid json};</script>';

      expect(() => parseGoogleFormHtml(html, 'https://example.com')).toThrow();
    });
  });

  describe('submitFormResponse', () => {
    beforeEach(() => {
      vi.mocked(global.fetch).mockReset();
    });

    it('should submit form data via proxy', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const submitUrl = 'https://docs.google.com/forms/d/e/123/formResponse';
      const responses = {
        'entry.123': 'John Doe',
        'entry.456': 'test@example.com',
      };

      const result = await submitFormResponse(submitUrl, responses);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/proxy'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle array values (checkboxes)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const submitUrl = 'https://docs.google.com/forms/d/e/123/formResponse';
      const responses = {
        'entry.123': ['Option A', 'Option B'],
      };

      const result = await submitFormResponse(submitUrl, responses);

      expect(result).toBe(true);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body['entry.123']).toEqual(['Option A', 'Option B']);
    });

    it('should return false on fetch error', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const submitUrl = 'https://docs.google.com/forms/d/e/123/formResponse';
      const responses = { 'entry.123': 'test' };

      const result = await submitFormResponse(submitUrl, responses);

      expect(result).toBe(false);
    });

    it('should handle non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const submitUrl = 'https://docs.google.com/forms/d/e/123/formResponse';
      const responses = { 'entry.123': 'test' };

      const result = await submitFormResponse(submitUrl, responses);

      expect(result).toBe(false);
    });
  });
});
