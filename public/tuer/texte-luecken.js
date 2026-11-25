/* BtMM Tür: Ergänzung für Gruppen ohne eigenen Pfad (PR #38, 24.11.2026).
 * Neue Schritte einstieg / kunde / lebensphase mit Zielseiten /fuer-dich/*.
 * Inhalte laut /workspace/projekte/btmm/texte/KONZEPTTEXT-TUER-LUECKEN-2026-11-24.md, tabufrei.
 * Wird nach texte.js geladen und ergänzt BTMM_TUER_TEXTE je Sprache. de/en sorgfältig, übrige sinngemäß. */
(function (w) {
  'use strict';
  var T = w.BTMM_TUER_TEXTE; if (!T) return;
  var E = {
    de: { f: "In welcher Lebensphase bist du gerade, zum Beispiel Ausbildung, Familie, beruflicher Wechsel oder Ruhestand?", s: { einstieg: ['Berufseinstieg (geplant)', 'Einstiegsstelle, Lernstunden, die wie Arbeitsstunden zählen, und Wege zum staatlichen Abschluss.'],
               kunde: ['Als Kundin oder Kunde', 'Fairer Marktpreis mit offener Verwendung, das Jahreskreis-Abo und der Weg zum Nutzungsmitglied.'],
               lebensphase: ['Solidarfonds für Lebensphasen und Übergänge', 'Wie die Gemeinschaft in besonderen Lebensphasen trägt, und ab wann der Fonds zahlt.'] },
          b: { einstieg: 'Weil du am Anfang im Beruf stehst', kunde: 'Weil du als Kundin oder Kunde schaust', lebensphase: 'Weil sich bei dir gerade etwas verändert' },
          e: { einstieg: 'Für den Einstieg ist bei BtMM etwas geplant.', kunde: 'Auch als Kundin oder Kunde hast du etwas von BtMM.', lebensphase: 'Für Lebensphasen und Übergänge gibt es den Solidarfonds.' },
          m: { einstieg: 'du stehst am Anfang im Beruf', kunde: 'du schaust als Kundin oder Kunde', lebensphase: 'bei dir verändert sich gerade etwas' },
          k: { einstieg: ['ausbildung', 'azubi', 'berufseinstieg', 'berufsanfang', 'am anfang', 'schule fertig', 'studium fertig', ' lehre ', 'praktikum', 'erste stelle', 'gerade fertig', 'eingestiegen'],
               kunde: ['kunde', 'kundin', ' kaufen', 'bestellen', 'beauftrag', 'angebot', ' abo', 'suche jemanden', 'suche handwerker', 'suche einen handwerker', 'handwerker für', 'einkaufen bei'],
               lebensphase: ['kinder', 'mit familie', 'unsere familie', 'ruhestand', 'rente', 'rentner', 'neu orientier', 'neuorientier', 'umbruch', 'übergang', 'lebensphase', 'was neues', 'ändert sich', 'verändert'] } },
    en: { f: "What phase of life are you in right now, for example training, family, a career change or retirement?", s: { einstieg: ['Starting your career (planned)', 'An entry position, learning hours that count like working hours, and paths to a state qualification.'],
               kunde: ['As a customer', 'A fair market price with open use of the money, the Jahreskreis subscription and the path to user membership.'],
               lebensphase: ['Solidarity fund for life phases and transitions', 'How the community carries people through special life phases, and from when the fund pays out.'] },
          b: { einstieg: 'Because you are at the start of your working life', kunde: 'Because you are looking as a customer', lebensphase: 'Because something is changing for you right now' },
          e: { einstieg: 'BtMM has plans for people starting out.', kunde: 'BtMM has something for customers too.', lebensphase: 'For life phases and transitions there is the solidarity fund.' },
          m: { einstieg: 'you are at the start of your working life', kunde: 'you are looking as a customer', lebensphase: 'something is changing for you right now' },
          k: { einstieg: ['apprentice', 'just finished', 'graduat', 'first job', 'starting out', 'career start', 'internship'],
               kunde: ['customer', ' buy', 'order', 'hire someone', 'looking for a', 'subscription'],
               lebensphase: ['children', 'kids', 'retire', 'pension', 'reorient', 'new direction', 'transition', 'life phase', 'changing'] } },
    fr: { f: "Dans quelle phase de vie es-tu en ce moment, par exemple formation, famille, changement professionnel ou retraite ?", s: { einstieg: ['Débuter (prévu)', 'Un poste d’entrée, des heures d’apprentissage qui comptent comme du travail et des voies vers un diplôme d’État.'],
               kunde: ['En tant que client·e', 'Un juste prix du marché à l’usage transparent, l’abonnement Jahreskreis et le chemin vers le statut de membre utilisateur.'],
               lebensphase: ['Fonds de solidarité pour les phases de vie et les transitions', 'Comment la communauté soutient lors de phases de vie particulières, et à partir de quand le fonds verse.'] },
          b: { einstieg: 'Parce que tu débutes dans la vie professionnelle', kunde: 'Parce que tu regardes en tant que client·e', lebensphase: 'Parce que quelque chose change pour toi en ce moment' },
          e: { einstieg: 'Pour les débuts, BtMM prévoit quelque chose.', kunde: 'En tant que client·e aussi, BtMM t’apporte quelque chose.', lebensphase: 'Pour les phases de vie et les transitions, il y a le fonds de solidarité.' },
          m: { einstieg: 'tu débutes dans la vie professionnelle', kunde: 'tu regardes en tant que client·e', lebensphase: 'quelque chose change pour toi' },
          k: { einstieg: ['apprenti', 'premier emploi', 'diplome', 'stage', 'je debute'], kunde: ['client', 'acheter', 'commander', 'abonnement'], lebensphase: ['enfants', 'retraite', 'reconversion', 'transition', 'changement'] } },
    es: { f: "¿En qué etapa de la vida estás ahora, por ejemplo formación, familia, cambio profesional o jubilación?", s: { einstieg: ['Empezar (previsto)', 'Un puesto de entrada, horas de aprendizaje que cuentan como trabajo y caminos hacia un título oficial.'],
               kunde: ['Como cliente', 'Un precio de mercado justo con uso transparente, la suscripción Jahreskreis y el camino a socio usuario.'],
               lebensphase: ['Fondo solidario para etapas de la vida y transiciones', 'Cómo la comunidad sostiene en etapas especiales de la vida y desde cuándo paga el fondo.'] },
          b: { einstieg: 'Porque estás empezando tu vida laboral', kunde: 'Porque miras como cliente', lebensphase: 'Porque algo está cambiando para ti ahora' },
          e: { einstieg: 'Para empezar, BtMM tiene algo previsto.', kunde: 'También como cliente BtMM te aporta algo.', lebensphase: 'Para etapas de la vida y transiciones existe el fondo solidario.' },
          m: { einstieg: 'estás empezando tu vida laboral', kunde: 'miras como cliente', lebensphase: 'algo está cambiando para ti' },
          k: { einstieg: ['aprendiz', 'primer trabajo', 'recien', 'practicas', 'empezando'], kunde: ['cliente', 'comprar', 'encargar', 'suscripcion'], lebensphase: ['hijos', 'jubila', 'reorient', 'transicion', 'cambio'] } },
    pt: { f: "Em que fase da vida você está agora, por exemplo formação, família, mudança profissional ou aposentadoria?", s: { einstieg: ['Começar (planejado)', 'Uma vaga de entrada, horas de aprendizagem que contam como trabalho e caminhos para um diploma oficial.'],
               kunde: ['Como cliente', 'Um preço de mercado justo com uso transparente, a assinatura Jahreskreis e o caminho para membro usuário.'],
               lebensphase: ['Fundo solidário para fases da vida e transições', 'Como a comunidade apoia em fases especiais da vida e a partir de quando o fundo paga.'] },
          b: { einstieg: 'Porque você está começando a vida profissional', kunde: 'Porque você olha como cliente', lebensphase: 'Porque algo está mudando para você agora' },
          e: { einstieg: 'Para quem está começando, o BtMM tem algo planejado.', kunde: 'Também como cliente o BtMM tem algo para você.', lebensphase: 'Para fases da vida e transições existe o fundo solidário.' },
          m: { einstieg: 'você está começando a vida profissional', kunde: 'você olha como cliente', lebensphase: 'algo está mudando para você' },
          k: { einstieg: ['aprendiz', 'primeiro emprego', 'estagio', 'comecando'], kunde: ['cliente', 'comprar', 'encomendar', 'assinatura'], lebensphase: ['filhos', 'aposenta', 'reorient', 'transicao', 'mudanca'] } },
    ru: { f: "На каком жизненном этапе ты сейчас, например обучение, семья, смена профессии или пенсия?", s: { einstieg: ['Начало пути (запланировано)', 'Вводная должность, учебные часы, которые считаются как рабочие, и путь к государственному диплому.'],
               kunde: ['Как клиент', 'Честная рыночная цена с открытым использованием денег, подписка Jahreskreis и путь к пользующемуся членству.'],
               lebensphase: ['Солидарный фонд для жизненных этапов и переходов', 'Как сообщество поддерживает в особые жизненные периоды и с какого момента фонд выплачивает.'] },
          b: { einstieg: 'Потому что ты в начале профессионального пути', kunde: 'Потому что ты смотришь как клиент', lebensphase: 'Потому что у тебя сейчас что-то меняется' },
          e: { einstieg: 'Для начинающих в BtMM кое-что запланировано.', kunde: 'И для клиентов в BtMM кое-что есть.', lebensphase: 'Для жизненных этапов и переходов есть солидарный фонд.' },
          m: { einstieg: 'ты в начале профессионального пути', kunde: 'ты смотришь как клиент', lebensphase: 'у тебя сейчас что-то меняется' },
          k: { einstieg: ['ученик', 'первая работа', 'выпускник', 'стажир', 'только начина'], kunde: ['клиент', 'купить', 'заказать', 'подписк'], lebensphase: ['дети', 'пенси', 'переход', 'перемен', 'новое направление'] } },
    ar: { f: "في أي مرحلة من حياتك أنت الآن، مثل التدريب أو العائلة أو تغيير المهنة أو التقاعد؟", s: { einstieg: ['بداية المسار المهني (مخطَّط)', 'وظيفة مدخل، وساعات تعلّم تُحتسب كساعات عمل، وطرق إلى شهادة رسمية.'],
               kunde: ['كعميل', 'سعر سوق عادل باستخدام شفاف للمال، واشتراك Jahreskreis، والطريق إلى العضوية المستخدِمة.'],
               lebensphase: ['صندوق التضامن لمراحل الحياة والتحولات', 'كيف يساند المجتمع في مراحل الحياة الخاصة، ومتى يبدأ الصندوق بالدفع.'] },
          b: { einstieg: 'لأنك في بداية حياتك المهنية', kunde: 'لأنك تنظر كعميل', lebensphase: 'لأن شيئًا ما يتغير لديك الآن' },
          e: { einstieg: 'لدى BtMM خطة لمن يبدأ.', kunde: 'لدى BtMM ما يفيدك كعميل أيضًا.', lebensphase: 'لمراحل الحياة والتحولات يوجد صندوق التضامن.' },
          m: { einstieg: 'أنت في بداية حياتك المهنية', kunde: 'تنظر كعميل', lebensphase: 'شيء ما يتغير لديك' },
          k: { einstieg: ['متدرب', 'اول وظيفه', 'تخرجت', 'بدايه'], kunde: ['عميل', 'زبون', 'اشتري', 'اشتراك'], lebensphase: ['اطفال', 'اولاد', 'تقاعد', 'تحول', 'تغيير'] } },
    hi: { f: "आप अभी जीवन के किस चरण में हैं, जैसे प्रशिक्षण, परिवार, करियर बदलाव या सेवानिवृत्ति?", s: { einstieg: ['करियर की शुरुआत (योजना में)', 'प्रवेश पद, सीखने के घंटे जो काम के घंटों की तरह गिने जाते हैं, और सरकारी योग्यता के रास्ते।'],
               kunde: ['ग्राहक के रूप में', 'खुले उपयोग के साथ उचित बाज़ार मूल्य, Jahreskreis सदस्यता और उपयोग-सदस्य बनने का रास्ता।'],
               lebensphase: ['जीवन के चरणों और बदलावों के लिए एकजुटता कोष', 'समुदाय जीवन के खास चरणों में कैसे साथ देता है, और कोष कब से भुगतान करता है।'] },
          b: { einstieg: 'क्योंकि आप करियर की शुरुआत में हैं', kunde: 'क्योंकि आप ग्राहक के रूप में देख रहे हैं', lebensphase: 'क्योंकि आपके जीवन में अभी कुछ बदल रहा है' },
          e: { einstieg: 'शुरुआत करने वालों के लिए BtMM में कुछ योजना है।', kunde: 'ग्राहक के रूप में भी BtMM से आपको कुछ मिलता है।', lebensphase: 'जीवन के चरणों और बदलावों के लिए एकजुटता कोष है।' },
          m: { einstieg: 'आप करियर की शुरुआत में हैं', kunde: 'आप ग्राहक के रूप में देख रहे हैं', lebensphase: 'आपके जीवन में कुछ बदल रहा है' },
          k: { einstieg: ['प्रशिक्षु', 'पहली नौकरी', 'पढ़ाई पूरी', 'शुरुआत'], kunde: ['ग्राहक', 'खरीद', 'ऑर्डर', 'सदस्यता'], lebensphase: ['बच्चे', 'सेवानिवृत्त', 'रिटायर', 'बदलाव'] } },
    bn: { f: "আপনি এখন জীবনের কোন পর্যায়ে আছেন, যেমন প্রশিক্ষণ, পরিবার, পেশা বদল বা অবসর?", s: { einstieg: ['কর্মজীবনের শুরু (পরিকল্পিত)', 'প্রবেশ-পদ, কাজের ঘণ্টার মতো গণ্য শেখার ঘণ্টা, এবং সরকারি সনদের পথ।'],
               kunde: ['গ্রাহক হিসেবে', 'স্বচ্ছ ব্যবহারের সাথে ন্যায্য বাজারদর, Jahreskreis সাবস্ক্রিপশন এবং ব্যবহারকারী সদস্য হওয়ার পথ।'],
               lebensphase: ['জীবনের পর্যায় ও পরিবর্তনের জন্য সংহতি তহবিল', 'বিশেষ জীবন-পর্যায়ে সম্প্রদায় কীভাবে পাশে থাকে, এবং তহবিল কবে থেকে দেয়।'] },
          b: { einstieg: 'কারণ আপনি কর্মজীবনের শুরুতে আছেন', kunde: 'কারণ আপনি গ্রাহক হিসেবে দেখছেন', lebensphase: 'কারণ আপনার জীবনে এখন কিছু বদলাচ্ছে' },
          e: { einstieg: 'যারা শুরু করছেন তাদের জন্য BtMM-এর পরিকল্পনা আছে।', kunde: 'গ্রাহক হিসেবেও BtMM থেকে আপনি কিছু পান।', lebensphase: 'জীবনের পর্যায় ও পরিবর্তনের জন্য সংহতি তহবিল আছে।' },
          m: { einstieg: 'আপনি কর্মজীবনের শুরুতে আছেন', kunde: 'আপনি গ্রাহক হিসেবে দেখছেন', lebensphase: 'আপনার জীবনে কিছু বদলাচ্ছে' },
          k: { einstieg: ['শিক্ষানবিশ', 'প্রথম চাকরি', 'পড়াশোনা শেষ'], kunde: ['গ্রাহক', 'কিনতে', 'অর্ডার'], lebensphase: ['সন্তান', 'অবসর', 'পরিবর্তন'] } },
    ja: { f: "今、人生のどんな時期にいますか？たとえば職業訓練、家族、転職、退職など。", s: { einstieg: ['キャリアの始まり（予定）', '入門ポスト、労働時間と同じように数える学習時間、公的資格への道。'],
               kunde: ['顧客として', 'お金の使い道が見える公正な市場価格、Jahreskreisのサブスク、利用組合員への道。'],
               lebensphase: ['人生の局面と移行のための連帯基金', '特別な人生の局面でコミュニティがどう支えるか、そして基金がいつから支払うか。'] },
          b: { einstieg: '仕事を始めたばかりだから', kunde: '顧客として見ているから', lebensphase: '今あなたに変化が起きているから' },
          e: { einstieg: '仕事を始める人のためにBtMMには計画があります。', kunde: '顧客にとってもBtMMには良いことがあります。', lebensphase: '人生の局面と移行のために連帯基金があります。' },
          m: { einstieg: '仕事を始めたばかり', kunde: '顧客として見ている', lebensphase: '今変化が起きている' },
          k: { einstieg: ['見習い', '新卒', '初めての仕事', 'インターン'], kunde: ['顧客', '買い', '注文', 'サブスク'], lebensphase: ['子ども', '子供', '退職', '年金', '転職', '変化'] } },
    zh: { f: "你现在处在人生的哪个阶段，比如培训、家庭、转行或退休？", s: { einstieg: ['职业起步（计划中）', '入门岗位、按工作时间计算的学习时间，以及取得国家认可资格的途径。'],
               kunde: ['作为顾客', '用途公开的公道市场价、Jahreskreis 订阅，以及成为使用成员的途径。'],
               lebensphase: ['人生阶段与过渡期互助基金', '社区如何在特殊的人生阶段给予支撑，以及基金从何时开始支付。'] },
          b: { einstieg: '因为你正处在职业起步阶段', kunde: '因为你以顾客身份在了解', lebensphase: '因为你现在正经历变化' },
          e: { einstieg: 'BtMM 为起步的人做了计划。', kunde: '作为顾客，BtMM 也能给你带来好处。', lebensphase: '人生阶段与过渡期有互助基金。' },
          m: { einstieg: '你正处在职业起步阶段', kunde: '你以顾客身份在了解', lebensphase: '你正经历变化' },
          k: { einstieg: ['学徒', '刚毕业', '第一份工作', '实习'], kunde: ['顾客', '客户', '购买', '订购', '订阅'], lebensphase: ['孩子', '退休', '转行', '过渡', '变化'] } }
  };
  Object.keys(E).forEach(function (l) {
    var t = T[l], e = E[l]; if (!t) return;
    if (e.f) t.fragen.lage = e.f;
    Object.keys(e.s).forEach(function (k) { t.schritte[k] = e.s[k]; t.bezug[k] = e.b[k]; t.echo[k] = e.e[k]; t.profil.motive[k] = e.m[k]; t.merkmale[k] = e.k[k]; });
  });
  /* Neue Schritte (#38) teilen sich die Weg-Fotos eines nahen Schritts; Alt-Text entsprechend übernehmen. */
  var ALT_TEIL = { kunde: 'arbeiten', einstieg: 'grundlagen', lebensphase: 'wohnen', ruhestand: 'sinn', unterstuetzen: 'anpacken' };
  Object.keys(T).forEach(function (l) {
    var alt = T[l] && T[l].alt;
    if (!alt) return;
    Object.keys(ALT_TEIL).forEach(function (k) {
      if (!alt[k] && alt[ALT_TEIL[k]]) alt[k] = alt[ALT_TEIL[k]];
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
