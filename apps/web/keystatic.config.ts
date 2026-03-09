import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local', // We use 'local' for development, we will switch to 'github' in production
  },
  collections: {
    projects: collection({
      label: 'Featured Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.document({ label: 'Content', formatting: true, dividers: true, links: true }),
      },
    }),
  },
});
