/**
 * DSE-Satz zur IP-Verarbeitung der Tür-KI (DS-Bot 25.11.2026).
 * Deutsch wörtlich vorgegeben; andere Sprachen sinngemäß in Sie-Form.
 * Die übrige DSE bleibt auf Deutsch; dieser Satz folgt der Seiten-Locale.
 */
import type { TuerSprache } from './konfig.ts'

export const DSE_IP_SATZ_DE =
  'Zur Missbrauchsvermeidung verarbeiten wir Ihre IP-Adresse kurzzeitig in gehashter Form; Hash, Zeitfenster und Zähler werden höchstens 24 Stunden in unserer Datenbank in der EU (Supabase, Region Frankfurt) gespeichert und danach gelöscht. Das täglich wechselnde Salz liegt nur in der Server-Umgebung, nicht in der Datenbank.'

export const DSE_IP_SATZ: Record<TuerSprache, string> = {
  de: DSE_IP_SATZ_DE,
  en: 'To prevent abuse, we process your IP address briefly in hashed form; the hash, time window and counter are stored for at most 24 hours in our database in the EU (Supabase, Frankfurt region) and then deleted. The daily rotating salt is kept only in the server environment, not in the database.',
  fr: "Afin de prévenir les abus, nous traitons votre adresse IP brièvement sous forme hachée ; le hachage, la fenêtre temporelle et le compteur sont conservés au maximum 24 heures dans notre base de données dans l'UE (Supabase, région de Francfort), puis supprimés. Le sel qui change chaque jour se trouve uniquement dans l'environnement du serveur, pas dans la base de données.",
  es: 'Para prevenir abusos, tratamos su dirección IP brevemente en forma de hash; el hash, la ventana temporal y el contador se almacenan como máximo 24 horas en nuestra base de datos en la UE (Supabase, región de Fráncfort) y después se eliminan. La sal que cambia cada día se encuentra solo en el entorno del servidor, no en la base de datos.',
  pt: 'Para evitar abusos, tratamos o seu endereço IP brevemente em forma de hash; o hash, a janela temporal e o contador são guardados no máximo 24 horas na nossa base de dados na UE (Supabase, região de Frankfurt) e depois apagados. O sal que muda diariamente encontra-se apenas no ambiente do servidor, não na base de dados.',
  ru: 'Для предотвращения злоупотреблений мы кратко обрабатываем Ваш IP-адрес в виде хеша; хеш, временное окно и счётчик хранятся не более 24 часов в нашей базе данных в ЕС (Supabase, регион Франкфурт) и затем удаляются. Ежедневно меняющаяся соль хранится только в среде сервера, а не в базе данных.',
  ar: 'لمنع إساءة الاستخدام نعالج عنوان IP الخاص بكم لفترة قصيرة في صيغة مشفّرة (هاش)؛ ويتم حفظ الهاش والنافذة الزمنية والعداد لمدة أقصاها 24 ساعة في قاعدة بياناتنا في الاتحاد الأوروبي (Supabase، منطقة فرانكفورت) ثم حذفها. الملح الذي يتغيّر يوميًا يوجد فقط في بيئة الخادم، وليس في قاعدة البيانات.',
  hi: 'दुरुपयोग रोकने के लिए हम आपके आईपी-पते को थोड़े समय के लिए हैश रूप में संसाधित करते हैं; हैश, समय-खिड़की और गणक को हमारे डेटाबेस में यूरोपीय संघ (Supabase, क्षेत्र फ़्रैंकफ़र्ट) में अधिकतम 24 घंटे रखा जाता है और फिर हटा दिया जाता है। प्रतिदिन बदलने वाला सॉल्ट केवल सर्वर-पर्यावरण में रहता है, डेटाबेस में नहीं।',
  bn: 'অপব্যবহার রোধে আমরা আপনার আইপি-ঠিকানা সাময়িকভাবে হ্যাশ আকারে প্রক্রিয়া করি; হ্যাশ, সময়-জানালা এবং গণক আমাদের ডেটাবেসে ইউরোপীয় ইউনিয়নে (Supabase, অঞ্চল ফ্রাঙ্কফুর্ট) সর্বোচ্চ 24 ঘণ্টা রাখা হয় এবং তারপর মুছে ফেলা হয়। প্রতিদিন বদলানো সল্ট শুধু সার্ভার-পরিবেশে থাকে, ডেটাবেসে নয়।',
  ja: '不正利用を防ぐため、お客様のIPアドレスを短時間、ハッシュ化した形で処理します。ハッシュ、時間枠およびカウンターは、EU内の当社データベース（Supabase、フランクフルト地域）に最長24時間保存された後、削除されます。毎日変わるソルトはサーバー環境のみにあり、データベースにはありません。',
  zh: '为防止滥用，我们会在短时间内以哈希形式处理您的IP地址；哈希、时间窗口和计数器最多在欧盟境内的数据库（Supabase，法兰克福区域）中保存24小时，随后删除。每日更换的盐值仅保存在服务器环境中，不保存在数据库中。',
}

export function dseIpSatz(locale: string): string {
  return DSE_IP_SATZ[(locale || 'de') as TuerSprache] || DSE_IP_SATZ_DE
}
