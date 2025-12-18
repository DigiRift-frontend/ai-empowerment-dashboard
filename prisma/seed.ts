import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.adminMessage.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.workshop.deleteMany()
  await prisma.customerRoadmapItem.deleteMany()
  await prisma.customerSchulungAssignment.deleteMany()
  await prisma.schulungSerieItem.deleteMany()
  await prisma.schulungSerie.deleteMany()
  await prisma.schulung.deleteMany()
  await prisma.moduleTemplate.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.moduleHistoryEntry.deleteMany()
  await prisma.testFeedback.deleteMany()
  await prisma.acceptanceCriterion.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.externalCost.deleteMany()
  await prisma.module.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.customerAdvisor.deleteMany()

  // Create Team Members
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        id: 'tm1',
        name: 'Max Müller',
        role: 'Senior AI Engineer',
        department: 'Engineering',
        email: 'max.mueller@aiempowerment.de',
      },
    }),
    prisma.teamMember.create({
      data: {
        id: 'tm2',
        name: 'Lisa Schmidt',
        role: 'ML Engineer',
        department: 'Data Science',
        email: 'lisa.schmidt@aiempowerment.de',
      },
    }),
    prisma.teamMember.create({
      data: {
        id: 'tm3',
        name: 'Tom Weber',
        role: 'Customer Success Manager',
        department: 'Customer Success',
        email: 'tom.weber@aiempowerment.de',
      },
    }),
    prisma.teamMember.create({
      data: {
        id: 'tm4',
        name: 'Anna Fischer',
        role: 'Solution Architect',
        department: 'Architecture',
        email: 'anna.fischer@aiempowerment.de',
      },
    }),
  ])
  console.log(`Created ${teamMembers.length} team members`)

  // Create Customer Advisor
  const advisor = await prisma.customerAdvisor.create({
    data: {
      id: 'advisor1',
      name: 'Sarah Meyer',
      role: 'Customer Success Manager',
      email: 'sarah.meyer@aiempowerment.de',
      phone: '+49 123 456789',
      calendlyUrl: 'https://calendly.com/sarah-meyer',
    },
  })
  console.log('Created customer advisor')

  // Create Membership
  const membership = await prisma.membership.create({
    data: {
      id: 'membership1',
      tier: 'M',
      monthlyPoints: 100,
      usedPoints: 67,
      remainingPoints: 33,
      monthlyPrice: 4900,
      contractStart: new Date('2024-01-01'),
      periodStart: new Date('2024-12-01'),
      periodEnd: new Date('2025-01-01'),
      carriedOverMonth1: 5,
      carriedOverMonth2: 8,
      carriedOverMonth3: 12,
    },
  })
  console.log('Created membership')

  // Create Customer
  const customer = await prisma.customer.create({
    data: {
      id: 'customer1',
      name: 'Thomas Müller',
      companyName: 'TechCorp GmbH',
      email: 'mueller@techcorp.de',
      customerCode: '4829',
      membershipId: membership.id,
      advisorId: advisor.id,
    },
  })
  console.log('Created customer')

  // Create Modules
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        id: 'mod1',
        name: 'KI-Dokumentenanalyse',
        description: 'Automatische Analyse und Kategorisierung von Geschäftsdokumenten mittels KI',
        status: 'abgeschlossen',
        priority: 'hoch',
        progress: 100,
        monthlyMaintenancePoints: 8,
        softwareUrl: 'https://docs.techcorp.aiempowerment.de',
        showInRoadmap: true,
        roadmapOrder: 1,
        customerId: customer.id,
        assigneeId: 'tm1',
        acceptanceStatus: 'akzeptiert',
        acceptedAt: new Date('2024-10-15'),
        acceptedBy: 'Thomas Müller',
        completedDate: new Date('2024-10-15'),
        startDate: new Date('2024-08-01'),
        targetDate: new Date('2024-10-01'),
      },
    }),
    prisma.module.create({
      data: {
        id: 'mod2',
        name: 'Chatbot für Kundenservice',
        description: 'Intelligenter Chatbot für First-Level-Support mit Wissensdatenbank-Anbindung',
        status: 'im_test',
        priority: 'hoch',
        progress: 85,
        monthlyMaintenancePoints: 12,
        showInRoadmap: true,
        roadmapOrder: 2,
        customerId: customer.id,
        assigneeId: 'tm2',
        acceptanceStatus: 'ausstehend',
        startDate: new Date('2024-10-01'),
        targetDate: new Date('2024-12-15'),
      },
    }),
    prisma.module.create({
      data: {
        id: 'mod3',
        name: 'Predictive Maintenance',
        description: 'KI-basierte Vorhersage von Wartungsbedarf für Produktionsanlagen',
        status: 'in_arbeit',
        priority: 'mittel',
        progress: 45,
        monthlyMaintenancePoints: 15,
        showInRoadmap: true,
        roadmapOrder: 3,
        customerId: customer.id,
        assigneeId: 'tm1',
        startDate: new Date('2024-11-01'),
        targetDate: new Date('2025-02-01'),
      },
    }),
    prisma.module.create({
      data: {
        id: 'mod4',
        name: 'Sentiment-Analyse',
        description: 'Analyse von Kundenfeedback und Social Media Mentions',
        status: 'geplant',
        priority: 'niedrig',
        progress: 0,
        monthlyMaintenancePoints: 6,
        showInRoadmap: true,
        roadmapOrder: 4,
        customerId: customer.id,
        targetDate: new Date('2025-04-01'),
      },
    }),
  ])
  console.log(`Created ${modules.length} modules`)

  // Create Acceptance Criteria for Module 2 (im Test)
  await Promise.all([
    prisma.acceptanceCriterion.create({
      data: {
        moduleId: 'mod2',
        description: 'Chatbot beantwortet 80% der Standardanfragen korrekt',
        accepted: true,
      },
    }),
    prisma.acceptanceCriterion.create({
      data: {
        moduleId: 'mod2',
        description: 'Durchschnittliche Antwortzeit unter 3 Sekunden',
        accepted: true,
      },
    }),
    prisma.acceptanceCriterion.create({
      data: {
        moduleId: 'mod2',
        description: 'Nahtlose Übergabe an menschlichen Support möglich',
        accepted: false,
      },
    }),
    prisma.acceptanceCriterion.create({
      data: {
        moduleId: 'mod2',
        description: 'Integration mit bestehendem CRM-System',
        accepted: false,
      },
    }),
  ])
  console.log('Created acceptance criteria')

  // Create Test Feedback
  await prisma.testFeedback.create({
    data: {
      moduleId: 'mod2',
      feedback: 'Die Übergabe an den menschlichen Support funktioniert noch nicht zuverlässig bei komplexen Anfragen.',
      resolved: false,
    },
  })
  console.log('Created test feedback')

  // Create Point Transactions
  const transactions = await Promise.all([
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-01'),
        description: 'Chatbot Weiterentwicklung - NLP Optimierung',
        points: 15,
        category: 'entwicklung',
        moduleId: 'mod2',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-03'),
        description: 'Dokumentenanalyse - Monatliche Wartung',
        points: 8,
        category: 'wartung',
        moduleId: 'mod1',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-05'),
        description: 'Team-Workshop: KI im Kundenservice',
        points: 12,
        category: 'schulung',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-08'),
        description: 'Predictive Maintenance - Datenmodellierung',
        points: 20,
        category: 'entwicklung',
        moduleId: 'mod3',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-10'),
        description: 'Strategieberatung Use-Case Priorisierung',
        points: 8,
        category: 'beratung',
      },
    }),
    prisma.pointTransaction.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-12'),
        description: 'Datenanalyse für Sentiment-Modul',
        points: 4,
        category: 'analyse',
      },
    }),
  ])
  console.log(`Created ${transactions.length} point transactions`)

  // Create External Costs
  await Promise.all([
    prisma.externalCost.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-01'),
        type: 'tokens',
        description: 'OpenAI API - GPT-4 Tokens',
        amount: 125.50,
        unit: 'EUR',
      },
    }),
    prisma.externalCost.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-01'),
        type: 'server',
        description: 'AWS EC2 - Inference Server',
        amount: 89.00,
        unit: 'EUR',
      },
    }),
    prisma.externalCost.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-12-05'),
        type: 'telefonie',
        description: 'Twilio - Voice Bot Minuten',
        amount: 34.20,
        unit: 'EUR',
      },
    }),
  ])
  console.log('Created external costs')

  // Create Module Templates (Katalog)
  await Promise.all([
    prisma.moduleTemplate.create({
      data: {
        name: 'KI-Dokumentenanalyse',
        description: 'Automatische Analyse und Kategorisierung von Geschäftsdokumenten mittels KI. Erkennt Dokumenttypen, extrahiert relevante Informationen und klassifiziert Inhalte.',
        category: 'Dokumentenverarbeitung',
        estimatedPoints: 40,
        estimatedMaintenancePoints: 8,
        features: ['OCR-Texterkennung', 'Dokumentklassifizierung', 'Informationsextraktion', 'Multi-Format Support'],
      },
    }),
    prisma.moduleTemplate.create({
      data: {
        name: 'Intelligenter Chatbot',
        description: 'KI-gestützter Chatbot für Kundenservice mit natürlicher Sprachverarbeitung und Wissensdatenbank-Anbindung.',
        category: 'Kundenservice',
        estimatedPoints: 60,
        estimatedMaintenancePoints: 12,
        features: ['Natural Language Processing', 'Kontextverständnis', 'Multi-Channel Support', 'Eskalation an Mitarbeiter'],
      },
    }),
    prisma.moduleTemplate.create({
      data: {
        name: 'Predictive Maintenance',
        description: 'Vorhersage von Wartungsbedarf durch Analyse von Sensordaten und historischen Ausfallmustern.',
        category: 'Produktion',
        estimatedPoints: 80,
        estimatedMaintenancePoints: 15,
        features: ['Sensordaten-Analyse', 'Anomalie-Erkennung', 'Wartungsplanung', 'Dashboard & Alerts'],
      },
    }),
    prisma.moduleTemplate.create({
      data: {
        name: 'Sentiment-Analyse',
        description: 'Analyse von Kundenfeedback, Bewertungen und Social Media zur Stimmungserfassung.',
        category: 'Marketing',
        estimatedPoints: 35,
        estimatedMaintenancePoints: 6,
        features: ['Social Media Monitoring', 'Review-Analyse', 'Trend-Erkennung', 'Automatische Reports'],
      },
    }),
    prisma.moduleTemplate.create({
      data: {
        name: 'Intelligente Suche',
        description: 'Semantische Suche über Unternehmensdokumente mit KI-gestütztem Ranking.',
        category: 'Wissensmanagement',
        estimatedPoints: 45,
        estimatedMaintenancePoints: 8,
        features: ['Semantische Suche', 'Auto-Tagging', 'Relevanz-Ranking', 'Facetten-Filter'],
      },
    }),
  ])
  console.log('Created module templates')

  // Create Schulungen (Katalog)
  const schulungen = await Promise.all([
    prisma.schulung.create({
      data: {
        id: 'sch1',
        title: 'KI-Grundlagen für Entscheider',
        description: 'Einführung in künstliche Intelligenz für Management und Führungskräfte',
        duration: '4 Stunden',
        points: 8,
        category: 'grundlagen',
      },
    }),
    prisma.schulung.create({
      data: {
        id: 'sch2',
        title: 'Prompt Engineering Basics',
        description: 'Effektive Kommunikation mit KI-Systemen für bessere Ergebnisse',
        duration: '2 Stunden',
        points: 4,
        category: 'grundlagen',
      },
    }),
    prisma.schulung.create({
      data: {
        id: 'sch3',
        title: 'KI im Kundenservice',
        description: 'Best Practices für den Einsatz von KI im Customer Support',
        duration: '3 Stunden',
        points: 6,
        category: 'fortgeschritten',
      },
    }),
    prisma.schulung.create({
      data: {
        id: 'sch4',
        title: 'Datenqualität für KI',
        description: 'Wie bereite ich Daten optimal für KI-Anwendungen vor?',
        duration: '4 Stunden',
        points: 8,
        category: 'fortgeschritten',
      },
    }),
    prisma.schulung.create({
      data: {
        id: 'sch5',
        title: 'Advanced Prompt Engineering',
        description: 'Fortgeschrittene Techniken für komplexe KI-Interaktionen',
        duration: '3 Stunden',
        points: 6,
        category: 'spezialisiert',
      },
    }),
  ])
  console.log(`Created ${schulungen.length} schulungen`)

  // Create Schulung Serie
  const serie = await prisma.schulungSerie.create({
    data: {
      id: 'serie1',
      title: 'KI-Einführungspaket',
      description: 'Komplettes Schulungspaket für den KI-Einstieg',
      totalPoints: 18,
    },
  })

  await Promise.all([
    prisma.schulungSerieItem.create({
      data: {
        serieId: serie.id,
        schulungId: 'sch1',
        order: 1,
      },
    }),
    prisma.schulungSerieItem.create({
      data: {
        serieId: serie.id,
        schulungId: 'sch2',
        order: 2,
      },
    }),
    prisma.schulungSerieItem.create({
      data: {
        serieId: serie.id,
        schulungId: 'sch3',
        order: 3,
      },
    }),
  ])
  console.log('Created schulung serie')

  // Create Workshops
  await Promise.all([
    prisma.workshop.create({
      data: {
        customerId: customer.id,
        title: 'KI-Strategie Workshop',
        date: new Date('2024-11-15'),
        duration: '1 Tag',
        participants: 8,
        pointsUsed: 16,
        status: 'abgeschlossen',
      },
    }),
    prisma.workshop.create({
      data: {
        customerId: customer.id,
        title: 'Prompt Engineering Training',
        date: new Date('2024-12-20'),
        duration: '4 Stunden',
        participants: 12,
        pointsUsed: 8,
        status: 'geplant',
      },
    }),
  ])
  console.log('Created workshops')

  // Create Decisions
  await prisma.decision.create({
    data: {
      customerId: customer.id,
      date: new Date('2024-11-20'),
      title: 'Chatbot Technologie-Stack',
      description: 'Entscheidung für GPT-4 als Basis-Modell mit RAG-Architektur',
      participants: ['Thomas Müller', 'Sarah Meyer', 'Max Müller'],
    },
  })
  console.log('Created decisions')

  // Create Meetings
  await Promise.all([
    prisma.meeting.create({
      data: {
        customerId: customer.id,
        title: 'Monatliches Review',
        date: new Date('2024-12-18'),
        type: 'review',
      },
    }),
    prisma.meeting.create({
      data: {
        customerId: customer.id,
        title: 'Chatbot Test-Abnahme',
        date: new Date('2024-12-22'),
        type: 'abstimmung',
      },
    }),
  ])
  console.log('Created meetings')

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        customerId: customer.id,
        type: 'test_required',
        title: 'Chatbot bereit zum Testen',
        message: 'Der Chatbot für Kundenservice ist bereit für die Testphase. Bitte testen Sie die Funktionen und geben Sie Feedback.',
        read: false,
        actionRequired: true,
        relatedProjectId: 'mod2',
        relatedUrl: '/modules/mod2',
      },
    }),
    prisma.notification.create({
      data: {
        customerId: customer.id,
        type: 'acceptance_required',
        title: 'Akzeptanzkriterien prüfen',
        message: 'Bitte prüfen und bestätigen Sie die Akzeptanzkriterien für den Chatbot.',
        read: false,
        actionRequired: true,
        relatedProjectId: 'mod2',
        relatedUrl: '/modules/mod2',
      },
    }),
    prisma.notification.create({
      data: {
        customerId: customer.id,
        type: 'project_update',
        title: 'Predictive Maintenance Update',
        message: 'Die Datenmodellierung für Predictive Maintenance wurde abgeschlossen. Nächster Schritt: Training des ML-Modells.',
        read: true,
        actionRequired: false,
        relatedProjectId: 'mod3',
      },
    }),
  ])
  console.log('Created notifications')

  // Create second customer for admin view
  const membership2 = await prisma.membership.create({
    data: {
      id: 'membership2',
      tier: 'L',
      monthlyPoints: 200,
      usedPoints: 145,
      remainingPoints: 55,
      monthlyPrice: 8900,
      contractStart: new Date('2024-03-01'),
      periodStart: new Date('2024-12-01'),
      periodEnd: new Date('2025-01-01'),
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      id: 'customer2',
      name: 'Maria Schmidt',
      companyName: 'InnovateTech AG',
      email: 'schmidt@innovatetech.de',
      customerCode: '7391',
      membershipId: membership2.id,
      advisorId: advisor.id,
    },
  })

  await Promise.all([
    prisma.module.create({
      data: {
        name: 'Automatisierte Rechnungsverarbeitung',
        description: 'KI-basierte Erfassung und Verarbeitung von Eingangsrechnungen',
        status: 'abgeschlossen',
        priority: 'hoch',
        progress: 100,
        monthlyMaintenancePoints: 10,
        softwareUrl: 'https://invoice.innovatetech.aiempowerment.de',
        showInRoadmap: true,
        customerId: customer2.id,
        assigneeId: 'tm4',
        acceptanceStatus: 'akzeptiert',
      },
    }),
    prisma.module.create({
      data: {
        name: 'KI-Vertriebsassistent',
        description: 'Intelligente Unterstützung für das Vertriebsteam mit Lead-Scoring',
        status: 'in_arbeit',
        priority: 'hoch',
        progress: 60,
        monthlyMaintenancePoints: 14,
        showInRoadmap: true,
        customerId: customer2.id,
        assigneeId: 'tm2',
      },
    }),
  ])
  console.log('Created second customer with modules')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
