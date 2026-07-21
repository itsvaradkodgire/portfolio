import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { TailoredResume, ResumeData } from './types';

// Use react-pdf's built-in Helvetica family (Helvetica / Helvetica-Bold).
// This avoids fetching external web fonts at render time, which fails on
// serverless (fontkit only accepts TTF/OTF, not the .woff files Google serves)
// and makes PDF generation deterministic and network-independent.

const ACCENT = '#2f5d8f';   // restrained navy-blue accent (used sparingly)
const INK = '#1a1a2e';      // primary heading ink
const BODY = '#33333d';     // body text
const MUTED = '#6b7280';    // secondary/meta text
const RULE = '#d9dee5';     // hairline rules

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: BODY,
    backgroundColor: '#ffffff',
    paddingTop: 42,
    paddingBottom: 46,
    paddingHorizontal: 50,
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 16,
    borderBottom: `2pt solid ${ACCENT}`,
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    letterSpacing: 0.3,
    lineHeight: 1.1,
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 8.5,
    color: MUTED,
    marginRight: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    lineHeight: 1.2,
    marginBottom: 6,
    borderBottom: `0.75pt solid ${RULE}`,
    paddingBottom: 3,
  },
  summary: {
    fontSize: 9.5,
    color: BODY,
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 9,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  companyTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: INK,
  },
  dateText: {
    fontSize: 8.5,
    color: MUTED,
  },
  roleTitle: {
    fontSize: 9.5,
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2.5,
    paddingRight: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 9.5,
    color: ACCENT,
    lineHeight: 1.45,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: BODY,
    lineHeight: 1.45,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillLabel: {
    width: 96,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    lineHeight: 1.4,
  },
  skillValues: {
    flex: 1,
    fontSize: 9,
    color: BODY,
    lineHeight: 1.4,
  },
  projectItem: {
    marginBottom: 7,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  projectTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: INK,
  },
  projectTagline: {
    fontSize: 8,
    color: MUTED,
  },
  projectDesc: {
    fontSize: 9.5,
    color: BODY,
    lineHeight: 1.45,
  },
  eduItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  eduDegree: {
    fontSize: 9.75,
    fontFamily: 'Helvetica-Bold',
    color: INK,
  },
  eduSchool: {
    fontSize: 9,
    color: MUTED,
  },
  eduYear: {
    fontSize: 8.5,
    color: MUTED,
  },
  certItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 7.5,
    color: '#9aa1ab',
    borderTop: `0.5pt solid ${RULE}`,
    paddingTop: 7,
  },
});

interface PDFProps {
  tailored: TailoredResume;
  baseData: ResumeData;
  /** Optional categorized skills (used by the base resume). Falls back to the
   *  flat `tailored.skills` list rendered on a single line when omitted. */
  skillGroups?: { label: string; values: string[] }[];
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

export function ResumePDF({ tailored, baseData, skillGroups }: PDFProps) {
  return (
    <Document
      title={`${baseData.fullName} — Resume`}
      author={baseData.fullName}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{baseData.fullName}</Text>
          <Text style={styles.jobTitle}>{tailored.title}</Text>
          <View style={styles.contactRow}>
            {baseData.email && <Text style={styles.contactItem}>{baseData.email}</Text>}
            {baseData.phone && <Text style={styles.contactItem}>{baseData.phone}</Text>}
            {baseData.location && <Text style={styles.contactItem}>{baseData.location}</Text>}
            {baseData.linkedinUrl && <Text style={styles.contactItem}>{baseData.linkedinUrl.replace(/^https?:\/\//, '')}</Text>}
            {baseData.githubUrl && <Text style={styles.contactItem}>{baseData.githubUrl.replace(/^https?:\/\//, '')}</Text>}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{tailored.summary}</Text>
        </View>

        {/* Skills */}
        {(skillGroups?.length || tailored.skills.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Skills</Text>
            {skillGroups && skillGroups.length > 0 ? (
              skillGroups.map((group, i) => (
                <View key={i} style={styles.skillRow}>
                  <Text style={styles.skillLabel}>{group.label}</Text>
                  <Text style={styles.skillValues}>{group.values.join(' · ')}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.skillValues}>{tailored.skills.join(' · ')}</Text>
            )}
          </View>
        )}

        {/* Experience */}
        {tailored.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {tailored.experience.map((exp, i) => (
              <View key={i} style={styles.experienceItem} wrap={false}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyTitle}>{exp.company}</Text>
                  <Text style={styles.dateText}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                <Text style={styles.roleTitle}>{exp.title}</Text>
                {exp.bullets.map((b, j) => (
                  <BulletPoint key={j} text={b} />
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {tailored.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Projects</Text>
            {tailored.projects.map((proj, i) => (
              <View key={i} style={styles.projectItem} wrap={false}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{proj.title}</Text>
                  {proj.tags.length > 0 && (
                    <Text style={styles.projectTagline}>{proj.tags.slice(0, 5).join(' · ')}</Text>
                  )}
                </View>
                <Text style={styles.projectDesc}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {baseData.includeSections.education && baseData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {baseData.education.map((edu, i) => (
              <View key={i} style={styles.eduItem} wrap={false}>
                <View>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduSchool}>{edu.school}{edu.gpa ? ` · ${edu.gpa}` : ''}</Text>
                </View>
                <Text style={styles.eduYear}>{edu.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {baseData.includeSections.certifications && baseData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {baseData.certifications.map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <Text style={styles.eduDegree}>{cert.name}</Text>
                <Text style={styles.eduYear}>{cert.issuer} · {cert.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {baseData.websiteUrl ? baseData.websiteUrl.replace(/^https?:\/\//, '') : 'varadkodgire.dev'}
        </Text>
      </Page>
    </Document>
  );
}
