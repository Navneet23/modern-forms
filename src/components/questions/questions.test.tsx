import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortAnswer } from './ShortAnswer';
import { Paragraph } from './Paragraph';
import { MultipleChoice } from './MultipleChoice';
import { Checkboxes } from './Checkboxes';
import { Dropdown } from './Dropdown';
import { LinearScale } from './LinearScale';
import type { FormQuestion } from '../../types/form';
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
};

describe('Question Components', () => {
  describe('ShortAnswer', () => {
    const shortAnswerQuestion: FormQuestion = {
      id: 'q1',
      entryId: 'entry.123',
      title: 'What is your name?',
      description: 'Please enter your full name',
      type: 'short_answer',
      required: true,
    };

    it('should render question title', () => {
      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('Please enter your full name')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should call onChange when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value=""
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'John Doe');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should display error message', () => {
      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value=""
          onChange={() => {}}
          error="This field is required"
          theme={mockTheme}
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(
        <ShortAnswer
          question={shortAnswerQuestion}
          value="John Doe"
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  describe('Paragraph', () => {
    const paragraphQuestion: FormQuestion = {
      id: 'q2',
      entryId: 'entry.456',
      title: 'Tell us about yourself',
      type: 'paragraph',
      required: false,
    };

    it('should render textarea', () => {
      render(
        <Paragraph
          question={paragraphQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should call onChange when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Paragraph
          question={paragraphQuestion}
          value=""
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Long text here');

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('MultipleChoice', () => {
    const multipleChoiceQuestion: FormQuestion = {
      id: 'q3',
      entryId: 'entry.789',
      title: 'What is your favorite color?',
      type: 'multiple_choice',
      required: true,
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
      ],
    };

    it('should render all options', () => {
      render(
        <MultipleChoice
          question={multipleChoiceQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Green')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
    });

    it('should call onChange when selecting an option', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <MultipleChoice
          question={multipleChoiceQuestion}
          value=""
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByLabelText('Red'));

      // Component uses option.value not option.label
      expect(handleChange).toHaveBeenCalledWith('red');
    });

    it('should show selected option', () => {
      render(
        <MultipleChoice
          question={multipleChoiceQuestion}
          value="green"  // Use option.value not label
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      const greenRadio = screen.getByLabelText('Green');
      expect(greenRadio).toBeChecked();
    });

    it('should only allow one selection', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <MultipleChoice
          question={multipleChoiceQuestion}
          value="red"  // Use option.value
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByLabelText('Blue'));

      expect(handleChange).toHaveBeenCalledWith('blue');
    });
  });

  describe('Checkboxes', () => {
    const checkboxQuestion: FormQuestion = {
      id: 'q4',
      entryId: 'entry.101112',
      title: 'Select your hobbies',
      type: 'checkboxes',
      required: false,
      options: [
        { value: 'reading', label: 'Reading' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'cooking', label: 'Cooking' },
      ],
    };

    it('should render all options as checkboxes', () => {
      render(
        <Checkboxes
          question={checkboxQuestion}
          value={[]}
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByLabelText('Reading')).toBeInTheDocument();
      expect(screen.getByLabelText('Gaming')).toBeInTheDocument();
      expect(screen.getByLabelText('Cooking')).toBeInTheDocument();
    });

    it('should allow multiple selections', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Checkboxes
          question={checkboxQuestion}
          value={['reading']}  // Use option.value
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByLabelText('Gaming'));

      expect(handleChange).toHaveBeenCalledWith(['reading', 'gaming']);
    });

    it('should allow deselection', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Checkboxes
          question={checkboxQuestion}
          value={['reading', 'gaming']}  // Use option.value
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByLabelText('Reading'));

      expect(handleChange).toHaveBeenCalledWith(['gaming']);
    });

    it('should show selected options', () => {
      render(
        <Checkboxes
          question={checkboxQuestion}
          value={['reading', 'cooking']}  // Use option.value
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByLabelText('Reading')).toBeChecked();
      expect(screen.getByLabelText('Gaming')).not.toBeChecked();
      expect(screen.getByLabelText('Cooking')).toBeChecked();
    });
  });

  describe('Dropdown', () => {
    const dropdownQuestion: FormQuestion = {
      id: 'q5',
      entryId: 'entry.131415',
      title: 'Select your country',
      type: 'dropdown',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
      ],
    };

    it('should render select element', () => {
      render(
        <Dropdown
          question={dropdownQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(
        <Dropdown
          question={dropdownQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });

    it('should call onChange when selecting an option', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dropdown
          question={dropdownQuestion}
          value=""
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      // Select by the option.value
      await user.selectOptions(screen.getByRole('combobox'), 'uk');

      expect(handleChange).toHaveBeenCalledWith('uk');
    });

    it('should show selected value', () => {
      render(
        <Dropdown
          question={dropdownQuestion}
          value="ca"  // Use option.value
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByRole('combobox')).toHaveValue('ca');
    });
  });

  describe('LinearScale', () => {
    const linearScaleQuestion: FormQuestion = {
      id: 'q6',
      entryId: 'entry.161718',
      title: 'Rate your experience',
      type: 'linear_scale',
      required: true,
      scaleStart: 1,
      scaleEnd: 5,
      scaleLabels: {
        low: 'Poor',
        high: 'Excellent',
      },
    };

    it('should render scale buttons', () => {
      render(
        <LinearScale
          question={linearScaleQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render scale labels', () => {
      render(
        <LinearScale
          question={linearScaleQuestion}
          value=""
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should call onChange when clicking a value', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <LinearScale
          question={linearScaleQuestion}
          value=""
          onChange={handleChange}
          theme={mockTheme}
        />
      );

      await user.click(screen.getByText('4'));

      expect(handleChange).toHaveBeenCalledWith('4');
    });

    it('should highlight selected value', () => {
      render(
        <LinearScale
          question={linearScaleQuestion}
          value="3"
          onChange={() => {}}
          theme={mockTheme}
        />
      );

      // LinearScale uses label elements, not buttons
      const selectedLabel = screen.getByText('3').closest('label');
      expect(selectedLabel).toHaveStyle({ backgroundColor: mockTheme.colors.primary });
    });
  });
});
