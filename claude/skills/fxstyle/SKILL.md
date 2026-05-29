---
name: fxstyle
description: Blueprint and Guidelines for building Web Applications (auth, user managemente, landigng pages, ui, basic features and so on)
---

# General Considerations

- Zod for Validation (backend and frontend)

# Dashboard considerations

- create a command palette for navigate between al pages
- create a profile page, inside this page a user can:
    - update its information
    - change the password
    - change avatar (if the platform has upload file feature)

# Single Dashboard Page

- Any CRUD page in dashboard has to be conform with:
    - a page with table and a button that redirects to new page, and with the following features:
      - Search
      - Filter by column
      - Pagination
      - the email column must have a icon of a paper to copy the email to the clipboar
    - the new page has a form, this form is reusable for create and edit

Management admin page (CRUD table with search, column filters, pagination, and copy-email-to-clipboard). Asks which platforms to use before starting.
