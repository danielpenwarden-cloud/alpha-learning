import { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { useStudent } from '../../hooks/useStudent';
import { MILESTONES } from '../../data/milestones';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#666', marginBottom: 20 },
  line: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 16 },
  strandTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 6, marginTop: 12 },
  strandDesc: { fontSize: 9, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  narrative: { fontSize: 10, lineHeight: 1.5, marginBottom: 8 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, fontSize: 9, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#bbb' },
});

// Map Alpha Learning domains to Te Whariki strands
const TE_WHARIKI_STRANDS = [
  {
    name: 'Mana Reo — Communication',
    description: 'Languages and symbols of their own and other cultures are promoted and protected.',
    domains: ['literacy'],
  },
  {
    name: 'Mana Aotūroa — Exploration',
    description: 'The child learns through active exploration of the environment.',
    domains: ['numeracy'],
  },
  {
    name: 'Mana Atua — Wellbeing',
    description: 'The health and wellbeing of the child are protected and nurtured.',
    domains: ['social', 'motor'],
  },
  {
    name: 'Mana Tangata — Contribution',
    description: 'Opportunities for learning are equitable, and each child\'s contribution is valued.',
    domains: ['social'],
  },
  {
    name: 'Mana Whenua — Belonging',
    description: 'Children and their families feel a sense of belonging.',
    domains: ['social'],
  },
];

function NZPortfolioDocument({ student, age, milestoneStatus }) {
  const dateStr = new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{student.firstName}'s Learning Story</Text>
        <Text style={styles.subtitle}>
          A Te Whāriki Portfolio — Age {age.years}yr {age.months}mo | {dateStr}
        </Text>
        <View style={styles.line} />

        <Text style={styles.narrative}>
          {student.firstName} is a {age.years}-year-old who attends {student.schoolName}.
          They will be transitioning to the New Zealand school system ({student.targetSchoolEntry}).
          This learning story documents {student.firstName}'s developmental journey across the
          Te Whāriki strands, providing evidence of their growth and areas of developing capability.
        </Text>

        {TE_WHARIKI_STRANDS.map(strand => {
          const relatedMilestones = MILESTONES.filter(m =>
            strand.domains.includes(m.domainId)
          );
          const activeMilestones = relatedMilestones.filter(m => {
            const s = milestoneStatus[m.id];
            return s && s.status !== 'not-started';
          });

          return (
            <View key={strand.name} wrap={false}>
              <Text style={styles.strandTitle}>{strand.name}</Text>
              <Text style={styles.strandDesc}>{strand.description}</Text>
              {activeMilestones.length > 0 ? (
                activeMilestones.map(m => {
                  const s = milestoneStatus[m.id] || {};
                  return (
                    <View key={m.id} style={styles.milestoneRow}>
                      <Text>{m.name}: {m.description}</Text>
                      <Text>{s.status} ({s.progress}%)</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 9, color: '#999' }}>Evidence being gathered.</Text>
              )}
            </View>
          );
        })}

        <View style={{ marginTop: 20 }}>
          <View style={styles.line} />
          <Text style={{ fontSize: 9, color: '#666', lineHeight: 1.4 }}>
            This learning story is generated from parent-observed assessments and follows the
            Te Whāriki framework for early childhood education in Aotearoa New Zealand.
            Milestone benchmarks are cross-referenced against US (Common Core K), UK (EYFS/Cambridge),
            and AU (EYLF) frameworks. It is intended as a transition portfolio to support
            {' '}{student.firstName}'s entry into the NZ school system.
          </Text>
        </View>

        <Text style={styles.footer}>Alpha Learning | Te Whāriki Learning Story | {dateStr}</Text>
      </Page>
    </Document>
  );
}

export default function NZPortfolioButton() {
  const { student, age, milestoneStatus } = useStudent();
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <NZPortfolioDocument student={student} age={age} milestoneStatus={milestoneStatus} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.firstName}-NZ-Learning-Story-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="text-xs px-3 py-1.5 rounded-lg border border-numeracy text-numeracy hover:bg-numeracy/10 transition-colors disabled:opacity-50"
    >
      {generating ? 'Generating...' : '\u{1F1F3}\u{1F1FF} Export NZ Learning Story'}
    </button>
  );
}
