/**
 * PR #38, Runde 3: Ruhestand (Erfahrung weitergeben) und Unterstützen ohne Mitgliedschaft.
 * Abschnitt 4 fehlte in KONZEPTTEXT-TUER-LUECKEN-2026-11-24.md (Stand 24.11. 01:10); daher NUR belegte Sätze aus:
 *  - 07 BtMM Konzept v22.69.0, Z.1357: „Erfahrung im Rentenalter zählt im Zeit-Tausch als Stunde der Kategorie Bildung.“
 *  - 07 BtMM Konzept v22.69.0, Z.1485: Qualifizierungsfonds Stufe A „bis 1.000 € – Zuschuss gegen Weitergabe: zehn Stunden Mentoring oder Lehre im Zeit-Tausch“
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
    quelle: 'Quellen: Konzept v22.69.0 (Zeit-Tausch, Qualifizierungsfonds), Satzungsentwurf § 4 Abs. 2, Wirtschaften-Anleitung v3.15.1 (Direktkredite).',
    geld: { titel: 'Wichtig, wenn du mit Geld helfen willst', text: 'Direktkredite sind nachrangig: Zurückgezahlt wird nur aus freiem Vermögen, und in einer Insolvenz kommen alle anderen Gläubiger zuerst. Im schlimmsten Fall kann das Geld ganz verloren gehen. Gib deshalb nur, was du verlieren könntest: Dein Notgroschen und deine Altersvorsorge gehören nicht hierher.' },
    ruhestand: {
      titel: 'Im Ruhestand: Erfahrung weitergeben',
      kurz: 'Deine Erfahrung zählt: im Zeit-Tausch, beim Weitergeben von Wissen und als Unterstützung.',
      punkte: [
        'Erfahrung im Rentenalter zählt im Zeit-Tausch als Stunde der Kategorie Bildung.',
        'Wissen weitergeben: Im geplanten Qualifizierungsfonds gibt es Zuschüsse bis 1.000 € gegen zehn Stunden Mentoring oder Lehre im Zeit-Tausch.',
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
    quelle: 'Sources: Concept v22.69.0 (time exchange, qualification fund), draft statutes § 4 (2), Economic guide v3.15.1 (direct loans).',
    geld: { titel: 'Important if you want to help with money', text: 'Direct loans are subordinated: they are only repaid from free assets, and in an insolvency all other creditors come first. In the worst case the money can be lost completely. So only give what you could afford to lose: your emergency savings and your retirement provision do not belong here.' },
    ruhestand: {
      titel: 'In retirement: passing on experience',
      kurz: 'Your experience counts: in the time exchange, when passing on knowledge and as support.',
      punkte: [
        'Experience at retirement age counts in the time exchange as an hour in the education category.',
        'Passing on knowledge: the planned qualification fund offers grants of up to €1,000 in return for ten hours of mentoring or teaching in the time exchange.',
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
    quelle: 'Sources : Concept v22.69.0 (échange de temps, fonds de qualification), projet de statuts § 4 al. 2, guide économique v3.15.1 (prêts directs).',
    geld: { titel: 'Important si tu veux aider avec de l’argent', text: 'Les prêts directs sont subordonnés : ils ne sont remboursés qu’à partir du patrimoine libre, et en cas d’insolvabilité tous les autres créanciers passent avant. Dans le pire des cas, l’argent peut être entièrement perdu. Ne donne donc que ce que tu pourrais perdre : ton épargne de secours et ta prévoyance retraite n’ont rien à faire ici.' },
    ruhestand: {
      titel: 'À la retraite : transmettre son expérience',
      kurz: 'Ton expérience compte : dans l’échange de temps, en transmettant ton savoir et comme soutien.',
      punkte: [
        'L’expérience à l’âge de la retraite compte dans l’échange de temps comme une heure de la catégorie formation.',
        'Transmettre son savoir : le fonds de qualification prévu accorde des aides jusqu’à 1 000 € en échange de dix heures de mentorat ou d’enseignement dans l’échange de temps.',
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
    quelle: 'Fuentes: Concepto v22.69.0 (intercambio de tiempo, fondo de cualificación), borrador de estatutos § 4.2, guía económica v3.15.1 (préstamos directos).',
    geld: { titel: 'Importante si quieres ayudar con dinero', text: 'Los préstamos directos son subordinados: solo se devuelven con patrimonio libre y, en caso de insolvencia, todos los demás acreedores van primero. En el peor de los casos el dinero puede perderse por completo. Por eso da solo lo que podrías perder: tu colchón de emergencia y tu previsión para la jubilación no van aquí.' },
    ruhestand: {
      titel: 'En la jubilación: transmitir experiencia',
      kurz: 'Tu experiencia cuenta: en el intercambio de tiempo, al transmitir conocimientos y como apoyo.',
      punkte: [
        'La experiencia en edad de jubilación cuenta en el intercambio de tiempo como una hora de la categoría formación.',
        'Transmitir conocimientos: el fondo de cualificación previsto da ayudas de hasta 1.000 € a cambio de diez horas de mentoría o enseñanza en el intercambio de tiempo.',
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
    quelle: 'Fontes: Conceito v22.69.0 (troca de tempo, fundo de qualificação), projeto de estatuto § 4.º n.º 2, guia económico v3.15.1 (empréstimos diretos).',
    geld: { titel: 'Importante se queres ajudar com dinheiro', text: 'Os empréstimos diretos são subordinados: só são reembolsados a partir de património livre e, numa insolvência, todos os outros credores vêm primeiro. No pior caso, o dinheiro pode perder-se por completo. Por isso dá apenas o que poderias perder: a tua reserva de emergência e a tua previdência para a reforma não pertencem aqui.' },
    ruhestand: {
      titel: 'Na reforma: passar a experiência',
      kurz: 'A tua experiência conta: na troca de tempo, ao passar conhecimento e como apoio.',
      punkte: [
        'A experiência na idade da reforma conta na troca de tempo como uma hora da categoria formação.',
        'Passar conhecimento: o fundo de qualificação previsto dá apoios até 1.000 € em troca de dez horas de mentoria ou ensino na troca de tempo.',
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
    quelle: 'Источники: Концепция v22.69.0 (обмен временем, фонд квалификации), проект устава § 4 п. 2, экономическое руководство v3.15.1 (прямые займы).',
    geld: { titel: 'Важно, если хочешь помочь деньгами', text: 'Прямые займы являются субординированными: их возвращают только из свободного имущества, а при банкротстве сначала удовлетворяются все остальные кредиторы. В худшем случае деньги могут быть потеряны полностью. Поэтому давай только то, что можешь позволить себе потерять: твой резерв на чёрный день и пенсионные накопления сюда не относятся.' },
    ruhestand: {
      titel: 'На пенсии: передавать опыт',
      kurz: 'Твой опыт важен: в обмене временем, при передаче знаний и как поддержка.',
      punkte: [
        'Опыт в пенсионном возрасте засчитывается в обмене временем как час категории «образование».',
        'Передавать знания: планируемый фонд квалификации даёт субсидии до 1000 € в обмен на десять часов наставничества или обучения в обмене временем.',
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
    quelle: 'المصادر: المفهوم v22.69.0 (تبادل الوقت، صندوق التأهيل)، مسودة النظام الأساسي المادة 4 الفقرة 2، الدليل الاقتصادي v3.15.1 (القروض المباشرة).',
    geld: { titel: 'مهم إذا أردت المساعدة بالمال', text: 'القروض المباشرة قروض ثانوية: لا تُسدَّد إلا من الأصول الحرة، وفي حالة الإعسار يأتي جميع الدائنين الآخرين أولًا. في أسوأ الأحوال قد يضيع المال كله. لذلك لا تقدّم إلا ما يمكنك تحمّل خسارته: مدخرات الطوارئ ومدخرات التقاعد لا مكان لها هنا.' },
    ruhestand: {
      titel: 'في التقاعد: نقل الخبرة',
      kurz: 'خبرتك لها قيمة: في تبادل الوقت، وفي نقل المعرفة، وكدعم.',
      punkte: [
        'تُحتسب الخبرة في سن التقاعد في تبادل الوقت كساعة من فئة التعليم.',
        'نقل المعرفة: يقدّم صندوق التأهيل المخطط منحًا تصل إلى 1000 يورو مقابل عشر ساعات من الإرشاد أو التعليم في تبادل الوقت.',
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
    quelle: 'स्रोत: अवधारणा v22.69.0 (समय-विनिमय, योग्यता कोष), उपनियम मसौदा § 4 (2), आर्थिक मार्गदर्शिका v3.15.1 (प्रत्यक्ष ऋण)।',
    geld: { titel: 'ज़रूरी, अगर तुम पैसे से मदद करना चाहते हो', text: 'प्रत्यक्ष ऋण अधीनस्थ होते हैं: इन्हें केवल मुक्त संपत्ति से लौटाया जाता है, और दिवालियापन में बाकी सभी लेनदार पहले आते हैं। सबसे बुरी स्थिति में पैसा पूरी तरह डूब सकता है। इसलिए केवल उतना दो जितना खो सकते हो: तुम्हारी आपातकालीन बचत और सेवानिवृत्ति की बचत यहाँ नहीं आती।' },
    ruhestand: {
      titel: 'सेवानिवृत्ति में: अनुभव आगे बढ़ाना',
      kurz: 'तुम्हारा अनुभव मायने रखता है: समय-विनिमय में, ज्ञान आगे बढ़ाने में और सहयोग के रूप में।',
      punkte: [
        'सेवानिवृत्ति की उम्र का अनुभव समय-विनिमय में शिक्षा श्रेणी के एक घंटे के रूप में गिना जाता है।',
        'ज्ञान आगे बढ़ाना: योजनाबद्ध योग्यता कोष समय-विनिमय में दस घंटे की मेंटरिंग या शिक्षण के बदले 1,000 € तक का अनुदान देता है।',
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
    quelle: 'উৎস: ধারণা v22.69.0 (সময়-বিনিময়, যোগ্যতা তহবিল), সংবিধির খসড়া § ৪ (২), অর্থনৈতিক নির্দেশিকা v3.15.1 (সরাসরি ঋণ)।',
    geld: { titel: 'টাকা দিয়ে সাহায্য করতে চাইলে জরুরি', text: 'সরাসরি ঋণ অধস্তন: শুধু মুক্ত সম্পদ থেকে ফেরত দেওয়া হয়, আর দেউলিয়া হলে অন্য সব পাওনাদার আগে পায়। সবচেয়ে খারাপ ক্ষেত্রে পুরো টাকা হারিয়ে যেতে পারে। তাই শুধু ততটুকুই দাও যা হারাতে পারো: জরুরি সঞ্চয় আর অবসরের সঞ্চয় এখানে নয়।' },
    ruhestand: {
      titel: 'অবসরে: অভিজ্ঞতা এগিয়ে দেওয়া',
      kurz: 'তোমার অভিজ্ঞতার মূল্য আছে: সময়-বিনিময়ে, জ্ঞান এগিয়ে দেওয়ায় এবং সহায়তা হিসেবে।',
      punkte: [
        'অবসরের বয়সের অভিজ্ঞতা সময়-বিনিময়ে শিক্ষা বিভাগের এক ঘণ্টা হিসেবে গণ্য হয়।',
        'জ্ঞান এগিয়ে দেওয়া: পরিকল্পিত যোগ্যতা তহবিল সময়-বিনিময়ে দশ ঘণ্টা মেন্টরিং বা শিক্ষাদানের বিনিময়ে ১,০০০ € পর্যন্ত অনুদান দেয়।',
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
    quelle: '出典：コンセプト v22.69.0（時間交換、資格基金）、定款草案 第4条第2項、経済ガイド v3.15.1（直接融資）。',
    geld: { titel: 'お金で支援したい場合に大切なこと', text: '直接融資は劣後です。返済は自由な資産からのみ行われ、破産時には他のすべての債権者が優先されます。最悪の場合、お金はすべて失われる可能性があります。だから失っても困らない分だけにしてください。生活防衛資金や老後の備えはここに入れるものではありません。' },
    ruhestand: {
      titel: '退職後：経験を伝える',
      kurz: 'あなたの経験には価値があります。時間交換で、知識を伝えることで、そして支援として。',
      punkte: [
        '年金年齢の経験は、時間交換で「教育」カテゴリーの1時間として数えられます。',
        '知識を伝える：計画中の資格基金は、時間交換での10時間のメンタリングまたは指導と引き換えに、最大1,000€の助成を行います。',
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
    quelle: '来源：概念 v22.69.0（时间交换、资格基金）、章程草案第4条第2款、经济指南 v3.15.1（直接贷款）。',
    geld: { titel: '如果你想用钱帮忙，请注意', text: '直接贷款是次级的：只用自由资产偿还，破产时所有其他债权人优先。最坏情况下，钱可能全部损失。所以只拿出你能承受损失的钱：你的应急储蓄和养老储备不属于这里。' },
    ruhestand: {
      titel: '退休后：传承经验',
      kurz: '你的经验有价值：在时间交换中、在传授知识中，以及作为支持。',
      punkte: [
        '退休年龄的经验在时间交换中按“教育”类别的一小时计算。',
        '传授知识：计划中的资格基金提供最高 1,000 € 的补助，换取时间交换中十小时的指导或授课。',
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
