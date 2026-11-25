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
    quelle: 'Quellen: Konzept v22.69.0; Satzung der geplanten BtMM eG (Entwurf v9.1.4); Direktkredit-Hinweis der Webfassung.',
    geld: { titel: 'Wichtig, wenn du mit Geld helfen willst', text: 'Direktkredite sind für die Zeit nach der Gründung angedacht, Bedingungen noch offen und in rechtlicher Prüfung, nachrangig, Totalverlust möglich. Gib nur, was du verlieren könntest.' },
    ruhestand: {
      titel: 'Im Ruhestand: Erfahrung weitergeben',
      kurz: 'Deine Erfahrung zählt: im Zeit-Tausch, beim Weitergeben von Wissen und als Unterstützung.',
      punkte: [
        'Du behältst deine Rente und kannst nach der Gründung Mitglied mit einer Stimme sein (Satzung § 5 Abs. 4, Entwurf). Eine Mitgliedschaft ist derzeit nicht möglich. Geplant ist, gemeinsame Bausteine zum Selbstkostenpreis zu nutzen (Einkauf, Räume, Werkzeug, Verwaltung, Körperarbeit).',
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
      weg: 'Unterstützen ist ein eigener, vollwertiger Weg und keine Mitgliedschaft. BtMM ist noch nicht gegründet, eine Mitgliedschaft ist derzeit nicht möglich. Die geplante Satzung kennt nur eine Mitgliedschaft, keine Anwärterstufe. Wer später beitreten möchte, kann uns zuerst im gemeinsamen Tun kennenlernen.',
    },
  },
  en: {
    marke: 'After the founding, being set up',
    quelle: 'Sources: Concept v22.69.0; statutes of the planned BtMM eG (draft v9.1.4); direct-loan note of the web version.',
    geld: { titel: 'Important if you want to help with money', text: 'Direct loans are planned for the time after the founding; terms still open and under legal review, subordinated, total loss possible. Only give what you could afford to lose.' },
    ruhestand: {
      titel: 'In retirement: passing on experience',
      kurz: 'Your experience counts: in the time exchange, when passing on knowledge and as support.',
      punkte: [
        'You keep your pension and, after the founding, can be a member with one vote (statutes § 5 (4), draft). Membership is currently not possible. The plan is to use shared building blocks at cost price (purchasing, rooms, tools, administration, bodywork).',
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
      weg: 'Supporting is a path of its own, of full value, and not a membership. BtMM is not yet founded, membership is currently not possible. The planned statutes know only one membership, no candidate level. Anyone who wants to join later can get to know us first by doing things together.',
    },
  },
  fr: {
    marke: 'Après la fondation, en construction',
    quelle: 'Sources : Concept v22.69.0 ; statuts de la BtMM eG prévue (projet v9.1.4) ; mention sur les prêts directs de la version web.',
    geld: { titel: 'Important si tu veux aider avec de l’argent', text: 'Les prêts directs sont envisagés pour la période après la fondation ; conditions encore ouvertes et en examen juridique, subordonnés, perte totale possible. Ne donne que ce que tu pourrais perdre.' },
    ruhestand: {
      titel: 'À la retraite : transmettre son expérience',
      kurz: 'Ton expérience compte : dans l’échange de temps, en transmettant ton savoir et comme soutien.',
      punkte: [
        'Tu gardes ta retraite et, après la fondation, tu pourras être membre avec une voix (statuts § 5 al. 4, projet). Une adhésion n\'est pas possible actuellement. Il est prévu d\'utiliser des éléments communs au prix coûtant (achats, locaux, outils, administration, travail corporel).',
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
      weg: 'Soutenir est une voie à part entière et non une adhésion. BtMM n\'est pas encore fondée, une adhésion n\'est pas possible actuellement. Les statuts prévus ne connaissent qu\'une seule adhésion, pas de niveau candidat. Qui veut adhérer plus tard peut d\'abord nous connaître en agissant ensemble.',
    },
  },
  es: {
    marke: 'Tras la fundación, en construcción',
    quelle: 'Fuentes: Concepto v22.69.0; estatutos de la BtMM eG planificada (borrador v9.1.4); aviso sobre préstamos directos de la versión web.',
    geld: { titel: 'Importante si quieres ayudar con dinero', text: 'Los préstamos directos están pensados para el tiempo posterior a la fundación; condiciones aún abiertas y en revisión jurídica, subordinados, pérdida total posible. Da solo lo que podrías perder.' },
    ruhestand: {
      titel: 'En la jubilación: transmitir experiencia',
      kurz: 'Tu experiencia cuenta: en el intercambio de tiempo, al transmitir conocimientos y como apoyo.',
      punkte: [
        'Conservas tu pensión y, tras la fundación, podrás ser miembro con un voto (estatutos § 5 ap. 4, borrador). Actualmente no es posible ser miembro. Está previsto usar elementos comunes al precio de coste (compras, espacios, herramientas, administración, trabajo corporal).',
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
      weg: 'Apoyar es un camino propio y no una membresía. BtMM aún no está fundada, actualmente no es posible ser miembro. Los estatutos previstos solo conocen una membresía, sin nivel de aspirante. Quien quiera adherirse más adelante puede conocernos antes haciendo cosas juntos.',
    },
  },
  pt: {
    marke: 'Após a fundação, em construção',
    quelle: 'Fontes: Conceito v22.69.0; estatutos da BtMM eG planeada (projeto v9.1.4); aviso sobre empréstimos diretos da versão web.',
    geld: { titel: 'Importante se queres ajudar com dinheiro', text: 'Os empréstimos diretos estão pensados para o tempo após a fundação; condições ainda em aberto e em análise jurídica, subordinados, perda total possível. Dá apenas o que poderias perder.' },
    ruhestand: {
      titel: 'Na reforma: passar a experiência',
      kurz: 'A tua experiência conta: na troca de tempo, ao passar conhecimento e como apoio.',
      punkte: [
        'Manténs a tua reforma e, após a fundação, poderás ser membro com um voto (estatutos § 5 n.º 4, projeto). Atualmente não é possível ser membro. Está previsto usar elementos comuns ao preço de custo (compras, espaços, ferramentas, administração, trabalho corporal).',
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
      weg: 'Apoiar é um caminho próprio e não uma adesão. A BtMM ainda não está fundada, atualmente não é possível ser membro. Os estatutos planeados só conhecem uma adesão, sem nível de candidato. Quem quiser aderir mais tarde pode primeiro conhecer-nos fazendo coisas em conjunto.',
    },
  },
  ru: {
    marke: 'После основания, в процессе создания',
    quelle: 'Источники: Концепция v22.69.0; устав планируемой BtMM eG (проект v9.1.4); примечание о прямых займах веб-версии.',
    geld: { titel: 'Важно, если хочешь помочь деньгами', text: 'Прямые займы предполагаются на время после основания; условия ещё открыты и проходят юридическую проверку, субординированные, возможна полная потеря. Давай только то, что можешь потерять.' },
    ruhestand: {
      titel: 'На пенсии: передавать опыт',
      kurz: 'Твой опыт важен: в обмене временем, при передаче знаний и как поддержка.',
      punkte: [
        'Ты сохраняешь пенсию и после основания сможешь быть членом с одним голосом (устав § 5 абз. 4, проект). Членство в настоящее время невозможно. Планируется пользоваться общими ресурсами по себестоимости (закупки, помещения, инструменты, администрирование, телесные практики).',
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
      weg: 'Поддержка — самостоятельный путь, а не членство. BtMM ещё не основана, членство в настоящее время невозможно. Планируемый устав предусматривает только одно членство, без ступени кандидата. Кто хочет вступить позже, может сначала познакомиться с нами в совместном деле.',
    },
  },
  ar: {
    marke: 'بعد التأسيس، قيد الإنشاء',
    quelle: 'المصادر: المفهوم v22.69.0؛ النظام الأساسي لـ BtMM eG المخطَّط لها (مسودة v9.1.4)؛ ملاحظة القروض المباشرة في النسخة الإلكترونية.',
    geld: { titel: 'مهم إذا أردت المساعدة بالمال', text: 'القروض المباشرة مخطَّط لها لفترة ما بعد التأسيس؛ الشروط لا تزال مفتوحة وقيد المراجعة القانونية، وهي قروض ثانوية، وقد تحدث خسارة كاملة. أعطِ فقط ما يمكنك أن تخسره.' },
    ruhestand: {
      titel: 'في التقاعد: نقل الخبرة',
      kurz: 'خبرتك لها قيمة: في تبادل الوقت، وفي نقل المعرفة، وكدعم.',
      punkte: [
        'تحتفظ بمعاشك، وبعد التأسيس يمكنك أن تكون عضواً بصوت واحد (النظام الأساسي § 5 الفقرة 4، مسودة). العضوية غير ممكنة حالياً. المخطَّط هو استخدام الموارد المشتركة بسعر التكلفة (المشتريات، الأماكن، الأدوات، الإدارة، العمل الجسدي).',
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
      weg: 'الدعم طريق قائم بذاته وليس عضوية. BtMM لم تُؤسَّس بعد، والعضوية غير ممكنة حالياً. النظام الأساسي المخطَّط له لا يعرف إلا عضوية واحدة، دون مستوى المرشّح. ومن يريد الانضمام لاحقاً يمكنه أن يتعرّف علينا أولاً بالعمل معاً.',
    },
  },
  hi: {
    marke: 'स्थापना के बाद, निर्माणाधीन',
    quelle: 'स्रोत: अवधारणा v22.69.0; नियोजित BtMM eG की नियमावली (मसौदा v9.1.4); वेब संस्करण का प्रत्यक्ष-ऋण नोट।',
    geld: { titel: 'ज़रूरी, अगर तुम पैसे से मदद करना चाहते हो', text: 'प्रत्यक्ष ऋण स्थापना के बाद के समय के लिए सोचे गए हैं; शर्तें अभी खुली हैं और कानूनी जाँच में हैं, अधीनस्थ हैं, पूरा नुकसान संभव है। केवल उतना दें जितना आप खो सकते हैं।' },
    ruhestand: {
      titel: 'सेवानिवृत्ति में: अनुभव आगे बढ़ाना',
      kurz: 'तुम्हारा अनुभव मायने रखता है: समय-विनिमय में, ज्ञान आगे बढ़ाने में और सहयोग के रूप में।',
      punkte: [
        'आपकी पेंशन बनी रहती है और स्थापना के बाद आप एक वोट के साथ सदस्य हो सकते हैं (नियमावली § 5 उपधारा 4, मसौदा)। सदस्यता फ़िलहाल संभव नहीं है। योजना है कि साझा साधन लागत मूल्य पर इस्तेमाल हों (खरीद, स्थान, औज़ार, प्रशासन, बॉडीवर्क)।',
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
      weg: 'सहयोग देना अपना अलग मार्ग है और सदस्यता नहीं है। BtMM की अभी स्थापना नहीं हुई है, सदस्यता फ़िलहाल संभव नहीं है। नियोजित नियमावली में केवल एक सदस्यता है, कोई उम्मीदवार स्तर नहीं। जो बाद में जुड़ना चाहे, वह पहले साथ काम करके हमें जान सकता है।',
    },
  },
  bn: {
    marke: 'প্রতিষ্ঠার পরে, গড়ে উঠছে',
    quelle: 'সূত্র: ধারণাপত্র v22.69.0; পরিকল্পিত BtMM eG-র সনদ (খসড়া v9.1.4); ওয়েব সংস্করণের সরাসরি ঋণের নোট।',
    geld: { titel: 'টাকা দিয়ে সাহায্য করতে চাইলে জরুরি', text: 'সরাসরি ঋণ প্রতিষ্ঠার পরের সময়ের জন্য ভাবা হয়েছে; শর্ত এখনও খোলা ও আইনি পর্যালোচনাধীন, অধস্তন, সম্পূর্ণ ক্ষতি সম্ভব। যা হারাতে পারেন কেবল তা-ই দিন।' },
    ruhestand: {
      titel: 'অবসরে: অভিজ্ঞতা এগিয়ে দেওয়া',
      kurz: 'তোমার অভিজ্ঞতার মূল্য আছে: সময়-বিনিময়ে, জ্ঞান এগিয়ে দেওয়ায় এবং সহায়তা হিসেবে।',
      punkte: [
        'আপনার পেনশন থাকে এবং প্রতিষ্ঠার পর আপনি একটি ভোট নিয়ে সদস্য হতে পারবেন (সনদ § ৫ উপধারা ৪, খসড়া)। সদস্যপদ বর্তমানে সম্ভব নয়। পরিকল্পনা হলো যৌথ উপকরণ ক্রয়মূল্যে ব্যবহার করা (ক্রয়, স্থান, সরঞ্জাম, প্রশাসন, বডিওয়ার্ক)।',
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
      weg: 'সহায়তা করা একটি স্বতন্ত্র পথ, সদস্যপদ নয়। BtMM এখনও প্রতিষ্ঠিত হয়নি, সদস্যপদ বর্তমানে সম্ভব নয়। পরিকল্পিত সনদে কেবল একটি সদস্যপদ আছে, প্রার্থী স্তর নেই। যিনি পরে যোগ দিতে চান, তিনি আগে একসঙ্গে কাজ করে আমাদের জানতে পারেন।',
    },
  },
  ja: {
    marke: '設立後、準備中',
    quelle: '出典：コンセプト v22.69.0、計画中のBtMM eGの定款（草案 v9.1.4）、Web版の直接融資に関する注記。',
    geld: { titel: 'お金で支援したい場合に大切なこと', text: '直接融資は設立後の時期に想定されており、条件は未定で法的検討中、劣後性があり、全額を失う可能性があります。失っても構わない額だけにしてください。' },
    ruhestand: {
      titel: '退職後：経験を伝える',
      kurz: 'あなたの経験には価値があります。時間交換で、知識を伝えることで、そして支援として。',
      punkte: [
        '年金はそのまま受け取れ、設立後は1人1票のメンバーになれます（定款 第5条第4項、草案）。現在メンバーシップは利用できません。共有の仕組みを原価で利用することが計画されています（購買、スペース、工具、事務、ボディワーク）。',
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
      weg: 'サポートは独自の道であり、メンバーシップではありません。BtMMはまだ設立されておらず、現在メンバーシップは利用できません。計画中の定款にはメンバーシップは1種類のみで、候補者段階はありません。後で加入したい方は、まず一緒に活動しながら私たちを知ることができます。',
    },
  },
  zh: {
    marke: '成立之后，筹建中',
    quelle: '来源：概念 v22.69.0；计划中的 BtMM eG 章程（草案 v9.1.4）；网页版的直接贷款说明。',
    geld: { titel: '如果你想用钱帮忙，请注意', text: '直接贷款计划在成立之后，条件尚未确定且在法律审查中，属于次级，可能全部损失。只出你能承受损失的金额。' },
    ruhestand: {
      titel: '退休后：传承经验',
      kurz: '你的经验有价值：在时间交换中、在传授知识中，以及作为支持。',
      punkte: [
        '你保留养老金，成立后可以成为拥有一票的成员（章程第 5 条第 4 款，草案）。目前无法成为会员。计划是按成本价使用共享设施（采购、场地、工具、行政、身体工作）。',
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
      weg: '支持是一条独立的道路，而不是会员资格。BtMM 尚未成立，目前无法成为会员。计划中的章程只设一种会员资格，没有候选人层级。以后想加入的人，可以先在共同行动中了解我们。',
    },
  },
}

export function r3Texte(locale: string): R3Texte {
  return R3[locale] || R3.en
}
