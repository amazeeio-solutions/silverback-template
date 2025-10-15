# Yoast SEO architecture and our customisation:

## Core Components:

- Researcher: The base analysis engine that provides research methods (like word
  count, sentence parsing, etc.)
- Researches: Individual analysis methods (like counting keywords, analyzing
  sentence structure)
- Assessor: Uses research results to make assessments about content quality
- Assessments: Individual tests that score specific aspects of content

## The Analysis Flow

```
    Paper[Paper with Content] --> Researcher
    Researcher --> |provides data| Assessor
    Assessor --> |runs| Assessments
    Assessments --> |produce| Results
```

## Customisation

Instead of using separate ContentAssessor and SeoAssessor, we're creating a
UniversalAssessor that: Combines SEO, readability, and technical assessments in
one place Organizes assessments into logical categories and subcategories Makes
it easier to customize which assessments to include Provides better frontend
organization of results
