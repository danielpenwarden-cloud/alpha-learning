export const METHODOLOGY = {
  intro: "Alpha Learning uses a quad-benchmark system to track Lani's development against US, NZ, AU, and UK/Cambridge standards. This page explains exactly how we calculate scores, where our data comes from, and what the limitations are.",

  frameworks: [
    {
      id: 'us',
      flag: '\u{1F1FA}\u{1F1F8}',
      name: 'United States (Primary)',
      label: 'US',
      color: '#f97316',
      description: 'Primary benchmark because the family follows the Alpha School curriculum, which is US-based and mastery-focused.',
      sources: [
        {
          name: 'Head Start Early Learning Outcomes Framework (ELOF)',
          description: 'Federal framework defining developmental expectations from birth to age 5 across 5 domains. We map our 4 domains to ELOF central domains.',
          url: 'https://eclkc.ohs.acf.hhs.gov/school-readiness/article/head-start-early-learning-outcomes-framework',
        },
        {
          name: 'DIBELS 8th Edition',
          description: 'Dynamic Indicators of Basic Early Literacy Skills. Provides percentile norms for letter naming, phonemic awareness, and early reading. Our literacy percentile curves are anchored to DIBELS K-entry norms.',
          url: 'https://dibels.uoregon.edu/',
        },
        {
          name: 'Common Core State Standards (Kindergarten)',
          description: 'Defines end-of-Kindergarten expectations. We use these as the "age 5-6" ceiling targets for milestone completion.',
          url: 'https://www.corestandards.org/',
        },
        {
          name: 'NCES Kindergarten Entry Studies',
          description: 'National Center for Education Statistics longitudinal studies providing population-level percentile distributions at school entry.',
        },
        {
          name: 'NWEA MAP Growth (Ages 6-18)',
          description: 'Measures of Academic Progress normative data providing percentile growth trajectories from kindergarten through grade 12. Used as the primary source for US age 6-18 percentile curves.',
        },
        {
          name: 'Common Core State Standards Grades 1-12 (Ages 6-18)',
          description: 'Grade-level expectations across ELA and Mathematics from elementary through high school. Defines proficiency targets mapped to our extended age range.',
        },
        {
          name: 'SAT/ACT Norms (Ages 16-18)',
          description: 'College readiness assessment percentile distributions used to anchor the upper end of literacy and numeracy curves for ages 16-18.',
        },
      ],
    },
    {
      id: 'nz',
      flag: '\u{1F1F3}\u{1F1FF}',
      name: 'New Zealand (Secondary)',
      label: 'NZ',
      color: '#0ea5e9',
      description: 'Secondary benchmark because Lani will enter the NZ school system mid-2026. NZ takes a more holistic, play-based approach in early childhood.',
      sources: [
        {
          name: 'Te Wh\u0101riki',
          description: "NZ's early childhood curriculum framework. Emphasizes holistic development through 5 strands: Wellbeing (Mana Atua), Belonging (Mana Whenua), Contribution (Mana Tangata), Communication (Mana Reo), Exploration (Mana Aot\u016Broa). Less prescriptive than US standards.",
        },
        {
          name: 'School Entry Assessment (SEA)',
          description: 'Assessment tool used when children start school (typically at age 5 in NZ). Covers literacy and numeracy readiness. Our "vs NZ" scores approximate SEA-readiness.',
        },
        {
          name: 'NZ Curriculum Level 1',
          description: 'The first level of the NZ national curriculum (Years 1-3). We map milestone targets to the transition expectations from Te Wh\u0101riki to Curriculum Level 1.',
        },
        {
          name: 'Ministry of Education Guidelines',
          description: 'MoE publications on school readiness expectations and transition to school.',
        },
        {
          name: 'e-asTTle (Ages 6-16)',
          description: 'NZ online assessment tool for reading, writing, and mathematics providing normative percentile data across NZ Curriculum Levels 2-6.',
        },
        {
          name: 'PAT (Progressive Achievement Tests) (Ages 6-16)',
          description: 'Standardised NZ assessments in reading, mathematics, and listening. Normed on NZ student populations providing percentile benchmarks.',
        },
        {
          name: 'NZ Curriculum Levels 1-8 (Ages 5-18)',
          description: 'The full NZ national curriculum spanning primary through secondary. Achievement objectives at each level inform our extended NZ percentile curves.',
        },
        {
          name: 'NCEA Levels 1-3 (Ages 15-18)',
          description: 'National Certificate of Educational Achievement standards and achievement data. Used to anchor NZ senior secondary expectations.',
        },
      ],
    },
    {
      id: 'au',
      flag: '\u{1F1E6}\u{1F1FA}',
      name: 'Australia (Secondary)',
      label: 'AU',
      color: '#22c55e',
      description: 'Included as an additional reference point. AU standards fall between US (more academic) and NZ (more holistic).',
      sources: [
        {
          name: 'Early Years Learning Framework V2.0 (EYLF)',
          description: "Australia's national early childhood framework. 5 outcomes: Identity, Community, Wellbeing, Learning, Communication. Similar holistic approach to NZ's Te Wh\u0101riki.",
        },
        {
          name: 'Australian Curriculum: Foundation Year',
          description: 'Defines expectations for the first year of formal schooling (age 5-6). More structured than EYLF. Our milestone targets reference Foundation year expectations.',
        },
        {
          name: 'AEDC (Australian Early Development Census)',
          description: 'Population-level data on developmental outcomes at school entry. Provides percentile distributions we use for benchmarking.',
        },
        {
          name: 'NAPLAN Year 3 (backward-mapped)',
          description: 'While NAPLAN is tested in Year 3, we backward-map expected trajectories to estimate age-5 readiness.',
        },
        {
          name: 'NAPLAN Years 3-9 (Ages 8-15)',
          description: 'National Assessment Program data across reading, writing, numeracy, and conventions. Provides population percentile distributions at Years 3, 5, 7, and 9.',
        },
        {
          name: 'Australian Curriculum F-10 (Ages 5-16)',
          description: 'Full Australian national curriculum from Foundation to Year 10. Achievement standards at each year level inform the extended AU percentile curves.',
        },
        {
          name: 'ATAR Pathway (Ages 16-18)',
          description: 'Australian Tertiary Admission Rank preparation pathway. Senior secondary achievement norms used to anchor the upper end of AU curves.',
        },
      ],
    },
    {
      id: 'uk',
      flag: '\u{1F1EC}\u{1F1E7}',
      name: 'United Kingdom / Cambridge (Secondary)',
      label: 'UK',
      color: '#8b5cf6',
      description: 'Included as an additional benchmark relevant to international schools following Cambridge International curriculum. UK EYFS standards sit between US (more academic at K-entry) and NZ (more holistic), offering a balanced reference point.',
      sources: [
        {
          name: 'Early Years Foundation Stage (EYFS) Profile',
          description: "England's statutory framework for children from birth to age 5. Covers 7 areas of learning: Communication & Language, Physical Development, Personal Social & Emotional Development, Literacy, Mathematics, Understanding the World, and Expressive Arts & Design. Assessment at age 5 uses 17 Early Learning Goals.",
        },
        {
          name: 'Development Matters',
          description: 'Non-statutory curriculum guidance for the EYFS, providing age-related expectations and developmental checkpoints from birth to Reception. Used as the primary source for our UK percentile curves.',
        },
        {
          name: 'Cambridge Early Years Framework',
          description: 'Cambridge International\u2019s early years curriculum framework used by international schools worldwide. Builds on EYFS principles with a global perspective. Particularly relevant for families considering international school pathways.',
        },
        {
          name: 'UK National Curriculum KS1',
          description: 'Key Stage 1 (Years 1-2, ages 5-7) expectations define the ceiling targets for school readiness. We backward-map KS1 expectations to estimate age-5 readiness benchmarks, similar to our approach with Common Core K in the US.',
        },
        {
          name: 'KS1-KS4 SATs & Assessments (Ages 5-16)',
          description: 'Key Stage assessments at ages 7, 11, 14, and 16 provide population-level percentile data across English and Mathematics. Used as anchoring points for the extended UK curves.',
        },
        {
          name: 'Cambridge Primary & Lower Secondary (Ages 5-14)',
          description: 'Cambridge International assessment frameworks for primary (stages 1-6) and lower secondary (stages 7-9). Particularly relevant for international school pathways.',
        },
        {
          name: 'GCSE / IGCSE (Ages 14-16)',
          description: 'General Certificate of Secondary Education grade distributions provide percentile benchmarks for the age 14-16 range. IGCSE norms are used for the international school context.',
        },
        {
          name: 'A-Levels (Ages 16-18)',
          description: 'Advanced Level examination grade distributions anchor the upper end of UK/Cambridge curves for ages 16-18.',
        },
      ],
    },
  ],

  scoringMethodology: {
    title: 'How Scores Are Calculated',
    sections: [
      {
        heading: 'Domain Scores (vs Own Age)',
        content: 'Each domain score represents the percentage of age-appropriate skills mastered within that domain. We calculate this by weighting each milestone based on its difficulty level, summing completed milestones, and comparing against the expected completion rate for the child\'s current age using the percentile curves.',
      },
      {
        heading: 'Domain Scores (vs Age 5)',
        content: 'The "vs Age 5" score shows where the child currently sits compared to where they need to be at age 5 (school entry). This uses the age-5 column of the percentile data as the reference point. A score of 68% means the child has achieved 68% of the age-5 target.',
      },
      {
        heading: 'Percentile Bands',
        content: 'The growth-chart style visualization shows 5 percentile bands: p10, p25, p50 (median), p75, and p90. These represent population-level distributions. The child\'s score is plotted against these bands to show relative position. Being at p50 means performing at the median for their age.',
      },
      {
        heading: 'Milestone Status Levels',
        content: 'Each milestone has 5 status levels: Not Started (0%), Emerging (1-25%), In Progress (26-74%), Proficient (75-89%), and Mastered (90-100%). These map roughly to educational assessment language used across all three frameworks.',
      },
      {
        heading: 'Extended Age 6-18 Projections',
        content: 'The growth charts extend beyond early childhood to show projected developmental trajectories through age 18. Data for ages 6-18 is derived from published assessment norms (NWEA MAP, NAPLAN, e-asTTle, KS2 SATs) and curriculum framework expectations. These extended projections are less precise than the early childhood data and should be interpreted as general trajectory indicators rather than specific predictions.',
      },
    ],
  },

  vs5yrExplanation: {
    title: 'Understanding "vs Age 5"',
    content: 'The "vs Age 5" comparison is the most important metric for school readiness planning. It answers: "If Lani were entering school today at age 5, what percentile would she be at?" This is calculated by taking her current skill levels and comparing them against the age-5 (60 months) row of the percentile data. For example, if Lani\'s literacy score is 38% mastery and the US age-5 median is 68%, she\'s at approximately the 25th-35th percentile relative to age-5 entry standards. This is expected and on-track for a 4yr 8mo old — she has ~8 months of growth ahead.',
  },

  disclaimer: {
    title: 'Important Disclaimer',
    content: 'All scores in Alpha Learning are estimates based on parent-reported observations and informal assessments. They are NOT equivalent to formal standardized test results (DIBELS, ASQ-3, etc.). The percentile curves are approximations derived from published research norms, not from direct population sampling. Use these scores as a helpful tracking tool and conversation starter with educators — not as a diagnostic or placement instrument. If you have concerns about any area of development, consult with a qualified early childhood professional.',
  },
};
