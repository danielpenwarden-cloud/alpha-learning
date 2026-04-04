// Pre-written demo content for demo mode users
// This avoids calling the Claude API while giving demo users a taste of the features

export const DEMO_INSIGHTS = {
  strengths: [
    { title: 'Strong Motor Development', detail: 'Motor skills score 79% vs age — above the 75th percentile. Pencil grip (M01) and name writing (M02) are particularly strong at proficient level.' },
    { title: 'Social-Emotional Resilience', detail: 'Social domain at 68% vs age with strong self-regulation (S01) and empathy (S04). These skills support all other learning domains.' },
  ],
  focusAreas: [
    { title: 'Alphabet Knowledge Gap', milestoneId: 'L03', detail: 'Uppercase letter identification is at 42% — target 20-26 letters by age 5. Multi-sensory approaches (sand tracing, magnetic letters) recommended.' },
    { title: 'Counting Beyond 10', milestoneId: 'N04', detail: 'Rote counting to 20 is emerging. Focus on the tricky teen numbers (13-19) with songs and physical counting.' },
  ],
  crossDomain: [
    { title: 'Motor Skills Support Literacy', detail: 'Strong pencil grip (M01 proficient) creates a foundation for letter writing (L03). Leverage this by combining letter tracing with fine motor practice.' },
    { title: 'Social Skills Enable Group Learning', detail: 'Good self-regulation (S01) and following directions (S05) mean structured group activities will be effective for literacy and numeracy gains.' },
  ],
  plateauAlerts: [
    { milestoneId: 'L08', title: 'Sight Words Stalled', detail: 'Sight word recognition has been at emerging level for 2+ weeks.', suggestion: 'Try a word wall at home. Point out "I", "a", "the" during shared reading. Reading Eggs tricky words module can help.' },
  ],
  nextBestStep: [
    { domain: 'literacy', milestoneId: 'L03', title: 'Alphabet Flashcard Blitz', detail: 'Introduce 3-4 new uppercase letters per week. Use salt tray tracing, playdough building, and sky-writing for multi-sensory learning.' },
    { domain: 'numeracy', milestoneId: 'N04', title: 'Teen Number Songs', detail: 'Focus on counting 11-20 using number songs. Count physical objects beyond 10 during snack time and play.' },
    { domain: 'social', milestoneId: 'S07', title: 'Persistence Practice', detail: 'Introduce progressively challenging puzzles. Praise effort over outcome to build growth mindset.' },
    { domain: 'motor', milestoneId: 'M03', title: 'Scissor Skills Upgrade', detail: 'Practice cutting along curved lines. Start with thick markers, progress to printed lines. Cut-and-paste craft activities work well.' },
  ],
  benchmarkNote: 'Overall positioning is stronger against NZ Te Whāriki expectations (which emphasize holistic development) than US Common Core (which is more academically rigorous at this age). Literacy is the primary area where US benchmarks demand faster progress.',
};

export const DEMO_WORKSHEETS = {
  literacy: {
    title: 'Letter Explorer — Literacy Worksheet',
    domain: 'literacy',
    instructions: 'Read each prompt aloud to your child. Help them trace carefully and celebrate each letter they recognize!',
    activities: [
      { type: 'trace', prompt: 'Trace the letters A, B, and C', content: 'A B C', hint: 'Start at the top of each letter' },
      { type: 'trace', prompt: 'Trace your name', content: 'Demo Child', hint: 'Use a pencil and go slowly' },
      { type: 'match', prompt: 'Draw a line from each letter to its picture', content: 'A-apple,B-ball,C-cat', hint: 'Say the letter sound as you match' },
      { type: 'circle', prompt: 'Circle all the letter As you can find', content: 'A,3,B,A,C,A,7,A', hint: 'There are 4 hidden!' },
      { type: 'write', prompt: 'Try to write the letter D on your own', content: 'D', hint: 'Start with a straight line down, then add the bump' },
      { type: 'count', prompt: 'Count the letters in the word CAT', content: 'cat', hint: 'Touch each letter as you count' },
    ],
  },
  numeracy: {
    title: 'Number Fun — Numeracy Worksheet',
    domain: 'numeracy',
    instructions: 'Read each activity aloud. Use fingers, blocks, or toys to make counting hands-on!',
    activities: [
      { type: 'trace', prompt: 'Trace the numbers 1 through 5', content: '1 2 3 4 5', hint: 'Say each number as you trace it' },
      { type: 'count', prompt: 'Count all the stars', content: '7', hint: 'Touch each star as you count' },
      { type: 'compare_groups', prompt: 'Which group has more dots? Circle the bigger group', content: '3,6', hint: 'Count each group carefully' },
      { type: 'shapes', prompt: 'Name each shape. Can you find these shapes in your room?', content: 'circle,square,triangle,rectangle', hint: 'A clock is a circle, a window is a rectangle' },
      { type: 'write', prompt: 'What number comes next? Fill in the blanks', content: '1, 2, ___    4, 5, ___    7, 8, ___', hint: 'Count forward — what comes after each pair?' },
      { type: 'trace', prompt: 'Trace the numbers 6 through 10', content: '6 7 8 9 10', hint: 'Remember: 6 and 9 look similar but face different ways!' },
    ],
  },
  social: {
    title: 'Feelings & Friends — Social-Emotional Worksheet',
    domain: 'social',
    instructions: 'Talk through each activity together. There are no wrong answers — feelings are important to explore!',
    activities: [
      { type: 'emotions', prompt: 'Point to the happy face. Now show me YOUR happy face!', content: 'happy,sad,angry,surprised', hint: 'All feelings are okay to have' },
      { type: 'draw', prompt: 'Draw a picture of something that makes you happy', content: '', hint: 'It could be a person, place, animal, or toy' },
      { type: 'breathing', prompt: 'Let\'s do breathing together! Breathe in for 4 counts, out for 4 counts', content: '4', hint: 'This helps when we feel big emotions' },
      { type: 'emotions', prompt: 'How would you feel if your friend shared their toy with you? Point to the face', content: 'happy,sad,surprised,neutral' },
      { type: 'circle', prompt: 'Circle the small problems you could solve by yourself', content: 'spilled_milk,scraped_knee,lost_toy,broken_crayon', hint: 'You can handle more than you think!' },
      { type: 'draw', prompt: 'Draw a picture of you helping a friend', content: '' },
    ],
  },
  motor: {
    title: 'Hands at Work — Motor Skills Worksheet',
    domain: 'motor',
    instructions: 'These activities build hand strength and control. Encourage steady, careful movements.',
    activities: [
      { type: 'trace', prompt: 'Trace these letters carefully from left to right', content: 'A B C D E', hint: 'Start at the top of each letter' },
      { type: 'color', prompt: 'Color each shape a different color', content: 'circle,square,triangle', hint: 'Try to stay inside the lines' },
      { type: 'cut_shape', prompt: 'Cut along the dashed line to cut out this shape', content: 'square', hint: 'Turn the paper, not the scissors' },
      { type: 'draw', prompt: 'Draw a person with a head, body, arms, and legs', content: '', hint: 'Don\'t forget eyes, nose, and mouth!' },
      { type: 'write', prompt: 'Write your name as neatly as you can', content: 'Demo Child', hint: 'Take your time with each letter' },
      { type: 'cut_shape', prompt: 'Cut out the circle — follow the dashed line carefully', content: 'circle', hint: 'Circles are tricky — go slowly!' },
    ],
  },
};
