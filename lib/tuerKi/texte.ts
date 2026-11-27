/**
 * Feste Antworten der Tür-KI-Route in den 11 Tür-Sprachen (kein Modellaufruf).
 * Keine Emojis, keine Tabu-Wörter. Alle nutzerseitigen Texte in Sie-Form
 * (in Sprachen mit Anrede die höfliche Form; Englisch: you).
 * Hinweise aus/Limit/Deckel/Fehler ohne Verweis auf den alten Dialog.
 */
import type { TuerSprache } from './konfig.ts'

export type FesteTexte = {
  aus: string
  sensibel: string
  limit: string
  deckel: string
  fehler: string
  ende: string
  zuLang: string
  ersetzt: string
  direktkredit: string
}

/** Hinweise bei aus, Limit, Deckel oder Fehler: ein Wortlaut, Sie-Form, ohne alten Dialog. */
export const NICHT_VERFUEGBAR: Record<TuerSprache, string> = {
  de: "Die BtMM-KI ist gerade nicht verfügbar. Eine Einführung finden Sie unter [Einführung](/dokumente/01-einfuehrung). Weitere Seiten: [Dokumente](/dokumente), [Häufige Fragen](/faq).",
  en: "The BtMM AI is not available right now. An introduction is available at [Introduction](/dokumente/01-einfuehrung). Further pages: [Documents](/dokumente), [FAQ](/faq).",
  fr: "L’IA BtMM n’est pas disponible pour le moment. Une introduction se trouve sous [Introduction](/dokumente/01-einfuehrung). Autres pages : [Documents](/dokumente), [Questions fréquentes](/faq).",
  es: "La IA de BtMM no está disponible en este momento. Una introducción está en [Introducción](/dokumente/01-einfuehrung). Otras páginas: [Documentos](/dokumente), [Preguntas frecuentes](/faq).",
  pt: "A IA da BtMM não está disponível de momento. Uma introdução está em [Introdução](/dokumente/01-einfuehrung). Outras páginas: [Documentos](/dokumente), [Perguntas frequentes](/faq).",
  ru: "ИИ BtMM сейчас недоступен. Введение — в [Einführung](/dokumente/01-einfuehrung). Другие страницы: [Dokumente](/dokumente), [FAQ](/faq).",
  ar: "ذكاء BtMM غير متاح الآن. مقدمة قصيرة تحت [Einführung](/dokumente/01-einfuehrung). صفحات أخرى: [Dokumente](/dokumente)، [FAQ](/faq).",
  hi: "BtMM-KI अभी उपलब्ध नहीं है। परिचय [Einführung](/dokumente/01-einfuehrung) पर है। अन्य पृष्ठ: [Dokumente](/dokumente), [FAQ](/faq).",
  bn: "BtMM-KI এখন পাওয়া যাচ্ছে না। ভূমিকা আছে [Einführung](/dokumente/01-einfuehrung)-এ। অন্যান্য পৃষ্ঠা: [Dokumente](/dokumente), [FAQ](/faq).",
  ja: "BtMM-KIは現在ご利用いただけません。導入は [Einführung](/dokumente/01-einfuehrung) にあります。他のページ: [Dokumente](/dokumente)、[FAQ](/faq)。",
  zh: "BtMM-KI 目前不可用。简介见 [Einführung](/dokumente/01-einfuehrung)。其他页面：[Dokumente](/dokumente)、[FAQ](/faq)。",
}

export const FESTE_TEXTE: Record<TuerSprache, FesteTexte> = {
  de: {
    aus: NICHT_VERFUEGBAR.de,
    sensibel: 'Bitte keine persönlichen Angaben wie Gesundheit, Kontaktdaten oder Kontodaten. Ihre Nachricht habe ich nicht weitergegeben. Schreiben Sie mir, was Sie an BtMM interessiert.',
    limit: NICHT_VERFUEGBAR.de,
    deckel: NICHT_VERFUEGBAR.de,
    fehler: NICHT_VERFUEGBAR.de,
    ende: 'Danke für das Gespräch. Hier ist Ihr Weg durch BtMM.',
    zuLang: 'Ihre Nachricht ist zu lang. Bitte fassen Sie sich etwas kürzer (höchstens 600 Zeichen).',
    ersetzt: 'Dazu kann ich hier nichts Verlässliches sagen. Schauen Sie gern in die [Dokumente](/dokumente) oder fragen Sie über das Kontaktformular unter [Mitmachen](/mitmachen).',
    direktkredit: 'Direktkredite sind für die Zeit nach der Gründung angedacht. Die Bedingungen sind noch offen und werden rechtlich geprüft. Grundsätzlich gilt: Direktkredite sind nachrangig, ein vollständiger Verlust ist möglich, geben Sie nur, was Sie verlieren könnten. Fragen dazu gern über das Kontaktformular unter [Mitmachen](/mitmachen).',
  },
  en: {
    aus: NICHT_VERFUEGBAR.en,
    sensibel: 'Please do not share personal details such as health, contact or bank details. I have not passed your message on. Tell me what interests you about BtMM.',
    limit: NICHT_VERFUEGBAR.en,
    deckel: NICHT_VERFUEGBAR.en,
    fehler: NICHT_VERFUEGBAR.en,
    ende: 'Thank you for the conversation. Here is your path through BtMM.',
    zuLang: 'Your message is too long. Please keep it a little shorter (at most 600 characters).',
    ersetzt: 'I cannot say anything reliable about that here. Feel free to check the documents or ask via the contact form.',
    direktkredit: 'Direct loans are being considered for the time after the founding. The terms are still open and under legal review. In general, direct loans are subordinated, a total loss is possible, only give what you could afford to lose. Questions are welcome via the contact form.',
  },
  fr: {
    aus: NICHT_VERFUEGBAR.fr,
    sensibel: "Merci de ne pas indiquer de données personnelles comme la santé, des coordonnées ou des données bancaires. Je n'ai pas transmis votre message. Dites-moi ce qui vous intéresse chez BtMM.",
    limit: NICHT_VERFUEGBAR.fr,
    deckel: NICHT_VERFUEGBAR.fr,
    fehler: NICHT_VERFUEGBAR.fr,
    ende: 'Merci pour la conversation. Voici votre chemin à travers BtMM.',
    zuLang: 'Votre message est trop long. Veuillez le raccourcir un peu (600 caractères au maximum).',
    ersetzt: "Je ne peux rien dire de fiable à ce sujet ici. Consultez les documents ou posez votre question via le formulaire de contact.",
    direktkredit: "Les prêts directs sont envisagés pour la période après la fondation. Les conditions sont encore ouvertes et font l'objet d'un examen juridique. En principe, les prêts directs sont subordonnés, une perte totale est possible, ne donnez que ce que vous pourriez perdre. Questions bienvenues via le formulaire de contact.",
  },
  es: {
    aus: NICHT_VERFUEGBAR.es,
    sensibel: 'Por favor, no comparta datos personales como salud, datos de contacto o bancarios. No he enviado su mensaje. Cuénteme qué le interesa de BtMM.',
    limit: NICHT_VERFUEGBAR.es,
    deckel: NICHT_VERFUEGBAR.es,
    fehler: NICHT_VERFUEGBAR.es,
    ende: 'Gracias por la conversación. Aquí tiene su camino por BtMM.',
    zuLang: 'Su mensaje es demasiado largo. Escríbalo un poco más corto (máximo 600 caracteres).',
    ersetzt: 'Aquí no puedo decir nada fiable sobre eso. Consulte los documentos o pregunte por el formulario de contacto.',
    direktkredit: 'Los préstamos directos se contemplan para después de la fundación. Las condiciones aún están abiertas y en revisión jurídica. En general, los préstamos directos son subordinados, es posible una pérdida total, aporte solo lo que podría perder. Preguntas por el formulario de contacto.',
  },
  pt: {
    aus: NICHT_VERFUEGBAR.pt,
    sensibel: 'Por favor, não partilhe dados pessoais como saúde, contactos ou dados bancários. Não enviei a sua mensagem. Diga-me o que lhe interessa na BtMM.',
    limit: NICHT_VERFUEGBAR.pt,
    deckel: NICHT_VERFUEGBAR.pt,
    fehler: NICHT_VERFUEGBAR.pt,
    ende: 'Obrigado pela conversa. Aqui está o seu caminho pela BtMM.',
    zuLang: 'A sua mensagem é demasiado longa. Escreva um pouco menos (no máximo 600 caracteres).',
    ersetzt: 'Não posso dizer nada fiável sobre isso aqui. Consulte os documentos ou pergunte pelo formulário de contacto.',
    direktkredit: 'Os empréstimos diretos estão pensados para depois da fundação. As condições ainda estão em aberto e em análise jurídica. Em geral, os empréstimos diretos são subordinados, é possível uma perda total, dê só o que poderia perder. Perguntas pelo formulário de contacto.',
  },
  ru: {
    aus: NICHT_VERFUEGBAR.ru,
    sensibel: 'Пожалуйста, не указывайте личные данные: здоровье, контакты или банковские данные. Я не передал Ваше сообщение. Напишите, что Вас интересует в BtMM.',
    limit: NICHT_VERFUEGBAR.ru,
    deckel: NICHT_VERFUEGBAR.ru,
    fehler: NICHT_VERFUEGBAR.ru,
    ende: 'Спасибо за разговор. Вот Ваш путь по BtMM.',
    zuLang: 'Сообщение слишком длинное. Сократите его (не более 600 знаков).',
    ersetzt: 'Здесь я не могу сказать об этом ничего надёжного. Загляните в документы или спросите через контактную форму.',
    direktkredit: 'Прямые займы рассматриваются на время после основания. Условия ещё не определены и проходят юридическую проверку. В целом прямые займы субординированы, возможна полная потеря, давайте только то, что Вы можете позволить себе потерять. Вопросы через контактную форму.',
  },
  ar: {
    aus: NICHT_VERFUEGBAR.ar,
    sensibel: 'من فضلكم لا تشاركوا بيانات شخصية مثل الصحة أو بيانات الاتصال أو البيانات المصرفية. لم أرسل رسالتكم. أخبروني بما يهمكم في BtMM.',
    limit: NICHT_VERFUEGBAR.ar,
    deckel: NICHT_VERFUEGBAR.ar,
    fehler: NICHT_VERFUEGBAR.ar,
    ende: 'شكرًا على المحادثة. هذا طريقكم عبر BtMM.',
    zuLang: 'رسالتكم طويلة جدًا. يُرجى كتابتها أقصر قليلًا (600 حرف كحد أقصى).',
    ersetzt: 'لا أستطيع قول شيء موثوق عن ذلك هنا. اطلعوا على الوثائق أو اسألوا عبر نموذج التواصل.',
    direktkredit: 'القروض المباشرة مطروحة لفترة ما بعد التأسيس. الشروط لم تحدد بعد وهي قيد المراجعة القانونية. بشكل عام القروض المباشرة تابعة في الترتيب، والخسارة الكاملة ممكنة، فلا تقدموا إلا ما يمكنكم تحمل خسارته. الأسئلة عبر نموذج التواصل.',
  },
  hi: {
    aus: NICHT_VERFUEGBAR.hi,
    sensibel: 'कृपया स्वास्थ्य, संपर्क या बैंक जैसी निजी जानकारी न लिखें। मैंने आपका संदेश आगे नहीं भेजा। बताइए कि BtMM में आपको क्या रुचिकर लगता है।',
    limit: NICHT_VERFUEGBAR.hi,
    deckel: NICHT_VERFUEGBAR.hi,
    fehler: NICHT_VERFUEGBAR.hi,
    ende: 'बातचीत के लिए धन्यवाद। यह रहा BtMM में आपका रास्ता।',
    zuLang: 'आपका संदेश बहुत लंबा है। कृपया थोड़ा छोटा लिखें (अधिकतम 600 अक्षर)।',
    ersetzt: 'इस बारे में मैं यहाँ कुछ भरोसेमंद नहीं कह सकती। दस्तावेज़ देखें या संपर्क फ़ॉर्म से पूछें।',
    direktkredit: 'प्रत्यक्ष ऋण स्थापना के बाद के समय के लिए सोचे गए हैं। शर्तें अभी तय नहीं हैं और कानूनी जाँच में हैं। सामान्य रूप से प्रत्यक्ष ऋण अधीनस्थ होते हैं, पूरा नुकसान संभव है, केवल उतना दें जितना खो सकते हैं। सवाल संपर्क फ़ॉर्म से।',
  },
  bn: {
    aus: NICHT_VERFUEGBAR.bn,
    sensibel: 'দয়া করে স্বাস্থ্য, যোগাযোগ বা ব্যাংকের মতো ব্যক্তিগত তথ্য লিখবেন না। আমি আপনার বার্তা পাঠাইনি। বলুন BtMM-এ আপনার কী আগ্রহ।',
    limit: NICHT_VERFUEGBAR.bn,
    deckel: NICHT_VERFUEGBAR.bn,
    fehler: NICHT_VERFUEGBAR.bn,
    ende: 'কথোপকথনের জন্য ধন্যবাদ। এই হলো BtMM-এ আপনার পথ।',
    zuLang: 'আপনার বার্তা খুব লম্বা। একটু ছোট করে লিখুন (সর্বোচ্চ 600 অক্ষর)।',
    ersetzt: 'এ বিষয়ে আমি এখানে নির্ভরযোগ্য কিছু বলতে পারি না। নথিগুলো দেখুন বা যোগাযোগ ফর্মে জিজ্ঞেসা করুন।',
    direktkredit: 'সরাসরি ঋণ প্রতিষ্ঠার পরের সময়ের জন্য ভাবা হচ্ছে। শর্তগুলো এখনও খোলা এবং আইনি পর্যালোচনায় আছে। সাধারণভাবে সরাসরি ঋণ অধস্তন, পুরো ক্ষতি সম্ভব, শুধু ততটুকু দিন যতটুকু হারাতে পারেন। প্রশ্ন যোগাযোগ ফর্মে।',
  },
  ja: {
    aus: NICHT_VERFUEGBAR.ja,
    sensibel: '健康、連絡先、口座情報などの個人情報は書かないでください。メッセージは送信していません。BtMMのどこに興味があるか教えてください。',
    limit: NICHT_VERFUEGBAR.ja,
    deckel: NICHT_VERFUEGBAR.ja,
    fehler: NICHT_VERFUEGBAR.ja,
    ende: 'お話しいただきありがとうございます。BtMMでのあなたの道はこちらです。',
    zuLang: 'メッセージが長すぎます。少し短くしてください(最大600文字)。',
    ersetzt: 'それについてはここで確かなことは言えません。資料をご覧いただくか、お問い合わせフォームからご質問ください。',
    direktkredit: 'ダイレクトローンは設立後の時期に検討されています。条件はまだ決まっておらず、法的に確認中です。一般にダイレクトローンは劣後扱いで、全額を失う可能性があります。失っても困らない額だけにしてください。ご質問はお問い合わせフォームから。',
  },
  zh: {
    aus: NICHT_VERFUEGBAR.zh,
    sensibel: '请不要填写健康、联系方式或银行信息等个人资料。我没有转发您的消息。请告诉我您对 BtMM 的哪些方面感兴趣。',
    limit: NICHT_VERFUEGBAR.zh,
    deckel: NICHT_VERFUEGBAR.zh,
    fehler: NICHT_VERFUEGBAR.zh,
    ende: '谢谢您的交流。这是您了解 BtMM 的路径。',
    zuLang: '您的消息太长了。请写短一些（最多 600 个字符）。',
    ersetzt: '关于这一点我在这里无法给出可靠的说法。请查看文件，或通过联系表单提问。',
    direktkredit: '直接借款计划在成立之后考虑。条件尚未确定，正在进行法律审查。一般而言，直接借款属于次级债权，可能全部损失，只投入您能承受损失的金额。问题请通过联系表单提出。',
  },
}
