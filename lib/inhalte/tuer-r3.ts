/**
 * PR #38, Runde 3: Ruhestand (Erfahrung weitergeben) und Unterstützen ohne Mitgliedschaft.
 * Abschnitt 4 fehlte in KONZEPTTEXT-TUER-LUECKEN-2026-11-24.md (Stand 24.11. 01:10); daher NUR belegte Sätze aus:
 *  - 07 BtMM Konzept v22.69.0, Z.1357: „Erfahrung im Rentenalter zählt im Zeit-Tausch als Stunde der Kategorie Bildung.“
 *  - Runde 4 (BtMM-Bot, 24.11.): 07 Konzept v22.69.0 Z.251, 348 (Nutzungsmitglied, Selbstkostenpreis); 05 Gemeinschaftskultur Z.95, 164
 *    (Wissen weitergeben/Neue einarbeiten, Stunde für Stunde); 24 Partner werden v1.5.1 Z.46 (Satzung § 15a Abs. 5, Betrieb ohne Nachfolge).
 *    Qualifizierungsfonds-Zuschuss (Z.1485) entfernt: gilt für Lernende, nicht für den Ruhestand.
 *  - Satzungsentwurf § 4 Abs. 2 (lib/inhalte/glossar.ts): Unterstützer:in „teilt die Grundwerte und unterstützt in der Freizeit mit Fähigkeiten, Zeit oder Geld, ohne Mitglied zu sein“
 *  - lib/inhalte/vertiefungen.ts:61: „Unterstützen ist ein eigener, vollwertiger Weg …“
 *  - 04 Wirtschaften-Anleitung v3.15.1, Z.209 (v3.14.0 Z.206): Direktkredite nachrangig, „Dein Notgroschen und deine Altersvorsorge gehören nicht hierher.“
 *  - app/(seiten)/mitmachen: „Rente und Lohn“ stehen unter Offene Fragen.
 * Kein Förderverein, keine Spenden (Förderverein gestrichen, Konzept v22.66.0). de/en sorgfältig, übrige sinngemäß.
 */
export type R3Texte = {
  marke: string
  quelle: string
  geld: { titel: string; text: string }
  ruhestand: { titel: string; kurz: string; punkte: string[]; offen: string; offenLink: string }
  unterstuetzen: { titel: string; kurz: string; knopf: string; mitmachen: string; text: string; weg: string }
}

export const R3: Record<string, R3Texte> = {
  de: {
    marke: 'Nach der Gründung, im Aufbau',
    quelle: 'Quellen: Konzept v22.69.0 (Z. 251, 348 Nutzungsmitglied; Z. 1357 Zeit-Tausch), Gemeinschaftskultur (Z. 95, 164), Partner werden v1.5.1 (Satzung § 15a Abs. 5), Satzungsentwurf § 4 Abs. 2, Wirtschaften-Anleitung v3.15.1 (Direktkredite).',
    geld: { titel: 'Wichtig, wenn du mit Geld helfen willst', text: 'Direktkredite sind nachrangig: Zurückgezahlt wird nur aus freiem Vermögen, und in einer Insolvenz kommen alle anderen Gläubiger zuerst. Im schlimmsten Fall kann das Geld ganz verloren gehen. Gib deshalb nur, was du verlieren könntest: Dein Notgroschen und deine Altersvorsorge gehören nicht hierher.' },
    ruhestand: {
      titel: 'Im Ruhestand: Erfahrung weitergeben',
      kurz: 'Deine Erfahrung zählt: im Zeit-Tausch, beim Weitergeben von Wissen und als Unterstützung.',
      punkte: [
        'Du behältst deine Rente und kannst als Nutzungsmitglied Vollmitglied mit gleicher Stimme sein — gegen einen kleinen Beitrag nutzt du gemeinsame Bausteine zum Selbstkostenpreis (Einkauf, Räume, Werkzeug, Verwaltung, Körperarbeit).',
        'Erfahrung im Rentenalter zählt im Zeit-Tausch als Stunde der Kategorie Bildung.',
        'Wissen weitergeben und Neue einarbeiten zählt im Zeit-Tausch Stunde für Stunde — im eigenen Tempo, ohne Vollzeitdruck.',
        'Wer vor dem Ruhestand einen Betrieb ohne Nachfolge hat, kann ihn schrittweise oder mit bis zu drei Jahren Übergang als Gemeinschaftsbetrieb einbringen (Satzung § 15a Abs. 5).',
        'Du kannst auch ohne Mitgliedschaft unterstützen, mit Fähigkeiten, Zeit oder Geld.',
      ],
      offen: 'Fragen zur Rente sind noch offen.',
      offenLink: 'Zu den offenen Fragen',
    },
    unterstuetzen: {
      titel: 'Unterstützen, ohne Mitglied zu sein',
      kurz: 'Mit Fähigkeiten, Zeit oder Geld. Ein eigener, vollwertiger Weg.',
      knopf: 'Schreib uns, wie du unterstützen möchtest',
      mitmachen: 'Lieber mitmachen?',
      text: 'Unterstützerinnen und Unterstützer teilen die Grundwerte und unterstützen in ihrer Freizeit mit Fähigkeiten, Zeit oder Geld, ohne Mitglied zu sein.',
      weg: 'Unterstützen ist ein eigener, vollwertiger Weg. Wer später Mitglied werden möchte, lernt die Gruppe im gemeinsamen Tun und mit Begleitung kennen. Niemand muss sich in eine höhere Stufe drängen lassen.',
    },
  },
  en: {
    marke: 'After the founding, being set up',
    quelle: 'Sources: Concept v22.69.0 (l. 251, 348 user membership; l. 1357 time exchange), Community culture (l. 95, 164), Becoming a partner v1.5.1 (statutes § 15a (5)), draft statutes § 4 (2), Economic guide v3.15.1 (direct loans).',
    geld: { titel: 'Important if you want to help with money', text: 'Direct loans are subordinated: they are only repaid from free assets, and in an insolvency all other creditors come first. In the worst case the money can be lost completely. So only give what you could afford to lose: your emergency savings and your retirement provision do not belong here.' },
    ruhestand: {
      titel: 'In retirement: passing on experience',
      kurz: 'Your experience counts: in the time exchange, when passing on knowledge and as support.',
      punkte: [
        'You keep your pension and, as a user member, can be a full member with an equal vote — for a small contribution you use shared building blocks at cost price (purchasing, rooms, tools, administration, bodywork).',
        'Experience at retirement age counts in the time exchange as an hour in the education category.',
        'Passing on knowledge and training newcomers counts hour for hour in the time exchange — at your own pace, without full-time pressure.',
        'If you have a business without a successor before retiring, you can bring it in as a community business step by step or with a transition of up to three years (statutes § 15a (5)).',
        'You can also support without being a member, with skills, time or money.',
      ],
      offen: 'Questions about pensions are still open.',
      offenLink: 'See the open questions',
    },
    unterstuetzen: {
      titel: 'Support without being a member',
      kurz: 'With skills, time or money. A path of its own, of full value.',
      knopf: 'Write to us how you would like to support',
      mitmachen: 'Rather join in?',
      text: 'Supporters share the core values and support in their free time with skills, time or money, without being members.',
      weg: 'Supporting is a path of its own, of full value. Anyone who later wants to become a member gets to know the group by doing things together and with guidance. Nobody has to be pushed into a higher level.',
    },
  },
  fr: {
    marke: 'Après la fondation, en construction',
    quelle: 'Sources : Concept v22.69.0 (l. 251, 348 membre usager ; l. 1357 échange de temps), Culture commune (l. 95, 164), Devenir partenaire v1.5.1 (statuts § 15a al. 5), projet de statuts § 4 al. 2, guide économique v3.15.1 (prêts directs).',
    geld: { titel: 'Important si tu veux aider avec de l’argent', text: 'Les prêts directs sont subordonnés : ils ne sont remboursés qu’à partir du patrimoine libre, et en cas d’insolvabilité tous les autres créanciers passent avant. Dans le pire des cas, l’argent peut être entièrement perdu. Ne donne donc que ce que tu pourrais perdre : ton épargne de secours et ta prévoyance retraite n’ont rien à faire ici.' },
    ruhestand: {
      titel: 'À la retraite : transmettre son expérience',
      kurz: 'Ton expérience compte : dans l’échange de temps, en transmettant ton savoir et comme soutien.',
      punkte: [
        'Tu gardes ta retraite et, en tant que membre usager, tu peux être membre à part entière avec une voix égale — contre une petite cotisation, tu utilises des services communs à prix coûtant (achats, locaux, outils, administration, travail corporel).',
        'L’expérience à l’âge de la retraite compte dans l’échange de temps comme une heure de la catégorie formation.',
        'Transmettre son savoir et former les nouveaux compte heure pour heure dans l’échange de temps — à ton rythme, sans pression du temps plein.',
        'Si tu as, avant la retraite, une entreprise sans successeur, tu peux l’apporter comme entreprise commune, progressivement ou avec une transition allant jusqu’à trois ans (statuts § 15a al. 5).',
        'Tu peux aussi soutenir sans être membre, avec tes compétences, ton temps ou de l’argent.',
      ],
      offen: 'Les questions sur la retraite sont encore ouvertes.',
      offenLink: 'Voir les questions ouvertes',
    },
    unterstuetzen: {
      titel: 'Soutenir sans être membre',
      kurz: 'Avec des compétences, du temps ou de l’argent. Une voie à part entière.',
      knopf: 'Écris-nous comment tu aimerais soutenir',
      mitmachen: 'Plutôt participer ?',
      text: 'Les soutiens partagent les valeurs de base et soutiennent pendant leur temps libre avec des compétences, du temps ou de l’argent, sans être membres.',
      weg: 'Soutenir est une voie à part entière. Qui veut devenir membre plus tard apprend à connaître le groupe en agissant ensemble et avec un accompagnement. Personne ne doit être poussé vers un niveau supérieur.',
    },
  },
  es: {
    marke: 'Tras la fundación, en construcción',
    quelle: 'Fuentes: Concepto v22.69.0 (l. 251, 348 miembro usuario; l. 1357 intercambio de tiempo), Cultura comunitaria (l. 95, 164), Ser socio v1.5.1 (estatutos § 15a.5), borrador de estatutos § 4.2, guía económica v3.15.1 (préstamos directos).',
    geld: { titel: 'Importante si quieres ayudar con dinero', text: 'Los préstamos directos son subordinados: solo se devuelven con patrimonio libre y, en caso de insolvencia, todos los demás acreedores van primero. En el peor de los casos el dinero puede perderse por completo. Por eso da solo lo que podrías perder: tu colchón de emergencia y tu previsión para la jubilación no van aquí.' },
    ruhestand: {
      titel: 'En la jubilación: transmitir experiencia',
      kurz: 'Tu experiencia cuenta: en el intercambio de tiempo, al transmitir conocimientos y como apoyo.',
      punkte: [
        'Conservas tu pensión y, como miembro usuario, puedes ser miembro de pleno derecho con el mismo voto: por una pequeña cuota usas servicios comunes a precio de coste (compras, espacios, herramientas, administración, trabajo corporal).',
        'La experiencia en edad de jubilación cuenta en el intercambio de tiempo como una hora de la categoría formación.',
        'Transmitir conocimientos y formar a los nuevos cuenta hora por hora en el intercambio de tiempo, a tu ritmo y sin la presión de la jornada completa.',
        'Si antes de jubilarte tienes una empresa sin sucesión, puedes aportarla como empresa comunitaria de forma gradual o con una transición de hasta tres años (estatutos § 15a.5).',
        'También puedes apoyar sin ser miembro, con habilidades, tiempo o dinero.',
      ],
      offen: 'Las preguntas sobre la pensión siguen abiertas.',
      offenLink: 'Ver las preguntas abiertas',
    },
    unterstuetzen: {
      titel: 'Apoyar sin ser miembro',
      kurz: 'Con habilidades, tiempo o dinero. Un camino propio y de pleno valor.',
      knopf: 'Escríbenos cómo te gustaría apoyar',
      mitmachen: '¿Prefieres participar?',
      text: 'Quienes apoyan comparten los valores básicos y apoyan en su tiempo libre con habilidades, tiempo o dinero, sin ser miembros.',
      weg: 'Apoyar es un camino propio y de pleno valor. Quien más adelante quiera ser miembro conoce al grupo haciendo cosas juntos y con acompañamiento. Nadie tiene que verse empujado a un nivel superior.',
    },
  },
  pt: {
    marke: 'Após a fundação, em construção',
    quelle: 'Fontes: Conceito v22.69.0 (l. 251, 348 membro utilizador; l. 1357 troca de tempo), Cultura comunitária (l. 95, 164), Tornar-se parceiro v1.5.1 (estatuto § 15a n.º 5), projeto de estatuto § 4.º n.º 2, guia económico v3.15.1 (empréstimos diretos).',
    geld: { titel: 'Importante se queres ajudar com dinheiro', text: 'Os empréstimos diretos são subordinados: só são reembolsados a partir de património livre e, numa insolvência, todos os outros credores vêm primeiro. No pior caso, o dinheiro pode perder-se por completo. Por isso dá apenas o que poderias perder: a tua reserva de emergência e a tua previdência para a reforma não pertencem aqui.' },
    ruhestand: {
      titel: 'Na reforma: passar a experiência',
      kurz: 'A tua experiência conta: na troca de tempo, ao passar conhecimento e como apoio.',
      punkte: [
        'Manténs a tua reforma e, como membro utilizador, podes ser membro de pleno direito com voto igual — com uma pequena contribuição usas serviços comuns a preço de custo (compras, espaços, ferramentas, administração, trabalho corporal).',
        'A experiência na idade da reforma conta na troca de tempo como uma hora da categoria formação.',
        'Passar conhecimento e integrar quem chega conta hora a hora na troca de tempo — ao teu ritmo, sem pressão de tempo inteiro.',
        'Quem tem, antes da reforma, um negócio sem sucessão pode integrá-lo como negócio comunitário aos poucos ou com uma transição até três anos (estatuto § 15a n.º 5).',
        'Também podes apoiar sem ser membro, com competências, tempo ou dinheiro.',
      ],
      offen: 'As questões sobre a reforma ainda estão em aberto.',
      offenLink: 'Ver as questões em aberto',
    },
    unterstuetzen: {
      titel: 'Apoiar sem ser membro',
      kurz: 'Com competências, tempo ou dinheiro. Um caminho próprio e de pleno valor.',
      knopf: 'Escreve-nos como gostarias de apoiar',
      mitmachen: 'Preferes participar?',
      text: 'Quem apoia partilha os valores fundamentais e apoia no seu tempo livre com competências, tempo ou dinheiro, sem ser membro.',
      weg: 'Apoiar é um caminho próprio e de pleno valor. Quem mais tarde quiser ser membro conhece o grupo fazendo coisas em conjunto e com acompanhamento. Ninguém tem de ser empurrado para um nível superior.',
    },
  },
  ru: {
    marke: 'После основания, в процессе создания',
    quelle: 'Источники: Концепция v22.69.0 (стр. 251, 348 пользовательское членство; стр. 1357 обмен временем), Культура сообщества (стр. 95, 164), Стать партнёром v1.5.1 (устав § 15a п. 5), проект устава § 4 п. 2, экономическое руководство v3.15.1 (прямые займы).',
    geld: { titel: 'Важно, если хочешь помочь деньгами', text: 'Прямые займы являются субординированными: их возвращают только из свободного имущества, а при банкротстве сначала удовлетворяются все остальные кредиторы. В худшем случае деньги могут быть потеряны полностью. Поэтому давай только то, что можешь позволить себе потерять: твой резерв на чёрный день и пенсионные накопления сюда не относятся.' },
    ruhestand: {
      titel: 'На пенсии: передавать опыт',
      kurz: 'Твой опыт важен: в обмене временем, при передаче знаний и как поддержка.',
      punkte: [
        'Ты сохраняешь свою пенсию и как пользовательский член можешь быть полноправным членом с равным голосом — за небольшой взнос ты пользуешься общими услугами по себестоимости (закупки, помещения, инструменты, администрирование, телесные практики).',
        'Опыт в пенсионном возрасте засчитывается в обмене временем как час категории «образование».',
        'Передача знаний и введение новичков в работу засчитываются в обмене временем час за часом — в своём темпе, без давления полной занятости.',
        'Если перед выходом на пенсию у тебя есть дело без преемника, ты можешь внести его как общее предприятие постепенно или с переходным периодом до трёх лет (устав § 15a п. 5).',
        'Ты можешь поддерживать и без членства — навыками, временем или деньгами.',
      ],
      offen: 'Вопросы о пенсии пока открыты.',
      offenLink: 'К открытым вопросам',
    },
    unterstuetzen: {
      titel: 'Поддерживать, не будучи членом',
      kurz: 'Навыками, временем или деньгами. Самостоятельный и полноценный путь.',
      knopf: 'Напиши нам, как ты хочешь поддержать',
      mitmachen: 'Хочешь участвовать?',
      text: 'Сторонники разделяют основные ценности и поддерживают в свободное время навыками, временем или деньгами, не будучи членами.',
      weg: 'Поддержка — самостоятельный и полноценный путь. Кто позже захочет стать членом, знакомится с группой в совместных делах и с сопровождением. Никого не нужно подталкивать на более высокую ступень.',
    },
  },
  ar: {
    marke: 'بعد التأسيس، قيد الإنشاء',
    quelle: 'المصادر: المفهوم v22.69.0 (س 251، 348 عضوية الانتفاع؛ س 1357 تبادل الوقت)، ثقافة المجتمع (س 95، 164)، أن تصبح شريكًا v1.5.1 (النظام الأساسي المادة 15أ الفقرة 5)، مسودة النظام الأساسي المادة 4 الفقرة 2، الدليل الاقتصادي v3.15.1 (القروض المباشرة).',
    geld: { titel: 'مهم إذا أردت المساعدة بالمال', text: 'القروض المباشرة قروض ثانوية: لا تُسدَّد إلا من الأصول الحرة، وفي حالة الإعسار يأتي جميع الدائنين الآخرين أولًا. في أسوأ الأحوال قد يضيع المال كله. لذلك لا تقدّم إلا ما يمكنك تحمّل خسارته: مدخرات الطوارئ ومدخرات التقاعد لا مكان لها هنا.' },
    ruhestand: {
      titel: 'في التقاعد: نقل الخبرة',
      kurz: 'خبرتك لها قيمة: في تبادل الوقت، وفي نقل المعرفة، وكدعم.',
      punkte: [
        'تحتفظ بمعاشك التقاعدي، ويمكنك بصفتك عضو انتفاع أن تكون عضوًا كاملًا بصوت متساوٍ — مقابل مساهمة صغيرة تستخدم خدمات مشتركة بسعر التكلفة (الشراء، المساحات، الأدوات، الإدارة، العمل الجسدي).',
        'تُحتسب الخبرة في سن التقاعد في تبادل الوقت كساعة من فئة التعليم.',
        'نقل المعرفة وتأهيل القادمين الجدد يُحتسب في تبادل الوقت ساعةً بساعة — بإيقاعك الخاص ودون ضغط الدوام الكامل.',
        'من لديه قبل التقاعد منشأة بلا خلف يمكنه إدخالها كمنشأة مشتركة تدريجيًا أو بفترة انتقالية تصل إلى ثلاث سنوات (النظام الأساسي المادة 15أ الفقرة 5).',
        'يمكنك أيضًا الدعم دون عضوية، بالمهارات أو الوقت أو المال.',
      ],
      offen: 'الأسئلة المتعلقة بالتقاعد لا تزال مفتوحة.',
      offenLink: 'إلى الأسئلة المفتوحة',
    },
    unterstuetzen: {
      titel: 'الدعم دون عضوية',
      kurz: 'بالمهارات أو الوقت أو المال. طريق قائم بذاته وكامل القيمة.',
      knopf: 'اكتب لنا كيف تودّ أن تدعم',
      mitmachen: 'تفضّل المشاركة؟',
      text: 'الداعمون يشاركون القيم الأساسية ويدعمون في وقت فراغهم بالمهارات أو الوقت أو المال، دون أن يكونوا أعضاء.',
      weg: 'الدعم طريق قائم بذاته وكامل القيمة. من يرغب لاحقًا في العضوية يتعرّف على المجموعة من خلال العمل المشترك ومع المرافقة. لا أحد يُدفع إلى مستوى أعلى.',
    },
  },
  hi: {
    marke: 'स्थापना के बाद, निर्माणाधीन',
    quelle: 'स्रोत: अवधारणा v22.69.0 (पंक्ति 251, 348 उपयोगकर्ता-सदस्यता; पंक्ति 1357 समय-विनिमय), सामुदायिक संस्कृति (पंक्ति 95, 164), साझेदार बनना v1.5.1 (उपनियम § 15a (5)), उपनियम मसौदा § 4 (2), आर्थिक मार्गदर्शिका v3.15.1 (प्रत्यक्ष ऋण)।',
    geld: { titel: 'ज़रूरी, अगर तुम पैसे से मदद करना चाहते हो', text: 'प्रत्यक्ष ऋण अधीनस्थ होते हैं: इन्हें केवल मुक्त संपत्ति से लौटाया जाता है, और दिवालियापन में बाकी सभी लेनदार पहले आते हैं। सबसे बुरी स्थिति में पैसा पूरी तरह डूब सकता है। इसलिए केवल उतना दो जितना खो सकते हो: तुम्हारी आपातकालीन बचत और सेवानिवृत्ति की बचत यहाँ नहीं आती।' },
    ruhestand: {
      titel: 'सेवानिवृत्ति में: अनुभव आगे बढ़ाना',
      kurz: 'तुम्हारा अनुभव मायने रखता है: समय-विनिमय में, ज्ञान आगे बढ़ाने में और सहयोग के रूप में।',
      punkte: [
        'तुम अपनी पेंशन रखते हो और उपयोगकर्ता-सदस्य के रूप में बराबर वोट वाले पूर्ण सदस्य बन सकते हो — छोटे से योगदान पर तुम साझा सेवाएँ लागत मूल्य पर इस्तेमाल करते हो (ख़रीद, जगह, औज़ार, प्रशासन, शारीरिक कार्य)।',
        'सेवानिवृत्ति की उम्र का अनुभव समय-विनिमय में शिक्षा श्रेणी के एक घंटे के रूप में गिना जाता है।',
        'ज्ञान आगे बढ़ाना और नए लोगों को काम सिखाना समय-विनिमय में घंटे-दर-घंटे गिना जाता है — अपनी गति से, पूर्णकालिक दबाव के बिना।',
        'जिसके पास सेवानिवृत्ति से पहले बिना उत्तराधिकारी का व्यवसाय है, वह उसे धीरे-धीरे या तीन साल तक के संक्रमण के साथ साझा व्यवसाय के रूप में ला सकता है (उपनियम § 15a (5))।',
        'तुम सदस्य बने बिना भी कौशल, समय या पैसे से सहयोग कर सकते हो।',
      ],
      offen: 'पेंशन से जुड़े सवाल अभी खुले हैं।',
      offenLink: 'खुले सवाल देखें',
    },
    unterstuetzen: {
      titel: 'सदस्य बने बिना सहयोग करना',
      kurz: 'कौशल, समय या पैसे से। अपने आप में एक पूरा रास्ता।',
      knopf: 'हमें लिखो कि तुम कैसे सहयोग करना चाहते हो',
      mitmachen: 'शामिल होना चाहते हो?',
      text: 'सहयोगी मूल मूल्यों को साझा करते हैं और सदस्य बने बिना अपने खाली समय में कौशल, समय या पैसे से सहयोग करते हैं।',
      weg: 'सहयोग करना अपने आप में एक पूरा रास्ता है। जो बाद में सदस्य बनना चाहे, वह साथ काम करते हुए और मार्गदर्शन के साथ समूह को जानता है। किसी को ऊँचे स्तर पर धकेला नहीं जाता।',
    },
  },
  bn: {
    marke: 'প্রতিষ্ঠার পরে, গড়ে উঠছে',
    quelle: 'উৎস: ধারণা v22.69.0 (লাইন ২৫১, ৩৪৮ ব্যবহারকারী-সদস্যপদ; লাইন ১৩৫৭ সময়-বিনিময়), সম্প্রদায় সংস্কৃতি (লাইন ৯৫, ১৬৪), অংশীদার হওয়া v1.5.1 (সংবিধি § ১৫ক (৫)), সংবিধির খসড়া § ৪ (২), অর্থনৈতিক নির্দেশিকা v3.15.1 (সরাসরি ঋণ)।',
    geld: { titel: 'টাকা দিয়ে সাহায্য করতে চাইলে জরুরি', text: 'সরাসরি ঋণ অধস্তন: শুধু মুক্ত সম্পদ থেকে ফেরত দেওয়া হয়, আর দেউলিয়া হলে অন্য সব পাওনাদার আগে পায়। সবচেয়ে খারাপ ক্ষেত্রে পুরো টাকা হারিয়ে যেতে পারে। তাই শুধু ততটুকুই দাও যা হারাতে পারো: জরুরি সঞ্চয় আর অবসরের সঞ্চয় এখানে নয়।' },
    ruhestand: {
      titel: 'অবসরে: অভিজ্ঞতা এগিয়ে দেওয়া',
      kurz: 'তোমার অভিজ্ঞতার মূল্য আছে: সময়-বিনিময়ে, জ্ঞান এগিয়ে দেওয়ায় এবং সহায়তা হিসেবে।',
      punkte: [
        'তুমি তোমার পেনশন রাখো এবং ব্যবহারকারী-সদস্য হিসেবে সমান ভোটসহ পূর্ণ সদস্য হতে পারো — সামান্য চাঁদার বিনিময়ে তুমি যৌথ পরিষেবা খরচ-মূল্যে ব্যবহার করো (কেনাকাটা, জায়গা, যন্ত্রপাতি, প্রশাসন, শারীরিক চর্চা)।',
        'অবসরের বয়সের অভিজ্ঞতা সময়-বিনিময়ে শিক্ষা বিভাগের এক ঘণ্টা হিসেবে গণ্য হয়।',
        'জ্ঞান দেওয়া ও নতুনদের কাজ শেখানো সময়-বিনিময়ে ঘণ্টা ধরে ধরে গোনা হয় — নিজের গতিতে, পূর্ণকালীন চাপ ছাড়া।',
        'অবসরের আগে যার উত্তরসূরিহীন ব্যবসা আছে, সে সেটিকে ধাপে ধাপে বা সর্বোচ্চ তিন বছরের রূপান্তরকালসহ যৌথ ব্যবসা হিসেবে আনতে পারে (সংবিধি § ১৫ক (৫))।',
        'সদস্য না হয়েও তুমি দক্ষতা, সময় বা টাকা দিয়ে সহায়তা করতে পারো।',
      ],
      offen: 'অবসর ভাতা নিয়ে প্রশ্নগুলো এখনো খোলা।',
      offenLink: 'খোলা প্রশ্ন দেখো',
    },
    unterstuetzen: {
      titel: 'সদস্য না হয়ে সহায়তা',
      kurz: 'দক্ষতা, সময় বা টাকা দিয়ে। নিজস্ব, পূর্ণ মূল্যের একটি পথ।',
      knopf: 'কীভাবে সহায়তা করতে চাও, আমাদের লেখো',
      mitmachen: 'বরং যোগ দিতে চাও?',
      text: 'সহায়করা মূল মূল্যবোধ ভাগ করে নেয় এবং সদস্য না হয়ে অবসর সময়ে দক্ষতা, সময় বা টাকা দিয়ে সহায়তা করে।',
      weg: 'সহায়তা করা নিজস্ব, পূর্ণ মূল্যের একটি পথ। যে পরে সদস্য হতে চায়, সে একসাথে কাজ করে এবং সঙ্গ পেয়ে দলকে চেনে। কাউকে উঁচু স্তরে ঠেলে দেওয়া হয় না।',
    },
  },
  ja: {
    marke: '設立後、準備中',
    quelle: '出典：コンセプト v22.69.0（251・348行 利用組合員、1357行 時間交換）、コミュニティ文化（95・164行）、パートナーになる v1.5.1（定款 第15a条第5項）、定款草案 第4条第2項、経済ガイド v3.15.1（直接融資）。',
    geld: { titel: 'お金で支援したい場合に大切なこと', text: '直接融資は劣後です。返済は自由な資産からのみ行われ、破産時には他のすべての債権者が優先されます。最悪の場合、お金はすべて失われる可能性があります。だから失っても困らない分だけにしてください。生活防衛資金や老後の備えはここに入れるものではありません。' },
    ruhestand: {
      titel: '退職後：経験を伝える',
      kurz: 'あなたの経験には価値があります。時間交換で、知識を伝えることで、そして支援として。',
      punkte: [
        '年金はそのまま受け取れ、利用組合員として同じ議決権を持つ正組合員になれます。少額の負担で、共同のサービス（仕入れ、場所、道具、事務、ボディワーク）を原価で利用できます。',
        '年金年齢の経験は、時間交換で「教育」カテゴリーの1時間として数えられます。',
        '知識を伝え、新しい人を育てることは、時間交換で1時間ずつ数えられます。自分のペースで、フルタイムの重圧なしに。',
        '退職前に後継者のいない事業を持っている人は、段階的に、または最長3年の移行期間を設けて、共同事業として持ち込めます（定款 第15a条第5項）。',
        '組合員にならなくても、技能・時間・お金で支援できます。',
      ],
      offen: '年金に関する問いはまだ未解決です。',
      offenLink: '未解決の問いへ',
    },
    unterstuetzen: {
      titel: '組合員にならずに支援する',
      kurz: '技能・時間・お金で。それ自体が一つの、価値ある道です。',
      knopf: 'どのように支援したいか、私たちに書いてください',
      mitmachen: '参加したい方は',
      text: '支援者は基本的な価値観を共有し、組合員にならずに、余暇に技能・時間・お金で支援します。',
      weg: '支援することはそれ自体が一つの、価値ある道です。後で組合員になりたい人は、一緒に活動し、伴走を受けながらグループを知っていきます。誰も上の段階へ押しやられることはありません。',
    },
  },
  zh: {
    marke: '成立之后，筹建中',
    quelle: '来源：概念 v22.69.0（第251、348行 使用型成员；第1357行 时间交换）、社区文化（第95、164行）、成为合作伙伴 v1.5.1（章程第15a条第5款）、章程草案第4条第2款、经济指南 v3.15.1（直接贷款）。',
    geld: { titel: '如果你想用钱帮忙，请注意', text: '直接贷款是次级的：只用自由资产偿还，破产时所有其他债权人优先。最坏情况下，钱可能全部损失。所以只拿出你能承受损失的钱：你的应急储蓄和养老储备不属于这里。' },
    ruhestand: {
      titel: '退休后：传承经验',
      kurz: '你的经验有价值：在时间交换中、在传授知识中，以及作为支持。',
      punkte: [
        '你保留自己的养老金，并可以作为使用型成员成为拥有平等表决权的正式成员——只需少量会费，即可按成本价使用共同服务（采购、场地、工具、行政、身体工作）。',
        '退休年龄的经验在时间交换中按“教育”类别的一小时计算。',
        '传授知识和带新人在时间交换中按小时计算——按你自己的节奏，没有全职压力。',
        '退休前拥有无人接班企业的人，可以逐步或以最长三年的过渡期将其作为共同企业并入（章程第15a条第5款）。',
        '你也可以不成为成员而提供支持，用技能、时间或金钱。',
      ],
      offen: '关于养老金的问题仍未解决。',
      offenLink: '查看未解决的问题',
    },
    unterstuetzen: {
      titel: '不成为成员也能支持',
      kurz: '用技能、时间或金钱。一条独立而完整的道路。',
      knopf: '写信告诉我们你想如何支持',
      mitmachen: '更想参与？',
      text: '支持者认同基本价值观，在业余时间用技能、时间或金钱提供支持，而不成为成员。',
      weg: '支持本身就是一条独立而完整的道路。以后想成为成员的人，会在共同行动中并在陪伴下认识这个团体。没有人需要被推向更高的阶段。',
    },
  },
}

export function r3Texte(locale: string): R3Texte {
  return R3[locale] || R3.en
}
