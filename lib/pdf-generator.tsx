import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { TailoredResume, ResumeData } from './types';

// Register a clean system font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1.5pt solid #d4834e',
    paddingBottom: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f0f0f',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    color: '#d4834e',
    fontWeight: 600,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  contactItem: {
    fontSize: 9,
    color: '#555',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#d4834e',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
    borderBottom: '0.5pt solid #e8e0d8',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.6,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  companyTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: '#111',
  },
  dateText: {
    fontSize: 9,
    color: '#777',
  },
  roleTitle: {
    fontSize: 9.5,
    color: '#555',
    fontWeight: 600,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9.5,
    color: '#333',
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 1.5,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: '#f5f0eb',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    color: '#333',
    fontWeight: 600,
  },
  projectItem: {
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#111',
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 9.5,
    color: '#444',
    lineHeight: 1.5,
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },
  projectTag: {
    fontSize: 8.5,
    color: '#d4834e',
    fontWeight: 600,
  },
  eduItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eduDegree: {
    fontSize: 10,
    fontWeight: 700,
    color: '#111',
  },
  eduSchool: {
    fontSize: 9.5,
    color: '#555',
  },
  eduYear: {
    fontSize: 9,
    color: '#777',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
    borderTop: '0.5pt solid #eee',
    paddingTop: 8,
  },
});

interface PDFProps {
  tailored: TailoredResume;
  baseData: ResumeData;
}

function BulletPoint({ text }: { text: string }) {
  return (
    <Text style={styles.bullet}>• {text}</Text>
  );
}

export function ResumePDF({ tailored, baseData }: PDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{baseData.fullName}</Text>
          <Text style={styles.jobTitle}>{tailored.title}</Text>
          <View style={styles.contactRow}>
            {baseData.email && <Text style={styles.contactItem}>{baseData.email}</Text>}
            {baseData.phone && <Text style={styles.contactItem}>{baseData.phone}</Text>}
            {baseData.location && <Text style={styles.contactItem}>{baseData.location}</Text>}
            {baseData.linkedinUrl && <Text style={styles.contactItem}>{baseData.linkedinUrl.replace('https://', '')}</Text>}
            {baseData.githubUrl && <Text style={styles.contactItem}>{baseData.githubUrl.replace('https://', '')}</Text>}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{tailored.summary}</Text>
        </View>

        {/* Skills */}
        {tailored.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Skills</Text>
            <View style={styles.skillsGrid}>
              {tailored.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {tailored.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {tailored.experience.map((exp, i) => (
              <View key={i} style={styles.experienceItem}>
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
              <View key={i} style={styles.projectItem}>
                <Text style={styles.projectTitle}>{proj.title}</Text>
                <Text style={styles.projectDesc}>{proj.description}</Text>
                <View style={styles.projectTags}>
                  {proj.tags.map((tag, j) => (
                    <Text key={j} style={styles.projectTag}>{tag}{j < proj.tags.length - 1 ? ' ·' : ''}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {baseData.includeSections.education && baseData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {baseData.education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <View>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduSchool}>{edu.school}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</Text>
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
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 9.5, color: '#333', fontWeight: 600 }}>{cert.name}</Text>
                <Text style={{ fontSize: 9, color: '#777' }}>{cert.issuer} · {cert.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by AI Resume Tailor · varadkodgire.dev
        </Text>
      </Page>
    </Document>
  );
}
