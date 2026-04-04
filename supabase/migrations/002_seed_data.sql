-- ═══════════════════════════════════════════════
-- SEED DATA — Domains
-- ═══════════════════════════════════════════════

INSERT INTO domains (id, name, icon, color, sort_order) VALUES
  ('literacy', 'Literacy & Language', '📖', '#E8654A', 1),
  ('numeracy', 'Numeracy & Math', '🔢', '#4A90D9', 2),
  ('social', 'Social-Emotional', '💛', '#E8A94A', 3),
  ('motor', 'Motor Skills', '✋', '#6ABF69', 4);

-- ═══════════════════════════════════════════════
-- SEED DATA — Milestones
-- ═══════════════════════════════════════════════

-- Literacy
INSERT INTO milestones (id, domain_id, name, description, detail, how_to_assess, how_to_teach, age5_target, sort_order, difficulty_level) VALUES
  ('L01', 'literacy', 'Name Recognition', 'Recognizes and spells own name', 'Can identify and write own first name. Recognizes letters in and out of name context.', 'Ask child to write their name. Show name mixed with other words — can they find it?', 'Practice daily name writing. Use name cards, magnetic letters to build name.', 'Expected by age 4.5', 1, 1),
  ('L02', 'literacy', 'Print Concepts', 'Understands how books and print work', 'Holds books correctly, turns pages left-to-right, knows print carries meaning, points to text.', 'Hand child a book upside down. Do they correct it? Do they point to text when reading?', 'Shared reading daily. Point to words as you read. Ask where do I start reading?', 'Expected by age 4', 2, 1),
  ('L03', 'literacy', 'Alphabet Knowledge (Uppercase)', 'Identifies and names uppercase letters', 'Recognizes the 26 uppercase letters when shown individually.', 'Show letter flashcards in random order. Record which are identified correctly. Test weekly.', '3-4 new letters per week. Multi-sensory: trace in sand/salt tray, build with playdough, sky-write.', 'Age 5 target: 20-26 letters (77-100%)', 3, 2),
  ('L04', 'literacy', 'Letter-Sound Connections', 'Associates letters with their primary sounds', 'Knows that each letter makes a sound. Can say the sound when shown the letter.', 'Show letter, ask what sound does this make? Record correct responses.', 'Pair with alphabet knowledge. B says /b/ like ball. Reading Eggs Sound Hounds game.', 'Age 5 target: 15+ letter sounds', 4, 2),
  ('L05', 'literacy', 'Rhyming Awareness', 'Identifies and produces rhyming words', 'Can hear when two words rhyme (cat/hat) and generate new rhymes.', 'Do cat and hat rhyme? Do cat and dog rhyme? Then: What rhymes with sun?', 'Nursery rhymes, rhyming picture books (Dr. Seuss). Rhyming games.', 'Age 5 target: Identifies rhyming pairs consistently', 5, 2),
  ('L06', 'literacy', 'Syllable Segmentation', 'Claps out syllables in words', 'Can break words into syllable parts by clapping or tapping.', 'Say a word, child claps the parts: butterfly (3 claps), cat (1 clap).', 'Start with child name: La-ni (2). Use familiar words. Make it physical.', 'Age 5 target: Segments 2-3 syllable words', 6, 2),
  ('L07', 'literacy', 'Initial Sound Isolation', 'Identifies the first sound in a word', 'Can tell you what sound a word starts with: ball starts with /b/.', 'What sound does fish start with? Test with 10 words.', 'I-Spy with sounds. Sort objects by first sound.', 'Age 5 target: Isolates initial sound in CVC words', 7, 3),
  ('L08', 'literacy', 'Sight Words (10)', 'Reads 10 high-frequency words on sight', 'Instantly recognizes: I, a, the, is, my, to, and, go, no, we.', 'Flash each word on a card. Instant recognition = mastered.', 'Word wall at home. Point them out in books. Reading Eggs tricky words module.', 'Age 5 target: 5-10 sight words', 8, 3),
  ('L09', 'literacy', 'Story Retelling', 'Retells a familiar story in sequence', 'Can describe characters, setting, and retell beginning → middle → end.', 'Read a short story, then ask what happened? Listen for sequence and key details.', 'After reading, ask: What happened first? Then what? How did it end?', 'Age 5 target: Retells 3-part sequence with detail', 9, 2),
  ('L10', 'literacy', 'Listening Comprehension', 'Answers questions about a story read aloud', 'Can answer who/what/where/why questions about a story heard.', 'Read a story, ask 5 questions: who, what happened, where, why, what might happen next.', 'Pause during reading to ask predictions. After: Why did the bear do that?', 'Age 5 target: Answers 4/5 comprehension questions', 10, 2),
  ('L11', 'literacy', 'Vocabulary (Expressive)', 'Uses 2000+ words, speaks in complex sentences', 'Uses descriptive language, 5-6 word sentences, explains ideas clearly.', 'Observe daily speech. Can child explain how something works?', 'Rich conversation. Expand their sentences.', 'Age 5 target: Complex sentences, explains ideas', 11, 2),
  ('L12', 'literacy', 'CVC Word Decoding', 'Sounds out and reads simple 3-letter words', 'Can blend /c/ /a/ /t/ to read cat. Reads simple CVC words independently.', 'Show 10 CVC words (cat, dog, sit, run, etc.). Can child sound them out?', 'Sound boxes: 3 squares, one sound per square. Blend together.', 'Age 5 (end of K): Reads CVC words', 12, 4);

-- Numeracy
INSERT INTO milestones (id, domain_id, name, description, how_to_assess, how_to_teach, age5_target, sort_order, difficulty_level) VALUES
  ('N01', 'numeracy', 'Rote Counting 1-10', 'Counts aloud 1-10 in sequence', 'Ask child to count as high as they can.', 'Counting songs, count during daily routines.', 'Expected by age 4.5', 1, 1),
  ('N02', 'numeracy', '1:1 Correspondence', 'Points to each object while counting', 'Give 10 blocks, ask to count them. Watch if finger matches count.', 'Touch-and-count everything: grapes, stairs, buttons.', 'Age 5 target: Accurate to 10+', 2, 1),
  ('N03', 'numeracy', 'Number Recognition 0-10', 'Identifies written numerals 0 through 10', 'Show numeral flashcards in random order.', 'Number cards, number puzzles, find the number hunts.', 'Age 5 target: All numerals 0-10', 3, 2),
  ('N04', 'numeracy', 'Counting to 20', 'Counts aloud 1-20 reliably', 'Ask child to count to 20. Note skips, errors, ceiling.', 'Number songs (especially teens). Count objects beyond 10.', 'Age 5 target: Counts to 20 without errors', 4, 2),
  ('N05', 'numeracy', 'Shape Recognition', 'Names circle, square, triangle, rectangle', 'Show shapes in various sizes/orientations.', 'Shape hunts in environment.', 'Expected by age 4.5', 5, 1),
  ('N06', 'numeracy', 'Comparing Quantities', 'Uses more, less/fewer, same correctly', 'Two groups of objects: Which has more?', 'Snack time comparisons.', 'Age 5 target: Compares groups up to 10', 6, 2),
  ('N07', 'numeracy', 'Spatial Language', 'Uses positional words correctly', 'Put the bear ON the box. Put it UNDER the box.', 'Daily directions using position words. Obstacle courses.', 'Age 5 target: 8+ positional words', 7, 2),
  ('N08', 'numeracy', 'Simple Patterns (AB)', 'Recognizes, copies, and extends ABAB patterns', 'Make a red-blue-red-blue pattern. Can child continue it?', 'Color patterns, shape patterns, sound patterns.', 'Age 5 target: Extends and creates AB patterns', 8, 2),
  ('N09', 'numeracy', 'Sorting & Classifying', 'Groups objects by a single attribute', 'Give mixed objects. Can you sort these into groups?', 'Laundry sorting, toy cleanup by type.', 'Age 5 target: Sorts by 2 attributes', 9, 2),
  ('N10', 'numeracy', 'Number Writing 1-10', 'Writes numerals 1-10 recognizably', 'Ask child to write numbers 1-10.', 'Number tracing sheets, sand tray writing.', 'Age 5 target: Writes 1-10 legibly', 10, 3),
  ('N11', 'numeracy', 'Addition Concepts (within 5)', 'Combines small groups: 2+1=3, 3+2=5', 'You have 2 blocks, I give you 1 more. How many now?', 'Always start with physical objects.', 'Age 5 (end of K): Adds within 5', 11, 3),
  ('N12', 'numeracy', 'Measurement Language', 'Uses bigger/smaller, taller/shorter, heavier/lighter', 'Show two objects: Which is taller? Which is heavier?', 'Compare everything. Use balance scales.', 'Age 5 target: Uses 6+ comparison words', 12, 2);

-- Social-Emotional
INSERT INTO milestones (id, domain_id, name, description, how_to_assess, how_to_teach, age5_target, sort_order, difficulty_level) VALUES
  ('S01', 'social', 'Self-Regulation', 'Manages emotions with some adult support', 'Observe during frustrating tasks.', 'Teach stop, breathe, think routine.', 'Age 5: Self-calms in most situations', 1, 2),
  ('S02', 'social', 'Cooperative Play', 'Plays with others, takes turns, shares', 'Observe in group play.', 'Board games, collaborative building projects.', 'Expected by age 4.5', 2, 1),
  ('S03', 'social', 'Independence', 'Completes multi-step tasks independently', 'Give 3-step task without reminders.', 'Visual checklists. Gradually reduce prompts.', 'Age 5: Multi-step tasks without reminders', 3, 2),
  ('S04', 'social', 'Empathy & Perspective', 'Recognizes and responds to others'' feelings', 'Does child notice when peers are upset?', 'Read books about feelings. Practice Are you okay?', 'Age 5: Labels 6+ emotions in self and others', 4, 2),
  ('S05', 'social', 'Following Instructions', 'Follows 2-3 step directions reliably', 'Give 3-step direction without repeating.', 'Simon Says, scavenger hunts with multi-step clues.', 'Age 5: 3-step directions consistently', 5, 2),
  ('S06', 'social', 'Conflict Resolution', 'Attempts to solve problems with peers using words', 'During a disagreement, does child use words first?', 'Role-play scenarios. Teach phrases.', 'Age 5: Uses words first in most conflicts', 6, 3),
  ('S07', 'social', 'Growth Mindset', 'Persists with challenging tasks, accepts mistakes', 'Does child give up quickly on hard tasks?', 'Praise effort not outcome. Normalize mistakes.', 'Age 5: Persists through moderate challenge', 7, 3),
  ('S08', 'social', 'Expressing Needs', 'Clearly communicates wants, needs, and feelings verbally', 'Does child use words to express needs?', 'Model: I feel tired because I worked hard.', 'Age 5: Expresses needs clearly without prompting', 8, 1);

-- Motor Skills
INSERT INTO milestones (id, domain_id, name, description, how_to_assess, how_to_teach, age5_target, sort_order, difficulty_level) VALUES
  ('M01', 'motor', 'Pencil Grip', 'Uses tripod grip consistently', 'Observe grip when drawing/writing.', 'Short crayons force tripod grip. Playdough strengthens hand muscles.', 'Age 5: Consistent tripod grip', 1, 2),
  ('M02', 'motor', 'Name Writing', 'Writes first name legibly on a line', 'Ask child to write name. Check letter formation.', 'Daily practice. Start with tracing, then copying, then independent.', 'Age 5: Writes name legibly on line', 2, 2),
  ('M03', 'motor', 'Scissor Skills', 'Cuts along straight and curved lines', 'Draw lines. Can child cut along them within ~5mm?', 'Start with snipping. Progress: straight → curves → shapes.', 'Age 5: Cuts simple shapes', 3, 2),
  ('M04', 'motor', 'Drawing a Person', 'Draws a person with 6+ body parts', 'Ask child to draw a person. Count distinct parts.', 'Draw together. What else does a person have? Practice weekly.', 'Age 5: 6+ distinct body parts', 4, 2),
  ('M05', 'motor', 'Letter Formation', 'Forms most uppercase letters recognizably', 'Dictate 10 letters. Can child write them?', 'Letter tracing worksheets. Start with straight-line letters.', 'Age 5: Most uppercase letters recognizable', 5, 3),
  ('M06', 'motor', 'Gross Motor: Balance', 'Hops on one foot, walks on a line, balances 5+ sec', 'Can child hop 5 times? Walk on tape line? Balance 5 seconds?', 'Balance beam (tape on floor), hopping games, obstacle courses.', 'Expected by age 4.5', 6, 1),
  ('M07', 'motor', 'Gross Motor: Ball Skills', 'Catches a bounced ball, throws overhand with aim', 'Bounce ball from 2m — catch 3/5 times? Throw at a target?', 'Daily ball play. Start with large soft balls.', 'Expected by age 5', 7, 2),
  ('M08', 'motor', 'Coloring Control', 'Colors within lines of a simple picture', 'Give coloring page with large shapes. Stays within lines?', 'Coloring books with progressively smaller shapes.', 'Age 5: Mostly within lines of medium shapes', 8, 2);

-- ═══════════════════════════════════════════════
-- PREREQUISITES
-- ═══════════════════════════════════════════════

INSERT INTO milestone_prerequisites (milestone_id, requires_milestone_id) VALUES
  ('L03', 'L01'), ('L04', 'L02'), ('L05', 'L02'), ('L06', 'L05'),
  ('L07', 'L03'), ('L07', 'L04'), ('L08', 'L03'), ('L08', 'L05'),
  ('L09', 'L10'), ('L12', 'L04'), ('L12', 'L07'), ('L12', 'L08'),
  ('N03', 'N01'), ('N04', 'N01'), ('N06', 'N02'),
  ('N10', 'N03'), ('N11', 'N02'), ('N11', 'N06'),
  ('S06', 'S04'), ('S06', 'S01'),
  ('M02', 'M01'), ('M05', 'M01'), ('M03', 'M01');
