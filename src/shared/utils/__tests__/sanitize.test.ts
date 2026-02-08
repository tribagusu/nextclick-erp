/**
 * Sanitization Utility Tests
 *
 * Tests for XSS prevention and data sanitization.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeFormData } from '../sanitize';

describe('sanitizeString', () => {
  describe('XSS Prevention', () => {
    it('removes script tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('removes script tags with content between them', () => {
      expect(sanitizeString('Hello<script>document.cookie</script>World')).toBe('HelloWorld');
    });

    it('removes img tags with onerror handlers', () => {
      expect(sanitizeString('<img src="x" onerror="alert(\'xss\')">Text')).toBe('Text');
    });

    it('removes img tags with onload handlers', () => {
      expect(sanitizeString('<img src="valid.jpg" onload="malicious()">Photo')).toBe('Photo');
    });

    it('removes div tags with event handlers', () => {
      expect(sanitizeString('<div onmouseover="alert(\'xss\')">Content</div>')).toBe('Content');
    });

    it('removes anchor tags with javascript URLs', () => {
      expect(sanitizeString('<a href="javascript:alert(\'xss\')">Click me</a>')).toBe('Click me');
    });

    it('removes iframe tags', () => {
      expect(sanitizeString('<iframe src="evil.com"></iframe>Safe content')).toBe('Safe content');
    });

    it('removes style tags', () => {
      expect(sanitizeString('<style>body{display:none}</style>Visible text')).toBe('Visible text');
    });

    it('removes svg tags with onload', () => {
      expect(sanitizeString('<svg onload="alert(\'xss\')">icon</svg>Text')).toBe('Text');
    });

    it('removes object tags', () => {
      expect(sanitizeString('<object data="malware.swf"></object>Content')).toBe('Content');
    });

    it('removes embed tags', () => {
      expect(sanitizeString('<embed src="malware.swf">Content')).toBe('Content');
    });

    it('removes form tags', () => {
      expect(sanitizeString('<form action="evil.com"><input></form>Text')).toBe('Text');
    });

    it('removes nested malicious tags', () => {
      expect(sanitizeString('<div><script>alert(1)</script><span onclick="bad()">Text</span></div>')).toBe('Text');
    });

    it('handles multiple script tags', () => {
      expect(sanitizeString('<script>a</script>Hello<script>b</script>World<script>c</script>')).toBe('HelloWorld');
    });
  });

  describe('Valid Content Preservation', () => {
    it('preserves plain text', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });

    it('preserves text with apostrophes', () => {
      expect(sanitizeString("John O'Brien")).toBe("John O'Brien");
    });

    it('preserves text with ampersands', () => {
      expect(sanitizeString('Tom & Jerry')).toBe('Tom & Jerry');
    });

    it('preserves text with special characters', () => {
      expect(sanitizeString('Price: $500 (50% off)')).toBe('Price: $500 (50% off)');
    });

    it('preserves email addresses', () => {
      expect(sanitizeString('Contact: test@example.com')).toBe('Contact: test@example.com');
    });

    it('preserves phone numbers', () => {
      expect(sanitizeString('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    });

    it('preserves unicode characters', () => {
      expect(sanitizeString('CafÃ© rÃ©sumÃ© naÃ¯ve')).toBe('CafÃ© rÃ©sumÃ© naÃ¯ve');
    });

    it('preserves newlines and whitespace', () => {
      expect(sanitizeString('Line 1\nLine 2\tTabbed')).toBe('Line 1\nLine 2\tTabbed');
    });

    it('preserves numbers', () => {
      expect(sanitizeString('Total: 12345.67')).toBe('Total: 12345.67');
    });

    it('preserves text with quotes', () => {
      expect(sanitizeString('He said "Hello" to her')).toBe('He said "Hello" to her');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('handles string with only whitespace', () => {
      expect(sanitizeString('   ')).toBe('   ');
    });

    it('handles string with only HTML tags (returns empty)', () => {
      expect(sanitizeString('<script></script>')).toBe('');
    });

    it('handles malformed HTML', () => {
      expect(sanitizeString('<script>alert(')).toBe('');
    });

    it('handles encoded HTML entities in script', () => {
      // DOMPurify should handle this
      const result = sanitizeString('&lt;script&gt;alert()&lt;/script&gt;Text');
      expect(result).not.toContain('<script>');
    });
  });
});

describe('sanitizeFormData', () => {
  describe('String Field Sanitization', () => {
    it('sanitizes all string fields in an object', () => {
      const input = {
        name: '<script>bad</script>John',
        email: 'test@example.com',
        notes: '<img src=x onerror=alert()>Some notes',
      };

      const result = sanitizeFormData(input);

      expect(result.name).toBe('John');
      expect(result.email).toBe('test@example.com');
      expect(result.notes).toBe('Some notes');
    });

    it('preserves non-string fields unchanged', () => {
      const input = {
        name: '<script>bad</script>John',
        age: 25,
        active: true,
        score: 99.5,
        data: null,
        items: undefined,
      };

      const result = sanitizeFormData(input);

      expect(result.name).toBe('John');
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
      expect(result.score).toBe(99.5);
      expect(result.data).toBeNull();
      expect(result.items).toBeUndefined();
    });
  });

  describe('Form-like Objects', () => {
    it('sanitizes client form data', () => {
      const clientForm = {
        name: '<script>alert()</script>Acme Corp',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        company_name: '<img src=x>Acme Inc',
        address: '123 Main St<script>bad</script>',
        notes: 'Important client<div onclick="bad()">notes here</div>',
      };

      const result = sanitizeFormData(clientForm);

      expect(result.name).toBe('Acme Corp');
      expect(result.email).toBe('contact@acme.com');
      expect(result.phone).toBe('+1-555-0123');
      expect(result.company_name).toBe('Acme Inc');
      expect(result.address).toBe('123 Main St');
      expect(result.notes).toBe('Important clientnotes here');
    });

    it('sanitizes project form data', () => {
      const projectForm = {
        project_name: '<iframe>Malicious</iframe>Website Redesign',
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        description: '<style>body{}</style>Build a new website for client',
        status: 'active',
        priority: 'high',
        total_budget: '5000',
        payment_terms: '<script>alert()</script>Net 30',
      };

      const result = sanitizeFormData(projectForm);

      expect(result.project_name).toBe('Website Redesign');
      expect(result.client_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.description).toBe('Build a new website for client');
      expect(result.status).toBe('active');
      expect(result.priority).toBe('high');
      expect(result.total_budget).toBe('5000');
      expect(result.payment_terms).toBe('Net 30');
    });

    it('sanitizes employee form data', () => {
      const employeeForm = {
        name: '<script>bad</script>Jane Smith',
        email: 'jane@company.com',
        phone: '',
        position: '<img onerror=alert()>Senior Developer',
        department: '<svg onload=alert()></svg>Engineering',
        status: 'active',
        salary: '75000',
      };

      const result = sanitizeFormData(employeeForm);

      expect(result.name).toBe('Jane Smith');
      expect(result.position).toBe('Senior Developer');
      expect(result.department).toBe('Engineering');
    });

    it('sanitizes communication form data', () => {
      const commForm = {
        client_id: 'uuid-here',
        date: '2026-01-28',
        mode: 'email',
        summary: '<script>steal()</script>Discussed project timeline and deliverables',
        follow_up_required: true,
      };

      const result = sanitizeFormData(commForm);

      expect(result.summary).toBe('Discussed project timeline and deliverables');
      expect(result.follow_up_required).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty object', () => {
      const result = sanitizeFormData({});
      expect(result).toEqual({});
    });

    it('handles object with empty strings', () => {
      const input = { name: '', notes: '' };
      const result = sanitizeFormData(input);
      expect(result.name).toBe('');
      expect(result.notes).toBe('');
    });

    it('does not mutate the original object', () => {
      const original = { name: '<script>bad</script>John' };
      const result = sanitizeFormData(original);

      expect(result.name).toBe('John');
      expect(original.name).toBe('<script>bad</script>John');
    });

    it('handles deeply nested objects (only sanitizes top level)', () => {
      const input = {
        name: '<script>bad</script>John',
        nested: { value: '<script>also bad</script>Nested' },
      };

      const result = sanitizeFormData(input);

      expect(result.name).toBe('John');
      // Note: Current implementation only sanitizes top-level strings
      expect(result.nested).toEqual({ value: '<script>also bad</script>Nested' });
    });
  });
});
