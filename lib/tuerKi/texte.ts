/**
 * Feste Antworten der Tür-KI-Route in den 11 Tür-Sprachen (kein Modellaufruf).
 * Keine Emojis, keine Tabu-Wörter. Du-Form wie in der Tür.
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

export const FESTE_TEXTE: Record<TuerSprache, FesteTexte> = {
  de: {
    aus: 'Die BtMM-KI ist gerade nicht verfügbar. Du kannst dich hier umsehen oder die kurzen Fragen nutzen.',
    sensibel: 'Bitte keine persönlichen Angaben wie Gesundheit, Kontaktdaten oder Kontodaten. Deine Nachricht habe ich nicht weitergegeben. Schreib mir, was dich an BtMM interessiert.',
    limit: 'Gerade kommen sehr viele Nachrichten an. Bitte versuch es etwas später wieder.',
    deckel: 'Die BtMM-KI macht für heute Pause. Du kannst dich hier umsehen oder die kurzen Fragen nutzen.',
    fehler: 'Das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal oder sieh dich hier um.',
    ende: 'Danke für das Gespräch. Hier ist dein Weg durch BtMM.',
    zuLang: 'Deine Nachricht ist zu lang. Bitte fass dich etwas kürzer (höchstens 600 Zeichen).',
    ersetzt: 'Dazu kann ich hier nichts Verlässliches sagen. Schau gern in die Dokumente oder frag über das Kontaktformular.',
    direktkredit: 'Direktkredite sind für die Zeit nach der Gründung angedacht. Die Bedingungen sind noch offen und werden rechtlich geprüft. Grundsätzlich gilt: Direktkredite sind nachrangig, ein vollständiger Verlust ist möglich, gib nur, was du verlieren könntest. Fragen dazu gern über das Kontaktformular.',
  },
  en: {
    aus: 'The BtMM AI is not available right now. You can look around here or use the short questions.',
    sensibel: 'Please do not share personal details such as health, contact or bank details. I have not passed your message on. Tell me what interests you about BtMM.',
    limit: 'A lot of messages are arriving right now. Please try again a little later.',
    deckel: 'The BtMM AI is taking a break for today. You can look around here or use the short questions.',
    fehler: 'That did not work just now. Please try again in a moment or look around here.',
    ende: 'Thank you for the conversation. Here is your path through BtMM.',
    zuLang: 'Your message is too long. Please keep it a little shorter (at most 600 characters).',
    ersetzt: 'I cannot say anything reliable about that here. Feel free to check the documents or ask via the contact form.',
    direktkredit: 'Direct loans are being considered for the time after the founding. The terms are still open and under legal review. In general, direct loans are subordinated, a total loss is possible, only give what you could afford to lose. Questions are welcome via the contact form.',
  },
  fr: {
    aus: "L'IA BtMM n'est pas disponible pour le moment. Tu peux regarder ici ou utiliser les questions courtes.",
    sensibel: "Merci de ne pas indiquer de données personnelles comme la santé, des coordonnées ou des données bancaires. Je n'ai pas transmis ton message. Dis-moi ce qui t'intéresse chez BtMM.",
    limit: 'Beaucoup de messages arrivent en ce moment. Réessaie un peu plus tard.',
    deckel: "L'IA BtMM fait une pause pour aujourd'hui. Tu peux regarder ici ou utiliser les questions courtes.",
    fehler: "Cela n'a pas fonctionné. Réessaie dans un instant ou regarde ici.",
    ende: 'Merci pour la conversation. Voici ton chemin à travers BtMM.',
    zuLang: 'Ton message est trop long. Fais un peu plus court (600 caractères au maximum).',
    ersetzt: "Je ne peux rien dire de fiable à ce sujet ici. Consulte les documents ou pose ta question via le formulaire de contact.",
    direktkredit: "Les prêts directs sont envisagés pour la période après la fondation. Les conditions sont encore ouvertes et font l'objet d'un examen juridique. En principe, les prêts directs sont subordonnés, une perte totale est possible, ne donne que ce que tu pourrais perdre. Questions bienvenues via le formulaire de contact.",
  },
  es: {
    aus: 'La IA de BtMM no está disponible ahora. Puedes mirar por aquí o usar las preguntas cortas.',
    sensibel: 'Por favor, no compartas datos personales como salud, datos de contacto o bancarios. No he enviado tu mensaje. Cuéntame qué te interesa de BtMM.',
    limit: 'Ahora llegan muchos mensajes. Vuelve a intentarlo un poco más tarde.',
    deckel: 'La IA de BtMM hace una pausa por hoy. Puedes mirar por aquí o usar las preguntas cortas.',
    fehler: 'Eso no ha funcionado. Inténtalo de nuevo en un momento o mira por aquí.',
    ende: 'Gracias por la conversación. Aquí tienes tu camino por BtMM.',
    zuLang: 'Tu mensaje es demasiado largo. Escríbelo un poco más corto (máximo 600 caracteres).',
    ersetzt: 'Aquí no puedo decir nada fiable sobre eso. Consulta los documentos o pregunta por el formulario de contacto.',
    direktkredit: 'Los préstamos directos se contemplan para después de la fundación. Las condiciones aún están abiertas y en revisión jurídica. En general, los préstamos directos son subordinados, es posible una pérdida total, aporta solo lo que podrías perder. Preguntas por el formulario de contacto.',
  },
  pt: {
    aus: 'A IA da BtMM não está disponível agora. Podes ver por aqui ou usar as perguntas curtas.',
    sensibel: 'Por favor, não partilhes dados pessoais como saúde, contactos ou dados bancários. Não enviei a tua mensagem. Diz-me o que te interessa na BtMM.',
    limit: 'Estão a chegar muitas mensagens. Tenta de novo um pouco mais tarde.',
    deckel: 'A IA da BtMM faz uma pausa por hoje. Podes ver por aqui ou usar as perguntas curtas.',
    fehler: 'Isso não funcionou. Tenta de novo daqui a pouco ou vê por aqui.',
    ende: 'Obrigado pela conversa. Aqui está o teu caminho pela BtMM.',
    zuLang: 'A tua mensagem é demasiado longa. Escreve um pouco menos (no máximo 600 caracteres).',
    ersetzt: 'Não posso dizer nada fiável sobre isso aqui. Consulta os documentos ou pergunta pelo formulário de contacto.',
    direktkredit: 'Os empréstimos diretos estão pensados para depois da fundação. As condições ainda estão em aberto e em análise jurídica. Em geral, os empréstimos diretos são subordinados, é possível uma perda total, dá só o que poderias perder. Perguntas pelo formulário de contacto.',
  },
  ru: {
    aus: 'ИИ BtMM сейчас недоступен. Можешь осмотреться здесь или ответить на короткие вопросы.',
    sensibel: 'Пожалуйста, не указывай личные данные: здоровье, контакты или банковские данные. Я не передал твоё сообщение. Напиши, что тебя интересует в BtMM.',
    limit: 'Сейчас приходит очень много сообщений. Попробуй чуть позже.',
    deckel: 'ИИ BtMM на сегодня делает паузу. Можешь осмотреться здесь или ответить на короткие вопросы.',
    fehler: 'Сейчас не получилось. Попробуй ещё раз чуть позже или осмотрись здесь.',
    ende: 'Спасибо за разговор. Вот твой путь по BtMM.',
    zuLang: 'Сообщение слишком длинное. Сократи его (не более 600 знаков).',
    ersetzt: 'Здесь я не могу сказать об этом ничего надёжного. Загляни в документы или спроси через контактную форму.',
    direktkredit: 'Прямые займы рассматриваются на время после основания. Условия ещё не определены и проходят юридическую проверку. В целом прямые займы субординированы, возможна полная потеря, давай только то, что можешь позволить себе потерять. Вопросы через контактную форму.',
  },
  ar: {
    aus: 'ذكاء BtMM غير متاح الآن. يمكنك التجول هنا أو استخدام الأسئلة القصيرة.',
    sensibel: 'من فضلك لا تشارك بيانات شخصية مثل الصحة أو بيانات الاتصال أو البيانات المصرفية. لم أرسل رسالتك. أخبرني بما يهمك في BtMM.',
    limit: 'تصل الآن رسائل كثيرة جدًا. حاول مرة أخرى بعد قليل.',
    deckel: 'ذكاء BtMM يأخذ استراحة اليوم. يمكنك التجول هنا أو استخدام الأسئلة القصيرة.',
    fehler: 'لم ينجح ذلك الآن. حاول مرة أخرى بعد لحظة أو تجول هنا.',
    ende: 'شكرًا على المحادثة. هذا طريقك عبر BtMM.',
    zuLang: 'رسالتك طويلة جدًا. اكتبها أقصر قليلًا (600 حرف كحد أقصى).',
    ersetzt: 'لا أستطيع قول شيء موثوق عن ذلك هنا. اطلع على الوثائق أو اسأل عبر نموذج التواصل.',
    direktkredit: 'القروض المباشرة مطروحة لفترة ما بعد التأسيس. الشروط لم تحدد بعد وهي قيد المراجعة القانونية. بشكل عام القروض المباشرة تابعة في الترتيب، والخسارة الكاملة ممكنة، فلا تقدم إلا ما يمكنك تحمل خسارته. الأسئلة عبر نموذج التواصل.',
  },
  hi: {
    aus: 'BtMM-KI अभी उपलब्ध नहीं है। तुम यहाँ देख सकते हो या छोटे सवालों का उपयोग कर सकते हो।',
    sensibel: 'कृपया स्वास्थ्य, संपर्क या बैंक जैसी निजी जानकारी न लिखें। मैंने तुम्हारा संदेश आगे नहीं भेजा। बताओ कि BtMM में तुम्हें क्या रुचिकर लगता है।',
    limit: 'अभी बहुत सारे संदेश आ रहे हैं। थोड़ी देर बाद फिर कोशिश करो।',
    deckel: 'BtMM-KI आज के लिए विराम ले रही है। तुम यहाँ देख सकते हो या छोटे सवालों का उपयोग कर सकते हो।',
    fehler: 'अभी यह नहीं हो पाया। थोड़ी देर में फिर कोशिश करो या यहाँ देखो।',
    ende: 'बातचीत के लिए धन्यवाद। यह रहा BtMM में तुम्हारा रास्ता।',
    zuLang: 'तुम्हारा संदेश बहुत लंबा है। थोड़ा छोटा लिखो (अधिकतम 600 अक्षर)।',
    ersetzt: 'इस बारे में मैं यहाँ कुछ भरोसेमंद नहीं कह सकती। दस्तावेज़ देखो या संपर्क फ़ॉर्म से पूछो।',
    direktkredit: 'प्रत्यक्ष ऋण स्थापना के बाद के समय के लिए सोचे गए हैं। शर्तें अभी तय नहीं हैं और कानूनी जाँच में हैं। सामान्य रूप से प्रत्यक्ष ऋण अधीनस्थ होते हैं, पूरा नुकसान संभव है, केवल उतना दो जितना खो सकते हो। सवाल संपर्क फ़ॉर्म से।',
  },
  bn: {
    aus: 'BtMM-KI এখন পাওয়া যাচ্ছে না। তুমি এখানে ঘুরে দেখতে পারো বা ছোট প্রশ্নগুলো ব্যবহার করতে পারো।',
    sensibel: 'দয়া করে স্বাস্থ্য, যোগাযোগ বা ব্যাংকের মতো ব্যক্তিগত তথ্য লিখো না। আমি তোমার বার্তা পাঠাইনি। বলো BtMM-এ তোমার কী আগ্রহ।',
    limit: 'এখন অনেক বার্তা আসছে। একটু পরে আবার চেষ্টা করো।',
    deckel: 'BtMM-KI আজকের মতো বিরতিতে। তুমি এখানে ঘুরে দেখতে পারো বা ছোট প্রশ্নগুলো ব্যবহার করতে পারো।',
    fehler: 'এখন এটা হলো না। একটু পরে আবার চেষ্টা করো বা এখানে ঘুরে দেখো।',
    ende: 'কথোপকথনের জন্য ধন্যবাদ। এই হলো BtMM-এ তোমার পথ।',
    zuLang: 'তোমার বার্তা খুব লম্বা। একটু ছোট করে লেখো (সর্বোচ্চ 600 অক্ষর)।',
    ersetzt: 'এ বিষয়ে আমি এখানে নির্ভরযোগ্য কিছু বলতে পারি না। নথিগুলো দেখো বা যোগাযোগ ফর্মে জিজ্ঞেস করো।',
    direktkredit: 'সরাসরি ঋণ প্রতিষ্ঠার পরের সময়ের জন্য ভাবা হচ্ছে। শর্তগুলো এখনও খোলা এবং আইনি পর্যালোচনায় আছে। সাধারণভাবে সরাসরি ঋণ অধস্তন, পুরো ক্ষতি সম্ভব, শুধু ততটুকু দাও যতটুকু হারাতে পারো। প্রশ্ন যোগাযোগ ফর্মে।',
  },
  ja: {
    aus: 'BtMM-KIは現在ご利用いただけません。ここを見て回るか、短い質問をご利用ください。',
    sensibel: '健康、連絡先、口座情報などの個人情報は書かないでください。メッセージは送信していません。BtMMのどこに興味があるか教えてください。',
    limit: '現在メッセージが非常に多く届いています。少し後でもう一度お試しください。',
    deckel: 'BtMM-KIは本日休止中です。ここを見て回るか、短い質問をご利用ください。',
    fehler: 'うまくいきませんでした。少ししてからもう一度試すか、ここを見て回ってください。',
    ende: 'お話しいただきありがとうございます。BtMMでのあなたの道はこちらです。',
    zuLang: 'メッセージが長すぎます。少し短くしてください(最大600文字)。',
    ersetzt: 'それについてはここで確かなことは言えません。資料をご覧いただくか、お問い合わせフォームからご質問ください。',
    direktkredit: 'ダイレクトローンは設立後の時期に検討されています。条件はまだ決まっておらず、法的に確認中です。一般にダイレクトローンは劣後扱いで、全額を失う可能性があります。失っても困らない額だけにしてください。ご質問はお問い合わせフォームから。',
  },
  zh: {
    aus: 'BtMM-KI 目前不可用。你可以在这里看看，或使用简短问题。',
    sensibel: '请不要填写健康、联系方式或银行信息等个人资料。我没有转发你的消息。告诉我你对 BtMM 的哪些方面感兴趣。',
    limit: '现在收到的消息非常多。请稍后再试。',
    deckel: 'BtMM-KI 今天暂停服务。你可以在这里看看，或使用简短问题。',
    fehler: '刚才没有成功。请稍后再试，或在这里看看。',
    ende: '谢谢你的交流。这是你了解 BtMM 的路径。',
    zuLang: '你的消息太长了。请写短一些（最多 600 个字符）。',
    ersetzt: '关于这一点我在这里无法给出可靠的说法。请查看文件，或通过联系表单提问。',
    direktkredit: '直接借款计划在成立之后考虑。条件尚未确定，正在进行法律审查。一般而言，直接借款属于次级债权，可能全部损失，只投入你能承受损失的金额。问题请通过联系表单提出。',
  },
}
