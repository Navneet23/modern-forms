import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StandardLayout } from './StandardLayout';
import { QuestionByQuestionLayout } from './QuestionByQuestionLayout';
import type { ParsedForm } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  description: 'Theme for testing',
  colors: {
    primary: '#6750A4',
    secondary: '#625B71',
    background: '#F6EDFF',
    surface: '#FFFFFF',
    text: '#1C1B1F',
    textSecondary: '#49454F',
    border: '#CAC4D0',
    error: '#B3261E',
    success: '#2E7D32',
  },
  borderRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  backgroundEffect: 'shapes',
};

const mockForm: ParsedForm = {
  id: 'test-form-123',
  title: 'Test Survey Form',
  description: 'Please complete this survey',
  submitUrl: 'https://docs.google.com/forms/d/e/123/formResponse',
  questions: [
    {
      id: 'q1',
      entryId: 'entry.100',
      title: 'What is your name?',
      type: 'short_answer',
      required: true,
    },
    {
      id: 'q2',
      entryId: 'entry.200',
      title: 'What is your favorite color?',
      type: 'multiple_choice',
      required: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
      ],
    },
    {
      id: 'q3',
      entryId: 'entry.300',
      title: 'Select your hobbies',
      type: 'checkboxes',
      required: false,
      options: [
        { value: 'reading', label: 'Reading' },
        { value: 'gaming', label: 'Gaming' },
      ],
    },
  ],
};

// Mock form with no required fields for navigation tests
const mockFormOptional: ParsedForm = {
  id: 'test-form-optional',
  title: 'Optional Survey',
  description: 'All questions are optional',
  submitUrl: 'https://docs.google.com/forms/d/e/456/formResponse',
  questions: [
    {
      id: 'q1',
      entryId: 'entry.100',
      title: 'What is your name?',
      type: 'short_answer',
      required: false,
    },
    {
      id: 'q2',
      entryId: 'entry.200',
      title: 'What is your favorite color?',
      type: 'multiple_choice',
      required: false,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
      ],
    },
    {
      id: 'q3',
      entryId: 'entry.300',
      title: 'Select your hobbies',
      type: 'checkboxes',
      required: false,
      options: [
        { value: 'reading', label: 'Reading' },
        { value: 'gaming', label: 'Gaming' },
      ],
    },
  ],
};

describe('StandardLayout', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it('should render form title', () => {
    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    expect(screen.getByText('Test Survey Form')).toBeInTheDocument();
  });

  it('should render form description', () => {
    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    expect(screen.getByText('Please complete this survey')).toBeInTheDocument();
  });

  it('should render all questions', () => {
    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    expect(screen.getByText('What is your name?')).toBeInTheDocument();
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation errors for required fields on submit', async () => {
    const user = userEvent.setup();
    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Should show error for required fields
    expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
  });

  it('should not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);

    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    // fetch should not be called because validation failed
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should submit form when all required fields are filled', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    // Fill in required fields
    await user.type(screen.getByRole('textbox'), 'John Doe');
    await user.click(screen.getByLabelText('Red'));

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should show success message after submission', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    render(<StandardLayout form={mockForm} theme={mockTheme} />);

    // Fill in required fields
    await user.type(screen.getByRole('textbox'), 'John Doe');
    await user.click(screen.getByLabelText('Red'));

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/response submitted/i)).toBeInTheDocument();
    });
  });

  it('should not submit in preview mode', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<StandardLayout form={mockForm} theme={mockTheme} isPreview />);

    // Fill in required fields
    await user.type(screen.getByRole('textbox'), 'John Doe');
    await user.click(screen.getByLabelText('Red'));

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining('preview')
    );
    expect(global.fetch).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  it('should render header image when provided', () => {
    render(
      <StandardLayout
        form={mockForm}
        theme={mockTheme}
        headerImageUrl="https://example.com/image.jpg"
      />
    );

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
});

describe('QuestionByQuestionLayout', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it('should render welcome screen initially', () => {
    render(<QuestionByQuestionLayout form={mockForm} theme={mockTheme} />);

    expect(screen.getByText('Test Survey Form')).toBeInTheDocument();
    expect(screen.getByText('Please complete this survey')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should show first question after clicking Start', async () => {
    const user = userEvent.setup();
    render(<QuestionByQuestionLayout form={mockForm} theme={mockTheme} />);

    await user.click(screen.getByRole('button', { name: /start/i }));

    expect(screen.getByText('What is your name?')).toBeInTheDocument();
  });

  it('should show question counter', async () => {
    const user = userEvent.setup();
    render(<QuestionByQuestionLayout form={mockForm} theme={mockTheme} />);

    await user.click(screen.getByRole('button', { name: /start/i }));

    expect(screen.getByText(/1.*of.*3/i)).toBeInTheDocument();
  });

  it('should navigate to next question with Next button', async () => {
    // Use optional form to bypass validation issues in tests
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Start the form
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    // Wait for first question
    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    // Click Next (no validation since field is optional)
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for animation and navigation (300ms animation delay)
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText(/2.*of.*3/i)).toBeInTheDocument();
  });

  it('should navigate back with Previous button', async () => {
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Start and navigate to second question
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait to be on second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click Previous
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    // Wait to be back on first question
    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should preserve answers when navigating back', async () => {
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Start and fill first question
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Select option on second question (auto-advances)
    fireEvent.click(screen.getByLabelText('Green'));

    // Wait for third question (auto-advance)
    await waitFor(() => {
      expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Navigate back twice to first question
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Answer should be preserved
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('should auto-advance for multiple choice questions', async () => {
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Start and go to second question (multiple choice)
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click an option - should auto-advance after delay
    fireEvent.click(screen.getByLabelText('Blue'));

    // Wait for auto-advance (component has 300ms animation + delay)
    await waitFor(
      () => {
        expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should not auto-advance for checkbox questions', async () => {
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Navigate to checkbox question (third question)
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByLabelText('Blue'));

    // Wait for auto-advance to checkbox question
    await waitFor(() => {
      expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click a checkbox - should NOT auto-advance
    fireEvent.click(screen.getByLabelText('Reading'));

    // Wait a moment to ensure no auto-advance happens
    await new Promise(resolve => setTimeout(resolve, 500));

    // Should still be on same question
    expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
  });

  it('should show review button on last question', async () => {
    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByLabelText('Blue'));

    // Wait for auto-advance to last question
    await waitFor(() => {
      expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Should show Review button (leads to review screen where Submit is)
    expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
  });

  it('should submit form with all answers', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} />);

    // Fill out all questions
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByLabelText('Blue'));

    // Wait for auto-advance to last question
    await waitFor(() => {
      expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click Review to go to review screen
    fireEvent.click(screen.getByRole('button', { name: /review/i }));

    // Wait for review screen
    await waitFor(() => {
      expect(screen.getByText('Review Your Answers')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Submit from review screen
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that all answers were included
    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body['entry.100']).toBe('John Doe');
    expect(body['entry.200']).toBe('blue');  // Component uses option.value
  });

  it('should show validation error when required field is empty', async () => {
    render(<QuestionByQuestionLayout form={mockForm} theme={mockTheme} />);

    // Start and try to proceed without filling required field
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    // Wait for question to be displayed
    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('should not submit in preview mode', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<QuestionByQuestionLayout form={mockFormOptional} theme={mockTheme} isPreview />);

    // Fill out form
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByLabelText('Blue'));

    // Wait for auto-advance to last question
    await waitFor(() => {
      expect(screen.getByText('Select your hobbies')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click Review to go to review screen
    fireEvent.click(screen.getByRole('button', { name: /review/i }));

    // Wait for review screen
    await waitFor(() => {
      expect(screen.getByText('Review Your Answers')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('preview'));
    expect(global.fetch).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
