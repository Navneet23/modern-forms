import type { ParsedForm, FormQuestion, QuestionType } from '../types/form';

// Google Forms uses specific data attributes and structures
// This parser extracts the form structure from the HTML/JSON response

export async function fetchGoogleForm(formUrl: string): Promise<string> {
  // Extract form ID from URL
  const formId = extractFormId(formUrl);
  if (!formId) {
    throw new Error('Invalid Google Form URL');
  }

  // Fetch via proxy to avoid CORS
  const googleFormPath = `d/e/${formId}/viewform`;
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(googleFormPath)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch form');
  }

  return response.text();
}

export function extractFormId(url: string): string | null {
  // Handle various Google Form URL formats
  const patterns = [
    /forms\/d\/e\/([a-zA-Z0-9_-]+)/,
    /forms\/d\/([a-zA-Z0-9_-]+)/,
    /forms\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function parseGoogleFormHtml(html: string, formUrl: string): ParsedForm {
  // Extract form data from the FB_PUBLIC_LOAD_DATA_ script
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);

  if (!match) {
    throw new Error('Could not find form data in the page');
  }

  let formData: unknown[];
  try {
    formData = JSON.parse(match[1]);
  } catch (e) {
    throw new Error('Could not parse form data');
  }

  return parseFromData(formData, formUrl);
}

function parseFromData(data: unknown[], formUrl: string): ParsedForm {
  // Google Forms data structure:
  // data[1][0] = form description
  // data[1][1] = array of questions
  // data[1][7] = form title (sometimes at index 8)

  const formInfo = data[1] as unknown[];
  if (!formInfo) {
    throw new Error('Invalid form data structure');
  }

  const description = (formInfo[0] as string) || undefined;
  const questionsData = (formInfo[1] as unknown[][]) || [];

  // Title can be at index 7 or 8 depending on form settings
  let title = 'Untitled Form';
  if (typeof formInfo[7] === 'string' && formInfo[7]) {
    title = formInfo[7];
  } else if (typeof formInfo[8] === 'string' && formInfo[8]) {
    title = formInfo[8];
  }

  const formId = extractFormId(formUrl) || 'unknown';
  const questions: FormQuestion[] = [];

  questionsData.forEach((q, index) => {
    if (!Array.isArray(q) || q.length < 5) return;

    const questionTitle = q[1] as string;
    const questionDesc = q[2] as string | null;
    const googleType = q[3] as number;
    const questionData = q[4] as unknown[][];

    if (!questionTitle || !Array.isArray(questionData) || questionData.length === 0) return;

    const type = mapGoogleType(googleType);
    if (!type) return;

    // Entry ID is the first element of the first item in questionData
    const entryInfo = questionData[0] as unknown[];
    const entryId = `entry.${entryInfo[0]}`;

    const question: FormQuestion = {
      id: `q_${index}`,
      entryId,
      title: questionTitle,
      description: questionDesc || undefined,
      type,
      required: false, // Will check later if we can determine this
    };

    // Extract options for choice-based questions
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(type)) {
      const optionsData = entryInfo[1] as unknown[][] | null;
      if (Array.isArray(optionsData)) {
        question.options = optionsData.map((opt, i) => ({
          value: String(opt[0] || i),
          label: String(opt[0] || `Option ${i + 1}`),
        }));
      }
    }

    // Extract scale info for linear scale
    if (type === 'linear_scale') {
      const scaleOptions = entryInfo[1] as unknown[][] | null;
      const scaleLabels = entryInfo[3] as string[] | null;

      if (Array.isArray(scaleOptions) && scaleOptions.length >= 2) {
        question.scaleStart = parseInt(String(scaleOptions[0]?.[0] || '1'), 10);
        question.scaleEnd = parseInt(String(scaleOptions[scaleOptions.length - 1]?.[0] || '5'), 10);

        if (Array.isArray(scaleLabels) && scaleLabels.length >= 2) {
          question.scaleLabels = {
            low: scaleLabels[0] || '',
            high: scaleLabels[1] || '',
          };
        }
      }
    }

    questions.push(question);
  });

  if (questions.length === 0) {
    throw new Error('Could not parse questions from form');
  }

  // Build submit URL
  const submitUrl = formUrl.replace('/viewform', '/formResponse');

  return {
    id: formId,
    title,
    description,
    questions,
    submitUrl,
  };
}

function mapGoogleType(type: number): QuestionType | null {
  // Google Forms internal type codes
  const typeMap: { [key: number]: QuestionType } = {
    0: 'short_answer',
    1: 'paragraph',
    2: 'multiple_choice',
    3: 'dropdown',
    4: 'checkboxes',
    5: 'linear_scale',
    7: 'multiple_choice_grid',
    8: 'checkbox_grid',
    9: 'date',
    10: 'time',
  };

  return typeMap[type] ?? null;
}

export async function submitFormResponse(
  submitUrl: string,
  responses: { [entryId: string]: string | string[] }
): Promise<boolean> {
  const formData = new FormData();

  Object.entries(responses).forEach(([entryId, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(entryId, v));
    } else {
      formData.append(entryId, value);
    }
  });

  try {
    // Submit via proxy - extract the path from the full Google Forms URL
    const formPath = submitUrl.replace('https://docs.google.com/forms/', '');
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(formPath)}`;
    await fetch(proxyUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // Google Forms doesn't return CORS headers
    });

    // Since no-cors doesn't give us the response, we assume success
    return true;
  } catch (error) {
    console.error('Failed to submit form:', error);
    return false;
  }
}
