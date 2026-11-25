/* BtMM Tür, PR #38 Runde 4 (24.11.2026): Antwort-Chips für „motiv“, „lage“ und „zeit“ (Test-Bot r3: Chips + optionaler Freitext).
 * Die Chips tragen ihre Bedeutung selbst (Index → Merkmale in pfad.js WAHL), unabhängig von der Wortwahl; Freitext bleibt möglich.
 * Dazu allgemeine Freitext-Regeln (kein Abgleich mit Test-Antworten):
 *   kv = Kunden-Verben („einkaufen“, „kaufen“, „beziehen“, „nutzen“, „Kunde“): schlagen „Betrieb“, wenn kein eigener Betrieb genannt ist (eb),
 *   sk = Alltagsphrasen der Skepsis („Haken“, „zu schön“, „Beweise“, „echt“, „kritisch“, „prüfen“).
 * Reihenfolge der Chips = Reihenfolge in pfad.js WAHL. de/en sorgfältig, übrige sinngemäß. Tabufrei. */
(function (w) {
  'use strict';
  var T = w.BTMM_TUER_TEXTE; if (!T) return;
  var S = {
    de: { m: ['Eigener Betrieb / Handwerk', 'Solo / selbstständig', 'Fair einkaufen & nutzen', 'Erst mal prüfen', 'Mitmachen / gründen', 'Unterstützen / fördern', 'Neugierig auf die Idee'],
          z: ['Kurz lesen (2 Min.)', 'Genauer ansehen (5 Min.)', 'In Ruhe vertiefen', 'Mal vorbeikommen', 'Mit anpacken'], h: 'Antippen oder frei schreiben',
          kv: [' einkaufen', ' einkaufe', ' kaufen', ' kaufe ', 'beziehen', 'bezieh', ' nutzen', 'kunde', 'kundin', 'bestellen', 'als verbraucher'],
          eb: ['eigenen betrieb', 'eigener betrieb', 'eigenem betrieb', 'eigene firma', 'eigene werkstatt', 'einen betrieb', 'habe eine werkstatt', 'mein betrieb', 'meinen betrieb', 'meinem betrieb', 'unser betrieb', 'unseren betrieb', 'meine firma', 'meiner firma', 'meine werkstatt', 'meiner werkstatt', 'mein geschäft', 'meinen laden', 'mein laden', 'ich arbeite', 'arbeite als', 'arbeite in', 'bin selbst', 'selbstständig', 'selbständig', 'meister', 'geselle', 'gesellin', 'inhaber', 'angestellt', 'mitarbeiter', 'mein handwerk', 'bin handwerker', 'freiberuf', 'gelernt'],
          sk: ['wo ist der haken', 'gibt es einen haken', 'ist das echt', 'echt jetzt', 'ob das echt', 'beweise', 'zu gut um', 'nachprüf', 'überprüf', 'skepsis', 'erst sehen', 'abwarten', 'traue ', 'trau ', 'klingt zu', 'wer garantiert', 'bin kritisch', 'kritisch'] },
    en: { m: ['Own business / craft', 'Solo / self-employed', 'Buy & use fairly', 'Check it first', 'Join / co-found', 'Support / sponsor', 'Curious about the idea'],
          z: ['Quick read (2 min)', 'Closer look (5 min)', 'Take my time', 'Drop by', 'Get involved'], h: 'Tap an answer or type freely',
          kv: [' shop ', 'shopping', ' buy', 'purchase', 'source from', ' use your', ' use the', 'customer', 'order from', 'as a consumer'],
          eb: ['own business', 'own company', 'own workshop', 'have a business', 'my business', 'my company', 'my workshop', 'my shop', 'my firm', 'i work', 'i run', 'work as', 'self-employed', 'freelanc', 'owner', 'employees', 'my trade', 'master craftsman', 'journeyman', 'i am a carpenter', "i'm a carpenter"],
          sk: ["what's the catch", 'is there a catch', 'too good to be true', ' for real', 'is it real', 'is this real', 'prove', 'proof', 'evidence', 'verify', 'wait and see', "don't trust", 'critical', 'check'] },
    fr: { m: ['Artisanat / mon entreprise', 'Indépendant·e', 'Acheter & utiliser équitable', 'D’abord vérifier', 'Participer / fonder', 'Soutenir', 'Curieux de l’idée'],
          z: ['Lire vite (2 min)', 'Regarder de près (5 min)', 'Approfondir tranquillement', 'Passer vous voir', 'Mettre la main à la pâte'], h: 'Touche une réponse ou écris librement',
          kv: ['acheter', 'achete', 'faire mes courses', 'utiliser', 'client', 'commander'], eb: ['mon entreprise', 'mon atelier', 'ma societe', 'je travaille', 'independant', 'artisan', 'patron', 'salaries'],
          sk: ['ou est le piege', 'trop beau', 'preuve', 'verifier', 'vraiment', 'critique', 'mefian'] },
    es: { m: ['Oficio / empresa propia', 'Autónomo/a', 'Comprar y usar de forma justa', 'Primero comprobar', 'Participar / fundar', 'Apoyar', 'Me interesa la idea'],
          z: ['Leer rápido (2 min)', 'Mirar más (5 min)', 'Profundizar con calma', 'Pasarme por allí', 'Echar una mano'], h: 'Toca una opción o escribe libremente',
          kv: ['comprar', 'compro', 'usar', 'utilizar', 'cliente', 'encargar'], eb: ['mi empresa', 'mi taller', 'mi negocio', 'trabajo como', 'trabajo en', 'autonom', 'artesan', 'empleados'],
          sk: ['donde esta la trampa', 'demasiado bonito', 'prueba', 'comprobar', 'de verdad', 'critic', 'desconfi'] },
    pt: { m: ['Ofício / negócio próprio', 'Trabalho por conta própria', 'Comprar e usar de forma justa', 'Primeiro verificar', 'Participar / fundar', 'Apoiar', 'Curiosidade pela ideia'],
          z: ['Ler rápido (2 min)', 'Ver melhor (5 min)', 'Aprofundar com calma', 'Passar por lá', 'Dar uma mão'], h: 'Toca numa opção ou escreve livremente',
          kv: ['comprar', 'compro', 'usar', 'utilizar', 'cliente', 'encomendar'], eb: ['minha empresa', 'minha oficina', 'meu negocio', 'trabalho como', 'trabalho em', 'conta propria', 'artesao', 'funcionarios'],
          sk: ['qual e o truque', 'bom demais', 'prova', 'verificar', 'de verdade', 'critic', 'desconfi'] },
    ru: { m: ['Ремесло / своё дело', 'Самозанятый', 'Честно покупать и пользоваться', 'Сначала проверить', 'Участвовать / основать', 'Поддержать', 'Интересна идея'],
          z: ['Быстро прочитать (2 мин)', 'Посмотреть подробнее (5 мин)', 'Спокойно вникнуть', 'Зайти в гости', 'Включиться в работу'], h: 'Нажми вариант или напиши свободно',
          kv: ['покупать', 'купить', 'покупаю', 'пользоваться', 'клиент', 'заказать'], eb: ['моё дело', 'мое дело', 'моя фирма', 'моя мастерская', 'я работаю', 'работаю как', 'самозанят', 'сотрудник'],
          sk: ['в чём подвох', 'в чем подвох', 'слишком хорошо', 'доказ', 'провер', 'правда ли', 'критич', 'не довер'] },
    ar: { m: ['حرفة / منشأة خاصة', 'عمل حر', 'الشراء والاستخدام بإنصاف', 'أتحقق أولًا', 'المشاركة / التأسيس', 'الدعم', 'الفكرة تثير فضولي'],
          z: ['قراءة سريعة (دقيقتان)', 'نظرة أدق (5 دقائق)', 'التعمق بهدوء', 'زيارة', 'المشاركة الفعلية'], h: 'اختر إجابة أو اكتب بحرية',
          kv: ['اشتري', 'شراء', 'استخدام', 'استخدم', 'زبون', 'عميل'], eb: ['منشأتي', 'شركتي', 'ورشتي', 'اعمل', 'عمل حر', 'موظفين'],
          sk: ['ما الخدعه', 'اجمل من', 'دليل', 'اثبات', 'تحقق', 'حقا', 'ناقد', 'لا اثق'] },
    hi: { m: ['हुनर / अपना व्यवसाय', 'स्वरोज़गार', 'न्यायपूर्ण ख़रीद और उपयोग', 'पहले जाँचना', 'जुड़ना / स्थापना', 'सहयोग करना', 'विचार में रुचि'],
          z: ['जल्दी पढ़ना (2 मिनट)', 'ध्यान से देखना (5 मिनट)', 'आराम से गहराई में', 'मिलने आना', 'हाथ बँटाना'], h: 'कोई उत्तर चुनो या खुलकर लिखो',
          kv: ['ख़रीद', 'खरीद', 'उपयोग', 'इस्तेमाल', 'ग्राहक'], eb: ['मेरा व्यवसाय', 'मेरी कंपनी', 'मेरी वर्कशॉप', 'मैं काम करता', 'मैं काम करती', 'स्वरोज़गार', 'कर्मचारी'],
          sk: ['क्या चाल', 'बहुत अच्छा', 'सबूत', 'प्रमाण', 'जाँच', 'सच में', 'आलोचना', 'भरोसा नहीं'] },
    bn: { m: ['কারিগরি / নিজের ব্যবসা', 'স্বনির্ভর পেশা', 'ন্যায্যভাবে কেনা ও ব্যবহার', 'আগে যাচাই', 'যোগ দেওয়া / প্রতিষ্ঠা', 'সহায়তা করা', 'ধারণাটি নিয়ে কৌতূহল'],
          z: ['দ্রুত পড়া (২ মিনিট)', 'ভালো করে দেখা (৫ মিনিট)', 'ধীরে গভীরে যাওয়া', 'দেখা করতে আসা', 'হাত লাগানো'], h: 'একটি উত্তর বাছো বা নিজে লেখো',
          kv: ['কিনতে', 'কেনা', 'ব্যবহার', 'গ্রাহক', 'ক্রেতা'], eb: ['আমার ব্যবসা', 'আমার কোম্পানি', 'আমার কারখানা', 'আমি কাজ করি', 'স্বনির্ভর', 'কর্মী'],
          sk: ['কী ফাঁদ', 'এত ভালো', 'প্রমাণ', 'যাচাই', 'সত্যি', 'সমালোচ', 'বিশ্বাস হয় না'] },
    ja: { m: ['手仕事・自分の事業', '個人事業・フリー', '公正に買う・使う', 'まず確かめたい', '参加・設立したい', '支援したい', '考え方に興味'],
          z: ['さっと読む（2分）', '少し詳しく（5分）', 'じっくり深める', '訪ねてみる', '一緒に動く'], h: '選ぶか、自由に書いてください',
          kv: ['買い', '購入', '利用', '使い', '顧客', 'お客'], eb: ['自分の事業', '私の会社', '自分の工房', '働いて', '自営', 'フリーランス', '従業員', '経営'],
          sk: ['裏がある', 'うますぎる', '証拠', '根拠', '確かめ', '本当に', '批判', '信用でき'] },
    zh: { m: ['手艺 / 自己的企业', '个体 / 自由职业', '公平购买和使用', '先核实一下', '参与 / 共同创立', '支持', '对理念好奇'],
          z: ['快速浏览（2分钟）', '仔细看看（5分钟）', '慢慢深入', '过来看看', '一起动手'], h: '点选或自由输入',
          kv: ['购买', '买', '使用', '顾客', '客户'], eb: ['我的企业', '我的公司', '我的作坊', '我在', '自由职业', '个体', '员工', '经营'],
          sk: ['有什么猫腻', '太好了吧', '证据', '证明', '核实', '真的吗', '批评', '不相信'] }
  };
  Object.keys(S).forEach(function (l) {
    var t = T[l], e = S[l]; if (!t) return;
    t.motivWahl = e.m; t.zeitWahl = e.z; t.wahlHinweis = e.h;
    t.vorrang = { kundeVerben: e.kv, eigenerBetrieb: e.eb };
    t.merkmale.skeptisch = (t.merkmale.skeptisch || []).concat(e.sk);
  });
})(typeof window !== 'undefined' ? window : globalThis);
