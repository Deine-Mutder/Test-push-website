/**
 * Seed-Script.
 *
 * WICHTIGER HINWEIS ZUR INHALTSQUALITÄT:
 * Die Inhalte (Erklärungen, Formeln, Fragen) in diesem Seed sind als
 * Qualitäts-Vorlage für das Thema "Bruchrechnung" (Mathematik) vollständig
 * ausgearbeitet. Für den Produktivbetrieb sollten alle Fachinhalte vor
 * Veröffentlichung durch eine Lehrkraft mit Bezug zum sächsischen Lehrplan
 * fachlich geprüft werden. Die übrigen Themen sind als Strukturbeispiele
 * angelegt (Architektur-Nachweis), aber inhaltlich noch nicht vollständig.
 *
 * SQLite-Hinweis: Da SQLite in Prisma keinen Json-Typ kennt, werden alle
 * strukturierten Wiki-Inhalte (definitions, examples, formulas, ...) hier
 * mit JSON.stringify() als Text gespeichert. Beim Lesen (siehe
 * topics.service.ts) muss entsprechend JSON.parse() erfolgen.
 *
 * Ausführen mit: npm run seed
 */
import { PrismaClient } from '@prisma/client';
import { QuestionUsage, Difficulty } from '../src/common/types/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding gestartet...');

  // ---------------------------------------------------------------------
  // Admin- und Demo-Nutzer
  // ---------------------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@lernplattform-sachsen.de' },
    update: {},
    create: {
      email: 'admin@lernplattform-sachsen.de',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Team',
      role: 'ADMIN',
    },
  });

  const demoPasswordHash = await bcrypt.hash('Demo123!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@lernplattform-sachsen.de' },
    update: {},
    create: {
      email: 'demo@lernplattform-sachsen.de',
      passwordHash: demoPasswordHash,
      firstName: 'Lena',
      lastName: 'Beispiel',
      role: 'STUDENT',
    },
  });

  // ---------------------------------------------------------------------
  // Fächer
  // ---------------------------------------------------------------------
  const mathematik = await prisma.subject.upsert({
    where: { slug: 'mathematik' },
    update: {},
    create: {
      slug: 'mathematik',
      name: 'Mathematik',
      description: 'Algebra, Geometrie, Funktionen und Stochastik für den Realschulabschluss.',
      icon: 'calculator',
      colorHex: '#2D3A8C',
      sortOrder: 1,
    },
  });

  const deutsch = await prisma.subject.upsert({
    where: { slug: 'deutsch' },
    update: {},
    create: {
      slug: 'deutsch',
      name: 'Deutsch',
      description: 'Textanalyse, Grammatik, Rechtschreibung und Aufsatzformen.',
      icon: 'book-open',
      colorHex: '#0F9D78',
      sortOrder: 2,
    },
  });

  const englisch = await prisma.subject.upsert({
    where: { slug: 'englisch' },
    update: {},
    create: {
      slug: 'englisch',
      name: 'Englisch',
      description: 'Grammar, Vocabulary, Reading & Listening Comprehension.',
      icon: 'globe',
      colorHex: '#C9852A',
      sortOrder: 3,
    },
  });

  // ---------------------------------------------------------------------
  // Mathematik-Themen (Struktur gemäß sächsischem Lehrplan-Themenkatalog)
  // ---------------------------------------------------------------------
  const topicDefs = [
    { slug: 'bruchrechnung', name: 'Bruchrechnung', sortOrder: 1 },
    { slug: 'geometrie', name: 'Geometrie', sortOrder: 2 },
    { slug: 'funktionen', name: 'Funktionen', sortOrder: 3 },
    { slug: 'gleichungen', name: 'Gleichungen und Ungleichungen', sortOrder: 4 },
    { slug: 'prozentrechnung', name: 'Prozent- und Zinsrechnung', sortOrder: 5 },
    { slug: 'stochastik', name: 'Wahrscheinlichkeit und Statistik', sortOrder: 6 },
  ];

  const mathTopics: Record<string, { id: string }> = {};
  for (const t of topicDefs) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_slug: { subjectId: mathematik.id, slug: t.slug } },
      update: {},
      create: { subjectId: mathematik.id, slug: t.slug, name: t.name, sortOrder: t.sortOrder },
    });
    mathTopics[t.slug] = topic;
  }

  // Deutsch/Englisch: Struktur-Beispielthemen (Inhalte folgen in Ausbaustufe 2)
  for (const [slug, name, sortOrder] of [
    ['rechtschreibung', 'Rechtschreibung und Zeichensetzung', 1],
    ['textanalyse', 'Textanalyse und Interpretation', 2],
    ['grammatik', 'Grammatik', 3],
  ] as const) {
    await prisma.topic.upsert({
      where: { subjectId_slug: { subjectId: deutsch.id, slug } },
      update: {},
      create: { subjectId: deutsch.id, slug, name, sortOrder },
    });
  }
  for (const [slug, name, sortOrder] of [
    ['tenses', 'Tenses (Zeitformen)', 1],
    ['vocabulary', 'Vocabulary', 2],
    ['reading-comprehension', 'Reading Comprehension', 3],
  ] as const) {
    await prisma.topic.upsert({
      where: { subjectId_slug: { subjectId: englisch.id, slug } },
      update: {},
      create: { subjectId: englisch.id, slug, name, sortOrder },
    });
  }

  // ---------------------------------------------------------------------
  // Wissens-Wiki: Bruchrechnung (vollständig ausgearbeitete Vorlage)
  // ---------------------------------------------------------------------
  const bruchTopic = mathTopics['bruchrechnung'];

  await prisma.subTopic.upsert({
    where: { topicId_slug: { topicId: bruchTopic.id, slug: 'grundlagen-der-bruchrechnung' } },
    update: {},
    create: {
      topicId: bruchTopic.id,
      slug: 'grundlagen-der-bruchrechnung',
      name: 'Grundlagen der Bruchrechnung',
      sortOrder: 1,
      explanation:
        'Ein Bruch beschreibt einen Teil eines Ganzen. Er besteht aus Zähler (oben) und Nenner ' +
        '(unten), getrennt durch einen Bruchstrich: Zähler/Nenner. Der Nenner gibt an, in wie ' +
        'viele gleich große Teile das Ganze geteilt wird, der Zähler gibt an, wie viele dieser ' +
        'Teile gemeint sind. Beispiel: 3/4 bedeutet "3 von 4 gleich großen Teilen". Brüche lassen ' +
        'sich erweitern (Zähler und Nenner mit derselben Zahl multiplizieren) oder kürzen (durch ' +
        'denselben Wert teilen), ohne dass sich ihr Wert ändert.',
      summary:
        'Ein Bruch ist Zähler/Nenner und beschreibt einen Teil eines Ganzen. Erweitern und Kürzen ' +
        'verändern den Wert eines Bruchs nicht, nur seine Schreibweise.',
      definitions: JSON.stringify([
        { term: 'Zähler', definition: 'Die obere Zahl eines Bruchs; gibt die Anzahl der Teile an.' },
        { term: 'Nenner', definition: 'Die untere Zahl eines Bruchs; gibt die Gesamtzahl der gleich großen Teile an.' },
        { term: 'Echter Bruch', definition: 'Ein Bruch, bei dem der Zähler kleiner ist als der Nenner (z.B. 3/4).' },
        { term: 'Unechter Bruch', definition: 'Ein Bruch, bei dem der Zähler größer oder gleich dem Nenner ist (z.B. 5/4).' },
        { term: 'Kürzen', definition: 'Zähler und Nenner durch dieselbe Zahl teilen, um den Bruch zu vereinfachen.' },
        { term: 'Erweitern', definition: 'Zähler und Nenner mit derselben Zahl multiplizieren, ohne den Wert zu verändern.' },
      ]),
      examples: JSON.stringify([
        { title: 'Kürzen', content: '8/12 kürzen: größter gemeinsamer Teiler von 8 und 12 ist 4. 8÷4 / 12÷4 = 2/3.' },
        { title: 'Erweitern', content: '2/3 auf den Nenner 12 erweitern: 12÷3 = 4, also Zähler und Nenner mit 4 multiplizieren: 8/12.' },
      ]),
      formulas: JSON.stringify([
        { label: 'Kürzen', formula: 'a/b = (a÷n)/(b÷n)', description: 'n ist ein gemeinsamer Teiler von a und b.' },
        { label: 'Erweitern', formula: 'a/b = (a·n)/(b·n)', description: 'n ist eine beliebige natürliche Zahl ungleich 0.' },
      ]),
      keyTakeaways: JSON.stringify([
        'Der Wert eines Bruchs ändert sich beim Kürzen und Erweitern nicht.',
        'Ein Bruch ist immer vollständig gekürzt, wenn Zähler und Nenner keinen gemeinsamen Teiler außer 1 haben.',
      ]),
      stepByStepGuides: JSON.stringify([
        {
          title: 'Bruch vollständig kürzen',
          steps: [
            'Größten gemeinsamen Teiler (ggT) von Zähler und Nenner bestimmen.',
            'Zähler durch den ggT teilen.',
            'Nenner durch den ggT teilen.',
            'Ergebnis ist der vollständig gekürzte Bruch.',
          ],
        },
      ]),
      commonMistakes: JSON.stringify([
        { mistake: 'Nur den Zähler oder nur den Nenner verändern.', correction: 'Beim Kürzen/Erweitern müssen IMMER beide Zahlen gleich behandelt werden.' },
        { mistake: 'Addieren statt multiplizieren/dividieren beim Erweitern/Kürzen.', correction: 'Erweitern und Kürzen funktionieren nur über Multiplikation bzw. Division, nicht über Addition/Subtraktion.' },
      ]),
      tips: JSON.stringify([
        'Bei der Suche nach dem ggT hilft die Primfaktorzerlegung beider Zahlen.',
        'Ein gekürzter Bruch ist leichter mit anderen Brüchen zu vergleichen.',
      ]),
      examTaskExamples: JSON.stringify([
        {
          question: 'Kürze den Bruch 18/24 vollständig.',
          solution: '3/4',
          explanation: 'ggT(18,24) = 6. 18÷6=3, 24÷6=4, also 3/4.',
        },
      ]),
    },
  });

  await prisma.subTopic.upsert({
    where: { topicId_slug: { topicId: bruchTopic.id, slug: 'addition-und-subtraktion' } },
    update: {},
    create: {
      topicId: bruchTopic.id,
      slug: 'addition-und-subtraktion',
      name: 'Addition und Subtraktion von Brüchen',
      sortOrder: 2,
      explanation:
        'Brüche können nur addiert oder subtrahiert werden, wenn sie denselben Nenner haben ' +
        '(gleichnamig sind). Haben zwei Brüche unterschiedliche Nenner, müssen sie zuerst auf ' +
        'einen gemeinsamen Nenner gebracht werden - meist das kleinste gemeinsame Vielfache ' +
        '(kgV) beider Nenner. Danach werden nur die Zähler addiert bzw. subtrahiert, der Nenner ' +
        'bleibt gleich.',
      summary:
        'Vor dem Addieren/Subtrahieren müssen Brüche gleichnamig gemacht werden (gemeinsamer ' +
        'Nenner). Dann werden nur die Zähler verrechnet.',
      definitions: JSON.stringify([
        { term: 'Gleichnamige Brüche', definition: 'Brüche mit demselben Nenner.' },
        { term: 'Kleinstes gemeinsames Vielfaches (kgV)', definition: 'Die kleinste Zahl, die durch beide Nenner ohne Rest teilbar ist.' },
      ]),
      examples: JSON.stringify([
        { title: 'Gleichnamige Addition', content: '2/5 + 1/5 = 3/5 (nur Zähler addieren, Nenner bleibt).' },
        { title: 'Ungleichnamige Addition', content: '1/3 + 1/4: kgV(3,4)=12, also 4/12 + 3/12 = 7/12.' },
      ]),
      formulas: JSON.stringify([
        { label: 'Addition (gleichnamig)', formula: 'a/n + b/n = (a+b)/n' },
        { label: 'Subtraktion (gleichnamig)', formula: 'a/n − b/n = (a−b)/n' },
      ]),
      keyTakeaways: JSON.stringify([
        'Nenner werden bei Addition/Subtraktion NICHT addiert.',
        'Immer zuerst auf den gemeinsamen Nenner bringen, dann rechnen.',
      ]),
      stepByStepGuides: JSON.stringify([
        {
          title: 'Zwei ungleichnamige Brüche addieren',
          steps: [
            'Kleinstes gemeinsames Vielfaches (kgV) der Nenner bestimmen.',
            'Beide Brüche auf diesen Nenner erweitern.',
            'Zähler addieren, Nenner beibehalten.',
            'Ergebnis so weit wie möglich kürzen.',
          ],
        },
      ]),
      commonMistakes: JSON.stringify([
        { mistake: 'Nenner mit addieren, z.B. 1/3 + 1/4 = 2/7.', correction: 'Nur Zähler werden addiert, der (gemeinsame) Nenner bleibt bestehen.' },
      ]),
      tips: JSON.stringify(['Am Ende immer prüfen, ob das Ergebnis noch gekürzt werden kann.']),
      examTaskExamples: JSON.stringify([
        {
          question: 'Berechne: 3/8 + 1/4',
          solution: '5/8',
          explanation: 'kgV(8,4)=8. 1/4 = 2/8. 3/8 + 2/8 = 5/8.',
        },
      ]),
    },
  });

  // ---------------------------------------------------------------------
  // Fragen: Bruchrechnung (15 für Themen-Lerntest + Teil des Einstufungstest-Pools)
  // ---------------------------------------------------------------------
  const bruchFragen: Array<{
    prompt: string;
    explanation: string;
    difficulty: Difficulty;
    answers: { text: string; isCorrect: boolean }[];
  }> = [
    {
      prompt: 'Kürze den Bruch 8/12 vollständig.',
      explanation: 'ggT(8,12) = 4. 8÷4=2, 12÷4=3, also 2/3.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '2/3', isCorrect: true },
        { text: '4/6', isCorrect: false },
        { text: '1/2', isCorrect: false },
        { text: '3/4', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 1/4 + 1/2',
      explanation: '1/2 = 2/4. 1/4 + 2/4 = 3/4.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '3/4', isCorrect: true },
        { text: '2/6', isCorrect: false },
        { text: '1/3', isCorrect: false },
        { text: '2/4', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 5/6 − 1/3',
      explanation: '1/3 = 2/6. 5/6 − 2/6 = 3/6 = 1/2.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '1/2', isCorrect: true },
        { text: '4/3', isCorrect: false },
        { text: '4/6', isCorrect: false },
        { text: '1/3', isCorrect: false },
      ],
    },
    {
      prompt: 'Welcher Bruch ist gleichwertig zu 3/4?',
      explanation: 'Erweitern mit 3: 3·3/4·3 = 9/12.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '9/12', isCorrect: true },
        { text: '6/9', isCorrect: false },
        { text: '4/5', isCorrect: false },
        { text: '3/5', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 2/3 · 3/4',
      explanation: 'Zähler mal Zähler, Nenner mal Nenner: 6/12 = 1/2.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '1/2', isCorrect: true },
        { text: '5/7', isCorrect: false },
        { text: '6/12', isCorrect: false },
        { text: '2/4', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 3/4 ÷ 1/2',
      explanation: 'Division durch einen Bruch = Multiplikation mit dem Kehrwert: 3/4 · 2/1 = 6/4 = 3/2.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '3/2', isCorrect: true },
        { text: '3/8', isCorrect: false },
        { text: '2/3', isCorrect: false },
        { text: '6/4', isCorrect: false },
      ],
    },
    {
      prompt: 'Was ist der Kehrwert von 5/7?',
      explanation: 'Beim Kehrwert werden Zähler und Nenner vertauscht: 7/5.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '7/5', isCorrect: true },
        { text: '5/7', isCorrect: false },
        { text: '-5/7', isCorrect: false },
        { text: '1/5', isCorrect: false },
      ],
    },
    {
      prompt: 'Wandle den unechten Bruch 11/4 in eine gemischte Zahl um.',
      explanation: '11 ÷ 4 = 2 Rest 3, also 2 3/4.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '2 3/4', isCorrect: true },
        { text: '3 1/4', isCorrect: false },
        { text: '2 1/4', isCorrect: false },
        { text: '4 3/11', isCorrect: false },
      ],
    },
    {
      prompt: 'Wandle die gemischte Zahl 3 1/5 in einen unechten Bruch um.',
      explanation: '3·5 + 1 = 16, also 16/5.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '16/5', isCorrect: true },
        { text: '15/5', isCorrect: false },
        { text: '13/5', isCorrect: false },
        { text: '16/15', isCorrect: false },
      ],
    },
    {
      prompt: 'Welcher Bruch ist am größten?',
      explanation: 'Auf gemeinsamen Nenner 12 bringen: 3/4=9/12, 2/3=8/12, 5/6=10/12, 7/12. Größter ist 5/6.',
      difficulty: Difficulty.HARD,
      answers: [
        { text: '5/6', isCorrect: true },
        { text: '3/4', isCorrect: false },
        { text: '2/3', isCorrect: false },
        { text: '7/12', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 7/10 − 2/5',
      explanation: '2/5 = 4/10. 7/10 − 4/10 = 3/10.',
      difficulty: Difficulty.MEDIUM,
      answers: [
        { text: '3/10', isCorrect: true },
        { text: '5/5', isCorrect: false },
        { text: '9/10', isCorrect: false },
        { text: '1/2', isCorrect: false },
      ],
    },
    {
      prompt: 'Vereinfache: 15/45',
      explanation: 'ggT(15,45)=15. 15÷15=1, 45÷15=3, also 1/3.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '1/3', isCorrect: true },
        { text: '1/2', isCorrect: false },
        { text: '3/9', isCorrect: false },
        { text: '5/15', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 1/2 + 1/3 + 1/6',
      explanation: 'kgV(2,3,6)=6. 3/6 + 2/6 + 1/6 = 6/6 = 1.',
      difficulty: Difficulty.HARD,
      answers: [
        { text: '1', isCorrect: true },
        { text: '3/11', isCorrect: false },
        { text: '5/6', isCorrect: false },
        { text: '6/11', isCorrect: false },
      ],
    },
    {
      prompt: 'Ein Kuchen wird in 8 gleich große Stücke geteilt. Ein Gast isst 3 Stücke. Welcher Anteil ist das?',
      explanation: '3 von 8 Stücken entsprechen 3/8 des Kuchens.',
      difficulty: Difficulty.EASY,
      answers: [
        { text: '3/8', isCorrect: true },
        { text: '8/3', isCorrect: false },
        { text: '3/5', isCorrect: false },
        { text: '1/3', isCorrect: false },
      ],
    },
    {
      prompt: 'Berechne: 4/9 · 3/8',
      explanation: '4·3=12, 9·8=72, 12/72 = 1/6 (kürzen durch 12).',
      difficulty: Difficulty.HARD,
      answers: [
        { text: '1/6', isCorrect: true },
        { text: '12/72', isCorrect: false },
        { text: '7/17', isCorrect: false },
        { text: '1/2', isCorrect: false },
      ],
    },
  ];

  for (const f of bruchFragen) {
    await prisma.question.create({
      data: {
        topicId: bruchTopic.id,
        usage: QuestionUsage.BOTH,
        difficulty: f.difficulty,
        prompt: f.prompt,
        explanation: f.explanation,
        answers: { create: f.answers },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Platzhalter-Fragen für die übrigen Mathe-Themen, damit der
  // Einstufungstest lauffähig ist (gleichmäßige Themenverteilung über 50 Fragen).
  // Fachlich zu verifizieren / auszubauen vor Produktivbetrieb.
  // ---------------------------------------------------------------------
  const placeholderQuestions: Record<string, Array<{ prompt: string; correct: string; wrong: string[] }>> = {
    geometrie: [
      { prompt: 'Wie viele Seiten hat ein Sechseck?', correct: '6', wrong: ['5', '7', '8'] },
      { prompt: 'Wie berechnet man den Flächeninhalt eines Rechtecks?', correct: 'Länge · Breite', wrong: ['Länge + Breite', '2·(Länge+Breite)', 'Länge²'] },
      { prompt: 'Wie viel Grad hat die Innenwinkelsumme eines Dreiecks?', correct: '180°', wrong: ['90°', '270°', '360°'] },
      { prompt: 'Wie berechnet man den Umfang eines Kreises?', correct: '2·π·r', wrong: ['π·r²', 'π·d²', 'r²'] },
      { prompt: 'Wie berechnet man den Flächeninhalt eines Kreises?', correct: 'π·r²', wrong: ['2·π·r', 'π·d', 'r²'] },
    ],
    funktionen: [
      { prompt: 'Wie lautet die allgemeine Form einer linearen Funktion?', correct: 'y = m·x + b', wrong: ['y = x²+b', 'y = m/x', 'y = m·x²'] },
      { prompt: 'Was beschreibt "m" in y = m·x + b?', correct: 'Die Steigung', wrong: ['Den y-Achsenabschnitt', 'Den x-Achsenabschnitt', 'Die Nullstelle'] },
      { prompt: 'Was beschreibt "b" in y = m·x + b?', correct: 'Den y-Achsenabschnitt', wrong: ['Die Steigung', 'Die Nullstelle', 'Den Definitionsbereich'] },
      { prompt: 'Wann ist eine Funktion streng monoton steigend?', correct: 'Wenn m > 0 ist', wrong: ['Wenn m < 0 ist', 'Wenn m = 0 ist', 'Wenn b > 0 ist'] },
      { prompt: 'Wie nennt man die Stelle, an der eine Funktion die x-Achse schneidet?', correct: 'Nullstelle', wrong: ['Extremum', 'Achsenabschnitt', 'Wendepunkt'] },
    ],
    gleichungen: [
      { prompt: 'Löse: x + 5 = 12', correct: 'x = 7', wrong: ['x = 17', 'x = 5', 'x = 60'] },
      { prompt: 'Löse: 3x = 21', correct: 'x = 7', wrong: ['x = 63', 'x = 18', 'x = 24'] },
      { prompt: 'Löse: 2x − 4 = 10', correct: 'x = 7', wrong: ['x = 3', 'x = 6', 'x = 12'] },
      { prompt: 'Was macht man zuerst bei x/3 = 6?', correct: 'Beide Seiten mit 3 multiplizieren', wrong: ['Beide Seiten durch 3 teilen', '3 addieren', '3 subtrahieren'] },
      { prompt: 'Löse die Ungleichung: x + 2 > 5', correct: 'x > 3', wrong: ['x < 3', 'x > 7', 'x < 7'] },
    ],
    prozentrechnung: [
      { prompt: 'Wie viel sind 25% von 80?', correct: '20', wrong: ['15', '25', '40'] },
      { prompt: 'Wie berechnet man den Prozentsatz?', correct: '(Anteil ÷ Grundwert) · 100', wrong: ['Anteil · Grundwert', 'Grundwert ÷ Anteil', 'Anteil + Grundwert'] },
      { prompt: 'Ein Preis von 50€ wird um 10% erhöht. Neuer Preis?', correct: '55€', wrong: ['60€', '45€', '51€'] },
      { prompt: 'Was ist der Grundwert bei "20% von 150 sind 30"?', correct: '150', wrong: ['30', '20', '6'] },
      { prompt: 'Wie berechnet man Zinsen p.a. bei Kapital K und Zinssatz p%?', correct: 'K · p/100', wrong: ['K + p', 'K/p', 'K·p'] },
    ],
    stochastik: [
      { prompt: 'Wie hoch ist die Wahrscheinlichkeit, beim Würfeln eine 6 zu würfeln?', correct: '1/6', wrong: ['1/2', '1/3', '1/12'] },
      { prompt: 'Was ist der Mittelwert (arithmetisches Mittel) von 2, 4, 6?', correct: '4', wrong: ['3', '6', '12'] },
      { prompt: 'Wie viele mögliche Ergebnisse gibt es beim einmaligen Münzwurf?', correct: '2', wrong: ['1', '3', '4'] },
      { prompt: 'Was beschreibt der Median einer Datenreihe?', correct: 'Den mittleren Wert einer geordneten Reihe', wrong: ['Den häufigsten Wert', 'Die Summe aller Werte', 'Den größten Wert'] },
      { prompt: 'Wie hoch ist die Wahrscheinlichkeit für "Kopf oder Zahl" beim Münzwurf zusammen?', correct: '1 (100%)', wrong: ['0,5', '0,25', '2'] },
    ],
  };

  for (const [slug, questions] of Object.entries(placeholderQuestions)) {
    const topic = mathTopics[slug];
    for (const q of questions) {
      const options = shuffleArray([
        { text: q.correct, isCorrect: true },
        ...q.wrong.map((w) => ({ text: w, isCorrect: false })),
      ]);
      await prisma.question.create({
        data: {
          topicId: topic.id,
          usage: QuestionUsage.BOTH,
          difficulty: Difficulty.MEDIUM,
          prompt: q.prompt,
          explanation: `Die richtige Antwort ist "${q.correct}".`,
          answers: { create: options },
        },
      });
    }
  }

  console.log('Seeding abgeschlossen.');
  console.log('Admin-Login: admin@lernplattform-sachsen.de / Admin123!');
  console.log('Demo-Login:  demo@lernplattform-sachsen.de / Demo123!');
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
