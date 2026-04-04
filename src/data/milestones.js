// All milestone definitions from the build spec
// Status values: 'not-started', 'emerging', 'in-progress', 'proficient', 'mastered'

export const MILESTONES = [
  // ── LITERACY (12 milestones) ──
  { id: 'L01', domainId: 'literacy', name: 'Name Recognition', description: 'Recognizes and spells own name', detail: 'Can identify and write own first name. Recognizes letters in and out of name context.', howToAssess: 'Ask child to write their name. Show name mixed with other words — can they find it?', howToTeach: 'Practice daily name writing. Use name cards, magnetic letters to build name.', age5Target: 'Expected by age 4.5', sortOrder: 1, difficultyLevel: 1 },
  { id: 'L02', domainId: 'literacy', name: 'Print Concepts', description: 'Understands how books and print work', detail: 'Holds books correctly, turns pages left-to-right, knows print carries meaning, points to text.', howToAssess: "Hand child a book upside down. Do they correct it? Do they point to text when 'reading'?", howToTeach: "Shared reading daily. Point to words as you read. Ask 'where do I start reading?'", age5Target: 'Expected by age 4', sortOrder: 2, difficultyLevel: 1 },
  { id: 'L03', domainId: 'literacy', name: 'Alphabet Knowledge (Uppercase)', description: 'Identifies and names uppercase letters', detail: 'Recognizes the 26 uppercase letters when shown individually.', howToAssess: 'Show letter flashcards in random order. Record which are identified correctly. Test weekly.', howToTeach: '3-4 new letters per week. Multi-sensory: trace in sand/salt tray, build with playdough, sky-write. Reading Eggs phonics modules.', age5Target: 'Age 5 target: 20-26 letters (77-100%)', sortOrder: 3, difficultyLevel: 2 },
  { id: 'L04', domainId: 'literacy', name: 'Letter-Sound Connections', description: 'Associates letters with their primary sounds', detail: 'Knows that each letter makes a sound. Can say the sound when shown the letter.', howToAssess: "Show letter, ask 'what sound does this make?' Record correct responses.", howToTeach: "Pair with alphabet knowledge. 'B says /b/ like ball.' Reading Eggs Sound Hounds game.", age5Target: 'Age 5 target: 15+ letter sounds', sortOrder: 4, difficultyLevel: 2 },
  { id: 'L05', domainId: 'literacy', name: 'Rhyming Awareness', description: 'Identifies and produces rhyming words', detail: 'Can hear when two words rhyme (cat/hat) and generate new rhymes.', howToAssess: "'Do cat and hat rhyme? Do cat and dog rhyme?' Then: 'What rhymes with sun?'", howToTeach: "Nursery rhymes, rhyming picture books (Dr. Seuss). Rhyming games: 'I say a word, you say one that rhymes.'", age5Target: 'Age 5 target: Identifies rhyming pairs consistently', sortOrder: 5, difficultyLevel: 2 },
  { id: 'L06', domainId: 'literacy', name: 'Syllable Segmentation', description: 'Claps out syllables in words', detail: 'Can break words into syllable parts by clapping or tapping.', howToAssess: "Say a word, child claps the parts: 'butterfly' (3 claps), 'cat' (1 clap).", howToTeach: "Start with child's name: La-ni (2). Use familiar words. Make it physical — jump for each syllable.", age5Target: 'Age 5 target: Segments 2-3 syllable words', sortOrder: 6, difficultyLevel: 2 },
  { id: 'L07', domainId: 'literacy', name: 'Initial Sound Isolation', description: 'Identifies the first sound in a word', detail: "Can tell you what sound a word starts with: 'ball' starts with /b/.", howToAssess: "'What sound does 'fish' start with?' Test with 10 words.", howToTeach: "I-Spy with sounds: 'I spy something starting with /s/.' Sort objects by first sound.", age5Target: 'Age 5 target: Isolates initial sound in CVC words', sortOrder: 7, difficultyLevel: 3 },
  { id: 'L08', domainId: 'literacy', name: 'Sight Words (10)', description: 'Reads 10 high-frequency words on sight', detail: 'Instantly recognizes: I, a, the, is, my, to, and, go, no, we.', howToAssess: 'Flash each word on a card. Instant recognition = mastered. Hesitation = still learning.', howToTeach: "Word wall at home. Point them out in books. Reading Eggs tricky words module.", age5Target: 'Age 5 target: 5-10 sight words', sortOrder: 8, difficultyLevel: 3 },
  { id: 'L09', domainId: 'literacy', name: 'Story Retelling', description: 'Retells a familiar story in sequence', detail: 'Can describe characters, setting, and retell beginning \u2192 middle \u2192 end.', howToAssess: "Read a short story, then ask 'what happened?' Listen for sequence and key details.", howToTeach: "After reading, ask: 'What happened first? Then what? How did it end?' Use picture prompts.", age5Target: 'Age 5 target: Retells 3-part sequence with detail', sortOrder: 9, difficultyLevel: 2 },
  { id: 'L10', domainId: 'literacy', name: 'Listening Comprehension', description: 'Answers questions about a story read aloud', detail: 'Can answer who/what/where/why questions about a story heard.', howToAssess: "Read a story, ask 5 questions: who, what happened, where, why, what might happen next.", howToTeach: "Pause during reading to ask predictions. After: 'Why did the bear do that?'", age5Target: 'Age 5 target: Answers 4/5 comprehension questions', sortOrder: 10, difficultyLevel: 2 },
  { id: 'L11', domainId: 'literacy', name: 'Vocabulary (Expressive)', description: 'Uses 2000+ words, speaks in complex sentences', detail: 'Uses descriptive language, 5-6 word sentences, explains ideas clearly.', howToAssess: "Observe daily speech. Can child explain how something works? Describe a picture in detail?", howToTeach: "Rich conversation. Expand their sentences: Child says 'big dog.' You say 'Yes, that\u2019s a big brown dog running fast!'", age5Target: 'Age 5 target: Complex sentences, explains ideas', sortOrder: 11, difficultyLevel: 2 },
  { id: 'L12', domainId: 'literacy', name: 'CVC Word Decoding', description: 'Sounds out and reads simple 3-letter words', detail: "Can blend /c/ /a/ /t/ to read 'cat'. Reads simple CVC words independently.", howToAssess: "Show 10 CVC words (cat, dog, sit, run, etc.). Can child sound them out and read them?", howToTeach: "Sound boxes: 3 squares, one sound per square. Blend together. Reading Eggs decoding levels.", age5Target: 'Age 5 (end of K): Reads CVC words', sortOrder: 12, difficultyLevel: 4 },

  // ── NUMERACY (12 milestones) ──
  { id: 'N01', domainId: 'numeracy', name: 'Rote Counting 1-10', description: 'Counts aloud 1-10 in sequence', howToAssess: 'Ask child to count as high as they can. Note where they stop or make errors.', howToTeach: 'Counting songs, count during daily routines (stairs, snacks, toys).', age5Target: 'Expected by age 4.5', sortOrder: 1, difficultyLevel: 1 },
  { id: 'N02', domainId: 'numeracy', name: '1:1 Correspondence', description: 'Points to each object while counting \u2014 one number per object', howToAssess: 'Give 10 blocks, ask to count them. Watch if finger matches count.', howToTeach: 'Touch-and-count everything: grapes, stairs, buttons. Slow and deliberate.', age5Target: 'Age 5 target: Accurate to 10+', sortOrder: 2, difficultyLevel: 1 },
  { id: 'N03', domainId: 'numeracy', name: 'Number Recognition 0-10', description: 'Identifies written numerals 0 through 10', howToAssess: 'Show numeral flashcards in random order. Record which are identified.', howToTeach: "Number cards, number puzzles, 'find the number' hunts. Note: 6 and 9 confusion is common.", age5Target: 'Age 5 target: All numerals 0-10', sortOrder: 3, difficultyLevel: 2 },
  { id: 'N04', domainId: 'numeracy', name: 'Counting to 20', description: 'Counts aloud 1-20 reliably', howToAssess: 'Ask child to count to 20. Note skips, errors, ceiling.', howToTeach: "Number songs (especially teens \u2014 'thirteen, fourteen...'). Count objects beyond 10.", age5Target: 'Age 5 target: Counts to 20 without errors', sortOrder: 4, difficultyLevel: 2 },
  { id: 'N05', domainId: 'numeracy', name: 'Shape Recognition', description: 'Names circle, square, triangle, rectangle', howToAssess: 'Show shapes in various sizes/orientations. Can child name them?', howToTeach: "Shape hunts in environment. 'What shape is the window? The wheel?'", age5Target: 'Expected by age 4.5', sortOrder: 5, difficultyLevel: 1 },
  { id: 'N06', domainId: 'numeracy', name: 'Comparing Quantities', description: 'Uses more, less/fewer, same correctly', howToAssess: "'Two groups of objects: 'Which has more? Which has fewer? Are they the same?'", howToTeach: "'Snack time comparisons. 'You have 3 grapes, I have 5. Who has more?'", age5Target: 'Age 5 target: Compares groups up to 10', sortOrder: 6, difficultyLevel: 2 },
  { id: 'N07', domainId: 'numeracy', name: 'Spatial Language', description: 'Uses positional words correctly (on, under, next to, behind, between, above)', howToAssess: "'Put the bear ON the box. Put it UNDER the box. Put it BETWEEN the cups.'", howToTeach: "Daily directions using position words. Obstacle courses. 'Go UNDER the table, OVER the pillow.'", age5Target: 'Age 5 target: 8+ positional words', sortOrder: 7, difficultyLevel: 2 },
  { id: 'N08', domainId: 'numeracy', name: 'Simple Patterns (AB)', description: 'Recognizes, copies, and extends ABAB patterns', howToAssess: 'Make a red-blue-red-blue pattern. Can child continue it? Can they make their own?', howToTeach: 'Color patterns, shape patterns, sound patterns (clap-stomp-clap-stomp). Build to ABB.', age5Target: 'Age 5 target: Extends and creates AB patterns', sortOrder: 8, difficultyLevel: 2 },
  { id: 'N09', domainId: 'numeracy', name: 'Sorting & Classifying', description: 'Groups objects by a single attribute (color, shape, size)', howToAssess: "'Give mixed objects. 'Can you sort these into groups?' See if child picks an attribute.", howToTeach: 'Laundry sorting, toy cleanup by type, bead sorting by color.', age5Target: 'Age 5 target: Sorts by 2 attributes', sortOrder: 9, difficultyLevel: 2 },
  { id: 'N10', domainId: 'numeracy', name: 'Number Writing 1-10', description: 'Writes numerals 1-10 recognizably', howToAssess: 'Ask child to write numbers 1-10. Check formation and legibility.', howToTeach: 'Number tracing sheets (printable!), sand tray writing, whiteboard practice.', age5Target: 'Age 5 target: Writes 1-10 legibly', sortOrder: 10, difficultyLevel: 3 },
  { id: 'N11', domainId: 'numeracy', name: 'Addition Concepts (within 5)', description: 'Combines small groups: 2+1=3, 3+2=5', howToAssess: "'You have 2 blocks, I give you 1 more. How many now?' Use manipulatives.", howToTeach: "Always start with physical objects. 'How many altogether?' before introducing + symbol.", age5Target: 'Age 5 (end of K): Adds within 5', sortOrder: 11, difficultyLevel: 3 },
  { id: 'N12', domainId: 'numeracy', name: 'Measurement Language', description: 'Uses bigger/smaller, taller/shorter, heavier/lighter', howToAssess: "'Show two objects: 'Which is taller? Which is heavier?' Test with 5 pairs.", howToTeach: "Compare everything: 'Is daddy taller or shorter than mummy?' Use balance scales.", age5Target: 'Age 5 target: Uses 6+ comparison words', sortOrder: 12, difficultyLevel: 2 },

  // ── SOCIAL-EMOTIONAL (8 milestones) ──
  { id: 'S01', domainId: 'social', name: 'Self-Regulation', description: 'Manages emotions with some adult support', howToAssess: 'Observe during frustrating tasks. Can child pause and use words instead of physical reactions?', howToTeach: "Teach 'stop, breathe, think' routine. Name emotions: 'I can see you feel frustrated.'", age5Target: 'Age 5: Self-calms in most situations', sortOrder: 1, difficultyLevel: 2 },
  { id: 'S02', domainId: 'social', name: 'Cooperative Play', description: 'Plays with others, takes turns, shares', howToAssess: 'Observe in group play. Does child negotiate, wait turns, share materials?', howToTeach: 'Board games (turn-taking), collaborative building projects, partner activities.', age5Target: 'Expected by age 4.5', sortOrder: 2, difficultyLevel: 1 },
  { id: 'S03', domainId: 'social', name: 'Independence', description: 'Completes multi-step tasks independently', howToAssess: "'Go get your bag, put your shoes on, and come to the door.' Can child do all 3 without reminders?", howToTeach: 'Visual checklists (morning routine, bedtime routine). Gradually reduce prompts.', age5Target: 'Age 5: Multi-step tasks without reminders', sortOrder: 3, difficultyLevel: 2 },
  { id: 'S04', domainId: 'social', name: 'Empathy & Perspective', description: "Recognizes and responds to others' feelings", howToAssess: "When another child is upset, does child notice? Do they respond (ask, comfort, get help)?", howToTeach: "Read books about feelings. Ask 'how do you think they feel?' Practice 'Are you okay?'", age5Target: 'Age 5: Labels 6+ emotions in self and others', sortOrder: 4, difficultyLevel: 2 },
  { id: 'S05', domainId: 'social', name: 'Following Instructions', description: 'Follows 2-3 step directions reliably', howToAssess: 'Give 3-step direction without repeating. Did child complete all steps?', howToTeach: 'Simon Says, scavenger hunts with multi-step clues, cooking together.', age5Target: 'Age 5: 3-step directions consistently', sortOrder: 5, difficultyLevel: 2 },
  { id: 'S06', domainId: 'social', name: 'Conflict Resolution', description: 'Attempts to solve problems with peers using words', howToAssess: 'During a disagreement, does child use words before physical reactions?', howToTeach: "Role-play scenarios. Teach phrases: 'I don\u2019t like it when...' and 'Can we take turns?'", age5Target: 'Age 5: Uses words first in most conflicts', sortOrder: 6, difficultyLevel: 3 },
  { id: 'S07', domainId: 'social', name: 'Growth Mindset', description: 'Persists with challenging tasks, accepts mistakes', howToAssess: "Does child give up quickly on hard tasks? Do they say 'I can\u2019t'? Or do they try again?", howToTeach: "Praise effort not outcome: 'You worked so hard on that!' Normalize mistakes: 'Mistakes help us learn.'", age5Target: 'Age 5: Persists through moderate challenge', sortOrder: 7, difficultyLevel: 3 },
  { id: 'S08', domainId: 'social', name: 'Expressing Needs', description: 'Clearly communicates wants, needs, and feelings verbally', howToAssess: 'Does child use words to express hunger, tiredness, frustration, excitement?', howToTeach: "Model: 'I feel tired because I worked hard.' Feelings chart with faces and words.", age5Target: 'Age 5: Expresses needs clearly without prompting', sortOrder: 8, difficultyLevel: 1 },

  // ── MOTOR SKILLS (8 milestones) ──
  { id: 'M01', domainId: 'motor', name: 'Pencil Grip', description: 'Uses tripod grip consistently', howToAssess: 'Observe grip when drawing/writing. Is thumb + index + middle finger holding the pencil?', howToTeach: 'Short crayons force tripod grip. Playdough strengthens hand muscles. Grip aids if needed.', age5Target: 'Age 5: Consistent tripod grip', sortOrder: 1, difficultyLevel: 2 },
  { id: 'M02', domainId: 'motor', name: 'Name Writing', description: 'Writes first name legibly on a line', howToAssess: 'Ask child to write name. Check: correct letters, readable, relatively sized, near the line.', howToTeach: 'Daily practice. Start with tracing, then copying, then independent. Use lined paper.', age5Target: 'Age 5: Writes name legibly on line', sortOrder: 2, difficultyLevel: 2 },
  { id: 'M03', domainId: 'motor', name: 'Scissor Skills', description: 'Cuts along straight and curved lines', howToAssess: 'Draw a straight line and a wavy line. Can child cut along them within ~5mm?', howToTeach: 'Start with snipping. Progress: straight lines \u2192 curves \u2192 simple shapes. Use child-safe scissors.', age5Target: 'Age 5: Cuts simple shapes', sortOrder: 3, difficultyLevel: 2 },
  { id: 'M04', domainId: 'motor', name: 'Drawing a Person', description: 'Draws a person with 6+ body parts', howToAssess: 'Ask child to draw a person. Count distinct parts: head, body, arms, legs, eyes, mouth, etc.', howToTeach: "Draw together. 'Let\u2019s add arms! What else does a person have?' Practice weekly.", age5Target: 'Age 5: 6+ distinct body parts', sortOrder: 4, difficultyLevel: 2 },
  { id: 'M05', domainId: 'motor', name: 'Letter Formation', description: 'Forms most uppercase letters recognizably', howToAssess: 'Dictate 10 letters. Can child write them so you can identify each one?', howToTeach: 'Letter tracing worksheets (printable!). Start with straight-line letters: L, T, I, E, F, H.', age5Target: 'Age 5: Most uppercase letters recognizable', sortOrder: 5, difficultyLevel: 3 },
  { id: 'M06', domainId: 'motor', name: 'Gross Motor: Balance', description: 'Hops on one foot, walks on a line, balances 5+ sec', howToAssess: 'Can child hop 5 times on one foot? Walk along a tape line? Stand on one foot for 5 seconds?', howToTeach: 'Balance beam (tape on floor), hopping games, obstacle courses.', age5Target: 'Expected by age 4.5', sortOrder: 6, difficultyLevel: 1 },
  { id: 'M07', domainId: 'motor', name: 'Gross Motor: Ball Skills', description: 'Catches a bounced ball, throws overhand with aim', howToAssess: 'Bounce ball to child from 2m \u2014 can they catch it 3/5 times? Throw at a target?', howToTeach: 'Daily ball play. Start with large soft balls, decrease size as skill improves.', age5Target: 'Expected by age 5', sortOrder: 7, difficultyLevel: 2 },
  { id: 'M08', domainId: 'motor', name: 'Coloring Control', description: 'Colors within lines of a simple picture', howToAssess: 'Give a coloring page with large shapes. Does child stay mostly within the lines?', howToTeach: 'Coloring books with progressively smaller shapes. Encourage slow, deliberate movements.', age5Target: 'Age 5: Mostly within lines of medium shapes', sortOrder: 8, difficultyLevel: 2 },
];

// Prerequisite edges (skills graph)
export const PREREQUISITES = [
  { milestoneId: 'L03', requires: 'L01' },
  { milestoneId: 'L04', requires: 'L02' },
  { milestoneId: 'L05', requires: 'L02' },
  { milestoneId: 'L06', requires: 'L05' },
  { milestoneId: 'L07', requires: 'L03' },
  { milestoneId: 'L07', requires: 'L04' },
  { milestoneId: 'L08', requires: 'L03' },
  { milestoneId: 'L08', requires: 'L05' },
  { milestoneId: 'L09', requires: 'L10' },
  { milestoneId: 'L12', requires: 'L04' },
  { milestoneId: 'L12', requires: 'L07' },
  { milestoneId: 'L12', requires: 'L08' },
  { milestoneId: 'N03', requires: 'N01' },
  { milestoneId: 'N04', requires: 'N01' },
  { milestoneId: 'N06', requires: 'N02' },
  { milestoneId: 'N10', requires: 'N03' },
  { milestoneId: 'N11', requires: 'N02' },
  { milestoneId: 'N11', requires: 'N06' },
  { milestoneId: 'S06', requires: 'S04' },
  { milestoneId: 'S06', requires: 'S01' },
  { milestoneId: 'M02', requires: 'M01' },
  { milestoneId: 'M05', requires: 'M01' },
  { milestoneId: 'M03', requires: 'M01' },
];

// Lani's real assessment data — Feb 25, 2026
// Sources: Reading Eggs report, Lovell School report, parent testing
export const INITIAL_STATUS = [
  // ── LITERACY (Reading Eggs report + parent testing, Feb 25 2026) ──
  { milestoneId: 'L01', status: 'mastered', progress: 100, evidenceNotes: 'Writes own name, brother\'s name, and "Tegan"' },
  { milestoneId: 'L02', status: 'mastered', progress: 100, evidenceNotes: 'Holds books correctly, points to text' },
  { milestoneId: 'L03', status: 'in-progress', progress: 73, evidenceNotes: 'Writes 19/26 letters (tested Feb 25 2026)' },
  { milestoneId: 'L04', status: 'in-progress', progress: 50, evidenceNotes: 'Reading Eggs: 31/250 phonic skills mastered, completed lessons on N and P with sounds' },
  { milestoneId: 'L05', status: 'not-started', progress: 0 },
  { milestoneId: 'L06', status: 'not-started', progress: 0 },
  { milestoneId: 'L07', status: 'not-started', progress: 0 },
  { milestoneId: 'L08', status: 'emerging', progress: 10, evidenceNotes: 'Reading Eggs: 4/236 sight words known' },
  { milestoneId: 'L09', status: 'in-progress', progress: 40, evidenceNotes: 'Read 2 fiction books (Pp, Nn) on Reading Eggs' },
  { milestoneId: 'L10', status: 'in-progress', progress: 50, evidenceNotes: 'Reading Eggs Map 1 quiz 93%, Lesson 12 score 100%, Lesson 11 score 90%' },
  { milestoneId: 'L11', status: 'proficient', progress: 75, evidenceNotes: 'Reading Eggs estimated reading age 5 years' },
  { milestoneId: 'L12', status: 'emerging', progress: 10, evidenceNotes: 'Reading Eggs: 12/130 skills mastered, just starting CVC decoding' },

  // ── NUMERACY (school report + parent testing, Feb 25 2026) ──
  { milestoneId: 'N01', status: 'mastered', progress: 100, evidenceNotes: 'Counts 1-10 fluently' },
  { milestoneId: 'N02', status: 'proficient', progress: 70, evidenceNotes: '1:1 correspondence solid to 7' },
  { milestoneId: 'N03', status: 'in-progress', progress: 60, evidenceNotes: 'Recognizes 1-5,7. Confuses 6 and 9' },
  { milestoneId: 'N04', status: 'mastered', progress: 100, evidenceNotes: 'Counts to 29 (tested Feb 25 2026)' },
  { milestoneId: 'N05', status: 'mastered', progress: 100, evidenceNotes: 'All 4 basic shapes' },
  { milestoneId: 'N06', status: 'in-progress', progress: 50, evidenceNotes: "Good with 'more', developing 'fewer'" },
  { milestoneId: 'N07', status: 'in-progress', progress: 65, evidenceNotes: 'Strong: on,under,next to. Learning: behind,between' },
  { milestoneId: 'N08', status: 'not-started', progress: 0 },
  { milestoneId: 'N09', status: 'in-progress', progress: 55, evidenceNotes: 'Sorts by color well, developing shape/size' },
  { milestoneId: 'N10', status: 'in-progress', progress: 70, evidenceNotes: 'Writes numbers to 10, needs support with 8 and 9 (school report)' },
  { milestoneId: 'N11', status: 'in-progress', progress: 30, evidenceNotes: 'School taught number bonds for 5 and 10' },
  { milestoneId: 'N12', status: 'in-progress', progress: 45, evidenceNotes: 'Bigger/smaller good. Taller/shorter developing' },

  // ── SOCIAL-EMOTIONAL (school report screenshots, Feb 25 2026) ──
  { milestoneId: 'S01', status: 'in-progress', progress: 55 },
  { milestoneId: 'S02', status: 'mastered', progress: 100, evidenceNotes: 'Negotiates sharing, collaborates in sand pit (school report)' },
  { milestoneId: 'S03', status: 'proficient', progress: 75, evidenceNotes: 'Builds intricate structures independently (school report)' },
  { milestoneId: 'S04', status: 'proficient', progress: 70, evidenceNotes: 'Observed peers, offered help, demonstrated to group (school report)' },
  { milestoneId: 'S05', status: 'proficient', progress: 75 },
  { milestoneId: 'S06', status: 'in-progress', progress: 50, evidenceNotes: 'Navigated sharing successfully (school report)' },
  { milestoneId: 'S07', status: 'in-progress', progress: 40 },
  { milestoneId: 'S08', status: 'proficient', progress: 80, evidenceNotes: '"Fantastic communicating" (school report)' },

  // ── MOTOR SKILLS (parent testing, Feb 25 2026) ──
  { milestoneId: 'M01', status: 'mastered', progress: 100, evidenceNotes: 'Consistent tripod grip' },
  { milestoneId: 'M02', status: 'mastered', progress: 100, evidenceNotes: 'Writes 3 names (own, brother, Tegan)' },
  { milestoneId: 'M03', status: 'in-progress', progress: 40 },
  { milestoneId: 'M04', status: 'in-progress', progress: 55 },
  { milestoneId: 'M05', status: 'in-progress', progress: 73, evidenceNotes: 'Writes 19/26 letters (tested Feb 25 2026)' },
  { milestoneId: 'M06', status: 'mastered', progress: 100, evidenceNotes: 'Hops on one foot, balances 5 seconds (tested Feb 25 2026)' },
  { milestoneId: 'M07', status: 'proficient', progress: 75 },
  { milestoneId: 'M08', status: 'proficient', progress: 85, evidenceNotes: 'Colours within lines well (tested Feb 25 2026)' },
];

// Reading Eggs summary data (Feb 25, 2026)
export const READING_EGGS_DATA = {
  capturedDate: '2026-02-25',
  estimatedReadingAge: '5 years',
  phonicSkills: { mastered: 31, total: 250 },
  sightWords: { known: 4, total: 236 },
  skillsMastered: { count: 12, total: 130 },
  lessonsCompleted: 12,
  map1Quiz: 93,
  timeOnTask: { hours: 1.1, sessions: 5, avgMinPerSession: 14 },
  booksRead: { count: 2, type: 'fiction', totalWords: 16 },
};

// Helper: get milestones by domain
export const getMilestonesByDomain = (domainId) =>
  MILESTONES.filter(m => m.domainId === domainId).sort((a, b) => a.sortOrder - b.sortOrder);

// Helper: get prerequisites for a milestone
export const getPrerequisites = (milestoneId) =>
  PREREQUISITES.filter(p => p.milestoneId === milestoneId).map(p => p.requires);

// Helper: get initial status for a milestone
export const getInitialStatus = (milestoneId) =>
  INITIAL_STATUS.find(s => s.milestoneId === milestoneId) || { status: 'not-started', progress: 0 };
