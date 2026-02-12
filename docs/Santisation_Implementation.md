# Data Sanitization Guide

This document explains how to use the sanitization utility to prevent XSS attacks.

To run the automated test, use the following in the CLI
npm test -- --run sanitize


To see manual testing results, navigate to docs > testing > NextClick ERP Forms Test Cases

---

## Overview

The `sanitize.ts` utility provides two functions:

| Function | Purpose |
|----------|---------|
| `sanitizeString(input)` | Sanitizes a single string value |
| `sanitizeFormData(data)` | Sanitizes all string fields in an object |

Both functions use **DOMPurify** to strip all HTML tags from input, preventing XSS attacks.

---

## Import

```typescript
import { sanitizeString, sanitizeFormData } from '@/shared/utils/sanitize';
```

---

## Usage Examples

### 1. Sanitizing a Single String

Use `sanitizeString` when you need to sanitize an individual field:

```typescript
import { sanitizeString } from '@/shared/utils/sanitize';

const userInput = '<script>alert("xss")</script>John';
const cleanInput = sanitizeString(userInput);
// Result: "John"
```

### 2. Sanitizing Entire Form Data

Use `sanitizeFormData` when submitting a form with multiple string fields:

```typescript
import { sanitizeFormData } from '@/shared/utils/sanitize';

const formData = {
  name: '<script>alert("xss")</script>John',
  email: 'john@example.com',
  department: '<iframe>Engineering</iframe>',
  age: 25  // Non-string fields are ignored
};

const cleanData = sanitizeFormData(formData);
// Result: {
//   name: "John",
//   email: "john@example.com",
//   department: "",  // Note: content inside malicious tags is removed
//   age: 25
// }
```

---

## Applying to Form Submissions

### React Hook Form Example

Sanitize data in your form's `onSubmit` handler **before** sending to the API:

```typescript
import { sanitizeFormData } from '@/shared/utils/sanitize';

function MyForm() {
  const form = useForm<FormSchema>();

  const handleSubmit = (data: FormSchema) => {
    // Sanitize all string fields
    const sanitized = sanitizeFormData(data);
    
    // Then send to API
    createMutation.mutate(sanitized);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

### Sanitizing Specific Fields Only

If you only need to sanitize certain fields:

```typescript
import { sanitizeString } from '@/shared/utils/sanitize';

const handleSubmit = (data: FormSchema) => {
  const sanitized = {
    ...data,
    summary: sanitizeString(data.summary),
    notes: sanitizeString(data.notes),
    // other fields remain unchanged
  };
  
  createMutation.mutate(sanitized);
};
```

---

## Important Behavior Notes

### 1. Content Inside Malicious Tags

DOMPurify removes **both** the malicious tag and its content:

```typescript
sanitizeString('<iframe>Engineering</iframe>')  // Returns: ""
sanitizeString('<script>bad</script>Safe Text') // Returns: "Safe Text"
```

To preserve content, ensure it's outside the tags:
```typescript
sanitizeString('<svg onload=alert()></svg>Engineering') // Returns: "Engineering"
```

### 2. Server-Side Rendering (SSR)

The utility handles SSR automatically:
- **Browser**: Uses DOMPurify (full protection)
- **Server**: Falls back to regex-based tag removal

### 3. Non-String Fields

`sanitizeFormData` only processes string fields. Numbers, booleans, nulls, and nested objects are passed through unchanged.

---

## Existing Implementations

Forms already using sanitization:

| Feature | File | Method |
|---------|------|--------|
| Clients (Create) | `ClientFormDialog.tsx` | `sanitizeFormData` |
| Clients (Edit) | `ClientEditDialog.tsx` | `sanitizeFormData` |
| Employees | `EmployeeForm.tsx` | `sanitizeFormData` |
| Projects | `ProjectFormDialog.tsx` | `sanitizeFormData` |
| Milestones | `MilestoneFormDialog.tsx` | `sanitizeFormData` |
| Communications (Create) | `CommunicationFormDialog.tsx` | `sanitizeString` |
| Communications (Edit) | `CommunicationEditDialog.tsx` | `sanitizeString` |
| Team Members | `TeamMembersDialog.tsx` | `sanitizeString` |

---

## Quick Reference

```typescript
// Single field
const clean = sanitizeString(dirty);

// Entire form object
const cleanForm = sanitizeFormData(dirtyForm);

// In form handler
const handleSubmit = (data) => {
  const sanitized = sanitizeFormData(data);
  mutation.mutate(sanitized);
};
```



