/**
 * Inhalte für die Lücken der Überzeugungstür (PR #38).
 * Quelle: /workspace/projekte/btmm/texte/KONZEPTTEXT-TUER-LUECKEN-2026-11-24.md
 * (BtMM-Bot, aus 07 Konzept v22.68.0 und 06 Gute Gründe v1.10.2). Nichts dazuerfunden.
 * de/en sorgfältig, übrige Sprachen sinngemäß. Solidarfonds-Text kommt aus messages/<l>/konzept.json (gemeinschaft.solidar_*).
 */
export type LueckenTexte = {
  geplant: string
  mehr: string
  einstieg: { titel: string; kurz: string; text: string; hinweis: string }
  kunden: { titel: string; kurz: string; text: string; abo: string; mitglied: string; hinweis: string }
  lohn: { frage: string; antwort: string }
  lebensphasen: { titel: string; kurz: string }
}

export const LUECKEN: Record<string, LueckenTexte> = {
  de: {
    geplant: 'Geplant',
    mehr: 'Mehr zur Gemeinschaft',
    einstieg: {
      titel: 'Berufseinstieg bei BtMM',
      kurz: 'Du fängst an, lernst im Betrieb und bekommst dafür denselben Stundenlohn wie alle.',
      text: 'Bei BtMM steigst du über eine Einstiegsstelle in einem Gemeinschaftsbetrieb ein, erst in Teilzeit, dann mit mehr Stunden. Lernstunden in einer vereinbarten Ausbildung zählen wie Arbeitsstunden. Die Kosten für die Ausbildung trägt der Qualifizierungsfonds der Genossenschaft. Die Betriebe halten Praxis, Begleitung und Verantwortung schriftlich fest. Damit kannst du später staatliche Abschlüsse erreichen, zum Beispiel die Prüfung als Externer nach eineinhalbfacher Ausbildungszeit oder im Handwerk die Ausübungsberechtigung nach sechs Jahren als Geselle (vier davon in leitender Stellung).',
      hinweis: 'Das ist geplant. Dass Lernstunden voll zählen, prüfen Fachleute noch. Die Einstiegsstelle gibt es erst mit den Gemeinschaftsbetrieben nach der Gründung.',
    },
    kunden: {
      titel: 'Als Kundin oder Kunde eines BtMM-Betriebs',
      kurz: 'Du zahlst einen fairen Marktpreis und weißt, wohin das Geld geht.',
      text: 'Wer bei einem BtMM-Betrieb kauft, zahlt den normalen Preis der Preisliste. Daraus werden der gleiche Stundenlohn für alle, eine Rücklage und ein Solidaranteil bezahlt, und das ist offen nachzulesen.',
      abo: 'Mit dem Jahreskreis-Abo trägst du einen Betrieb jeden Monat ein wenig mit, ähnlich wie bei einer solidarischen Landwirtschaft. Für 25 € im Monat bekommst du 27,50 € Guthaben für Sauna, Retreats, Hochbeete oder Gartenstunden.',
      mitglied: 'Und wer mehr will, wird Mitglied. Als Nutzungsmitglied behältst du dein Einkommen und nutzt die gemeinsamen Einrichtungen zum Selbstkostenpreis.',
      hinweis: 'Das Abo gilt nur für den Jahreskreis-Betrieb.',
    },
    lohn: {
      frage: 'Wie wird Arbeit bezahlt?',
      antwort: 'Jede Stunde wird gleich bezahlt, egal ob kochen, bauen oder programmieren. Der Lohn liegt nie unter dem gesetzlichen Mindestlohn (2027: 14,60 €). Das erste Ziel sind 20 € brutto je Stunde. Langfristig, wenn alles aufgebaut ist, sollen es 20 € netto werden (rund 31 € brutto). Läuft es gut, kommt aus dem Überschuss ein Bonus dazu. Am Anfang, vor den gemeinsamen Betrieben, bleibt jede:r selbstständig und schreibt eigene Rechnungen.',
    },
    lebensphasen: { titel: 'Solidarfonds für Lebensphasen und Übergänge', kurz: 'Wie die Gemeinschaft in besonderen Lebensphasen trägt, und ab wann der Fonds zahlt.' },
  },
  en: {
    geplant: 'Planned',
    mehr: 'More about the community',
    einstieg: {
      titel: 'Starting your career at BtMM',
      kurz: 'You start, learn on the job and get the same hourly wage as everyone else.',
      text: 'At BtMM you start through an entry position in a community business, first part-time, then with more hours. Learning hours in an agreed training count like working hours. The cooperative’s qualification fund covers the cost of the training. The businesses record practice, mentoring and responsibility in writing. This lets you reach state qualifications later, for example the exam as an external candidate after one and a half times the training period, or in the skilled trades the practice authorisation after six years as a journeyman (four of them in a leading position).',
      hinweis: 'This is planned. Whether learning hours count in full is still being checked by experts. The entry position only exists once the community businesses start after the founding.',
    },
    kunden: {
      titel: 'As a customer of a BtMM business',
      kurz: 'You pay a fair market price and know where the money goes.',
      text: 'If you buy from a BtMM business, you pay the normal price on the price list. It pays for the same hourly wage for everyone, a reserve and a solidarity share, and this can be read openly.',
      abo: 'With the Jahreskreis subscription you help carry a business a little every month, similar to community-supported agriculture. For €25 a month you get €27.50 in credit for sauna, retreats, raised beds or garden hours.',
      mitglied: 'And if you want more, you become a member. As a user member you keep your income and use the shared facilities at cost price.',
      hinweis: 'The subscription only applies to the Jahreskreis business.',
    },
    lohn: {
      frage: 'How is work paid?',
      antwort: 'Every hour is paid the same, whether cooking, building or programming. The wage is never below the statutory minimum wage (2027: €14.60). The first goal is €20 gross per hour. In the long run, once everything is built up, it should become €20 net (around €31 gross). If things go well, a bonus from the surplus is added. At the start, before the shared businesses exist, everyone stays self-employed and writes their own invoices.',
    },
    lebensphasen: { titel: 'Solidarity fund for life phases and transitions', kurz: 'How the community carries people through special life phases, and from when the fund pays out.' },
  },
  fr: {
    geplant: 'Prévu', mehr: 'En savoir plus sur la communauté',
    einstieg: { titel: 'Débuter sa vie professionnelle chez BtMM', kurz: 'Tu commences, tu apprends dans l’entreprise et tu reçois le même salaire horaire que tout le monde.',
      text: 'Chez BtMM, tu commences par un poste d’entrée dans une entreprise commune, d’abord à temps partiel, puis avec plus d’heures. Les heures d’apprentissage dans une formation convenue comptent comme des heures de travail. Le fonds de qualification de la coopérative prend en charge les coûts de la formation. Les entreprises consignent par écrit la pratique, l’accompagnement et les responsabilités. Tu peux ainsi obtenir plus tard des diplômes d’État, par exemple l’examen en candidat libre après une fois et demie la durée de formation, ou dans l’artisanat l’autorisation d’exercer après six ans comme compagnon (dont quatre en position de responsabilité).',
      hinweis: 'C’est prévu. Des spécialistes vérifient encore si les heures d’apprentissage comptent entièrement. Le poste d’entrée n’existera qu’avec les entreprises communes après la fondation.' },
    kunden: { titel: 'En tant que client·e d’une entreprise BtMM', kurz: 'Tu paies un juste prix du marché et tu sais où va l’argent.',
      text: 'Qui achète auprès d’une entreprise BtMM paie le prix normal de la liste. Il finance le même salaire horaire pour tous, une réserve et une part solidaire, et c’est consultable ouvertement.',
      abo: 'Avec l’abonnement Jahreskreis, tu soutiens un peu une entreprise chaque mois, un peu comme une AMAP. Pour 25 € par mois, tu reçois 27,50 € de crédit pour le sauna, des retraites, des bacs potagers ou des heures de jardin.',
      mitglied: 'Et si tu veux plus, tu deviens membre. En tant que membre utilisateur, tu gardes ton revenu et utilises les équipements communs à prix coûtant.',
      hinweis: 'L’abonnement ne concerne que l’entreprise Jahreskreis.' },
    lohn: { frage: 'Comment le travail est-il payé ?', antwort: 'Chaque heure est payée de la même façon, qu’il s’agisse de cuisiner, construire ou programmer. Le salaire n’est jamais inférieur au salaire minimum légal (2027 : 14,60 €). Le premier objectif est de 20 € brut de l’heure. À long terme, quand tout sera construit, ce devrait être 20 € net (environ 31 € brut). Si tout va bien, un bonus issu de l’excédent s’y ajoute. Au début, avant les entreprises communes, chacun·e reste indépendant·e et établit ses propres factures.' },
    lebensphasen: { titel: 'Fonds de solidarité pour les phases de vie et les transitions', kurz: 'Comment la communauté soutient lors de phases de vie particulières, et à partir de quand le fonds verse.' },
  },
  es: {
    geplant: 'Previsto', mehr: 'Más sobre la comunidad',
    einstieg: { titel: 'Empezar tu carrera en BtMM', kurz: 'Empiezas, aprendes en la empresa y recibes el mismo salario por hora que todos.',
      text: 'En BtMM empiezas con un puesto de entrada en una empresa común, primero a tiempo parcial y luego con más horas. Las horas de aprendizaje en una formación acordada cuentan como horas de trabajo. El fondo de cualificación de la cooperativa cubre los costes de la formación. Las empresas dejan por escrito la práctica, el acompañamiento y la responsabilidad. Así puedes obtener más adelante títulos oficiales, por ejemplo el examen como candidato externo tras una vez y media el tiempo de formación o, en los oficios, la autorización de ejercicio tras seis años como oficial (cuatro de ellos en un puesto de responsabilidad).',
      hinweis: 'Esto está previsto. Que las horas de aprendizaje cuenten por completo aún lo revisan especialistas. El puesto de entrada solo existirá con las empresas comunes tras la fundación.' },
    kunden: { titel: 'Como cliente de una empresa BtMM', kurz: 'Pagas un precio de mercado justo y sabes adónde va el dinero.',
      text: 'Quien compra en una empresa BtMM paga el precio normal de la lista. Con él se paga el mismo salario por hora para todos, una reserva y una parte solidaria, y se puede consultar abiertamente.',
      abo: 'Con la suscripción Jahreskreis apoyas un poco a una empresa cada mes, parecido a una agricultura apoyada por la comunidad. Por 25 € al mes recibes 27,50 € de saldo para sauna, retiros, bancales elevados u horas de jardín.',
      mitglied: 'Y quien quiera más se hace socio. Como socio usuario conservas tus ingresos y usas las instalaciones comunes a precio de coste.',
      hinweis: 'La suscripción solo vale para la empresa Jahreskreis.' },
    lohn: { frage: '¿Cómo se paga el trabajo?', antwort: 'Cada hora se paga igual, da igual si cocinas, construyes o programas. El salario nunca está por debajo del salario mínimo legal (2027: 14,60 €). El primer objetivo son 20 € brutos por hora. A largo plazo, cuando todo esté construido, deberían ser 20 € netos (unos 31 € brutos). Si va bien, se suma una bonificación del excedente. Al principio, antes de las empresas comunes, cada persona sigue siendo autónoma y emite sus propias facturas.' },
    lebensphasen: { titel: 'Fondo solidario para etapas de la vida y transiciones', kurz: 'Cómo la comunidad sostiene en etapas especiales de la vida y desde cuándo paga el fondo.' },
  },
  pt: {
    geplant: 'Planejado', mehr: 'Mais sobre a comunidade',
    einstieg: { titel: 'Começar a carreira no BtMM', kurz: 'Você começa, aprende na empresa e recebe o mesmo salário por hora que todos.',
      text: 'No BtMM você começa por uma vaga de entrada numa empresa comunitária, primeiro em meio período, depois com mais horas. As horas de aprendizagem numa formação combinada contam como horas de trabalho. O fundo de qualificação da cooperativa paga os custos da formação. As empresas registram por escrito a prática, o acompanhamento e a responsabilidade. Assim você pode obter mais tarde diplomas oficiais, por exemplo o exame como candidato externo após uma vez e meia o tempo de formação ou, nos ofícios, a autorização de exercício após seis anos como oficial (quatro deles em posição de liderança).',
      hinweis: 'Isto está planejado. Se as horas de aprendizagem contam por inteiro ainda está sendo verificado por especialistas. A vaga de entrada só existirá com as empresas comunitárias após a fundação.' },
    kunden: { titel: 'Como cliente de uma empresa BtMM', kurz: 'Você paga um preço de mercado justo e sabe para onde vai o dinheiro.',
      text: 'Quem compra numa empresa BtMM paga o preço normal da tabela. Com ele se pagam o mesmo salário por hora para todos, uma reserva e uma parcela solidária, e isso pode ser consultado abertamente.',
      abo: 'Com a assinatura Jahreskreis você ajuda a sustentar uma empresa um pouco a cada mês, parecido com uma agricultura apoiada pela comunidade. Por 25 € por mês você recebe 27,50 € de crédito para sauna, retiros, canteiros elevados ou horas de jardim.',
      mitglied: 'E quem quiser mais se torna membro. Como membro usuário você mantém sua renda e usa as instalações comuns a preço de custo.',
      hinweis: 'A assinatura vale só para a empresa Jahreskreis.' },
    lohn: { frage: 'Como o trabalho é pago?', antwort: 'Cada hora é paga igual, seja cozinhar, construir ou programar. O salário nunca fica abaixo do salário mínimo legal (2027: 14,60 €). A primeira meta são 20 € brutos por hora. A longo prazo, quando tudo estiver construído, devem ser 20 € líquidos (cerca de 31 € brutos). Se tudo correr bem, soma-se um bônus do excedente. No início, antes das empresas comuns, cada pessoa continua autônoma e emite suas próprias faturas.' },
    lebensphasen: { titel: 'Fundo solidário para fases da vida e transições', kurz: 'Como a comunidade apoia em fases especiais da vida e a partir de quando o fundo paga.' },
  },
  ru: {
    geplant: 'Запланировано', mehr: 'Подробнее о сообществе',
    einstieg: { titel: 'Начало профессионального пути в BtMM', kurz: 'Ты начинаешь, учишься на предприятии и получаешь ту же почасовую оплату, что и все.',
      text: 'В BtMM ты начинаешь с вводной должности на общем предприятии, сначала на неполный день, потом с большим числом часов. Учебные часы в согласованном обучении засчитываются как рабочие. Расходы на обучение несёт фонд квалификации кооператива. Предприятия письменно фиксируют практику, сопровождение и ответственность. Так позже можно получить государственный диплом, например сдать экзамен экстерном после полуторного срока обучения или в ремесле получить право на самостоятельную работу после шести лет подмастерьем (из них четыре на руководящей должности).',
      hinweis: 'Это запланировано. Засчитываются ли учебные часы полностью, ещё проверяют специалисты. Вводная должность появится только с общими предприятиями после основания.' },
    kunden: { titel: 'Как клиент предприятия BtMM', kurz: 'Ты платишь честную рыночную цену и знаешь, куда идут деньги.',
      text: 'Кто покупает у предприятия BtMM, платит обычную цену по прайс-листу. Из неё оплачиваются одинаковая почасовая оплата для всех, резерв и солидарная доля, и это открыто для ознакомления.',
      abo: 'С подпиской Jahreskreis ты понемногу поддерживаешь предприятие каждый месяц, похоже на общественно поддерживаемое сельское хозяйство. За 25 € в месяц ты получаешь 27,50 € на счёт для сауны, ретритов, грядок или садовых часов.',
      mitglied: 'А кто хочет большего, становится членом. Как пользующийся член ты сохраняешь свой доход и пользуешься общими объектами по себестоимости.',
      hinweis: 'Подписка действует только для предприятия Jahreskreis.' },
    lohn: { frage: 'Как оплачивается работа?', antwort: 'Каждый час оплачивается одинаково — готовишь ли ты, строишь или программируешь. Оплата никогда не ниже установленной законом минимальной (2027: 14,60 €). Первая цель — 20 € брутто в час. В долгосрочной перспективе, когда всё будет построено, должно стать 20 € нетто (около 31 € брутто). Если дела идут хорошо, из излишка добавляется бонус. В начале, до общих предприятий, каждый остаётся самозанятым и сам выставляет счета.' },
    lebensphasen: { titel: 'Солидарный фонд для жизненных этапов и переходов', kurz: 'Как сообщество поддерживает в особые жизненные периоды и с какого момента фонд выплачивает.' },
  },
  ar: {
    geplant: 'مخطَّط', mehr: 'المزيد عن المجتمع',
    einstieg: { titel: 'بداية مسارك المهني في BtMM', kurz: 'تبدأ وتتعلم داخل المنشأة وتحصل على الأجر نفسه للساعة مثل الجميع.',
      text: 'في BtMM تبدأ من خلال وظيفة مدخل في منشأة مشتركة، أولًا بدوام جزئي ثم بساعات أكثر. ساعات التعلّم في تدريب متفق عليه تُحتسب مثل ساعات العمل. يتحمّل صندوق التأهيل في التعاونية تكاليف التدريب. وتوثّق المنشآت الممارسة والمرافقة والمسؤولية كتابيًا. وبذلك يمكنك لاحقًا الحصول على شهادات رسمية، مثل امتحان المتقدّم الخارجي بعد مرة ونصف من مدة التدريب، أو في الحِرف تصريح المزاولة بعد ست سنوات كحِرفي مؤهَّل (أربع منها في موقع قيادي).',
      hinweis: 'هذا مخطَّط. ما إذا كانت ساعات التعلّم تُحتسب كاملة ما زال قيد فحص المختصين. وظيفة المدخل تتوفر فقط مع المنشآت المشتركة بعد التأسيس.' },
    kunden: { titel: 'كعميل لمنشأة من BtMM', kurz: 'تدفع سعر سوق عادلًا وتعرف أين يذهب المال.',
      text: 'من يشتري من منشأة تابعة لـ BtMM يدفع السعر العادي في قائمة الأسعار. ومنه يُدفع الأجر نفسه للساعة للجميع واحتياطي وحصة تضامنية، ويمكن الاطلاع على ذلك بشكل مفتوح.',
      abo: 'باشتراك Jahreskreis تساند منشأة قليلًا كل شهر، على غرار الزراعة المدعومة من المجتمع. مقابل 25 € شهريًا تحصل على رصيد 27.50 € للساونا أو الخلوات أو الأحواض المرتفعة أو ساعات الحديقة.',
      mitglied: 'ومن يريد أكثر يصبح عضوًا. كعضو مستخدِم تحتفظ بدخلك وتستخدم المرافق المشتركة بسعر التكلفة.',
      hinweis: 'الاشتراك يخص منشأة Jahreskreis فقط.' },
    lohn: { frage: 'كيف يُدفع أجر العمل؟', antwort: 'كل ساعة تُدفع بالقدر نفسه، سواء في الطبخ أو البناء أو البرمجة. لا يقل الأجر أبدًا عن الحد الأدنى القانوني للأجور (2027: 14.60 €). الهدف الأول 20 € إجمالي للساعة. وعلى المدى البعيد، عندما يكتمل البناء، يُفترض أن تصبح 20 € صافيًا (نحو 31 € إجمالي). وإذا سارت الأمور جيدًا تُضاف مكافأة من الفائض. في البداية، قبل المنشآت المشتركة، يبقى كل شخص مستقلًا ويصدر فواتيره بنفسه.' },
    lebensphasen: { titel: 'صندوق التضامن لمراحل الحياة والتحولات', kurz: 'كيف يساند المجتمع في مراحل الحياة الخاصة، ومتى يبدأ الصندوق بالدفع.' },
  },
  hi: {
    geplant: 'योजना में', mehr: 'समुदाय के बारे में और',
    einstieg: { titel: 'BtMM में करियर की शुरुआत', kurz: 'आप शुरू करते हैं, काम पर सीखते हैं और सबके बराबर प्रति घंटा मजदूरी पाते हैं।',
      text: 'BtMM में आप एक साझा व्यवसाय में प्रवेश पद से शुरू करते हैं, पहले अंशकालिक, फिर ज़्यादा घंटों के साथ। तय प्रशिक्षण में सीखने के घंटे काम के घंटों की तरह गिने जाते हैं। प्रशिक्षण का खर्च सहकारी संस्था का योग्यता कोष उठाता है। व्यवसाय अभ्यास, मार्गदर्शन और ज़िम्मेदारी को लिखित रूप में दर्ज करते हैं। इससे आप बाद में सरकारी योग्यता पा सकते हैं, जैसे प्रशिक्षण अवधि के डेढ़ गुना समय के बाद बाहरी उम्मीदवार के रूप में परीक्षा, या शिल्प में कारीगर के रूप में छह साल (जिनमें चार साल नेतृत्व पद पर) के बाद कार्य-अनुमति।',
      hinweis: 'यह योजना में है। सीखने के घंटे पूरे गिने जाएँगे या नहीं, यह विशेषज्ञ अभी जाँच रहे हैं। प्रवेश पद स्थापना के बाद साझा व्यवसायों के साथ ही होगा।' },
    kunden: { titel: 'BtMM व्यवसाय के ग्राहक के रूप में', kurz: 'आप उचित बाज़ार मूल्य देते हैं और जानते हैं कि पैसा कहाँ जाता है।',
      text: 'जो BtMM व्यवसाय से खरीदता है, वह मूल्य सूची का सामान्य दाम देता है। इससे सबके लिए एक जैसी प्रति घंटा मजदूरी, एक आरक्षित निधि और एक एकजुटता हिस्सा चुकाया जाता है, और यह खुले तौर पर पढ़ा जा सकता है।',
      abo: 'Jahreskreis सदस्यता से आप हर महीने थोड़ा-थोड़ा एक व्यवसाय को सहारा देते हैं, सामुदायिक खेती की तरह। 25 € महीने में आपको सौना, रिट्रीट, ऊँची क्यारियों या बागवानी घंटों के लिए 27.50 € का क्रेडिट मिलता है।',
      mitglied: 'और जो ज़्यादा चाहे, वह सदस्य बनता है। उपयोग-सदस्य के रूप में आप अपनी आय रखते हैं और साझा सुविधाओं का लागत मूल्य पर उपयोग करते हैं।',
      hinweis: 'यह सदस्यता केवल Jahreskreis व्यवसाय पर लागू है।' },
    lohn: { frage: 'काम का भुगतान कैसे होता है?', antwort: 'हर घंटे का भुगतान बराबर होता है, चाहे खाना बनाना हो, निर्माण हो या प्रोग्रामिंग। मजदूरी कभी कानूनी न्यूनतम मजदूरी (2027: 14.60 €) से कम नहीं होती। पहला लक्ष्य 20 € सकल प्रति घंटा है। लंबे समय में, जब सब बन जाए, यह 20 € शुद्ध (लगभग 31 € सकल) होना चाहिए। अच्छा चलने पर अधिशेष से बोनस जुड़ता है। शुरुआत में, साझा व्यवसायों से पहले, हर कोई स्वतंत्र रहता है और अपने बिल खुद बनाता है।' },
    lebensphasen: { titel: 'जीवन के चरणों और बदलावों के लिए एकजुटता कोष', kurz: 'समुदाय जीवन के खास चरणों में कैसे साथ देता है, और कोष कब से भुगतान करता है।' },
  },
  bn: {
    geplant: 'পরিকল্পিত', mehr: 'সম্প্রদায় সম্পর্কে আরও',
    einstieg: { titel: 'BtMM-এ কর্মজীবনের শুরু', kurz: 'আপনি শুরু করেন, প্রতিষ্ঠানে শেখেন এবং সবার মতোই একই ঘণ্টাপ্রতি মজুরি পান।',
      text: 'BtMM-এ আপনি একটি যৌথ প্রতিষ্ঠানে প্রবেশ-পদ দিয়ে শুরু করেন, প্রথমে খণ্ডকালীন, পরে আরও বেশি ঘণ্টা নিয়ে। নির্ধারিত প্রশিক্ষণের শেখার ঘণ্টা কাজের ঘণ্টার মতোই গণ্য হয়। প্রশিক্ষণের খরচ বহন করে সমবায়ের যোগ্যতা তহবিল। প্রতিষ্ঠানগুলো অনুশীলন, সহায়তা ও দায়িত্ব লিখিতভাবে রাখে। এতে আপনি পরে সরকারি সনদ পেতে পারেন, যেমন প্রশিক্ষণকালের দেড় গুণ সময় পরে বহিরাগত পরীক্ষার্থী হিসেবে পরীক্ষা, অথবা কারুশিল্পে কারিগর হিসেবে ছয় বছর (যার চার বছর নেতৃত্বের পদে) পরে কাজের অনুমতি।',
      hinweis: 'এটি পরিকল্পিত। শেখার ঘণ্টা পুরোপুরি গণ্য হবে কি না, বিশেষজ্ঞরা এখনও যাচাই করছেন। প্রবেশ-পদ প্রতিষ্ঠার পরে যৌথ প্রতিষ্ঠানগুলোর সাথেই আসবে।' },
    kunden: { titel: 'BtMM প্রতিষ্ঠানের গ্রাহক হিসেবে', kurz: 'আপনি ন্যায্য বাজারদর দেন এবং জানেন টাকা কোথায় যায়।',
      text: 'যে BtMM প্রতিষ্ঠান থেকে কেনে, সে মূল্যতালিকার স্বাভাবিক দাম দেয়। এ থেকে সবার জন্য একই ঘণ্টাপ্রতি মজুরি, একটি সঞ্চিতি এবং একটি সংহতি অংশ দেওয়া হয়, এবং তা খোলাখুলি পড়া যায়।',
      abo: 'Jahreskreis সাবস্ক্রিপশনে আপনি প্রতি মাসে একটু করে একটি প্রতিষ্ঠানকে সহায়তা করেন, সম্প্রদায়-সমর্থিত কৃষির মতো। মাসে 25 € দিলে সনা, রিট্রিট, উঁচু বেড বা বাগানের ঘণ্টার জন্য 27.50 € ক্রেডিট পান।',
      mitglied: 'আর যে আরও চায়, সে সদস্য হয়। ব্যবহারকারী সদস্য হিসেবে আপনি নিজের আয় রাখেন এবং যৌথ সুবিধাগুলো খরচ-মূল্যে ব্যবহার করেন।',
      hinweis: 'সাবস্ক্রিপশন শুধু Jahreskreis প্রতিষ্ঠানের জন্য।' },
    lohn: { frage: 'কাজের পারিশ্রমিক কীভাবে দেওয়া হয়?', antwort: 'প্রতিটি ঘণ্টার পারিশ্রমিক সমান, রান্না, নির্মাণ বা প্রোগ্রামিং যা-ই হোক। মজুরি কখনও আইনি ন্যূনতম মজুরির (2027: 14.60 €) নিচে নয়। প্রথম লক্ষ্য ঘণ্টায় 20 € মোট। দীর্ঘমেয়াদে, সব গড়ে উঠলে, এটি 20 € নিট হওয়া উচিত (প্রায় 31 € মোট)। ভালো চললে উদ্বৃত্ত থেকে বোনাস যোগ হয়। শুরুতে, যৌথ প্রতিষ্ঠানের আগে, প্রত্যেকে স্বনির্ভর থাকে এবং নিজের বিল নিজে করে।' },
    lebensphasen: { titel: 'জীবনের পর্যায় ও পরিবর্তনের জন্য সংহতি তহবিল', kurz: 'বিশেষ জীবন-পর্যায়ে সম্প্রদায় কীভাবে পাশে থাকে, এবং তহবিল কবে থেকে দেয়।' },
  },
  ja: {
    geplant: '予定', mehr: 'コミュニティについてもっと',
    einstieg: { titel: 'BtMMでのキャリアの始め方', kurz: '始めて、職場で学び、みんなと同じ時給を受け取ります。',
      text: 'BtMMでは、共同事業の入門ポストから始めます。最初はパートタイムで、その後時間を増やします。合意した職業訓練の学習時間は労働時間と同じように数えられます。訓練の費用は協同組合の資格取得基金が負担します。事業所は実務、指導、責任を書面で記録します。これにより後で公的な資格を取ることができます。たとえば訓練期間の1.5倍の期間の後に外部受験者として試験を受ける、あるいは手工業では職人として6年（うち4年は責任ある立場）を経て営業許可を得る、などです。',
      hinweis: 'これは予定です。学習時間が全部数えられるかは、まだ専門家が確認中です。入門ポストは設立後の共同事業とともに初めて生まれます。' },
    kunden: { titel: 'BtMMの事業の顧客として', kurz: '公正な市場価格を払い、お金の行き先がわかります。',
      text: 'BtMMの事業から買う人は、価格表どおりの通常価格を払います。そこから全員同じ時給、積立金、連帯分が支払われ、それは公開されていて読むことができます。',
      abo: 'Jahreskreisのサブスクで、地域支援型農業のように毎月少しずつ事業を支えます。月25ユーロで、サウナ、リトリート、レイズドベッド、庭仕事の時間に使える27.50ユーロ分のクレジットがもらえます。',
      mitglied: 'もっと関わりたい人は組合員になります。利用組合員としては、自分の収入をそのまま保ち、共同の設備を原価で使えます。',
      hinweis: 'サブスクはJahreskreisの事業だけが対象です。' },
    lohn: { frage: '仕事の報酬はどう支払われますか？', antwort: '料理でも建築でもプログラミングでも、どの1時間も同じように支払われます。賃金は法定最低賃金（2027年：14.60ユーロ）を下回りません。最初の目標は時給20ユーロ（税込）です。長期的にすべてが整えば、手取り20ユーロ（税込で約31ユーロ）を目指します。うまくいけば余剰からボーナスが加わります。最初は、共同事業ができるまで、各自が自営のままで自分で請求書を出します。' },
    lebensphasen: { titel: '人生の局面と移行のための連帯基金', kurz: '特別な人生の局面でコミュニティがどう支えるか、そして基金がいつから支払うか。' },
  },
  zh: {
    geplant: '计划中', mehr: '更多关于社区',
    einstieg: { titel: '在 BtMM 开始职业生涯', kurz: '你从这里开始，在企业里学习，并获得和所有人一样的时薪。',
      text: '在 BtMM，你通过共同企业里的入门岗位开始，先是兼职，再逐步增加工时。约定培训中的学习时间按工作时间计算。培训费用由合作社的资格基金承担。企业会书面记录实践、指导和责任。这样你以后可以获得国家认可的资格，例如在培训期一点五倍的时间后以校外考生身份参加考试，或在手工业中以帮工身份工作六年（其中四年担任负责职位）后获得执业许可。',
      hinweis: '这是计划中的内容。学习时间是否全额计算，仍在由专业人士核实。入门岗位要等成立后有了共同企业才会出现。' },
    kunden: { titel: '作为 BtMM 企业的顾客', kurz: '你支付公道的市场价，并且知道钱用在哪里。',
      text: '在 BtMM 企业购买的人，按价目表支付正常价格。这笔钱用于所有人相同的时薪、一笔储备金和一份互助份额，并且可以公开查阅。',
      abo: '通过 Jahreskreis 订阅，你每月为一家企业出一点力，类似社区支持农业。每月 25 欧元，你可获得 27.50 欧元的额度，用于桑拿、静修、高架种植床或园艺时间。',
      mitglied: '想参与更多的人可以成为成员。作为使用成员，你保留自己的收入，并以成本价使用共同设施。',
      hinweis: '该订阅仅适用于 Jahreskreis 企业。' },
    lohn: { frage: '工作如何计酬？', antwort: '每一小时的报酬相同，无论是做饭、建造还是编程。工资绝不低于法定最低工资（2027 年：14.60 欧元）。第一个目标是每小时税前 20 欧元。长期来看，一切建成后，应达到税后 20 欧元（约合税前 31 欧元）。如果运转良好，还会从盈余中发放奖金。起步阶段，在共同企业成立之前，每个人保持自雇并自行开具发票。' },
    lebensphasen: { titel: '人生阶段与过渡期互助基金', kurz: '社区如何在特殊的人生阶段给予支撑，以及基金从何时开始支付。' },
  },
}

export function lueckenTexte(locale: string): LueckenTexte {
  return LUECKEN[locale] ?? LUECKEN.en
}
