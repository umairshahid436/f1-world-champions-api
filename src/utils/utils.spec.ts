import { sortByProperty, formatValidationErrors } from './utils';
import { ValidationError } from 'class-validator';

describe('utils', () => {
  describe('sortByProperty', () => {
    // Test cases for string properties
    describe('string properties', () => {
      const drivers = [
        { name: 'Lewis Hamilton', team: 'Mercedes' },
        { name: 'Max Verstappen', team: 'Red Bull' },
        { name: 'Charles Leclerc', team: 'Ferrari' },
      ];

      it('should sort strings in ascending sortBy', () => {
        const result = sortByProperty({
          array: drivers,
          property: 'name',
          sortBy: 'ASC',
        });
        expect(result[0].name).toBe('Charles Leclerc');
        expect(result[1].name).toBe('Lewis Hamilton');
        expect(result[2].name).toBe('Max Verstappen');
      });

      it('should sort strings in descending sortBy', () => {
        const result = sortByProperty({
          array: drivers,
          property: 'name',
          sortBy: 'DESC',
        });
        expect(result[0].name).toBe('Max Verstappen');
        expect(result[1].name).toBe('Lewis Hamilton');
        expect(result[2].name).toBe('Charles Leclerc');
      });
    });

    // Test cases for number properties
    describe('number properties', () => {
      const standings = [
        { driver: 'Hamilton', points: 413 },
        { driver: 'Verstappen', points: 454 },
        { driver: 'Leclerc', points: 308 },
      ];

      it('should sort numbers in ascending sortBy', () => {
        const result = sortByProperty({
          array: standings,
          property: 'points',
          sortBy: 'ASC',
        });
        expect(result[0].points).toBe(308);
        expect(result[1].points).toBe(413);
        expect(result[2].points).toBe(454);
      });

      it('should sort numbers in descending sortBy', () => {
        const result = sortByProperty({
          array: standings,
          property: 'points',
          sortBy: 'DESC',
        });
        expect(result[0].points).toBe(454);
        expect(result[1].points).toBe(413);
        expect(result[2].points).toBe(308);
      });
    });

    // Test cases for date properties
    describe('date properties', () => {
      const races = [
        { name: 'Monaco GP', date: new Date('2024-05-26') },
        { name: 'British GP', date: new Date('2024-07-07') },
        { name: 'Australian GP', date: new Date('2024-03-24') },
      ];

      it('should sort dates in ascending sortBy', () => {
        const result = sortByProperty({
          array: races,
          property: 'date',
          sortBy: 'ASC',
        });
        expect(result[0].name).toBe('Australian GP');
        expect(result[1].name).toBe('Monaco GP');
        expect(result[2].name).toBe('British GP');
      });

      it('should sort dates in descending sortBy', () => {
        const result = sortByProperty({
          array: races,
          property: 'date',
          sortBy: 'DESC',
        });
        expect(result[0].name).toBe('British GP');
        expect(result[1].name).toBe('Monaco GP');
        expect(result[2].name).toBe('Australian GP');
      });
    });

    // Test cases for null/undefined values
    describe('null/undefined values', () => {
      const mixedData = [
        { name: 'Hamilton', points: 413 },
        { name: 'Verstappen', points: null },
        { name: 'Leclerc', points: undefined },
      ];

      it('should handle null values in ascending sortBy', () => {
        const result = sortByProperty({
          array: mixedData,
          property: 'points',
          sortBy: 'ASC',
        });
        expect(result[0].points).toBe(null);
        expect(result[1].points).toBe(undefined);
        expect(result[2].points).toBe(413);
      });

      it('should handle null values in descending sortBy', () => {
        const result = sortByProperty({
          array: mixedData,
          property: 'points',
          sortBy: 'DESC',
        });
        expect(result[0].points).toBe(413);
        expect(result[1].points).toBe(undefined);
        expect(result[2].points).toBe(null);
      });

      it('should handle multiple null values consistently', () => {
        const dataWithMultipleNulls = [
          { name: 'A', points: null },
          { name: 'B', points: null },
          { name: 'C', points: 100 },
        ];
        const result = sortByProperty({
          array: dataWithMultipleNulls,
          property: 'points',
          sortBy: 'DESC',
        });
        expect(result[0].points).toBe(100);
        expect(result[1].points).toBe(null);
        expect(result[2].points).toBe(null);
      });
    });

    // Test cases for mixed types
    describe('mixed types', () => {
      const mixedData = [
        { value: 'string' },
        { value: 42 },
        { value: new Date('2024-01-01') },
      ];

      it('should handle mixed types in ascending sortBy', () => {
        const result = sortByProperty({
          array: mixedData,
          property: 'value',
          sortBy: 'ASC',
        });
        expect(typeof result[0].value).toBe('number');
        expect(typeof result[1].value).toBe('object');
        expect(typeof result[2].value).toBe('string');
      });

      it('should handle mixed types in descending sortBy', () => {
        const result = sortByProperty({
          array: mixedData,
          property: 'value',
          sortBy: 'DESC',
        });
        expect(typeof result[0].value).toBe('string');
        expect(typeof result[1].value).toBe('object');
        expect(typeof result[2].value).toBe('number');
      });
    });

    // Test cases for empty array
    describe('empty array', () => {
      it('should return empty array when input is empty', () => {
        const result = sortByProperty({
          array: [],
          property: 'name',
          sortBy: 'ASC',
        });
        expect(result).toEqual([]);
      });
    });

    // Test cases for single item array
    describe('single item array', () => {
      it('should return same array when only one item', () => {
        const input = [{ name: 'Hamilton' }];
        const result = sortByProperty({
          array: input,
          property: 'name',
          sortBy: 'ASC',
        });
        expect(result).toEqual(input);
      });
    });

    // Test cases for default sortBy parameter
    describe('default sortBy parameter', () => {
      const drivers = [
        { name: 'Hamilton' },
        { name: 'Verstappen' },
        { name: 'Leclerc' },
      ];

      it('should sort in ascending sortBy when sortBy parameter is omitted', () => {
        const result = sortByProperty({
          array: drivers,
          property: 'name',
        });
        expect(result[0].name).toBe('Hamilton');
        expect(result[1].name).toBe('Leclerc');
        expect(result[2].name).toBe('Verstappen');
      });
    });
  });

  describe('formatValidationErrors', () => {
    it('should format single validation error', () => {
      const errors: ValidationError[] = [
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
          },
        },
      ];

      const result = formatValidationErrors(errors);
      expect(result).toEqual({
        name: ['name should not be empty'],
      });
    });

    it('should format multiple validation errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
            isString: 'name must be a string',
          },
        },
        {
          property: 'age',
          constraints: {
            isNumber: 'age must be a number',
          },
        },
      ];

      const result = formatValidationErrors(errors);
      expect(result).toEqual({
        name: ['name should not be empty', 'name must be a string'],
        age: ['age must be a number'],
      });
    });

    it('should handle errors without constraints', () => {
      const errors: ValidationError[] = [
        {
          property: 'name',
        },
      ];

      const result = formatValidationErrors(errors);
      expect(result).toEqual({
        name: ['Validation failed'],
      });
    });

    it('should handle empty errors array', () => {
      const result = formatValidationErrors([]);
      expect(result).toEqual({});
    });

    it('should handle nested validation errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'address',
          children: [
            {
              property: 'street',
              constraints: {
                isNotEmpty: 'street should not be empty',
              },
            },
          ],
        },
      ];

      const result = formatValidationErrors(errors);
      expect(result).toEqual({
        address: ['Validation failed'],
      });
    });

    it('should handle multiple errors for the same property', () => {
      const errors: ValidationError[] = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be a valid email',
            isNotEmpty: 'email should not be empty',
          },
        },
      ];

      const result = formatValidationErrors(errors);
      expect(result).toEqual({
        email: ['email must be a valid email', 'email should not be empty'],
      });
    });
  });
});
