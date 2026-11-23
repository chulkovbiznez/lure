/**
 * EAGLES FINAL — сервер нового сайта eaglesfinal.tilda.ws (старый FREE и командный сервер не трогает).
 * Версия 18 (26.10.2026, ТЗ Андрея «наставник, ID и выплаты»):
 *   ID выдаёт сервер по порядку с 11112, Андрей = 11111 (был 23933, его строка переименовывается сама,
 *   ссылка ?ref=23933 тоже ведёт на 11111). Самодельных ID нет. Без ref наставник 11111. Наставник после
 *   регистрации не меняется; нога меняется 1 раз в течение часа, как раньше. Приглашать могут все (и бесплатные).
 *   Пакеты E1 199 / E6 999 / E12 1 690 по сумме оплаты. Деньги считает раздел «ДЕНЬГИ» (личные, бинар, матчинг,
 *   сжатие неактивных, статусы sub/wait/tax/ok). Новые колонки users: Tax (npd|ip), Inn; payments: Pkg, Months.
 *   Новое: action=money (кабинет), type=tax_set (самозанятый/ИП + ИНН).
 * Версия 17-5 (21.10.2026): простое письмо: только код крупно одной строкой, без кнопок (решение Андрея).
 * Версия 17-4 (21.10.2026): простое письмо (белое, код крупно одной строкой) + кнопка «Войти с этим кодом»: открывает сайт, код вставляется сам.
 * Версия 17-3 (21.10.2026): код в письме одной строкой + кнопка «Скопировать код» (открывает страницу сайта /kod с кнопкой копирования).
 * Версия 17-2 (21.10.2026): красивое письмо с кодом (тёмное, золотой код, логотип), отправитель «EAGLES», без слова FREE.
 * Версия 17-1 (21.10.2026): Андрей (23933) вшит в сервер: при первом же запросе сервер сам вписывает его
 *   в таблицу первым (хозяин, PRO, без наставника, без регистрации). Ничего запускать не нужно.
 *   ID 23933 через сайт больше не зарегистрировать никому. Почта для входа Андрея: OWNER_EMAIL ниже.
 *   Регистрация только с ID пригласителя (по ссылке ?ref=ID или вписать вручную); «наставника EAGLES по умолчанию» нет.
 *   Ссылка Андрея: https://eaglesfinal.tilda.ws/?ref=23933
 * Версия 17 (21.10.2026): новый сайт с нуля, своя таблица «EAGLES FINAL data» (создаётся сама).
 *   Контакты при регистрации: Телеграм, МАКС, WhatsApp, телефон (минимум один). Новые колонки users: Wa, Phone.
 *   bin_ref отдаёт пакет наставника (plan: pro/free) для формы «Твой наставник … · пакет PRO».
 * Версия 16 (18.10.2026): регистрация только с ID пригласителя (ref обязателен, ошибки no_ref, ref_not_found).
 *   Ссылка-приглашение одна (?ref=ID): новый человек встаёт в низ меньшей ноги пригласившего (где меньше людей).
 *   Старые ссылки с &s=L|R работают как раньше. Перенос в другую ногу в течение часа остаётся. Только «Новая версия».
 * Версия 15 (18.10.2026): кнопки «Напиши» на странице просмотра ролика. В Профиле человек указывает свой
 *   Телеграм (@ник или номер) и ссылку на МАКС (max.ru/...), v_open отдаёт их кандидату (tg, max, ofn).
 *   Если Телеграм не указан, а при регистрации был @ник, берётся он. Новые колонки users: Tg, MaxUrl. Только «Новая версия».
 * Версия 14 (18.10.2026): ранг по слабой ноге за месяц (Сокол…Хозяин неба), матчинг по рангу (расчёт),
 *   история дохода по месяцам (лист income). Только «Новая версия».
 * Версия 13 (18.10.2026): перекос в бинар: расчётный личный бонус 10 %, бинар 10 % (уровень E1).
 * Версия 12 (18.10.2026): расчётный личный бонус 15 % вместо 10 % (план «Выше», уровень E1).
 * Версия 11 (18.10.2026): Андрей может заморозить человека (остаётся в бинаре, войти не может, видит
 *   «аккаунт заблокирован»). Пока заморожен, его лично приглашённые считаются у того, кто выше, ему ничего не считается.
 *   Пригласивший может 1 раз в течение часа перенести нового человека в низ левой или правой ноги. Только «Новая версия».
 * Версия 10 (18.10.2026): бинар без выплат. Ссылки-приглашения «влево» и «вправо» (?ref=ID&s=L|R),
 *   новый человек встаёт в самый низ выбранной ноги. Кто уже есть, встаёт в команду, открыв такую ссылку
 *   (контакты остаются). Приглашать: Андрей сразу, остальные PRO скоро, в ноябре. Цифры заработка пока расчётные,
 *   вывод денег закрыт. Для Андрея: поставить любого в бинар и дать PRO (страница Бинар). Только «Новая версия».
 * Версия 9 (17.10.2026): Андрей (ID 23933) всегда PRO. В FREE 1 ролик в библиотеке и ссылки для 30 кандидатов,
 *   в PRO до 15 роликов и ссылки без ограничений. Только «Новая версия», разрешения не нужны.
 * Версия 8 (17.10.2026): для роликов с Яндекс Диска страница кандидата берёт ссылку на файл сама
 *   (ссылку, взятую сервером Google, Яндекс не отдаёт). Разрешение заново давать не нужно, только «Новая версия».
 * Версия 7 (17.10.2026): ролики для кандидатов. Библиотека роликов (ссылки на Яндекс Диск),
 * персональная ссылка на каждого кандидата, привязка к одному телефону, просмотр без перемотки вперёд,
 * сервер считает, докуда досмотрено каждое видео и сколько раз его открывали.
 * ВАЖНО после вставки v7: сервер теперь ходит на Яндекс Диск, Google попросит разрешение.
 * В редакторе сверху выбери функцию razreshit → «Выполнить» → разреши доступ. Потом «Новая версия» развертывания.
 * Версия 6 (13.10.2026): цена полной версии 199 ₽/мес.
 * Версия 5 (12.10.2026): защита таблицы от формул в именах, контакты хранятся кусками (не упрутся
 * в лимит ячейки 50 000 знаков), запас писем для входа, проверка суммы оплаты, проверка фото.
 *
 * Своя таблица "EAGLES free data" (создаётся сама при первом обращении), листы:
 * - users     : Id | FirstName | LastName | Email | CreatedAt | AvatarDataUrl | Plan | DisplayName | Contact | ConsentAt | PaidUntil | Tg | MaxUrl
 *               Plan: free или pro. PaidUntil (мс) — до какого момента оплачено; когда прошло, человек снова free.
 * - pending   : Id | FirstName | LastName | Email | Code | CreatedAt | Used | Contact | ConsentAt   (регистрации до подтверждения)
 * - otp_codes : Id | Code | Email | CreatedAt | Used                        (коды для входа)
 * - sessions  : Token | Id | CreatedAt                                       (ключи входа, 30 дней)
 * - candidates: Id | DataJson | UpdatedAt | Part2 | Part3 ...                 (Мои контакты; длинные данные режутся на куски по 45 000 знаков)
 * - partners  : Id | CandidateId | PartnerName | MarkedAt | Touches           (кого человек сам отметил «Стал партнёром»;
 *               строка остаётся, даже если контакт потом удалён — это история для Профиля)
 * - payments  : ProdamusOrderId | Id | Email | Sum | Status | At | PaidUntil   (оплаты из Prodamus, каждая один раз)
 * - videos    : Id | DataJson | UpdatedAt        (библиотека роликов человека: [{ vid, title, url, d }])
 * - binar     : Id | SponsorId | ParentId | Side | PlacedAt | PlacedBy | Moved
 *               Moved = 1, если пригласивший уже переносил человека (можно 1 раз в течение часа после регистрации).
 *               Замороженные хранятся в свойствах скрипта: FROZEN_<id> = время заморозки.
 *               SponsorId — кто пригласил; ParentId и Side (L/R) — место в бинаре. ParentId пусто = ждёт места.
 *               Андрей (OWNER_ID) — вершина, своей строки у него нет.
 * - income    : Id | DataJson | UpdatedAt   (доход по месяцам, пока расчёт: { "2026-10": [личные, бинар, матчинг, оборот] })
 * - vlinks    : Code | OwnerId | CandidateId | CreatedAt | Device | DataJson | UpdatedAt
 *               одна ссылка на кандидата; Device — телефон, на котором её открыли первым;
 *               DataJson: { cn: имя кандидата, o: открытий, l: последний раз, v: { vid: { s: отправлен, m: досмотрено сек,
 *               d: длина сек, n: раз запускал, r: раз «в начало», e: досмотрел, t: последний сигнал } } }
 *
 * Оплата закончилась, а контактов больше 5 (CONTACTS_LIMIT): открыты 5 самых новых, остальные приходят на страницу
 * только с именем и пометкой locked (без телефонов и заметок). Сервер их хранит целиком и при
 * сохранении не даёт ни изменить, ни удалить. Снова оплатил — всё открыто.
 *
 * Аккаунт создаётся ТОЛЬКО после верного кода с почты. Пока код не введён, ID никто не занимает.
 * ID выдаёт система по порядку с 11112 (Андрей 11111, старый 23933 ведёт на 11111). Почта — одна на аккаунт.
 *
 * doGet ?action=...
 *   reg_request&id=&first=&last=&email=&tg=&max=&wa=&phone=&consent=1[&ref=][&s=L|R] → { ok }  письмо с кодом (без ref → наставник 23933);  ошибки: ref_not_found, bad_id, id_taken, bad_name, bad_email, bad_contact, no_consent, email_taken, too_often, mail_limit, mail_failed
 *   reg_verify&id=&code=                → { ok, id, name, session }; ошибки: bad_code, expired, id_taken, locked
 *   login_request&login=                → { ok, id } письмо с кодом (login = ID или почта); ошибки: not_found, too_often, mail_limit, mail_failed, locked
 *   login_verify&id=&code=              → { ok, id, name, session }; ошибки: bad_code, expired, locked
 *   pin_state | pin_set&pin= | pin_check&pin= | pin_change&old=&pin= | pin_rec_request | pin_rec_verify&code=&pin=  (с ключом входа; ПИН 4 цифры, 5 ошибок → только восстановление, 3 восстановления в сутки)
 *   inn_free&inn= | adm_kassa (только Андрей: Касса)  · 02.11: возврат всегда по неиспользованным дням; один ИНН — один ID
 *   me                                  → { ok, id, name, firstName, lastName, email, plan, avatar, contactsLimit, tg, max, contact }
 *   candidates_load                     → { ok, data }
 *   last_activation                     → { ok, lastActivationAt, activations, activationTimes, glassStart }  (для круга, как в команде)
 *   partners_list                       → { ok, partners:[{ n, name, at, touches }] }
 *   videos_list                         → { ok, list:[{ vid, title, url, d }] }   библиотека роликов
 *   video_check&url=                    → { ok, name, src }  проверить ссылку (Яндекс Диск или прямая .mp4)
 *   vlinks_stats                        → { ok, links:{ cid: { k, b, o, l, v } } }  просмотры по кандидатам
 *   vlink_send&cid=&cname=&vids=        → { ok, code }  отправить ролики (vids через запятую)
 *   vlink_reset&cid=                    → { ok }  снять привязку к телефону
 *   bin_tree&root=                      → бинар: 3 этажа от root (я или кто-то подо мной), ноги, расчёт, ждущие места
 *   ann_list | ann_send&text=  → «Объявление команде»: одно сообщение всей личной линии L1, L2… (PRO, 1 в день)
 *   chat_list | chat_unread | chat_open&with= | chat_send&with=&text= | chat_block&with=&on=1|0  → «Сообщения»: только текст, писать может PRO
 *   map_get                             → { ok, map|null, max (0 = без ограничений), pro }  личная Карта EAGLES
 *   link_preview&u=                     → { ok, img, title }  картинка-превью для ссылки (og:image), до 100 в день
 *   kop_get                             → { ok, dreams, frozen, base, free }  Копилка мечты (base = подтверждённое, free = можно вывести)
 *   bin_card&id=                        → карточка человека подо мной: пакет, срок, кто пригласил, контакты (видит пригласивший и Андрей)
 *   bin_join&ref=[&s=L|R]  (без s — в меньшую ногу)                 → встать в команду по ссылке (кто уже зарегистрирован)
 *   bin_place&id=&s=L|R                 → поставить в свою ногу того, кто ждёт места
 *   bin_fix&id=&s=L|R                   → перенести своего нового (до 1 часа, 1 раз) в низ левой или правой ноги
 *   adm_gift_list | adm_legs&id= | adm_gift&id=&to=&s=L|R   → «Подарок»: личного Андрея (первые GIFT_DAYS дней) в низ ноги любого, он становится его личным
 *   adm_users | adm_place&id=&parent=&s=&sponsor= | adm_unplace&id= | adm_freeze&id=&on=1|0 | adm_pro&id=&mode=month|year|forever|off | adm_pays&id= | adm_refund&id=&order=[&sum=] | adm_kop&id= | adm_kop_open&id=&kid=&why=  (только Андрей)
 *   без ключа входа (страница просмотра у кандидата):
 *   bin_ref&ref=                        → { ok, id, name, plan, avatar }  наставник для формы регистрации
 *   v_open&k=&dev=                      → { ok, owner, ofn, avatar, cname, tg, max, videos:[{ vid, title, src, u, url, kind, m, d }] }; ошибки: not_found, locked
 *                                         kind rutube|vk: url — ссылка на ролик, страница ставит плеер площадки (с 02.11 новые ролики только так)
 *   v_ping&k=&dev=&vid=&pos=&dur=&ev=   → { ok, m }   ev: tick | start | restart
 *
 * doPost (form-data, поле type=..., ключ sess добавляют страницы сами)
 *   update_profile → partnerName (+ tg, max, если переданы: пусто = стереть)          avatar_upload → photoBase64, mimeType
 *   candidates_save → dataJson  (без loadedAt нельзя уменьшить непустой список: not_loaded)
 *                      (free: до 5 контактов, менять только последний, без удаления; pro: без ограничений)
 *   touch → ничего не делает (в бесплатной версии нет командного счёта)
 *   map_save → data (JSON карты, до 150 000 знаков; FREE до 5 островков; у пункта могут быть свои ветки k, вглубь до 8; вид кружка i/cl/f, картинка по ссылке im; срок dt)  → { ok, at }; ошибки: bad_json, too_big, limit
 *   kop_save → op=new (t, pic|img, goal, amt, until=ГГГГ-ММ-ДД, auto=1) | add (id, amt) | edit (id, t, pic|img) | take (id, после даты)  → { ok, dreams, frozen, free }
 *   videos_save → dataJson (список роликов)    vlink_send, vlink_reset — то же, что в doGet
 *
 * ОПЛАТА PRODAMUS (включается, когда заполнены PAY_FORM_URL и PAY_KEY ниже):
 *   В Prodamus в настройках платёжной страницы, поле «Webhook URL» (уведомления об оплате):
 *   <ссылка /exec>?pay_key=<PAY_KEY>
 *   Prodamus сообщает об оплате → сервер находит человека по номеру заказа (его EAGLES ID) или по почте
 *   и сам продлевает полную версию на месяц от даты окончания (или от сегодня, если уже закончилась).
 *
 * ПОСЛЕ ДЕПЛОЯ КАК ВЕБ-ПРИЛОЖЕНИЯ (Выполнять от: Я, Доступ: Все) скопируйте ссылку /exec
 * и вставьте её в страницу Glavnaya-free-v1.html в строку FREE_SCRIPT_URL.
 */

var LOGIN_PAGE_URL = 'https://app.eaglesteam.ru/';
var CONTACTS_LIMIT = 5;            // бесплатная версия: 5 контактов, менять можно только последний добавленный (02.11)
var SESSION_DAYS = 30;
var CODE_MINUTES = 10;             // код действует 10 минут
var RESEND_SECONDS = 60;           // новый код на ту же почту не чаще раза в минуту
var OTP_MAX_FAILS = 5;             // 5 неверных кодов подряд → закрыто на час
var OTP_LOCK_MS = 60 * 60 * 1000;

var MAIL_RESERVE = 20;             // столько писем в день держим только для входа (регистрации их не тратят)
var REG_PER_HOUR = 200, REG_BUSY = /reg_busy/.source, REG_MAIL = /mail_limit/.source;             // не больше стольких писем регистрации в час на всех (защита от рассылки)
var PART = 45000, MAX_PARTS = 40;  // хранение контактов кусками

// ---------- оплата (заполнить, когда будет Prodamus) ----------
var PAY_FORM_URL = '';             // ссылка на платёжную страницу Prodamus, например 'https://eagles.payform.ru'. Пусто = кнопка пишет «скоро»
var PAY_KEY = '';                  // любой длинный набор латинских букв и цифр (≥ 20 знаков), он же в Webhook URL после pay_key=
var PRICE_RUB = 499;
var PAY_PRODUCT = 'EAGLES · полная версия · 1 месяц';
var PAY_SUCCESS_URL = 'https://app.eaglesteam.ru/profile.html';

// ---------- ролики ----------
var VIDEOS_MAX = 15;               // роликов в библиотеке у одного человека (PRO)
var FREE_VIDEOS = 1;               // FREE: 1 ролик в библиотеке
var FREE_LINKS = 5;                // FREE: ссылки на ролики для 5 кандидатов (02.11)
var OWNER_ID = '11111';            // Андрей: всегда PRO, первый ID в системе
var OLD_OWNER_ID = '23933';        // прежний ID Андрея: ссылки ?ref=23933 ведут на 11111
var FIRST_ID = 11112;              // новые ID по порядку с этого номера
var OWNER_FIRST = 'Андрей', OWNER_LAST = 'Чулков';
var OWNER_EMAIL = 'chulkovbiznez@gmail.com'; // на неё приходят коды входа Андрея
var OWNER_PAID_UNTIL = 4102444800000; // 01.01.2100, для надписи в Профиле
var PING_CAP_SEC = 20;             // сколько секунд между сигналами страницы засчитываем максимум
var OPEN_GAP_MS = 60 * 1000;       // повторное открытие раньше минуты (обновил страницу) не считаем

// ---------- бинар ----------
// СТАРТ ПРИГЛАШЕНИЙ — одна настройка на весь сайт. 0 = пока закрыто, на страницах «скоро».
// Когда Андрей назовёт дату: например Date.UTC(2026, 10, 15, 21, 0, 0) = 16 ноября 2026, 00:00 по Москве (месяц с нуля: 10 = ноябрь).
var REF_OPEN_AT = 0;
var BIN_INVITE_PCT = 10;           // расчёт: % с оплаты каждого лично приглашённого (E1; E6 20, E12 25 — после пакетов)
var BIN_BINARY_PCT = 10;           // расчёт: % от оборота слабой ноги (E1; E6 15, E12 20 — после пакетов)
// ранги: оборот слабой ноги за месяц, ₽
var RANKS = [['Сокол', 50000], ['Ястреб', 150000], ['Беркут', 500000], ['Кондор', 1500000], ['Золотой орёл', 5000000], ['Хозяин неба', 15000000]];
// матчинг по рангу: % с бинара лично приглашённых по поколениям (1-е, 2-е, ...)
var MATCH_PCT = [[10], [20, 10], [20, 10, 5], [20, 10, 5, 3, 3], [20, 10, 5, 3, 3, 2, 2], [20, 10, 5, 3, 3, 2, 2, 1, 1, 1]];
var WITHDRAW_OPEN = false;         // вывод денег включим после 22 ноября
var FIX_MS = 60 * 60 * 1000;       // столько времени после регистрации можно 1 раз перенести нового человека
var SUPPORT_URL = 'https://max.ru/u/f9LHodD0cOIec-v91ujcZ-dap9pM51MzN00AwcIMTy-x29hys8Mcg8n8HJ4'; // техподдержка = МАКС Андрея

// ---------- таблица ----------
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('EAGLES_FINAL_SHEET_ID');
  if (ssId) return SpreadsheetApp.openById(ssId);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    ssId = props.getProperty('EAGLES_FINAL_SHEET_ID');
    if (ssId) return SpreadsheetApp.openById(ssId);
    var ss = SpreadsheetApp.create('EAGLES FINAL data');
    props.setProperty('EAGLES_FINAL_SHEET_ID', ss.getId());
    return ss;
  } finally {
    lock.releaseLock();
  }
}

function getSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange('A:A').setNumberFormat('@'); // ID всегда текстом
    return sheet;
  } finally {
    lock.releaseLock();
  }
}
var USER_HEADERS = ['Id','FirstName','LastName','Email','CreatedAt','AvatarDataUrl','Plan','DisplayName','Contact','ConsentAt','PaidUntil','Tg','MaxUrl','Wa','Phone','Tax','Inn'];
function usersSheet_() {
  var sh = getSheet_('users', USER_HEADERS);
  // таблица могла быть создана прошлой версией с меньшим числом колонок — дописываем заголовки
  if (sh.getRange(1, USER_HEADERS.length).getValue() !== USER_HEADERS[USER_HEADERS.length - 1]) {
    for (var h = 0; h < USER_HEADERS.length; h++) sh.getRange(1, h + 1).setValue(USER_HEADERS[h]);
  }
  return sh;
}
function pendingSheet_()  { return getSheet_('pending',   ['Id','FirstName','LastName','Email','Code','CreatedAt','Used','Contact','ConsentAt','Ref','Side','Tg','MaxUrl','Wa','Phone']); }
function otpCodesSheet_() { return getSheet_('otp_codes', ['Id','Code','Email','CreatedAt','Used']); }
function sessionsSheet_() { return getSheet_('sessions',  ['Token','Id','CreatedAt']); }
function candidatesSheet_(){ return getSheet_('candidates',['Id','DataJson','UpdatedAt']); }
function partnersSheet_()  { return getSheet_('partners',  ['Id','CandidateId','PartnerName','MarkedAt','Touches']); }
function paymentsSheet_()  { return getSheet_('payments',  ['ProdamusOrderId','Id','Email','Sum','Status','At','PaidUntil','Pkg','Months','Kind','RefundAt','RefundSum']); }
function videosSheet_()    { return getSheet_('videos',    ['Id','DataJson','UpdatedAt']); }
function incomeSheet_()   { return getSheet_('income',    ['Id','DataJson','UpdatedAt']); }
function binarSheet_() {
  var sh = getSheet_('binar', ['Id','SponsorId','ParentId','Side','PlacedAt','PlacedBy','Moved']);
  if (sh.getRange(1, 7).getValue() !== 'Moved') sh.getRange(1, 7).setValue('Moved');
  return sh;
}
// Заморозка: в свойствах скрипта (быстро проверяется при каждом запросе)
function frozenAt_(id) { return Number(PropertiesService.getScriptProperties().getProperty('FROZEN_' + normId_(id)) || 0); }
function frozenMap_() {
  var all = PropertiesService.getScriptProperties().getProperties(), out = {};
  for (var k in all) if (k.indexOf('FROZEN_') === 0) out[k.slice(7)] = Number(all[k]) || 1;
  return out;
}
function frozenOut_() { return jsonOut_({ ok: false, error: 'frozen', support: SUPPORT_URL }); }
function vlinksSheet_()    { return getSheet_('vlinks',    ['Code','OwnerId','CandidateId','CreatedAt','Device','DataJson','UpdatedAt']); }

// ---------- утилиты ----------
function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function normEmail_(v) { return String(v || '').trim().toLowerCase(); }
function normId_(v) { return String(v || '').trim().toLowerCase(); }
function validId_(id) { return /^[a-z0-9_]{4,16}$/.test(id); }
// ID из ссылки или поля: 23933 = Андрей 11111
function normRef_(v) { var id = normId_(v); return id === OLD_OWNER_ID ? OWNER_ID : id; }
function validEmail_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function cleanName_(v) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 40); }
// Таблица превращает текст, начинающийся с = + - @, в формулу. Чужая формула в таблице Андрея может
// утащить данные наружу, поэтому такой текст сохраняем как обычный (апостроф впереди таблица не показывает).
function safe_(v) { v = String(v == null ? '' : v); return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }
// МАКС или Телеграм: ник (@name) или телефон
function cleanContact_(v) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 64); }
function validContact_(v) { return /^@?[A-Za-z0-9_]{4,32}$/.test(v) || /^\+?[0-9 ()\-]{10,20}$/.test(v); }

// Код из письма: 6 цифр из криптостойкого источника.
function makeOtp_() {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    Utilities.getUuid() + Utilities.getUuid() + Date.now());
  var n = 0;
  for (var i = 0; i < 6; i++) n = (n * 256 + (bytes[i] & 0xff)) % 900000;
  return String(100000 + n);
}

function findUserBy_(colIndex1based, value) {
  var data = usersSheet_().getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var cell = colIndex1based === 4 ? normEmail_(data[i][3]) : normId_(data[i][colIndex1based - 1]);
    if (cell === value) {
      return { row: i + 1, id: normId_(data[i][0]), firstName: data[i][1], lastName: data[i][2],
               email: normEmail_(data[i][3]), avatar: data[i][5] || '', plan: data[i][6] || 'free',
               displayName: data[i][7] || '', contact: data[i][8] || '', paidUntil: Number(data[i][10]) || 0,
               tg: String(data[i][11] || ''), maxUrl: String(data[i][12] || ''),
               wa: String(data[i][13] || ''), phone: String(data[i][14] || ''),
               tax: String(data[i][15] || ''), inn: String(data[i][16] || '') };
    }
  }
  return null;
}
function findUserById_(id) { return findUserBy_(1, normId_(id)); }
function findUserByEmail_(email) { return findUserBy_(4, normEmail_(email)); }
// pro, пока оплата действует; закончилась — снова free (без участия Андрея)
function planOf_(u) { return (u && (u.id === OWNER_ID || u.paidUntil > Date.now())) ? 'pro' : 'free'; }
function planById_(id) { return normId_(id) === OWNER_ID ? 'pro' : planOf_(findUserById_(id)); }
// Телеграм: @ник, ник, t.me/ник или номер телефона → 'ник' или '+79991234567'; не подходит → null
function cleanTg_(v) {
  v = String(v || '').trim().replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
  if (!v) return '';
  if (/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(v)) return v;
  var d = v.replace(/[\s()\-]/g, '');
  if (/^\+?[0-9]{10,15}$/.test(d)) { if (d[0] !== '+') d = (d.length === 11 && d[0] === '8' ? '+7' + d.slice(1) : '+' + d); return d; }
  return null;
}
// МАКС: только ссылка на профиль max.ru/... (по нику или номеру МАКС не открывается)
function cleanMax_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  v = v.replace(/^http:/i, 'https:');
  return /^https:\/\/(web\.)?max\.ru\/[A-Za-z0-9_\-\/]{3,200}$/.test(v) ? v : null;
}
// Телефон / WhatsApp: 10–15 цифр → '+79991234567' (8 в начале → +7); пусто → ''; не подходит → null
function cleanPhone_(v) {
  var d = String(v || '').replace(/[\s()\-]/g, '');
  if (!d) return '';
  if (!/^\+?[0-9]{10,15}$/.test(d)) return null;
  if (d[0] !== '+') d = d.length === 11 && d[0] === '8' ? '+7' + d.slice(1) : (d.length === 10 ? '+7' + d : '+' + d);
  return d;
}
function tgUrl_(u) {
  var t = u.tg || '';
  if (!t) { var c = cleanTg_(u.contact); if (c && c[0] !== '+') t = c; } // ник из регистрации
  return t ? 'https://t.me/' + t : '';
}
function fullName_(u) { return String(u.displayName || '').trim() || (String(u.firstName || '') + ' ' + String(u.lastName || '')).trim(); }

// ---------- ключ входа ----------
function makeSession_(id) {
  var t = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  sessionsSheet_().appendRow([t, String(id), new Date().toISOString()]);
  CacheService.getScriptCache().put('S_' + t, String(id), 21600);
  return t;
}
function sessionId_(e) {
  var sid = sessionIdRaw_(e);
  if (sid && frozenAt_(sid)) return '';   // заморожен: страница выйдет, при входе увидит «заблокирован»
  return sid;
}
function sessionIdRaw_(e) {
  var t = String((e && e.parameter && e.parameter.sess) || '').trim();
  if (t.length < 40) return '';
  var cache = CacheService.getScriptCache();
  var hit = cache.get('S_' + t);
  if (hit) return hit;
  var data = sessionsSheet_().getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === t) {
      var age = Date.now() - new Date(data[i][2]).getTime();
      if (!(age >= 0 && age < SESSION_DAYS * 86400000)) return '';
      var sid = String(data[i][1]);
      cache.put('S_' + t, sid, 21600);
      return sid;
    }
  }
  return '';
}
function noAuth_() { return jsonOut_({ ok: false, error: 'auth' }); }

// ---------- защита от подбора кода ----------
function otpFailKey_(id) { return 'OTP_FAIL_' + String(id); }
function getOtpFail_(id) {
  var raw = PropertiesService.getScriptProperties().getProperty(otpFailKey_(id));
  if (!raw) return { n: 0, until: 0 };
  try { var o = JSON.parse(raw); return { n: Number(o.n) || 0, until: Number(o.until) || 0 }; }
  catch (err) { return { n: 0, until: 0 }; }
}
function otpLockedMinutes_(id) {
  var left = getOtpFail_(id).until - Date.now();
  return left > 0 ? Math.ceil(left / 60000) : 0;
}
function lockedOut_(minutes) { return jsonOut_({ ok: false, error: 'locked', retryAfterMin: minutes }); }
function registerOtpFail_(id) {
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var f = getOtpFail_(id);
    if (f.until && f.until <= Date.now()) f = { n: 0, until: 0 };
    f.n += 1;
    if (f.n >= OTP_MAX_FAILS) {
      f.until = Date.now() + OTP_LOCK_MS; f.n = 0;
      props.setProperty(otpFailKey_(id), JSON.stringify(f));
      return Math.ceil(OTP_LOCK_MS / 60000);
    }
    props.setProperty(otpFailKey_(id), JSON.stringify(f));
    return 0;
  } finally {
    lock.releaseLock();
  }
}
function resetOtpFail_(id) { PropertiesService.getScriptProperties().deleteProperty(otpFailKey_(id)); }

// ---------- ПИН-код входа (02.11) ----------
// Хранится только отпечаток (SHA-256 с солью) в свойстве PIN_<ID>. Один ПИН на аккаунт: меняешь на одном телефоне — меняется на всех.
var PIN_MAX_FAILS = 5;       // 5 неверных подряд → только восстановление кодом на почту
var PIN_REC_PER_DAY = 3;     // восстановлений ПИН в сутки (МСК)
function pinKey_(id) { return 'PIN_' + normId_(id); }
function pinGet_(id) { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(pinKey_(id)) || 'null'); } catch (e) { return null; } }
function pinPut_(id, o) { PropertiesService.getScriptProperties().setProperty(pinKey_(id), JSON.stringify(o)); }
function pinHash_(id, pin, salt) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'eg-pin:' + normId_(id) + ':' + pin + ':' + salt)); }
function pinSave_(id, pin) { var salt = Utilities.getUuid().replace(/-/g, ''); pinPut_(id, { h: pinHash_(id, pin, salt), s: salt, at: Date.now(), f: 0 }); }
function pinValid_(v) { return /^\d{4}$/.test(String(v == null ? '' : v)); }
function pinDay_() { return new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10); }
function pinRec_(id) {
  var o = null; try { o = JSON.parse(PropertiesService.getScriptProperties().getProperty('PINREC_' + normId_(id)) || 'null'); } catch (e) {}
  if (!o || o.d !== pinDay_()) o = { d: pinDay_(), n: 0, c: '', at: 0, t: 0 };
  return o;
}
function pinRecPut_(id, o) { PropertiesService.getScriptProperties().setProperty('PINREC_' + normId_(id), JSON.stringify(o)); }
// неверный ПИН: считаем подряд; на 5-м — закрыто до восстановления
function pinTry_(id, P, pin) {
  if (P.f >= PIN_MAX_FAILS) return { ok: false, error: 'pin_blocked' };
  if (pinHash_(id, pin, P.s) === P.h) { if (P.f) { P.f = 0; pinPut_(id, P); } return { ok: true }; }
  P.f = (P.f || 0) + 1; pinPut_(id, P);
  if (P.f >= PIN_MAX_FAILS) return { ok: false, error: 'pin_blocked' };
  return { ok: false, error: 'bad_pin', left: PIN_MAX_FAILS - P.f };
}
function pinAction_(action, me, p) {
  var P = pinGet_(me), R = pinRec_(me);
  if (action === 'pin_state') return jsonOut_({ ok: true, has: !!P, blocked: !!(P && P.f >= PIN_MAX_FAILS), recLeft: Math.max(0, PIN_REC_PER_DAY - R.n) });
  if (action === 'pin_set') {
    if (P) return jsonOut_({ ok: false, error: 'pin_exists' });
    if (!pinValid_(p.pin)) return jsonOut_({ ok: false, error: 'bad_pin_format' });
    pinSave_(me, String(p.pin)); return jsonOut_({ ok: true });
  }
  if (action === 'pin_check') {
    if (!P) return jsonOut_({ ok: false, error: 'no_pin' });
    if (!pinValid_(p.pin)) return jsonOut_({ ok: false, error: 'bad_pin_format' });
    return jsonOut_(pinTry_(me, P, String(p.pin)));
  }
  if (action === 'pin_change') {
    if (!P) return jsonOut_({ ok: false, error: 'no_pin' });
    if (!pinValid_(p.old) || !pinValid_(p.pin)) return jsonOut_({ ok: false, error: 'bad_pin_format' });
    var r = pinTry_(me, P, String(p.old));
    if (!r.ok) return jsonOut_(r);
    pinSave_(me, String(p.pin)); return jsonOut_({ ok: true });
  }
  if (action === 'pin_rec_request') {
    if (R.n >= PIN_REC_PER_DAY) return jsonOut_({ ok: false, error: 'rec_limit' });
    var u = findUserById_(me);
    if (!u || !u.email) return jsonOut_({ ok: false, error: 'no_email' });
    if (tooOften_(u.email)) return jsonOut_({ ok: false, error: 'too_often' });
    if (MailApp.getRemainingDailyQuota() < 1) return jsonOut_({ ok: false, error: 'mail_limit' });
    var code = makeOtp_();
    var err = sendCode_(u.email, code, false, u.id);
    if (err) return jsonOut_({ ok: false, error: err });
    R.n += 1; R.c = code; R.at = Date.now(); R.t = 0; pinRecPut_(me, R);
    return jsonOut_({ ok: true, emailHint: u.email.replace(/^(.{2}).*(@.*)$/, '$1•••$2'), recLeft: Math.max(0, PIN_REC_PER_DAY - R.n) });
  }
  if (action === 'pin_rec_verify') {
    if (!R.c) return jsonOut_({ ok: false, error: 'expired' });
    if ((Date.now() - R.at) / 60000 > CODE_MINUTES) return jsonOut_({ ok: false, error: 'expired' });
    if (String(p.code || '').trim() !== R.c) {
      R.t = (R.t || 0) + 1; if (R.t >= 3) R.c = ''; pinRecPut_(me, R);
      return jsonOut_({ ok: false, error: R.c ? 'bad_code' : 'expired', left: Math.max(0, 3 - R.t) });
    }
    if (!pinValid_(p.pin)) return jsonOut_({ ok: false, error: 'bad_pin_format' });
    R.c = ''; pinRecPut_(me, R);
    pinSave_(me, String(p.pin)); return jsonOut_({ ok: true });
  }
  return jsonOut_({ ok: false, error: 'bad_action' });
}

// ---------- Касса Андрея (02.11): сколько пришло, сколько должен людям, когда освобождается ----------
// Деньги-факт лежат в Продамусе и на счёте ИП. Здесь — учёт: обязательства перед людьми по тем же правилам, что кабинет человека.
var AUSN_LIMIT = 60000000;
function mskDay_(t) { return new Date(t + 3 * 3600000).toISOString().slice(0, 10); }
function kassa_() {
  var now = Date.now(), X = moneyCalc_(now), D = X.D, R = X.R, A = R.A;
  var today = mskDay_(now), month = today.slice(0, 7), year = today.slice(0, 4);
  var inc = { day: 0, month: 0, year: 0, all: 0, refDay: 0, refMonth: 0, refYear: 0, refAll: 0, n: 0 }, days = {};
  var pd = paymentsSheet_().getDataRange().getValues();
  for (var i = 1; i < pd.length; i++) {
    var st = String(pd[i][4] || '');
    if (st !== 'success' && st !== 'refund') continue;
    var sum = num_(pd[i][3]), at = new Date(pd[i][5]).getTime() || 0, d = mskDay_(at);
    inc.all += sum; inc.n++;
    if (d === today) inc.day += sum; if (d.slice(0, 7) === month) inc.month += sum; if (d.slice(0, 4) === year) inc.year += sum;
    if (d >= mskDay_(now - 29 * 86400000)) days[d] = (days[d] || 0) + sum;
    if (st === 'refund') {
      var rs = num_(pd[i][11]), rd = mskDay_(new Date(pd[i][10]).getTime() || at);
      inc.refAll += rs; if (rd === today) inc.refDay += rs; if (rd.slice(0, 7) === month) inc.refMonth += rs; if (rd.slice(0, 4) === year) inc.refYear += rs;
    }
  }
  var tot = { sub: 0, wait: 0, tax: 0, ok: 0, week: 0, next: 0 }, people = {}, unlock = {};
  R.E.forEach(function (e) {
    if (!e.to || e.to === OWNER_ID || !e.sum) return;
    var u = D.U[e.to] || {}, act = activeAt_(D, A, e.to, now), tax = u.tax || '';
    var till = (e.hold || e.at) + HOLD_MS;
    var st = e.next ? 'next' : e.week ? 'week' : e.grey && !act ? 'sub' : e.sum > 0 && now < till ? 'wait' : !tax ? 'tax' : 'ok';
    tot[st] += e.sum;
    var P = people[e.to] || (people[e.to] = { id: e.to, name: u.name || e.to, tax: tax, sub: 0, wait: 0, tax0: 0, ok: 0, week: 0, next: 0, sum: 0, items: [] });
    P[st === 'tax' ? 'tax0' : st] += e.sum; P.sum += e.sum;
    if (P.items.length < 40) P.items.push({ k: e.k, sum: Math.round(e.sum * 100) / 100, at: e.at, st: st, till: till, from: e.from ? (D.U[e.from] ? D.U[e.from].name : e.from) : '' });
    if (st === 'wait') { var ud = mskDay_(till); unlock[ud] = (unlock[ud] || 0) + e.sum; }
  });
  var r2 = function (v) { return Math.round(v * 100) / 100; };
  for (var k in tot) tot[k] = r2(tot[k]);
  var list = Object.keys(people).map(function (id) { var P = people[id]; ['sub', 'wait', 'tax0', 'ok', 'week', 'next', 'sum'].forEach(function (f) { P[f] = r2(P[f]); }); P.items.sort(function (a, b) { return b.at - a.at; }); return P; });
  list.sort(function (a, b) { return b.sum - a.sum; });
  var payNext = 0, payPeople = 0;   // к выплате в ближайшую субботу: у кого есть статус и набралось от минимума
  list.forEach(function (P) { if (P.tax && P.ok >= MIN_WITHDRAW) { payNext += P.ok; payPeople++; } });
  var owe = tot.wait + tot.tax + tot.ok + tot.week + tot.next;   // точно должен (серое — только если человек оплатит подписку)
  var net = inc.all - inc.refAll;
  var nU = 0, nPro = 0;
  for (var uid in D.U) { if (uid === OWNER_ID) continue; nU++; if (activeAt_(D, A, uid, now)) nPro++; }
  var ul = Object.keys(unlock).sort().slice(0, 14).map(function (d) { return { d: d, sum: r2(unlock[d]) }; });
  var dl = Object.keys(days).sort().map(function (d) { return { d: d, sum: r2(days[d]) }; });
  return jsonOut_({ ok: true, at: now, income: { day: r2(inc.day - inc.refDay), month: r2(inc.month - inc.refMonth), year: r2(inc.year - inc.refYear), all: r2(net), refunds: r2(inc.refAll), payments: inc.n },
    paidOut: 0, totals: tot, owe: r2(owe), maybe: tot.sub, free: r2(net - owe), payNext: r2(payNext), payPeople: payPeople, withdrawOpen: WITHDRAW_OPEN, minWithdraw: MIN_WITHDRAW,
    ausn: { limit: AUSN_LIMIT, year: r2(inc.year - inc.refYear) }, users: nU, pro: nPro, unlock: ul, days: dl, people: list.slice(0, 300) });
}

// ИНН физлица / ИП: 12 цифр с контрольными числами (как в налоговой)
function innOk_(s) {
  s = String(s || ''); if (!/^\d{12}$/.test(s)) return false;
  var c = function (w) { var x = 0; for (var i = 0; i < w.length; i++) x += w[i] * Number(s[i]); return x % 11 % 10; };
  return c([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(s[10]) && c([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(s[11]);
}
// Один ИНН — один ID: ищем, не привязан ли ИНН к другому аккаунту
function innOwner_(inn, me) {
  var d = usersSheet_().getDataRange().getValues();
  for (var i = 1; i < d.length; i++) { var v = String(d[i][16] || '').replace(/\D/g, ''); if (v && v === inn && normId_(d[i][0]) !== me) return normId_(d[i][0]); }
  return '';
}

// ---------- письма ----------
// Не чаще раза в минуту на одну почту; при исчерпанном дневном лимите Google — понятная ошибка.
function tooOften_(email) {
  var cache = CacheService.getScriptCache();
  if (cache.get('M_' + email)) return true;
  cache.put('M_' + email, '1', RESEND_SECONDS);
  return false;
}
function regHourFull_() {
  var cache = CacheService.getScriptCache();
  var k = 'REGH_' + Math.floor(Date.now() / 3600000);
  var n = Number(cache.get(k) || 0);
  if (n >= REG_PER_HOUR) return true;
  cache.put(k, String(n + 1), 3700);
  return false;
}
// Письмо с кодом: тёмное, в цветах EAGLES, логотип с Тильды (картинки base64 почта не показывает)
var MAIL_LOGO = 'https://static.tildacdn.com/tild3366-6134-4730-a162-323533303338/75445.png';
function sendCode_(email, code, isReg, id) {
  if (MailApp.getRemainingDailyQuota() < 1) return 'mail_limit';
  var title = isReg ? 'Подтверди регистрацию в EAGLES' : 'Вход в EAGLES';
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#222222;font-size:15px;line-height:22px;max-width:460px;">' +
    '<p style="margin:0 0 12px;">' + title + '</p>' +
    '<p style="margin:0 0 6px;">Твой код:</p>' +
    '<p style="margin:0 0 18px;font-size:30px;line-height:36px;font-weight:bold;letter-spacing:2px;white-space:nowrap;">' + code + '</p>' +
    '<p style="margin:0;font-size:13px;color:#777777;">Код действует ' + CODE_MINUTES + ' минут. Если это был не ты, просто не отвечай на письмо.</p>' +
    '</div>';
  try {
    MailApp.sendEmail({
      to: email,
      name: 'EAGLES',
      subject: isReg ? 'EAGLES: код подтверждения ' + code : 'EAGLES: код для входа ' + code,
      body: title + '. Твой код: ' + code + '. Код действует ' + CODE_MINUTES + ' минут.',
      htmlBody: html
    });
  } catch (mailErr) {
    return 'mail_failed';
  }
  return '';
}

// ---------- запросы ----------
function doGet(e) {
  ensureOwner_();
  var p = e.parameter;
  var action = p.action;

  // ===== регистрация: шаг 1 — проверить данные и выслать код =====
  if (action === 'reg_request') {
    var first = cleanName_(p.first);
    var last = cleanName_(p.last);
    var email = normEmail_(p.email);
    // контакты: Телеграм, МАКС, WhatsApp, телефон — минимум один (старое поле contact тоже понимаем)
    var cTg = cleanTg_(p.tg), cMax = cleanMax_(p.max), cWa = cleanPhone_(p.wa), cPh = cleanPhone_(p.phone);
    if (cTg === null || cMax === null || cWa === null || cPh === null) return jsonOut_({ ok: false, error: 'bad_contact' });
    var contact = cTg ? (cTg[0] === '+' ? cTg : '@' + cTg) : (cPh || cWa || cleanContact_(p.contact));
    if (!first || !last) return jsonOut_({ ok: false, error: 'bad_name' });
    if (!validEmail_(email)) return jsonOut_({ ok: false, error: 'bad_email' });
    if (!cMax && !validContact_(contact)) return jsonOut_({ ok: false, error: 'bad_contact' });
    if (String(p.consent) !== '1') return jsonOut_({ ok: false, error: 'no_consent' });
    if (findUserByEmail_(email)) return jsonOut_({ ok: false, error: 'email_taken' });
    // наставник: из ссылки или поля; пусто — Андрей 11111. ID нового человека выдаст сервер после кода.
    var ref = normRef_(p.ref) || OWNER_ID;
    if (!validId_(ref) || !findUserById_(ref) || frozenAt_(ref)) return jsonOut_({ ok: false, error: 'ref_not_found' });
    var id = 'r' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);   // временный ключ заявки, не ID
    var lockMin = otpLockedMinutes_('reg:' + email);
    if (lockMin) return lockedOut_(lockMin);
    if (tooOften_(email)) return jsonOut_({ ok: false, error: 'too_often' });
    if (MailApp.getRemainingDailyQuota() <= MAIL_RESERVE) return jsonOut_({ ok: false, error: REG_MAIL }); if (regHourFull_()) return jsonOut_({ ok: false, retryAfterMin: 60 - new Date().getMinutes(), error: REG_BUSY, was: 'mail_limit' });

    var code = makeOtp_();
    var err = sendCode_(email, code, true, id);
    if (err) return jsonOut_({ ok: false, error: err });
    pendingSheet_().appendRow([id, safe_(first), safe_(last), safe_(email), code, new Date().toISOString(), 'no', safe_(contact), new Date().toISOString(), ref, p.s === 'R' || p.s === 'L' ? p.s : 'A', safe_(cTg), safe_(cMax), safe_(cWa), safe_(cPh)]);
    return jsonOut_({ ok: true, key: id, id: id });
  }

  // ===== регистрация: шаг 2 — код верный → создаём аккаунт и сразу входим =====
  if (action === 'reg_verify') {
    var rId = normId_(p.key || p.id);   // ключ заявки из reg_request
    var rCode = String(p.code || '').trim();
    if (!rId || !rCode) return jsonOut_({ ok: false, error: 'missing_fields' });

    var ps = pendingSheet_();
    var pd = ps.getDataRange().getValues();
    var row = -1;
    for (var i = pd.length - 1; i >= 1; i--) {
      if (normId_(pd[i][0]) === rId && String(pd[i][4]) === rCode && String(pd[i][6]) === 'no') { row = i; break; }
    }
    var rMail = '';
    for (var i2 = pd.length - 1; i2 >= 1; i2--) if (normId_(pd[i2][0]) === rId) { rMail = normEmail_(pd[i2][3]); break; }
    var rLock = otpLockedMinutes_('reg:' + rMail);
    if (rLock) return lockedOut_(rLock);
    if (row === -1) {
      var jl = registerOtpFail_('reg:' + rMail);
      if (jl) return lockedOut_(jl);
      return jsonOut_({ ok: false, error: 'bad_code' });
    }
    if ((Date.now() - new Date(pd[row][5]).getTime()) / 60000 > CODE_MINUTES) {
      return jsonOut_({ ok: false, error: 'expired' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    var tmpKey = rId;
    try {
      // пока человек вводил код, почту мог занять кто-то другой
      if (findUserByEmail_(pd[row][3])) return jsonOut_({ ok: false, error: 'email_taken' });
      rId = nextId_();
      usersSheet_().appendRow([rId, safe_(pd[row][1]), safe_(pd[row][2]), safe_(normEmail_(pd[row][3])), new Date().toISOString(), '', 'free', '', safe_(pd[row][7] || ''), pd[row][8] || '', '',
                               safe_(pd[row][11] || ''), safe_(pd[row][12] || ''), safe_(pd[row][13] || ''), safe_(pd[row][14] || '')]);
      ps.getRange(row + 1, 7).setValue('yes');
    } finally {
      lock.releaseLock();
    }
    resetOtpFail_('reg:' + rMail);
    var rRef = normRef_(pd[row][9]) || OWNER_ID, placedNow = false;
    if (rRef) { try { placedNow = !!binJoin_(rId, rRef, String(pd[row][10] || 'A')).placed; } catch (errB) {} }
    notify_('🦅 Новый партнёр: ID ' + rId + ' ' + String(pd[row][1] || '').slice(0, 40) + ', пригласил ID ' + (rRef || '—') + (placedNow ? ', встал в бинар' : ''));
    return jsonOut_({ ok: true, id: rId, name: (pd[row][1] + ' ' + pd[row][2]).trim(), session: makeSession_(rId), binar: placedNow });
  }

  // ===== вход: шаг 1 — ID или почта → код на почту аккаунта =====
  if (action === 'login_request') {
    var login = String(p.login || '').trim();
    if (!login) return jsonOut_({ ok: false, error: 'not_found' });
    var u = login.indexOf('@') !== -1 ? findUserByEmail_(login) : findUserById_(normRef_(login));
    if (!u) return jsonOut_({ ok: false, error: 'not_found' });
    if (frozenAt_(u.id)) return frozenOut_();
    var lMin = otpLockedMinutes_(u.id);
    if (lMin) return lockedOut_(lMin);
    if (tooOften_(u.email)) return jsonOut_({ ok: false, error: 'too_often' });

    var code2 = makeOtp_();
    var err2 = sendCode_(u.email, code2, false, u.id);
    if (err2) return jsonOut_({ ok: false, error: err2 });
    otpCodesSheet_().appendRow([u.id, code2, u.email, new Date().toISOString(), 'no']);
    return jsonOut_({ ok: true, id: u.id, emailHint: u.email.replace(/^(.{2}).*(@.*)$/, '$1•••$2') });
  }

  // ===== вход: шаг 2 — проверка кода =====
  if (action === 'login_verify') {
    var vId = normRef_(p.id);
    var vCode = String(p.code || '').trim();
    if (!vId || !vCode) return jsonOut_({ ok: false, error: 'missing_fields' });
    if (frozenAt_(vId)) return frozenOut_();
    var vLock = otpLockedMinutes_(vId);
    if (vLock) return lockedOut_(vLock);

    var os = otpCodesSheet_();
    var od = os.getDataRange().getValues();
    var oRow = -1;
    for (var j = od.length - 1; j >= 1; j--) {
      if (normId_(od[j][0]) === vId && String(od[j][1]) === vCode && String(od[j][4]) === 'no') { oRow = j; break; }
    }
    if (oRow === -1) {
      var jl2 = registerOtpFail_(vId);
      if (jl2) return lockedOut_(jl2);
      return jsonOut_({ ok: false, error: 'bad_code' });
    }
    if ((Date.now() - new Date(od[oRow][3]).getTime()) / 60000 > CODE_MINUTES) {
      return jsonOut_({ ok: false, error: 'expired' });
    }
    os.getRange(oRow + 1, 5).setValue('yes');
    resetOtpFail_(vId);
    var vu = findUserById_(vId);
    return jsonOut_({ ok: true, id: vId, name: vu ? fullName_(vu) : '', session: makeSession_(vId) });
  }

  // ===== страница просмотра у кандидата (без входа, по персональной ссылке) =====
  if (action === 'start_info') return startInfo_(e, p); if (action === 'start_go') return startGo_(e, p); if (action === 'v_open') return vOpen_(p); if (String(action || '').indexOf('kc_') === 0) return kontent_(action, e, p); if (String(action || '').indexOf('kp_') === 0) return kanalPosts3_(action, e, p);
  if (action === 'v_ping') return vPing_(p);
  if (action === 'bin_ref') {
    var ru = findUserById_(normRef_(p.ref) || OWNER_ID);
    if (ru && frozenAt_(ru.id)) ru = null;
    return jsonOut_(ru ? { ok: true, id: ru.id, name: fullName_(ru), plan: planOf_(ru), avatar: ru.id === OWNER_ID ? ru.avatar : '' } : { ok: false, error: 'not_found' });
  }

  // ===== дальше всё только с ключом входа =====
  var me = sessionId_(e);
  if (!me) return noAuth_();

  // ===== ПИН-код входа (как в Альфе, 02.11): код на почту один раз, дальше 4 цифры =====
  if (action === 'pin_state' || action === 'pin_set' || action === 'pin_check' || action === 'pin_change' || action === 'pin_rec_request' || action === 'pin_rec_verify') return pinAction_(action, me, p);
  if (action === 'inn_free') { var fi = String(p.inn || '').replace(/\D/g, ''); return jsonOut_({ ok: true, valid: innOk_(fi), free: !innOwner_(fi, me) }); }

  if (action === 'me') {
    var mu = findUserById_(me);
    if (!mu) return noAuth_();
    return jsonOut_({ ok: true, id: mu.id, name: fullName_(mu), firstName: mu.firstName, lastName: mu.lastName,
                      email: mu.email, plan: planOf_(mu), paidUntil: mu.id === OWNER_ID ? OWNER_PAID_UNTIL : mu.paidUntil, avatar: mu.avatar, contactsLimit: CONTACTS_LIMIT,
                      tg: mu.tg, max: mu.maxUrl, wa: mu.wa, phone: mu.phone, contact: mu.contact,
                      price: PRICE_RUB, payUrl: payUrl_(mu), payUrls: { E1: payUrl_(mu, 'E1'), E6: payUrl_(mu, 'E6'), E12: payUrl_(mu, 'E12') },
                      pkgs: PKGS, openAt: REF_OPEN_AT, tax: mu.tax, inn: mu.inn ? mu.inn.replace(/^(\d{2})\d+(\d{2})$/, '$1••••$2') : '' });
  }

  if (action === 'candidates_load') {
    var cRow = findRowById_(candidatesSheet_(), me);
    if (cRow === -1) return jsonOut_({ ok: true, at: Date.now(), data: null });
    var raw = readData_(candidatesSheet_(), cRow);
    if (planOf_(findUserById_(me)) === 'pro') return jsonOut_({ ok: true, at: Date.now(), data: raw, locked: 0 });
    var st = null;
    try { st = JSON.parse(raw || '{}'); } catch (errL) { return jsonOut_({ ok: true, at: Date.now(), data: raw, locked: 0 }); }
    var lk = lockedIds_(st), nLocked = 0;
    for (var lid in lk) {
      var oc = st.candidates[lid] || {};
      st.candidates[lid] = { name: String(oc.name || ''), status: oc.status || 'new', locked: true };
      nLocked++;
    }
    return jsonOut_({ ok: true, at: Date.now(), data: JSON.stringify(st), locked: nLocked });
  }

  // круг в Профиле: те же поля, что у командного сервера, только «активации» = отмеченные самим партнёры
  if (action === 'last_activation') {
    var times = partnerRows_(me).map(function (r) { return r.at; }).filter(function (t) { return t > 0; });
    times.sort(function (a, b) { return a - b; });
    var lastAt = times.length ? times[times.length - 1] : 0;
    return jsonOut_({ ok: true, lastActivationAt: lastAt || 1, activations: times.length, activationTimes: times, glassStart: 0 });
  }

  if (action === 'partners_list') {
    var rows = partnerRows_(me);
    rows.sort(function (a, b) { return a.at - b.at; });
    return jsonOut_({ ok: true, partners: rows.map(function (r, k) {
      return { n: k + 1, name: r.name, at: r.at, touches: r.touches };
    }) });
  }

  if (action === 'videos_list') {
    var lpro = planById_(me) === 'pro';
    return jsonOut_({ ok: true, list: loadVideos_(me), plan: lpro ? 'pro' : 'free', limit: lpro ? VIDEOS_MAX : FREE_VIDEOS, linksLimit: lpro ? 0 : FREE_LINKS });
  }
  if (action === 'vlink_send') return vlinkSend_(me, p);
  if (action === 'vlink_reset') return vlinkReset_(me, p);

  if (action === 'video_check') {
    var chk = checkVideoUrl_(p.url);
    return jsonOut_(chk);
  }

  if (action === 'vlinks_stats') {
    var vs = vlinksSheet_().getDataRange().getValues(), links = {};
    for (var vi = 1; vi < vs.length; vi++) {
      if (normId_(vs[vi][1]) !== me) continue;
      var vdat = parseJson_(vs[vi][5]);
      var vv = {};
      for (var vk in (vdat.v || {})) {
        var x = vdat.v[vk];
        vv[vk] = { s: x.s || 0, m: Math.round(x.m || 0), d: Math.round(x.d || 0), n: x.n || 0, r: x.r || 0, e: x.e ? 1 : 0, l: x.l || 0 };
      }
      links[String(vs[vi][2])] = { k: String(vs[vi][0]), b: vs[vi][4] ? 1 : 0, o: vdat.o || 0, l: vdat.l || 0, v: vv };
    }
    var spro = planById_(me) === 'pro';
    return jsonOut_({ ok: true, links: links, plan: spro ? 'pro' : 'free', linksLimit: spro ? 0 : FREE_LINKS, videosLimit: spro ? VIDEOS_MAX : FREE_VIDEOS });
  }

  if (action === 'bin_tree') return binTree_(me, p);
  if (action === 'bin_card') return binCard_(me, p);
  if (action === 'chat_list') return chatList_(me);
  if (action === 'chat_unread') return chatUnread_(me);
  if (action === 'chat_open') return chatOpen_(me, p); if (action === 'eye_check' || String(action || '').indexOf('fr_') === 0) return friends_(action, me, p); if (String(action || '').indexOf('ec_') === 0) return eyeChat_(action, me, p);
  if (action === 'map_get') return mapGet_(me);
  if (action === 'kop_get') return kopGet_(me);
  if (action === 'link_preview') return linkPreview_(me, p);
  if (action === 'chat_send') return chatSend_(me, p);
  if (action === 'chat_block') return chatBlock_(me, p);
  if (action === 'ann_list') return annList_(me);
  if (action === 'ann_send') return annSend_(me, p);
  if (action === 'money') return jsonOut_(Object.assign({ ok: true, owner: me === OWNER_ID }, moneyFor_(me, Date.now())));
  if (action === 'bin_join') {
    var jr = binJoin_(me, normRef_(p.ref), p.s);
    return jsonOut_(jr);
  }
  if (action === 'bin_place') return binPlaceMine_(me, p);
  if (action === 'bin_fix') return binFix_(me, p);
  if (String(action || '').indexOf('adm_') === 0) {
    if (me !== OWNER_ID) return jsonOut_({ ok: false, error: 'not_owner' });
    return admin_(action, p);
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}

// ---------- контакты и партнёры ----------
// Контакты: первый кусок в колонке DataJson, следующие — в колонках после UpdatedAt
function readData_(sheet, row) {
  var v = sheet.getRange(row, 2, 1, 2 + MAX_PARTS).getValues()[0];
  var out = String(v[0] || '');
  for (var k = 2; k < v.length; k++) { if (v[k] === '' || v[k] == null) break; out += String(v[k]); }
  return out;
}
function writeData_(sheet, row, id, json) {
  var parts = [];
  for (var i = 0; i < json.length; i += PART) parts.push("'" + json.slice(i, i + PART));
  if (!parts.length) parts.push("'{}");
  if (parts.length > MAX_PARTS + 1) return false;
  var now = new Date().toISOString();
  if (row === -1) { sheet.appendRow([id, parts[0], now].concat(parts.slice(1))); return true; }
  sheet.getRange(row, 2).setValue(parts[0]);
  sheet.getRange(row, 3).setValue(now);
  var old = sheet.getRange(row, 4, 1, MAX_PARTS).getValues()[0];
  for (var k = 0; k < MAX_PARTS; k++) {
    var val = k + 1 < parts.length ? parts[k + 1] : '';
    if (val !== '' || (old[k] !== '' && old[k] != null)) sheet.getRange(row, 4 + k).setValue(val);
  }
  return true;
}

function findRowById_(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) if (normId_(data[i][0]) === normId_(id)) return i + 1;
  return -1;
}
function partnerRows_(id) {
  var data = partnersSheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < data.length; i++) {
    if (normId_(data[i][0]) !== normId_(id)) continue;
    out.push({ cid: String(data[i][1]), name: String(data[i][2] || ''), at: Number(data[i][3]) || 0, touches: Number(data[i][4]) || 0 });
  }
  return out;
}
// время добавления контакта зашито в его номер: c_<время>_...
function candTimes_(store) {
  var out = [];
  Object.keys((store && store.candidates) || {}).forEach(function (cid) {
    var m = /^c_(\d+)_/.exec(cid);
    if (m) out.push(Number(m[1]));
  });
  return out;
}
// Бесплатная версия: открыты CONTACTS_LIMIT самых новых контактов (по времени в номере), остальные под замком.
function lockedIds_(store) {
  var c = (store && store.candidates) || {};
  var ids = Object.keys(c);
  if (ids.length <= CONTACTS_LIMIT) return {};
  ids.sort(function (a, b) { return candTime_(b) - candTime_(a); });
  var out = {};
  ids.slice(CONTACTS_LIMIT).forEach(function (id) { out[id] = 1; });
  return out;
}
function candTime_(cid) { var m = /^c_(\d+)_/.exec(cid); return m ? Number(m[1]) : 0; }
// FREE: менять можно только последний добавленный контакт (самый новый из открытых)
function freeEditId_(cands, locked) {
  var best = '', bt = -1;
  Object.keys(cands || {}).forEach(function (id) { if (!(locked && locked[id]) && candTime_(id) > bt) { bt = candTime_(id); best = id; } });
  return best;
}
function freeEditIdOf_(me) {
  var r = findRowById_(candidatesSheet_(), me);
  if (r === -1) return '';
  var st = {}; try { st = JSON.parse(readData_(candidatesSheet_(), r) || '{}') || {}; } catch (e) { return ''; }
  return freeEditId_(st.candidates, lockedIds_(st));
}

// Новые «Стал партнёром» → строка в partners. Касания = сколько контактов добавлено
// между прошлым партнёром и этим. Повторная отметка того же контакта второй строки не даёт.
function syncPartners_(id, store) {
  var known = {}, prevAt = 0;
  partnerRows_(id).forEach(function (r) { known[r.cid] = 1; if (r.at > prevAt) prevAt = r.at; });
  var fresh = [];
  Object.keys((store && store.candidates) || {}).forEach(function (cid) {
    var c = store.candidates[cid];
    if (!c || c.status !== 'became_partner' || known[cid]) return;
    fresh.push({ cid: cid, name: String(c.name || '').slice(0, 60), at: Number(c.partnerAt) || Date.now() });
  });
  if (!fresh.length) return;
  fresh.sort(function (a, b) { return a.at - b.at; });
  var ts = candTimes_(store);
  var sheet = partnersSheet_();
  fresh.forEach(function (f) {
    var from = prevAt, n = 0;
    ts.forEach(function (t) { if (t > from && t <= f.at) n++; });
    sheet.appendRow([id, safe_(f.cid), safe_(f.name), f.at, n]);
    prevAt = Math.max(prevAt, f.at);
  });
}

// ---------- оплата Prodamus ----------
function payUrl_(u, pkg) {
  if (!PAY_FORM_URL || !PAY_KEY || !u) return '';
  var P = PKGS[pkg] || PRODUCTS[pkg] || PKGS.E1, nm = PRODUCTS[pkg] ? PRODUCTS[pkg].name : pkg && PKGS[pkg] ? 'EAGLES · пакет ' + pkg + ' · ' + P.months + ' мес.' : PAY_PRODUCT;
  var q = [
    'order_id=' + encodeURIComponent(u.id + '-' + (PRODUCTS[pkg] ? pkg + '-' : '') + Date.now()),
    'customer_email=' + encodeURIComponent(u.email),
    'products[0][name]=' + encodeURIComponent(nm),
    'products[0][price]=' + P.price,
    'products[0][quantity]=1',
    'urlSuccess=' + encodeURIComponent(PAY_SUCCESS_URL),
    'do=pay'
  ];
  return PAY_FORM_URL.replace(/\/+$/, '') + '/?' + q.join('&');
}
function addMonth_(ms) { var d = new Date(ms); d.setMonth(d.getMonth() + 1); return d.getTime(); }
// Prodamus присылает: order_id (номер в Prodamus), order_num (наш номер «id-время»), customer_email, sum, payment_status
// Оповещение Андрею в MAX (бот «EAGLES Сторож»). Отправляет index.js после записи в базу; ошибки не мешают запросу.
function notify_(t) { try { if (typeof Notify !== 'undefined') Notify.send(String(t)); } catch (eN) {} }

function handlePayment_(p) {
  if (String(p.payment_status || '') !== 'success') return jsonOut_({ ok: true, skipped: 'status' });
  if (!(parseFloat(String(p.sum || '0').replace(',', '.')) >= PRICE_RUB)) return jsonOut_({ ok: true, skipped: 'sum' });
  var pid = String(p.order_id || '');
  var num = String(p.order_num || '');
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ps = paymentsSheet_();
    if (pid) {
      var pd = ps.getDataRange().getValues();
      for (var i = 1; i < pd.length; i++) if (String(pd[i][0]) === pid) return jsonOut_({ ok: true, duplicate: true });
    }
    var u = num ? findUserById_(num.split('-')[0]) : null;
    if (!u && p.customer_email) u = findUserByEmail_(p.customer_email);
    if (!u) { ps.appendRow([safe_(pid), '', safe_(normEmail_(p.customer_email)), safe_(p.sum || ''), 'user_not_found', new Date().toISOString(), '']); notify_('⚠️ Оплата ' + (p.sum || '?') + ' ₽ пришла, но человек не найден (заказ ' + (num || pid) + '). Разобраться вручную.'); return jsonOut_({ ok: true, error: 'user_not_found' }); }
    // продукт: номер заказа «ID-код-время», подписку не продлевает, но это продажа (личные, бинар, мэтчинг)
    var pcode = num.split('-')[1] || '';
    if (PRODUCTS[pcode]) {
      if (parseFloat(String(p.sum || '0').replace(',', '.')) < PRODUCTS[pcode].price) { ps.appendRow([safe_(pid), u.id, safe_(u.email), safe_(p.sum || ''), 'underpaid', new Date().toISOString(), '', pcode, 0, '']); notify_('⚠️ Недоплата: ID ' + u.id + ' заплатил ' + (p.sum || '?') + ' ₽ за ' + pcode + '. Разобраться вручную.'); return jsonOut_({ ok: true, error: 'underpaid' }); }
      ps.appendRow([safe_(pid), u.id, safe_(u.email), safe_(p.sum || ''), 'success', new Date().toISOString(), '', pcode, 0, 'prod']);
      notify_('💰 Оплата: ID ' + u.id + ' купил ' + pcode + ' — ' + (p.sum || '?') + ' ₽');
      return jsonOut_({ ok: true, product: pcode });
    }
    // пакет по сумме: от 1 690 ₽ — E12, от 999 ₽ — E6, иначе E1
    var pkg = pkgBySum_(parseFloat(String(p.sum || '0').replace(',', '.'))), months = PKGS[pkg].months;
    var until = addMonths_(Math.max(Date.now(), u.paidUntil || 0), months);
    var us = usersSheet_();
    us.getRange(u.row, 7).setValue('pro');
    us.getRange(u.row, 11).setValue(until);
    ps.appendRow([safe_(pid), u.id, safe_(u.email), safe_(p.sum || ''), 'success', new Date().toISOString(), new Date(until).toISOString(), pkg, months, 'sub']);
    notify_('💰 Оплата: ID ' + u.id + ' — пакет ' + pkg + ' на ' + months + ' мес., ' + (p.sum || '?') + ' ₽');
    return jsonOut_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  ensureOwner_();
  if (PAY_KEY && e && e.parameter && String(e.parameter.pay_key || '') === PAY_KEY) return handlePayment_(e.parameter);
  var me = sessionId_(e);
  if (!me) return noAuth_();
  var p = e.parameter;
  var type = p.type;

  if (type === 'update_profile') {
    var nm = cleanName_(p.partnerName);
    if (!nm) return jsonOut_({ ok: false, error: 'missing_fields' });
    var u = findUserById_(me);
    if (!u) return noAuth_();
    var us = usersSheet_();
    if (!us.getRange(1, 8).getValue()) us.getRange(1, 8).setValue('DisplayName');
    us.getRange(u.row, 8).setValue(safe_(nm));
    if (p.tg !== undefined) { var tg = cleanTg_(p.tg); if (tg !== null) us.getRange(u.row, 12).setValue(safe_(tg)); }
    if (p.max !== undefined) { var mx = cleanMax_(p.max); if (mx !== null) us.getRange(u.row, 13).setValue(safe_(mx)); }
    if (p.wa !== undefined) { var wa = cleanPhone_(p.wa); if (wa !== null) us.getRange(u.row, 14).setValue(safe_(wa)); }
    if (p.phone !== undefined) { var ph = cleanPhone_(p.phone); if (ph !== null) us.getRange(u.row, 15).setValue(safe_(ph)); }
    return jsonOut_({ ok: true });
  }

  if (type === 'map_save') return mapSave_(me, p);
  if (type === 'kop_save') return kopSave_(me, p);
  if (type === 'img_put') return imgPut_(me, p); if (type === 'ec_voice') return ecVoice_(me, p); if (String(type || '').indexOf('kc_') === 0) return kontent_(type, e, p);
  if (type === 'img_del') return imgDel_(me, p);

  if (type === 'avatar_upload') {
    var b64 = String(p.photoBase64 || '');
    var mime = String(p.mimeType || 'image/jpeg');
    if (!/^image\/(jpeg|png|webp)$/.test(mime)) return jsonOut_({ ok: false, error: 'bad_photo' });
    if (!b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_photo' });
    if (b64.length > 48000) return jsonOut_({ ok: false, error: 'photo_big' }); // ячейка таблицы держит 50 000 знаков
    var au = findUserById_(me);
    if (!au) return noAuth_();
    usersSheet_().getRange(au.row, 6).setValue('data:' + mime + ';base64,' + b64);
    return jsonOut_({ ok: true });
  }

  if (type === 'candidates_save') {
    var json = String(p.dataJson || '{}');
    var store = null;
    try { store = JSON.parse(json); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
    var cu = findUserById_(me);
    var isPro = planOf_(cu) === 'pro';
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var cs = candidatesSheet_();
      var row = findRowById_(cs, me);
      // защита: страница, которая не получила контакты с сервера (нет loadedAt), не может затереть непустой список пустым
      if (isPro && row !== -1 && !(Number(p.loadedAt) > 0)) {
        var nNew = (store && store.candidates && typeof store.candidates === 'object') ? Object.keys(store.candidates).length : 0;
        var oldG = null; try { oldG = JSON.parse(readData_(cs, row) || '{}'); } catch (eG) {}
        var nOld = (oldG && oldG.candidates) ? Object.keys(oldG.candidates).length : 0;
        if (nOld > 0 && nNew < nOld) return jsonOut_({ ok: false, error: 'not_loaded' });
      }
      // вкладка «Контактов» могла открыться раньше, чем сервер получил свежие данные: свежие с сервера не теряем
      var loadedAt = Number(p.loadedAt) || 0;
      var known = {}; try { (JSON.parse(p.known || '[]') || []).forEach(function (x) { known[String(x)] = 1; }); } catch (eK) {}
      if (loadedAt && row !== -1 && store && typeof store === 'object') {
        var oldM = null; try { oldM = JSON.parse(readData_(cs, row) || '{}'); } catch (eM) {}
        if (oldM && oldM.candidates) {
          if (!store.candidates || typeof store.candidates !== 'object') store.candidates = {};
          if (!store.logs || typeof store.logs !== 'object') store.logs = {};
          var back = false;
          for (var mid in oldM.candidates) {
            var oc2 = oldM.candidates[mid], nc2 = store.candidates[mid], ou = Number(oc2 && oc2.updatedAt) || 0;
            if (!nc2 && known[mid]) continue;   // вкладка этого человека видела и удалила — не возвращаем
            if (ou > loadedAt && (!nc2 || ou > (Number(nc2.updatedAt) || 0))) { store.candidates[mid] = oc2; back = true; }
          }
          for (var dk in (oldM.logs || {})) {
            var ol = oldM.logs[dk], nl = store.logs[dk];
            if (!ol || !ol.candidateIds) continue;
            if (!nl) { var fresh = ol.candidateIds.some(function (x) { return (Number((oldM.candidates[x] || {}).updatedAt) || 0) > loadedAt; }); if (fresh) { store.logs[dk] = ol; back = true; } continue; }
            if (!nl.candidateIds) nl.candidateIds = [];
            ol.candidateIds.forEach(function (x) { if (nl.candidateIds.indexOf(x) < 0 && store.candidates[x] && (Number(store.candidates[x].updatedAt) || 0) > loadedAt) { nl.candidateIds.push(x); nl.touches = nl.candidateIds.length; back = true; } });
          }
          if (back) json = JSON.stringify(store);
        }
      }
      if (!isPro) {
        if (!store || typeof store !== 'object') store = {};
        if (!store.candidates || typeof store.candidates !== 'object') store.candidates = {};
        var newIds = store.candidates;
        var oldStore = { candidates: {} };
        if (row !== -1) {
          try { oldStore = JSON.parse(readData_(cs, row) || '{}') || {}; } catch (err2) { oldStore = {}; }
          if (!oldStore.candidates) oldStore.candidates = {};
        }
        var oldIds = oldStore.candidates;
        // бесплатная версия: удалять нельзя
        for (var oid in oldIds) if (!newIds[oid]) return jsonOut_({ ok: false, error: 'no_delete' });
        // закрытые контакты (оплата закончилась) остаются как были на сервере, правки с телефона не принимаем
        var lockedNow = lockedIds_(oldStore), restored = false;
        for (var lid2 in lockedNow) { newIds[lid2] = oldIds[lid2]; restored = true; }
        // менять можно только последний добавленный: остальные открытые остаются как были на сервере
        var editId = freeEditId_(newIds, lockedNow);
        for (var rid in oldIds) {
          if (lockedNow[rid] || rid === editId || !newIds[rid]) continue;
          if (JSON.stringify(newIds[rid]) !== JSON.stringify(oldIds[rid])) { newIds[rid] = oldIds[rid]; restored = true; }
        }
        if (restored) json = JSON.stringify(store);
        // и новых сверх CONTACTS_LIMIT не добавить (старые сверх лимита, оставшиеся после pro, не трогаем)
        var added = 0;
        for (var nid in newIds) if (!oldIds[nid]) added++;
        if (added > 0 && Object.keys(newIds).length > CONTACTS_LIMIT) return jsonOut_({ ok: false, error: 'limit', limit: CONTACTS_LIMIT });
      }
      if (!writeData_(cs, row, me, json)) return jsonOut_({ ok: false, error: 'too_big' });
      syncPartners_(me, store);
    } finally {
      lock.releaseLock();
    }
    return jsonOut_({ ok: true });
  }

  if (type === 'touch') return jsonOut_({ ok: true });

  // самозанятый или ИП: без этого деньги копятся, вывод закрыт
  if (type === 'tax_set') {
    var tx = String(p.tax || ''), inn = String(p.inn || '').replace(/\D/g, '');
    if (tx && tx !== 'npd' && tx !== 'ip') return jsonOut_({ ok: false, error: 'bad_tax' });
    if (tx && !innOk_(inn)) return jsonOut_({ ok: false, error: 'bad_inn' });
    if (tx && innOwner_(inn, me)) return jsonOut_({ ok: false, error: 'inn_taken' });
    var tu = findUserById_(me);
    if (!tu) return noAuth_();
    var tsh = usersSheet_();
    tsh.getRange(tu.row, 16).setValue(tx);
    tsh.getRange(tu.row, 17).setValue(tx ? "'" + inn : '');
    return jsonOut_({ ok: true });
  }

  if (type === 'videos_save') {
    var list = parseJson_(p.dataJson);
    if (!Array.isArray(list)) return jsonOut_({ ok: false, error: 'bad_json' });
    if (list.length > VIDEOS_MAX) return jsonOut_({ ok: false, error: 'limit', limit: VIDEOS_MAX });
    var oldUrls = {}; loadVideos_(me).forEach(function (o) { oldUrls[String(o.url || '')] = 1; });
    var clean = [];
    for (var li = 0; li < list.length; li++) {
      var it = list[li] || {};
      var url = String(it.url || '').trim();
      if (!/^v[a-z0-9]{6,14}$/.test(String(it.vid || ''))) return jsonOut_({ ok: false, error: 'bad_video' });
      var uk = videoUrlKind_(url);
      if (!uk) return jsonOut_({ ok: false, error: 'bad_link' });
      if (uk !== 'rutube' && uk !== 'vk' && !oldUrls[url]) return jsonOut_({ ok: false, error: 'old_kind' });
      clean.push({ vid: String(it.vid), title: cleanTitle_(it.title) || 'Ролик', url: url, d: Math.max(0, Math.min(36000, Math.round(Number(it.d) || 0))) });
    }
    // FREE: 1 ролик. Кто был в PRO и добавил больше, может их переставлять и удалять, но не добавлять новые.
    if (planById_(me) !== 'pro' && clean.length > FREE_VIDEOS && clean.length > loadVideos_(me).length) {
      return jsonOut_({ ok: false, error: 'free_limit', limit: FREE_VIDEOS });
    }
    var lockV = LockService.getScriptLock();
    lockV.waitLock(15000);
    try {
      var vsh = videosSheet_();
      var vrow = findRowById_(vsh, me);
      var vjson = "'" + JSON.stringify(clean);
      if (vrow === -1) vsh.appendRow([me, vjson, new Date().toISOString()]);
      else { vsh.getRange(vrow, 2).setValue(vjson); vsh.getRange(vrow, 3).setValue(new Date().toISOString()); }
    } finally {
      lockV.releaseLock();
    }
    return jsonOut_({ ok: true });
  }

  if (type === 'vlink_send') return vlinkSend_(me, p);
  if (type === 'vlink_reset') return vlinkReset_(me, p);

  return jsonOut_({ ok: false, error: 'unknown_type' });
}

// ---------- хозяин ----------
// Андрей 23933 вшит: если его строки в таблице ещё нет, сервер сам вписывает её при первом запросе.
function ensureOwner_() {
  var pr = PropertiesService.getScriptProperties();
  if (pr.getProperty('OWNER_OK18') === '1') return;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (!findUserById_(OWNER_ID) && findUserById_(OLD_OWNER_ID)) renameOwner_();
    if (!findUserById_(OWNER_ID)) {
      var now = new Date().toISOString();
      usersSheet_().appendRow([OWNER_ID, OWNER_FIRST, OWNER_LAST, normEmail_(OWNER_EMAIL), now, '', 'pro', '', '', now, '', '', '', '', '']);
    }
    pr.setProperty('OWNER_OK18', '1');
  } finally {
    lock.releaseLock();
  }
}
// v18: Андрей 23933 → 11111 во всех листах (почта, вход, контакты, ролики и бинар остаются его)
function renameOwner_() {
  var plan = [['users', [1]], ['sessions', [2]], ['candidates', [1]], ['partners', [1]], ['videos', [1]], ['income', [1]],
              ['vlinks', [2]], ['binar', [1, 2, 3]], ['payments', [2]], ['otp_codes', [1]], ['pending', [10]]];
  var ss = getSpreadsheet_();
  plan.forEach(function (x) {
    var sh = ss.getSheetByName(x[0]);
    if (!sh) return;
    var d = sh.getDataRange().getValues();
    for (var i = 1; i < d.length; i++) x[1].forEach(function (c) {
      if (normId_(d[i][c - 1]) === OLD_OWNER_ID) sh.getRange(i + 1, c).setValue(OWNER_ID);
    });
  });
}
// следующий свободный ID: больше всех числовых, не меньше 11112
function nextId_() {
  var d = usersSheet_().getDataRange().getValues(), mx = FIRST_ID - 1;
  for (var i = 1; i < d.length; i++) {
    var v = String(d[i][0] || '').trim();
    if (/^\d{5,9}$/.test(v) && v !== OLD_OWNER_ID && Number(v) > mx) mx = Number(v);
  }
  var pr = PropertiesService.getScriptProperties(), last = Number(pr.getProperty('LAST_ID') || 0);
  var n = Math.max(mx, last) + 1;
  pr.setProperty('LAST_ID', String(n));
  return String(n);
}
// Запасной способ (обычно не нужен): в редакторе выбрать sozdatHozyaina → Выполнить. Если строка уже есть, обновит почту и имя.
function sozdatHozyaina() {
  var sh = usersSheet_(), u = findUserById_(OWNER_ID), email = normEmail_(OWNER_EMAIL);
  if (u) {
    var data = sh.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (normId_(data[i][0]) === OWNER_ID) {
        sh.getRange(i + 1, 2, 1, 3).setValues([[OWNER_FIRST, OWNER_LAST, email]]);
        sh.getRange(i + 1, 7).setValue('pro');
        Logger.log('Хозяин 11111 уже был, данные обновлены: ' + email);
        return;
      }
    }
  }
  var now = new Date().toISOString();
  sh.appendRow([OWNER_ID, OWNER_FIRST, OWNER_LAST, email, now, '', 'pro', '', '', now, '', '', '', '', '']);
  Logger.log('Готово: хозяин 11111 вписан первым, почта ' + email);
}

// ---------- ролики ----------
// Запустить один раз в редакторе (выбрать razreshit → Выполнить), чтобы Google разрешил серверу ходить на Яндекс Диск.
function razreshit() {
  UrlFetchApp.fetch('https://cloud-api.yandex.net/v1/disk/public/resources?public_key=x', { muteHttpExceptions: true });
}

// Отправить ролики кандидату: одна ссылка на кандидата, новые ролики добавляются в неё же.
function vlinkSend_(me, p) {
  var cid = String(p.cid || '');
  if (!/^c_\d+_[a-z0-9]+$/.test(cid)) return jsonOut_({ ok: false, error: 'bad_contact' });
  var pro = planById_(me) === 'pro';
  if (!pro) { var fe = freeEditIdOf_(me); if (fe && cid !== fe && candTime_(cid) <= candTime_(fe)) return jsonOut_({ ok: false, error: 'ro_contact' }); }
  var lib = loadVideos_(me), libIds = {};
  if (!pro) lib = lib.slice(0, FREE_VIDEOS); // FREE: отправить можно только первый ролик библиотеки
  lib.forEach(function (v) { libIds[v.vid] = 1; });
  var vids = String(p.vids || '').split(',').filter(function (v) { return libIds[v]; });
  if (!vids.length) return jsonOut_({ ok: false, error: 'no_videos' });
  var lockS = LockService.getScriptLock();
  lockS.waitLock(15000);
  try {
    var ls = vlinksSheet_();
    var rows = ls.getDataRange().getValues(), at = -1;
    for (var ri = 1; ri < rows.length; ri++) {
      if (normId_(rows[ri][1]) === me && String(rows[ri][2]) === cid) { at = ri; break; }
    }
    if (at === -1 && !pro) {
      var used = 0;
      for (var rk = 1; rk < rows.length; rk++) if (normId_(rows[rk][1]) === me) used++;
      if (used >= FREE_LINKS) return jsonOut_({ ok: false, error: 'links_limit', limit: FREE_LINKS });
    }
    var now = Date.now();
    var data = at === -1 ? { o: 0, l: 0, v: {} } : parseJson_(rows[at][5]);
    if (!data.v) data.v = {};
    data.cn = cleanName_(p.cname).split(' ')[0].slice(0, 30);
    vids.forEach(function (v) { if (!data.v[v]) data.v[v] = { s: now, m: 0, d: 0, n: 0, r: 0 }; });
    if (at === -1) {
      var code = newCode_(rows);
      ls.appendRow([code, me, cid, new Date().toISOString(), '', "'" + JSON.stringify(data), new Date().toISOString()]);
      return jsonOut_({ ok: true, code: code });
    }
    ls.getRange(at + 1, 6).setValue("'" + JSON.stringify(data));
    ls.getRange(at + 1, 7).setValue(new Date().toISOString());
    return jsonOut_({ ok: true, code: String(rows[at][0]) });
  } finally {
    lockS.releaseLock();
  }
}

function vlinkReset_(me, p) {
  var rcid = String(p.cid || '');
  var lr = vlinksSheet_().getDataRange().getValues();
  for (var rj = 1; rj < lr.length; rj++) {
    if (normId_(lr[rj][1]) === me && String(lr[rj][2]) === rcid) {
      vlinksSheet_().getRange(rj + 1, 5).setValue('');
      return jsonOut_({ ok: true });
    }
  }
  return jsonOut_({ ok: false, error: 'not_found' });
}

function parseJson_(s) {
  try { var o = JSON.parse(String(s || '').replace(/^'/, '') || '{}'); return o || {}; } catch (err) { return {}; }
}
function cleanTitle_(v) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

function loadVideos_(id) {
  var sh = videosSheet_();
  var row = findRowById_(sh, id);
  if (row === -1) return [];
  var list = parseJson_(sh.getRange(row, 2).getValue());
  return Array.isArray(list) ? list : [];
}

// rutube / vk — открытый ролик по ссылке (с 02.11 только они для новых роликов).
// yandex — публичная ссылка Яндекс Диска, direct — прямая ссылка на файл .mp4/.mov/.webm (старые ролики продолжают играть)
function videoEmbed_(url) {
  url = String(url || '').trim();
  if (url.length > 500 || !/^https:\/\//i.test(url)) return null;
  var host = url.replace(/^https:\/\//i, '').split(/[\/?#]/)[0].toLowerCase(), m;
  if (/(^|\.)rutube\.ru$/.test(host)) {
    if (/\/private\//i.test(url) || /[?&]p=/.test(url)) return { kind: 'rutube', bad: 'private' };
    m = url.match(/rutube\.ru\/(?:video|shorts|play\/embed)\/([0-9a-f]{32})/i);
    return m ? { kind: 'rutube', id: m[1].toLowerCase() } : null;
  }
  if (/(^|\.)(vk\.com|vk\.ru|vkvideo\.ru)$/.test(host)) {
    m = url.match(/[?&]oid=(-?\d{1,12})&(?:amp;)?id=(\d{1,12})/i) || url.match(/(?:video|clip)(-?\d{1,12})_(\d{1,12})/i);
    return m ? { kind: 'vk', oid: m[1], id: m[2] } : null;
  }
  return null;
}
function videoUrlKind_(url) {
  url = String(url || '').trim();
  if (url.length > 500 || !/^https:\/\//i.test(url)) return '';
  var em = videoEmbed_(url);
  if (em) return em.bad ? '' : em.kind;
  if (/^https:\/\/(disk\.yandex\.(ru|com|kz|by|ua)|yadi\.sk|disk\.360\.yandex\.ru)\//i.test(url)) return 'yandex';
  if (/\.(mp4|m4v|mov|webm)(\?|#|$)/i.test(url)) return 'direct';
  return '';
}

// Ссылка, по которой браузер сам может проиграть файл. У Яндекса она временная, поэтому берём свежую и держим 20 минут.
function videoSrc_(url) {
  var kind = videoUrlKind_(url);
  if (kind === 'direct') return url;
  if (kind !== 'yandex') return '';
  var cache = CacheService.getScriptCache();
  var key = 'YD_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url));
  var hit = cache.get(key);
  if (hit) return hit;
  var r = UrlFetchApp.fetch('https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=' + encodeURIComponent(url),
    { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return '';
  var href = String(parseJson_(r.getContentText()).href || '');
  if (href) cache.put(key, href, 1200);
  return href;
}

function checkVideoUrl_(url) {
  url = String(url || '').trim();
  var em = videoEmbed_(url);
  if (em && em.bad) return { ok: false, error: 'private' };
  var kind = videoUrlKind_(url);
  if (!kind) return { ok: false, error: 'bad_link' };
  if (kind === 'yandex' || kind === 'direct') return { ok: false, error: 'old_kind' };
  if (kind === 'rutube') {
    // название и длина с Rutube; если не ответил — не страшно, длину возьмёт плеер
    try {
      var rr = UrlFetchApp.fetch('https://rutube.ru/api/video/' + em.id + '/?format=json', { muteHttpExceptions: true });
      if (rr.getResponseCode() === 404) return { ok: false, error: 'not_found' };
      if (rr.getResponseCode() === 200) {
        var rj = parseJson_(rr.getContentText());
        if (rj.is_hidden || rj.is_deleted) return { ok: false, error: 'private' };
        return { ok: true, kind: kind, name: cleanTitle_(String(rj.title || '')), d: Math.round(Number(rj.duration) || 0) };
      }
    } catch (eR) {}
    return { ok: true, kind: kind, name: '', d: 0 };
  }
  if (kind === 'vk') return { ok: true, kind: kind, name: '', d: 0 };
  var name = '';
  if (kind === 'yandex') {
    var r = UrlFetchApp.fetch('https://cloud-api.yandex.net/v1/disk/public/resources?fields=name,type,media_type,mime_type&public_key=' +
      encodeURIComponent(url), { muteHttpExceptions: true });
    if (r.getResponseCode() === 404) return { ok: false, error: 'not_found' };
    if (r.getResponseCode() !== 200) return { ok: false, error: 'yandex_error' };
    var meta = parseJson_(r.getContentText());
    if (meta.type === 'dir') return { ok: false, error: 'folder' };
    if (meta.media_type && meta.media_type !== 'video') return { ok: false, error: 'not_video' };
    name = String(meta.name || '');
  } else {
    name = decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() || '');
  }
  var src = videoSrc_(url);
  if (!src) return { ok: false, error: 'yandex_error' };
  return { ok: true, name: cleanTitle_(name.replace(/\.[a-z0-9]{2,4}$/i, '').replace(/[_]+/g, ' ')), src: src, kind: kind };
}

function newCode_(rows) {
  var used = {};
  for (var i = 1; i < rows.length; i++) used[String(rows[i][0])] = 1;
  for (var t = 0; t < 20; t++) {
    var c = Utilities.getUuid().replace(/-/g, '').slice(0, 10).toLowerCase();
    if (!used[c]) return c;
  }
  return Utilities.getUuid().replace(/-/g, '');
}

function findVlink_(code) {
  code = String(code || '').toLowerCase();
  if (!/^[a-z0-9]{8,40}$/.test(code)) return null;
  var sh = vlinksSheet_();
  // createTextFinder в Яндекс-обёртке нет: ищем обычным проходом по листу
  var all = sh.getDataRange().getValues(), row = -1;
  for (var fi = 1; fi < all.length; fi++) if (String(all[fi][0]).toLowerCase() === code) { row = fi + 1; break; }
  if (row === -1) return null;
  var v = all[row - 1].slice(0, 7);
  return { sh: sh, row: row, owner: normId_(v[1]), cid: String(v[2]), dev: String(v[4] || ''), data: parseJson_(v[5]) };
}
function validDev_(d) { return /^[a-z0-9]{16,40}$/.test(String(d || '')); }

function vOpen_(p) {
  var dev = String(p.dev || '');
  if (!validDev_(dev)) return jsonOut_({ ok: false, error: 'bad_device' });
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  var L;
  try {
    L = findVlink_(p.k);
    if (!L) return jsonOut_({ ok: false, error: 'not_found' });
    if (L.dev && L.dev !== dev) return jsonOut_({ ok: false, error: 'locked' });
    if (!L.dev) L.sh.getRange(L.row, 5).setValue(dev);
    var now = Date.now();
    if (!L.data.v) L.data.v = {};
    if (now - (L.data.lo || 0) > OPEN_GAP_MS) L.data.o = (L.data.o || 0) + 1;
    L.data.lo = now; L.data.l = now;
    L.sh.getRange(L.row, 6).setValue("'" + JSON.stringify(L.data));
    L.sh.getRange(L.row, 7).setValue(new Date().toISOString());
  } finally {
    lock.releaseLock();
  }
  var owner = findUserById_(L.owner);
  var lib = loadVideos_(L.owner), out = [];
  var ids = Object.keys(L.data.v).sort(function (a, b) { return (L.data.v[a].s || 0) - (L.data.v[b].s || 0); });
  ids.forEach(function (vid) {
    var v = null;
    for (var i = 0; i < lib.length; i++) if (lib[i].vid === vid) v = lib[i];
    if (!v) return; // ролик удалён из библиотеки
    var x = L.data.v[vid];
    // Ссылку на файл Яндекс отдаёт только тому, кто её запросил, поэтому её берёт сам телефон кандидата (u).
    var vk_ = videoUrlKind_(v.url), yd = vk_ === 'yandex', emb = vk_ === 'rutube' || vk_ === 'vk';
    out.push({ vid: vid, title: v.title, src: (yd || emb) ? '' : videoSrc_(v.url), u: yd ? v.url : '', url: emb ? v.url : '', kind: vk_,
               m: Math.round(x.m || 0), d: Math.round(x.d || v.d || 0) });
  });
  return jsonOut_({ ok: true, owner: owner ? fullName_(owner) : '', ofn: owner ? String(owner.firstName || '').trim() : '',
    avatar: owner ? owner.avatar : '', cname: L.data.cn || '', tg: owner ? tgUrl_(owner) : '', max: owner ? (owner.maxUrl || (owner.id === OWNER_ID ? SUPPORT_URL : '')) : '', videos: out });
}

// Сигнал со страницы просмотра. Досмотренное растёт не быстрее реального времени (защита от накрутки).
function vPing_(p) {
  var dev = String(p.dev || '');
  if (!validDev_(dev)) return jsonOut_({ ok: false, error: 'bad_device' });
  var pos = Number(p.pos), dur = Number(p.dur), ev = String(p.ev || 'tick');
  if (!(pos >= 0 && pos < 36000)) return jsonOut_({ ok: false, error: 'bad_pos' });
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var L = findVlink_(p.k);
    if (!L) return jsonOut_({ ok: false, error: 'not_found' });
    if (L.dev !== dev) return jsonOut_({ ok: false, error: 'locked' });
    var x = L.data.v && L.data.v[String(p.vid || '')];
    if (!x) return jsonOut_({ ok: false, error: 'not_found' });
    var now = Date.now();
    var gap = x.t ? Math.min(PING_CAP_SEC, Math.max(0, (now - x.t) / 1000)) : 15;
    var allowed = (x.m || 0) + gap * 1.5 + 12;
    var m = Math.min(pos, allowed);
    if (m > (x.m || 0)) x.m = m;
    if (dur > 0 && dur < 36000) x.d = dur;
    if (x.d && x.m > x.d) x.m = x.d;
    if (ev === 'start') x.n = (x.n || 0) + 1;
    if (ev === 'restart') x.r = (x.r || 0) + 1;
    if (x.d && x.m >= x.d - 3) x.e = 1;
    x.t = now; x.l = now; L.data.l = now;
    L.sh.getRange(L.row, 6).setValue("'" + JSON.stringify(L.data));
    return jsonOut_({ ok: true, m: Math.round(x.m) });
  } finally {
    lock.releaseLock();
  }
}

// ---------- бинар ----------
// Все люди одним чтением таблицы: имя и PRO (оплата или подарок Андрея действует).
function usersLite_() {
  var d = usersSheet_().getDataRange().getValues(), U = {}, now = Date.now(), F = frozenMap_();
  for (var i = 1; i < d.length; i++) {
    var id = normId_(d[i][0]);
    if (!id) continue;
    var until = id === OWNER_ID ? OWNER_PAID_UNTIL : (Number(d[i][10]) || 0);
    U[id] = { name: String(d[i][7] || '').trim() || (String(d[i][1] || '') + ' ' + String(d[i][2] || '')).trim(),
              until: until, pro: until > now, row: i + 1, frozen: !!F[id], av: String(d[i][5] || ''), reg: new Date(d[i][4]).getTime() || 0 };
  }
  return U;
}

function loadBin_() {
  var d = binarSheet_().getDataRange().getValues(), B = { map: {}, kids: {} };
  for (var i = 1; i < d.length; i++) {
    var id = normId_(d[i][0]);
    if (!id || id === OWNER_ID) continue;
    B.map[id] = { row: i + 1, sponsor: normId_(d[i][1]), parent: normId_(d[i][2]), side: String(d[i][3]) === 'R' ? 'R' : 'L',
                  at: Number(d[i][4]) || 0, by: String(d[i][5] || ''), moved: String(d[i][6] || '') === '1' };
  }
  for (var k in B.map) {
    var x = B.map[k];
    if (!x.parent) continue;
    if (!B.kids[x.parent]) B.kids[x.parent] = {};
    B.kids[x.parent][x.side] = k;
  }
  return B;
}
function placed_(B, id) { return id === OWNER_ID || !!(B.map[id] && B.map[id].parent); }
// самый низ ноги: идём от человека всё время в одну сторону, пока есть место
function bottom_(B, from, side) {
  var cur = from, g = 0;
  while (B.kids[cur] && B.kids[cur][side] && g++ < 100000) cur = B.kids[cur][side];
  return cur;
}
// сколько людей в ноге side у top
function legSize_(B, top, side) {
  var first = B.kids[top] && B.kids[top][side], n = 0, st = first ? [first] : [];
  while (st.length && n < 1000000) {
    var c = st.pop(); n++;
    var k = B.kids[c];
    if (k) { if (k.L) st.push(k.L); if (k.R) st.push(k.R); }
  }
  return n;
}
// меньшая нога (по числу людей); поровну — левая
function weakSide_(B, top) { return legSize_(B, top, 'R') < legSize_(B, top, 'L') ? 'R' : 'L'; }
// стоит ли id в структуре под top (или это он сам)
function under_(B, top, id) {
  var cur = id, g = 0;
  while (cur && g++ < 100000) {
    if (cur === top) return true;
    cur = B.map[cur] ? B.map[cur].parent : '';
  }
  return false;
}
function binWrite_(B, id, sponsor, parent, side, by) {
  var row = [id, sponsor || '', parent || '', side === 'R' ? 'R' : 'L', parent ? Date.now() : '', by || ''];
  var sh = binarSheet_();
  if (B.map[id]) { sh.getRange(B.map[id].row, 1, 1, 3).setNumberFormat('@'); sh.getRange(B.map[id].row, 1, 1, 6).setValues([row]); }
  else { var r = sh.getLastRow() + 1; sh.getRange(r, 1, 1, 3).setNumberFormat('@'); sh.getRange(r, 1, 1, 6).setValues([row]); }
}
// чья ссылка ставит сразу: Андрей всегда, остальные — PRO в бинаре и после открытия REF_OPEN_AT
// v18: приглашать могут все, и бесплатные тоже (их люди встают под них)
function refOpen_(B, id, U) {
  if (id === OWNER_ID) return true;
  return REF_OPEN_AT > 0 && Date.now() >= REF_OPEN_AT && !!(U[id] && !U[id].frozen) && placed_(B, id);
}
// Чей он лично приглашённый для расчёта (сжатие).
function effSponsor_(B, U, id) {
  var s = B.map[id] ? B.map[id].sponsor : '', g = 0;
  // v18: сжатие — неактивный (без подписки) или замороженный пропускается, его люди у ближайшего активного выше
  while (s && s !== OWNER_ID && U[s] && !active_(U, s) && g++ < 1000) s = B.map[s] ? B.map[s].sponsor : OWNER_ID;
  return s;
}
function active_(U, id) { return !!(U[id] && U[id].pro && !U[id].frozen); }

// Встать в команду по ссылке. Нельзя сейчас — запоминаем, кто пригласил: он поставит сам, когда откроется.
function binJoin_(id, ref, side) {
  id = normId_(id); ref = normId_(ref); side = side === 'R' || side === 'L' ? side : '';
  if (!ref || ref === id || id === OWNER_ID) return { ok: false, error: 'bad_ref' };
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var U = usersLite_();
    if (!U[ref] || !U[id]) return { ok: false, error: 'bad_ref' };
    var B = loadBin_();
    if (placed_(B, id)) return { ok: false, error: 'already' };
    if (!side) side = weakSide_(B, ref); // одна ссылка: в меньшую ногу
    if (refOpen_(B, ref, U)) {
      var parent = bottom_(B, ref, side);
      binWrite_(B, id, ref, parent, side, 'link');
      return { ok: true, placed: true, sponsor: U[ref].name };
    }
    binWrite_(B, id, ref, '', side, 'link');
    return { ok: true, placed: false, sponsor: U[ref].name };
  } finally {
    lock.releaseLock();
  }
}

function binPlaceMine_(me, p) {
  var id = normId_(p.id), side = p.s === 'R' ? 'R' : 'L';
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var U = usersLite_(), B = loadBin_();
    if (!refOpen_(B, me, U)) return jsonOut_({ ok: false, error: 'closed' });
    var x = B.map[id];
    if (!x || x.parent || x.sponsor !== me) return jsonOut_({ ok: false, error: 'not_found' });
    binWrite_(B, id, me, bottom_(B, me, side), side, me);
    return jsonOut_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Размер структуры под каждым и сколько в ней PRO (один проход снизу вверх)
function binSizes_(B, U) {
  var S = {};
  function walk(id) {
    if (S[id]) return S[id];
    var k = B.kids[id] || {}, r = { n: 0, a: 0 };
    S[id] = r;
    ['L', 'R'].forEach(function (sd) {
      var c = k[sd];
      if (!c) return;
      var w = walk(c);
      r.n += 1 + w.n;
      r.a += (active_(U, c) ? 1 : 0) + w.a;
    });
    return r;
  }
  return walk;
}
// все в ноге (id ребёнка и ниже)
function legIds_(B, top) {
  var out = [], st = top ? [top] : [], g = 0;
  while (st.length && g++ < 200000) {
    var c = st.pop();
    out.push(c);
    var k = B.kids[c] || {};
    if (k.L) st.push(k.L);
    if (k.R) st.push(k.R);
  }
  return out;
}

function binTree_(me, p) {
  var U = usersLite_(), B = loadBin_(), size = binSizes_(B, U);
  var meIn = placed_(B, me);
  var root = normId_(p.root) || me;
  if (!meIn || !placed_(B, root) || !under_(B, me, root)) root = me;
  function node(id) {
    if (!id) return null;
    var k = B.kids[id] || {}, x = B.map[id] || {};
    return { id: id, name: U[id] ? U[id].name : id, pro: active_(U, id), fz: !!(U[id] && U[id].frozen), mine: x.sponsor === me, size: size(id).n, l: !!k.L, r: !!k.R,
             lv: id === me ? 0 : lineLv_(B, me, id), av: U[id] ? U[id].av : '' };
  }
  var kr = B.kids[root] || {}, kL = B.kids[kr.L] || {}, kR = B.kids[kr.R] || {};
  var tree = { root: node(root), L: node(kr.L), R: node(kr.R), LL: node(kL.L), LR: node(kL.R), RL: node(kR.L), RR: node(kR.R) };
  var PK = pkgNow_(U, Object.keys(tree).map(function (k) { return tree[k] && tree[k].id; }));
  Object.keys(tree).forEach(function (k) { if (tree[k]) tree[k].pkg = (PK[tree[k].id] || {}).pkg || ''; });

  // мои ноги и расчёт (всегда от меня, не от того, кого смотрю)
  var km = B.kids[me] || {}, stats = { L: {}, R: {} };
  ['L', 'R'].forEach(function (sd) {
    var ids = meIn ? legIds_(B, km[sd]) : [], a = 0, pn = 0, pa = 0;
    ids.forEach(function (i) {
      var pro = active_(U, i);
      if (pro) a++;
      if (effSponsor_(B, U, i) === me) { pn++; if (pro) pa++; }
    });
    stats[sd] = { n: ids.length, a: a, pn: pn, pa: pa, turnover: a * PRICE_RUB };
  });
  var myPro = active_(U, me);
  var qualified = myPro && stats.L.pn > 0 && stats.R.pn > 0;
  var invite = Math.round((stats.L.pa + stats.R.pa) * PRICE_RUB * BIN_INVITE_PCT / 100);
  var binary = qualified ? Math.round(Math.min(stats.L.turnover, stats.R.turnover) * BIN_BINARY_PCT / 100) : 0;
  var potInvite = Math.round((stats.L.pn + stats.R.pn) * PRICE_RUB * BIN_INVITE_PCT / 100);
  var potBinary = Math.round(Math.min(stats.L.n, stats.R.n) * PRICE_RUB * BIN_BINARY_PCT / 100);
  var weak = Math.min(stats.L.turnover, stats.R.turnover), ri = rankIdx_(weak);
  var nx = RANKS[ri + 1] || null;
  var rank = { i: ri, name: ri >= 0 ? RANKS[ri][0] : '', weak: weak, next: nx ? nx[0] : '', nextV: nx ? nx[1] : 0,
               need: nx ? nx[1] - weak : 0, from: ri >= 0 ? RANKS[ri][1] : 0, list: RANKS };
  // v18: настоящие цифры за месяц из раздела «ДЕНЬГИ» (со сжатием и статусами), а не прикидка
  var money = moneyFor_(me, Date.now());
  invite = Math.round(money.month.inv); binary = Math.round(money.month.bin);
  var matching = Math.round(money.month.mat);
  var hist = saveIncome_(me, me === OWNER_ID ? [0, 0, 0, stats.L.turnover + stats.R.turnover] : [invite, binary, matching, stats.L.turnover + stats.R.turnover]);

  var waiting = [];
  for (var w in B.map) {
    var wx = B.map[w];
    if (!wx.parent && wx.sponsor === me && U[w]) waiting.push({ id: w, name: U[w].name, s: wx.side });
  }
  // мои новые: пришли по моей ссылке меньше часа назад, ещё не переносились и под ними никого
  var fresh = [], now = Date.now();
  for (var f in B.map) {
    var fx = B.map[f];
    if (fixable_(B, me, f, now)) fresh.push({ id: f, name: U[f] ? U[f].name : f, s: fx.side, left: Math.max(1, Math.round((fx.at + FIX_MS - now) / 60000)),
      under: U[fx.parent] ? U[fx.parent].name : (fx.parent === OWNER_ID ? 'тобой' : fx.parent) });
  }
  var mx = B.map[me] || null, sp = mx && mx.sponsor;
  var up = '';
  if (root !== me && B.map[root]) up = B.map[root].parent;
  return jsonOut_({ ok: true, me: me, owner: me === OWNER_ID, placed: meIn, pro: myPro,
    sponsor: sp ? { id: sp, name: U[sp] ? U[sp].name : sp } : null,
    pending: !!(mx && !mx.parent),
    canInvite: refOpen_(B, me, U), openAt: REF_OPEN_AT, root: root, up: up, tree: tree,
    stats: stats, qualified: qualified, invite: invite, binary: binary, matching: matching, total: invite + binary + matching,
    rank: rank, income: hist, matchPct: ri >= 0 ? MATCH_PCT[ri] : [],
    potInvite: potInvite, potBinary: potBinary, potTotal: potInvite + potBinary,
    invitePct: BIN_INVITE_PCT, binaryPct: BIN_BINARY_PCT, price: PRICE_RUB,
    withdraw: money.canWithdraw, money: money, waiting: waiting, fresh: fresh });
}

// Карточка человека из моей структуры: пакет, срок, кто пригласил, контакты.
// Контакты видит тот, кто лично пригласил, и Андрей (CARD_CONTACTS: 'sponsor' | 'two' | 'up').
var CARD_CONTACTS = 'sponsor';
function binCard_(me, p) {
  var U = usersLite_(), B = loadBin_(), id = normId_(p.id), x = B.map[id];
  if (!id || !U[id] || id === me || !x || !x.parent || !(me === OWNER_ID || under_(B, me, id))) return jsonOut_({ ok: false, error: 'bad_id' });
  var u = findUserById_(id), pk = pkgNow_(U, [id])[id] || {}, sp = x.sponsor || OWNER_ID;
  var spSp = B.map[sp] ? (B.map[sp].sponsor || OWNER_ID) : '';
  var see = me === OWNER_ID || sp === me || CARD_CONTACTS === 'up' || (CARD_CONTACTS === 'two' && spSp === me);
  var size = binSizes_(B, U)(id), k = B.kids[id] || {};
  return jsonOut_({ ok: true, id: id, name: U[id].name, avatar: u.avatar || '', pkg: pk.pkg || '', till: pk.till || 0,
    pro: active_(U, id), fz: !!U[id].frozen, joined: x.at || 0, side: x.side, lv: lineLv_(B, me, id),
    sponsor: { id: sp, name: U[sp] ? U[sp].name : (sp === OWNER_ID ? 'Андрей Чулков' : sp) }, mine: sp === me,
    team: size.n, l: !!k.L, r: !!k.R,
    contacts: see ? { tg: u.tg, max: u.maxUrl, wa: u.wa, phone: u.phone } : null });
}

// ===== Личная Карта EAGLES: островки и пункты человека =====
// У каждого свой лист map_<ID>: строка 2 = JSON карты и время сохранения. Сервер чистит всё, что пришло:
// только известные поля, длины обрезаны, ссылки только http(s). В FREE не больше MAP_FREE островков.
var MAP_FREE = 5, MAP_MAX_LEN = 150000, MAP_ISLES = 60, MAP_ITEMS = 40, MAP_DEPTH = 8, MAP_NODES = 2000;
var MAP_TYPES = { task: 1, link: 1, note: 1, lead: 1 }, MAP_COLORS = { r: 1, o: 1, y: 1, g: 1 };
var MAP_TRASH = 50, MAP_DONE = 300;   // корзина (30 дней) и «Выполнено» (последние 300)
var MAP_PAINT = { y: 1, w: 1, s: 1, b: 1, g: 1, o: 1, r: 1, p: 1, v: 1, n: 1 };   // цвет кружка (cl) и заливка (f)
function mapLook_(src, dst) { var i = mapStr_(src.i, 12).replace(/[^a-z]/g, ''); if (i) dst.i = i; if (MAP_PAINT[src.cl]) dst.cl = src.cl; if (src.f && dst.cl) dst.f = true; var e = mapStr_(src.e, 16); if (e && !/[\s<>"'&A-Za-z0-9]/.test(e)) dst.e = e;   // смайлик вместо значка
  var im = mapStr_(src.im, 600); if (/^https?:\/\/[^\s"'<>]+$/i.test(im)) dst.im = im; return dst; }
function mapSheet_(id) { return getSheet_('map_' + id, ['Json', 'At']); }
function mapStr_(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, n); }
function mapId_(v) { var x = String(v || '').replace(/[^a-z0-9]/gi, '').slice(0, 12); return x || Math.random().toString(36).slice(2, 10); }
function mapUrl_(v, n) { var u = mapStr_(v, n); return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
function mapDay_(v) { var d = mapStr_(v, 10); return /^\d{4}-\d\d-\d\d$/.test(d) ? d : ''; }
// 31.10 (Карта v33): один разбор для островка и пункта. Тип может не стоять: мульти (m=1) и папка (fo=1) без типа.
// task: u=1 срочно, ln ссылка, p превью; dk — день отметки «сделано» (для «Сегодня»); r/dd/sr — «каждый день» и серия.
// link (файл): u ссылка, p превью, im картинка. Островок первой линии может быть одиночным делом (type task).
function mapClean_(m) {
  var out = { v: 1, n: [] }, left = MAP_NODES;
  function node(b, depth, top) {
    if (!b || typeof b !== 'object' || left <= 0) return null;
    var ty = MAP_TYPES[b.type] ? b.type : '';
    if (!ty && !top && !b.m && !b.fo) return null;
    left--;
    var it = { id: mapId_(b.id), t: mapStr_(b.t, 60) || (top ? 'Островок' : '…') };
    if (ty) it.type = ty;
    var sv = mapStr_(b.s, 60); if (sv || ty) it.s = sv;
    var d = mapStr_(b.d, 300); if (d || top) it.d = d;
    if (top && !b.i) it.i = 'star';
    if (b.m) it.m = 1;
    if (b.fo) it.fo = 1;
    var dt = mapStr_(b.dt, 16); if (/^\d{4}-\d\d-\d\d(T\d\d:\d\d)?$/.test(dt)) it.dt = dt;   // срок (дата, время по желанию)
    if (ty === 'task' || it.dt || it.m) it.done = !!b.done;
    var dk = mapDay_(b.dk); if (dk) it.dk = dk;
    if (ty === 'task') {
      if (b.u === 1 || b.u === '1' || b.u === true) it.u = 1;
      var ln = mapUrl_(b.ln, 500) || (typeof b.u === 'string' && b.u.length > 1 ? mapUrl_(b.u, 500) : ''); if (ln) it.ln = ln;
      var pt = mapUrl_(b.p, 600); if (pt) it.p = pt;
      if (b.r) { it.r = 1; var dd = mapDay_(b.dd); if (dd) it.dd = dd; it.sr = Math.max(0, Math.min(9999, parseInt(b.sr, 10) || 0)); }
    }
    if (ty === 'link') { var u = mapUrl_(b.u, 500), pv = mapUrl_(b.p, 600); if (u) it.u = u; if (pv) it.p = pv; }
    if (ty === 'note') it.x = mapStr_(b.x, 1000);
    if (ty === 'lead') { it.ph = mapStr_(b.ph, 20).replace(/[^\d+]/g, ''); it.c = MAP_COLORS[b.c] ? b.c : 'r'; }
    mapLook_(b, it);
    var k = depth < MAP_DEPTH ? kids(b.k, depth + 1) : [];
    if (k.length || top) it.k = k;
    return it;
  }
  function kids(list, depth) {
    var r = [];
    (Array.isArray(list) ? list : []).slice(0, MAP_ITEMS).forEach(function (b) { var it = node(b, depth, false); if (it) r.push(it); });
    return r;
  }
  (Array.isArray(m && m.n) ? m.n : []).slice(0, MAP_ISLES).forEach(function (a) { var it = node(a, 1, true); if (it) out.n.push(it); });
  // Корзина: удалённое лежит 30 дней (не больше 50 штук), его можно вернуть на место. dn=1 — пришло из «Выполнено».
  var tr = [];
  (Array.isArray(m && m.tr) ? m.tr : []).slice(0, MAP_TRASH).forEach(function (r) {
    if (!r || !r.x || typeof r.x !== 'object') return;
    var at = Number(r.at) || 0; if (at < Date.now() - 30 * 864e5) return;
    var x = node(r.x, 1, !r.p && !r.x.type && !r.x.m && !r.x.fo); if (!x) return;
    var o = { x: x, p: r.p ? mapId_(r.p) : null, at: at }; if (r.dn) o.dn = 1; tr.push(o);
  });
  if (tr.length) out.tr = tr;
  // «Выполнено»: сделанные дела, ушедшие с карты (p — где лежали, чтобы вернуть на место)
  var dn = [];
  (Array.isArray(m && m.dn) ? m.dn : []).slice(0, MAP_DONE).forEach(function (r) {
    if (!r || !r.x || typeof r.x !== 'object') return;
    var x = node(r.x, 1, !r.p && !r.x.type && !r.x.m && !r.x.fo); if (!x) return;
    dn.push({ x: x, p: r.p ? mapId_(r.p) : null, at: Number(r.at) || 0 });
  });
  if (dn.length) out.dn = dn;
  return out;
}
// Свои картинки в кружках карты. Телефон сам ужимает фото до 400×400 (≈20 КБ) и присылает сюда,
// сервер кладёт файл в бакет сайта в папку u/<ID>/ и отдаёт ссылку. Лист img_<ID> — список файлов человека.
var IMG_FREE = 50, IMG_PRO = 1000, IMG_MAX_B64 = 160000;
function imgSheet_(id) { return getSheet_('img_' + id, ['Key', 'At']); }
function imgPut_(me, p) {
  var b64 = String(p.data || ''), mime = String(p.mime || '');
  if (!/^image\/(webp|jpeg|png)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (b64.length > IMG_MAX_B64) return jsonOut_({ ok: false, error: 'photo_big' });
  var head = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var okSig = mime === 'image/png' ? head[0] === 0x89 && head[1] === 0x50 : mime === 'image/jpeg' ? head[0] === 0xFF && head[1] === 0xD8 : head[0] === 0x52 && head[8] === 0x57;
  if (!okSig) return jsonOut_({ ok: false, error: 'bad_photo' });
  var U = usersLite_(), pro = active_(U, me) || me === OWNER_ID, sh = imgSheet_(me), n = sh.getDataRange().getValues().slice(1).filter(function (r) { return r[0]; }).length;
  var max = pro ? IMG_PRO : IMG_FREE;
  if (n >= max) return jsonOut_({ ok: false, error: 'limit', max: max });
  var key = 'u/' + me + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 16) + (mime === 'image/png' ? '.png' : mime === 'image/jpeg' ? '.jpg' : '.webp');
  var r = Storage.put(key, b64, mime);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  sh.appendRow([key, Date.now()]);
  return jsonOut_({ ok: true, url: Storage.url(key), left: max - n - 1 });
}
function imgDel_(me, p) {
  var u = String(p.url || ''), pre = Storage.url('u/' + me + '/');
  if (u.indexOf(pre) !== 0) return jsonOut_({ ok: false, error: 'not_yours' });
  var key = u.slice(Storage.url('').length), sh = imgSheet_(me), d = sh.getDataRange().getValues();
  for (var i = d.length - 1; i >= 1; i--) if (String(d[i][0]) === key) { Storage.del(key); sh.getRange(i + 1, 1, 1, 2).setValues([['', '']]); return jsonOut_({ ok: true }); }   // пустая строка = файл удалён
  return jsonOut_({ ok: false, error: 'not_found' });
}
// ---------- Копилка мечты (29.10.2026) ----------
// Часть заработанного человек откладывает на мечту: название, картинка, сумма мечты, дата. До даты эти деньги
// не выводятся. Досрочно — только через поддержку: человек пишет Андрею, тот в «Моей команде» жмёт «Открыть досрочно»
// с причиной (adm_kop_open), мечта закрывается, деньги сразу снова в «Доступно». Деньги никуда не переводятся: это пометка «на мечту» на уже
// подтверждённых начислениях («Доступно» + «Нужен статус»). Свободно к выводу = подтверждённое − на мечтах.
// «Откладывать 10 %»: с каждого начисления после создания мечты (до её даты) 10 % сами считаются отложенными.
// Лист kop_<ID>: строка 2 = JSON [{ id, t, pic | img, goal, adds:[{s,at}], at, until, auto }].
var KOP_MAX = 10, KOP_AUTO_PCT = 10, KOP_MIN = 100, KOP_MAX_DAYS = 3660;
var KOP_PICS = { sea: 1, laptop: 1, car: 1, home: 1, trip: 1 };
function kopSheet_(id) { return getSheet_('kop_' + id, ['Json', 'At']); }
function kopLoad_(me) {
  var d = kopSheet_(me).getDataRange().getValues(), list = [];
  if (d.length > 1 && d[1][0]) { try { list = JSON.parse(String(d[1][0])); } catch (e) { list = []; } }
  return Array.isArray(list) ? list : [];
}
function kopWrite_(me, list) {
  var sh = kopSheet_(me), d = sh.getDataRange().getValues(), row = [JSON.stringify(list), Date.now()];
  if (d.length > 1) sh.getRange(2, 1, 1, 2).setValues([row]); else sh.appendRow(row);
}
// сколько лежит на каждой мечте; conf — подтверждённые начисления [{at,sum}] (для «10 % с каждого начисления»)
function kopState_(list, conf, now) {
  var frozen = 0;
  var out = list.map(function (k) {
    var manual = 0; (k.adds || []).forEach(function (a) { manual += Number(a.s) || 0; });
    var auto = 0;
    if (k.auto) conf.forEach(function (e) { if (e.at >= k.at && e.at < k.until && e.sum > 0) auto += e.sum * KOP_AUTO_PCT / 100; });
    auto = Math.round(auto * 100) / 100;
    var saved = Math.round((manual + auto) * 100) / 100;
    frozen += saved;
    return { id: k.id, t: k.t, pic: k.pic || '', img: k.img || '', goal: k.goal || 0, saved: saved, manual: manual, autoSum: auto,
             auto: !!k.auto, at: k.at, until: k.until, open: now >= k.until };
  });
  return { list: out, frozen: Math.round(frozen * 100) / 100 };
}
// убирает отложенное из «Доступно» (сначала) и «Нужен статус»; вызывается из moneyFor_
function kopApply_(me, tot, conf, now) {
  var st = kopState_(kopLoad_(me), conf, now), base = Math.round((tot.ok + tot.tax) * 100) / 100, f = st.frozen;
  var fromOk = Math.min(f, tot.ok); tot.ok = Math.round((tot.ok - fromOk) * 100) / 100;
  tot.tax = Math.round(Math.max(0, tot.tax - (f - fromOk)) * 100) / 100;
  tot.kop = f;
  return { dreams: st.list, frozen: f, base: base, free: Math.round(Math.max(0, base - f) * 100) / 100 };
}
function kopGet_(me) {
  if (me === OWNER_ID) return jsonOut_({ ok: true, owner: true, dreams: [], frozen: 0, base: 0, free: 0 });
  var m = moneyFor_(me, Date.now());
  return jsonOut_(Object.assign({ ok: true, owner: false, autoPct: KOP_AUTO_PCT, min: KOP_MIN, max: KOP_MAX, support: SUPPORT_URL,
                                  early: kopEarly_(me).map(function (x) { return { at: x.at, t: x.t, sum: x.sum }; }) }, m.kop));
}
function kopDate_(v) {   // «2027-01-29» → полдень этого дня по Москве
  var s = String(v || ''); if (!/^\d{4}-\d\d-\d\d$/.test(s)) return 0;
  return Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)), 12) - MSK;
}
function kopSave_(me, p) {
  if (me === OWNER_ID) return jsonOut_({ ok: false, error: 'owner' });
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var now = Date.now(), op = String(p.op || ''), list = kopLoad_(me), m = moneyFor_(me, now), free = m.kop.free;
    var find = function (id) { for (var i = 0; i < list.length; i++) if (list[i].id === String(id)) return i; return -1; };
    var amt = Math.floor(Number(p.amt) || 0);
    if (op === 'new') {
      if (list.length >= KOP_MAX) return jsonOut_({ ok: false, error: 'limit', max: KOP_MAX });
      var until = kopDate_(p.until);
      if (!until || until < now + 86400000 / 2 || until > now + KOP_MAX_DAYS * 86400000) return jsonOut_({ ok: false, error: 'bad_date' });
      if (amt < 0 || amt > free) return jsonOut_({ ok: false, error: 'no_money', free: free });
      if (!amt && p.auto !== '1') return jsonOut_({ ok: false, error: 'bad_sum' });
      var k = { id: mapId_(''), t: mapStr_(p.t, 32) || 'Моя мечта', goal: Math.max(0, Math.min(100000000, Math.floor(Number(p.goal) || 0))),
                adds: amt ? [{ s: amt, at: now }] : [], at: now, until: until, auto: p.auto === '1' };
      kopPic_(me, p, k);
      list.unshift(k);
    } else if (op === 'add') {
      var i = find(p.id); if (i < 0) return jsonOut_({ ok: false, error: 'not_found' });
      if (now >= list[i].until) return jsonOut_({ ok: false, error: 'open' });
      if (amt < KOP_MIN || amt > free) return jsonOut_({ ok: false, error: 'no_money', free: free });
      list[i].adds = (list[i].adds || []).concat([{ s: amt, at: now }]).slice(-200);
    } else if (op === 'edit') {   // поменять название и картинку можно всегда, сумму и дату — нет
      var j = find(p.id); if (j < 0) return jsonOut_({ ok: false, error: 'not_found' });
      if (p.t !== undefined) list[j].t = mapStr_(p.t, 32) || list[j].t;
      kopPic_(me, p, list[j]);
    } else if (op === 'take') {   // забрать на баланс — только когда дата наступила
      var t = find(p.id); if (t < 0) return jsonOut_({ ok: false, error: 'not_found' });
      if (now < list[t].until) return jsonOut_({ ok: false, error: 'locked', until: list[t].until });
      list.splice(t, 1);
    } else return jsonOut_({ ok: false, error: 'bad_op' });
    kopWrite_(me, list);
    var m2 = moneyFor_(me, now);
    return jsonOut_(Object.assign({ ok: true }, m2.kop));
  } finally { lock.releaseLock(); }
}
function kopPic_(me, p, k) {
  if (KOP_PICS[p.pic]) { k.pic = p.pic; delete k.img; }
  var im = String(p.img || '');
  if (im && im.indexOf(Storage.url('u/' + me + '/')) === 0 && /^https?:\/\/[^\s"'<>]+$/.test(im)) { k.img = im.slice(0, 300); delete k.pic; }
  if (!k.pic && !k.img) k.pic = 'sea';
}
// досрочно через поддержку (31.10.2026). Лист kope_<ID>: [At, Мечта, Сумма, Причина] — что и почему Андрей открыл досрочно
function kopEarly_(id) {
  var sh = getSpreadsheet_().getSheetByName('kope_' + id), out = [];
  if (!sh) return out;
  var d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (d[i][0]) out.push({ at: Number(d[i][0]), t: String(d[i][1] || ''), sum: Number(d[i][2]) || 0, why: String(d[i][3] || '') });
  return out.slice(-10).reverse();
}
function admKop_(id) {
  var m = moneyFor_(id, Date.now());
  return jsonOut_({ ok: true, dreams: m.kop.dreams, frozen: m.kop.frozen, free: m.kop.free, early: kopEarly_(id) });
}
function admKopOpen_(id, p) {
  var why = mapStr_(p.why, 200);
  if (why.length < 3) return jsonOut_({ ok: false, error: 'no_why' });
  var now = Date.now(), list = kopLoad_(id), m = moneyFor_(id, now), kid = String(p.kid || ''), i, k = null;
  for (i = 0; i < list.length; i++) if (list[i].id === kid) break;
  if (i >= list.length) return jsonOut_({ ok: false, error: 'not_found' });
  m.kop.dreams.forEach(function (x) { if (x.id === kid) k = x; });
  var sum = k ? k.saved : 0, t = list[i].t;
  list.splice(i, 1);
  kopWrite_(id, list);
  getSheet_('kope_' + id, ['At', 'T', 'Sum', 'Why']).appendRow([now, t, sum, why]);
  var m2 = moneyFor_(id, now);
  return jsonOut_({ ok: true, t: t, sum: sum, dreams: m2.kop.dreams, frozen: m2.kop.frozen, free: m2.kop.free, early: kopEarly_(id) });
}

// Превью ссылки: открываем страницу как браузер и берём её картинку (og:image) и заголовок. Ответ помним 12 часов.
var PREVIEW_PER_DAY = 100;
function linkPreview_(me, p) {
  var u = String(p.u || '').trim().slice(0, 500);
  if (!/^https?:\/\/[^\s]+$/i.test(u)) return jsonOut_({ ok: false, error: 'bad_url' });
  var cache = CacheService.getScriptCache(), key = 'LP_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, u)).slice(0, 22);
  var hit = cache.get(key); if (hit) return jsonOut_(JSON.parse(hit));
  var dk = 'LPN_' + me + '_' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10), used = Number(cache.get(dk) || 0);
  if (used >= PREVIEW_PER_DAY && me !== OWNER_ID) return jsonOut_({ ok: false, error: 'limit' });
  cache.put(dk, String(used + 1), 21600);
  var out = { ok: true, img: '', title: '' };
  try {
    var r = UrlFetchApp.fetch(u, { muteHttpExceptions: true, safe: true }), base = r.getFinalUrl(), t = r.getContentText() || '';
    if (/^image\//i.test(r.getType())) out.img = base;
    function meta(re) { var m = t.match(re); return m ? m[1].replace(/&amp;/g, '&').trim() : ''; }
    var img = meta(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/i)
      || meta(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i)
      || meta(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
    if (img && !/^https?:\/\//i.test(img)) {   // относительный адрес картинки → полный (URL в этой песочнице нет)
      var org = (String(base).match(/^https?:\/\/[^\/?#]+/i) || [''])[0];
      img = /^\/\//.test(img) ? 'https:' + img : img.charAt(0) === '/' ? org + img : String(base).replace(/[?#].*$/, '').replace(/[^\/]*$/, '') + img;
    }
    if (/^https?:\/\//i.test(img)) out.img = img.slice(0, 600);
    out.title = (meta(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || meta(/<title[^>]*>([^<]+)<\/title>/i)).slice(0, 80);
  } catch (e) { out = { ok: true, img: '', title: '' }; }
  cache.put(key, JSON.stringify(out), 43200);
  return jsonOut_(out);
}
function mapGet_(me) {
  var U = usersLite_(), pro = active_(U, me) || me === OWNER_ID;
  var d = mapSheet_(me).getDataRange().getValues(), map = null;
  if (d.length > 1 && d[1][0]) { try { map = JSON.parse(String(d[1][0])); } catch (e) { map = null; } }
  return jsonOut_({ ok: true, map: map, at: d.length > 1 ? Number(d[1][1]) || 0 : 0, max: pro ? 0 : MAP_FREE, pro: pro });
}
function mapSave_(me, p) {
  var raw = String(p.data || '');
  if (raw.length > MAP_MAX_LEN) return jsonOut_({ ok: false, error: 'too_big' });
  var m; try { m = JSON.parse(raw); } catch (e) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  var map = mapClean_(m), U = usersLite_(), pro = active_(U, me) || me === OWNER_ID;
  var sh = mapSheet_(me), d = sh.getDataRange().getValues();
  if (!pro && map.n.length > MAP_FREE) {
    // после PRO островков могло остаться больше: менять их можно, добавлять новые нельзя
    var was = 0; if (d.length > 1 && d[1][0]) { try { was = (JSON.parse(String(d[1][0])).n || []).length; } catch (e2) { was = 0; } }
    if (map.n.length > was) return jsonOut_({ ok: false, error: 'limit', max: MAP_FREE });
  }
  var json = JSON.stringify(map), at = Date.now();
  if (json.length > MAP_MAX_LEN) return jsonOut_({ ok: false, error: 'too_big' });
  if (d.length > 1) sh.getRange(2, 1, 1, 2).setValues([[json, at]]); else sh.appendRow([json, at]);
  return jsonOut_({ ok: true, at: at });
}

// ===== «Сообщения»: переписка людей EAGLES, только текст =====
// Каждый чат — свой лист c_<меньший ID>_<больший ID> (Время, Кто, Текст); у каждого человека свой список in_<ID>
// (С кем, Последнее время, Кто писал последним, Текст, Прочитал до, Блок). Так сервер грузит только нужное.
var CHAT_MAX_LEN = 1000, CHAT_NEW_PER_DAY = 20, CHAT_SHOW = 100;
function chatKey_(a, b) { return 'c_' + (a < b ? a + '_' + b : b + '_' + a); }
function chatSheet_(a, b) { return getSheet_(chatKey_(a, b), ['At', 'From', 'Text']); }
function inboxSheet_(id) { return getSheet_('in_' + id, ['Peer', 'LastAt', 'LastFrom', 'LastText', 'ReadAt', 'Block']); }
function inboxRow_(id, peer) {
  var sh = inboxSheet_(id), d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (normId_(d[i][0]) === peer) return { sh: sh, row: i + 1, v: d[i] };
  return { sh: sh, row: 0, v: [peer, 0, '', '', 0, ''] };
}
function inboxPut_(x, v) {
  if (x.row) x.sh.getRange(x.row, 1, 1, 6).setValues([v]); else x.sh.appendRow(v);
}
function chatPeer_(U, B, id) {
  return { id: id, name: U[id] ? U[id].name : (id === OWNER_ID ? 'Андрей Чулков' : id), av: U[id] ? U[id].av : '', pro: active_(U, id) };
}
function chatList_(me) {
  var U = usersLite_(), B = loadBin_(), d = inboxSheet_(me).getDataRange().getValues(), list = [];
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]) === '#ann') continue;
    var peer = normId_(d[i][0]);
    if (!peer || !U[peer]) continue;
    var x = chatPeer_(U, B, peer);
    x.at = Number(d[i][1]) || 0; x.last = String(d[i][3] || ''); x.mineLast = normId_(d[i][2]) === me;
    x.unread = !x.mineLast && x.at > (Number(d[i][4]) || 0); x.block = String(d[i][5]) === '1';
    list.push(x);
  }
  list.sort(function (a, b) { return b.at - a.at; });
  return jsonOut_({ ok: true, list: list, canWrite: active_(U, me) || me === OWNER_ID });
}
function chatUnread_(me) {
  var d = inboxSheet_(me).getDataRange().getValues(), n = 0, annRead = 0;
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]) === '#ann') { annRead = Number(d[i][4]) || 0; continue; }
    if (normId_(d[i][2]) !== me && (Number(d[i][1]) || 0) > (Number(d[i][4]) || 0) && String(d[i][5]) !== '1') n++;
  }
  var a = annFor_(me, usersLite_(), loadBin_()).filter(function (x) { return x.at > annRead; }).length;
  return jsonOut_({ ok: true, n: n + a, chats: n, ann: a });
}
// ===== «Объявление команде»: листы ann_ГГГГММ по месяцам (Время, Кто, Текст), в ленте — текущий и прошлый месяц. Видит только личная линия автора: L1, L2, L3… (не перелив) =====
var ANN_PER_DAY = 1, ANN_SHOW = 30;
function annMonth_(t) { var d = new Date(t + 3 * 3600000); return d.getUTCFullYear() * 100 + d.getUTCMonth() + 1; }
function annSheet_(t) { return getSheet_('ann_' + annMonth_(t), ['At', 'From', 'Text']); }
// строки за текущий и прошлый месяц, старые в конце
function annRows_() {
  var now = Date.now(), m = new Date(now + 3 * 3600000), prev = Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1) - 3 * 3600000 - 1;
  var a = annSheet_(prev).getDataRange().getValues().slice(1), b = annSheet_(now).getDataRange().getValues().slice(1);
  return [['At', 'From', 'Text']].concat(a, b);
}
function annFor_(me, U, B) {
  var d = annRows_(), out = [];
  for (var i = d.length - 1; i >= 1 && out.length < ANN_SHOW; i--) {
    var from = normId_(d[i][1]);
    if (!from || from === me) continue;
    if (from === OWNER_ID ? !!U[me] : lineLv_(B, from, me) > 0)
      out.push({ at: Number(d[i][0]) || 0, from: from, name: U[from] ? U[from].name : (from === OWNER_ID ? 'Андрей Чулков' : from), av: U[from] ? U[from].av : '', t: String(d[i][2] || '') });
  }
  return out;
}
function annList_(me) {
  var U = usersLite_(), B = loadBin_(), list = annFor_(me, U, B);
  var x = inboxRow_(me, '#ann'), v = x.v.slice(); v[0] = '#ann'; v[4] = Date.now(); inboxPut_(x, v);   // прочитал
  var d = annRows_(), my = [];
  for (var i = d.length - 1; i >= 1 && my.length < 5; i--) if (normId_(d[i][1]) === me) my.push({ at: Number(d[i][0]) || 0, t: String(d[i][2] || '') });
  var team = lineCount_(B, U, me);
  return jsonOut_({ ok: true, list: list, mine: my, team: team, canSend: (active_(U, me) || me === OWNER_ID) && team > 0 });
}
// сколько людей в моей личной линии (все, кого пригласил я, они и дальше)
function lineCount_(B, U, me) {
  if (me === OWNER_ID) return Object.keys(U).length - 1;
  var kids = {}, n = 0;
  for (var id in B.map) { var s = B.map[id].sponsor || OWNER_ID; (kids[s] = kids[s] || []).push(id); }
  var st = (kids[me] || []).slice();
  while (st.length) { var x = st.pop(); n++; if (kids[x]) st.push.apply(st, kids[x]); }
  return n;
}
function annSend_(me, p) {
  var U = usersLite_(), B = loadBin_();
  var text = String(p.text || '').replace(/\r/g, '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, CHAT_MAX_LEN);
  if (!text) return jsonOut_({ ok: false, error: 'empty' });
  if (!(active_(U, me) || me === OWNER_ID)) return jsonOut_({ ok: false, error: 'need_pro' });
  if (me !== OWNER_ID) {
    var cache = CacheService.getScriptCache(), ck = 'ANN_' + me + '_' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
    if (Number(cache.get(ck) || 0) >= ANN_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
    cache.put(ck, '1', 21600);
  }
  annSheet_(Date.now()).appendRow([Date.now(), me, text]);
  var team = lineCount_(B, U, me);
  return jsonOut_({ ok: true, team: team });
}
// начать переписку можно с любым из своей структуры и с теми, кто выше тебя; ответить — любому, кто написал
function chatCanStart_(B, me, peer) {
  if (me === OWNER_ID) return true;
  if (under_(B, me, peer)) return true;
  var c = me, g = 0;
  while (c && g++ < 100000) { var x = B.map[c]; c = x ? (x.parent || (c === OWNER_ID ? '' : OWNER_ID)) : (c === OWNER_ID ? '' : OWNER_ID); if (c === peer) return true; }
  c = me; g = 0;
  while (c && g++ < 100000) { var y = B.map[c]; c = y ? (y.sponsor || OWNER_ID) : ''; if (c === peer) return true; if (c === OWNER_ID) break; }
  return false;
}
function chatOpen_(me, p) {
  var U = usersLite_(), B = loadBin_(), peer = normId_(p['with']);
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  var mine = inboxRow_(me, peer), theirs = inboxRow_(peer, me);
  var started = !!mine.row;
  if (!started && !chatCanStart_(B, me, peer)) return jsonOut_({ ok: false, error: 'not_allowed' });
  var d = started ? chatSheet_(me, peer).getDataRange().getValues() : [[]], msgs = [];
  for (var i = Math.max(1, d.length - CHAT_SHOW); i < d.length; i++) msgs.push({ at: Number(d[i][0]) || 0, me: normId_(d[i][1]) === me, t: String(d[i][2] || '') });
  if (started && (Number(mine.v[1]) || 0) > (Number(mine.v[4]) || 0)) { var v = mine.v.slice(); v[4] = Date.now(); inboxPut_(mine, v); }
  var x = chatPeer_(U, B, peer), pk = pkgNow_(U, [peer])[peer] || {};
  x.pkg = pk.pkg || ''; x.lv = lineLv_(B, me, peer);
  return jsonOut_({ ok: true, peer: x, msgs: msgs, canWrite: active_(U, me) || me === OWNER_ID,
    iBlocked: String(mine.v[5]) === '1', blockedMe: String(theirs.v[5]) === '1' });
}
function chatSend_(me, p) {
  var U = usersLite_(), B = loadBin_(), peer = normId_(p['with']);
  var text = String(p.text || '').replace(/\r/g, '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, CHAT_MAX_LEN);
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  if (!text) return jsonOut_({ ok: false, error: 'empty' });
  if (!(active_(U, me) || me === OWNER_ID)) return jsonOut_({ ok: false, error: 'need_pro' });
  var mine = inboxRow_(me, peer), theirs = inboxRow_(peer, me);
  if (String(theirs.v[5]) === '1') return jsonOut_({ ok: false, error: 'blocked' });
  if (!mine.row && !theirs.row) {
    if (!chatCanStart_(B, me, peer)) return jsonOut_({ ok: false, error: 'not_allowed' });
    if (me !== OWNER_ID) {
      var cache = CacheService.getScriptCache(), ck = 'CHN_' + me + '_' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
      var used = Number(cache.get(ck) || 0);
      if (used >= CHAT_NEW_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
      cache.put(ck, String(used + 1), 21600);
    }
  }
  var now = Date.now(), short = text.length > 120 ? text.slice(0, 117) + '…' : text;
  chatSheet_(me, peer).appendRow([now, me, text]);
  inboxPut_(mine, [peer, now, me, short, now, String(mine.v[5] || '')]);
  inboxPut_(theirs, [me, now, me, short, Number(theirs.v[4]) || 0, String(theirs.v[5] || '')]);
  return jsonOut_({ ok: true, at: now });
}
function chatBlock_(me, p) {
  var U = usersLite_(), peer = normId_(p['with']);
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  var mine = inboxRow_(me, peer), v = mine.v.slice();
  v[5] = String(p.on) === '1' ? '1' : '';
  inboxPut_(mine, v);
  return jsonOut_({ ok: true, block: v[5] === '1' });
}

// Моя личная линия: 1 — пригласил я, 2 — пригласил мой лично приглашённый и т. д.; 0 — перелив (не моя ветка приглашений)
function lineLv_(B, me, id) {
  var c = id, k = 0;
  while (c && k < 1000) {
    var s = B.map[c] ? (B.map[c].sponsor || OWNER_ID) : (c === OWNER_ID ? '' : OWNER_ID);
    k++;
    if (s === me) return k;
    if (!s || s === c) return 0;
    c = s;
  }
  return 0;
}

function rankIdx_(weak) {
  var r = -1;
  for (var i = 0; i < RANKS.length; i++) if (weak >= RANKS[i][1]) r = i;
  return r;
}
// Матчинг (расчёт): % с бинара моих лично приглашённых, их лично приглашённых и т. д. — сколько поколений даёт ранг.
// Бинар каждого: PRO, лично приглашённый в обеих ногах, % от оборота слабой ноги.
function matching_(B, U, size, me, pcts) {
  var kidsBySp = {}, side = {};
  for (var id in B.map) {
    if (!B.map[id].parent) continue;
    var s = effSponsor_(B, U, id);
    if (!s) continue;
    (kidsBySp[s] = kidsBySp[s] || []).push(id);
    // в какой ноге пригласившего стоит человек
    var cur = id, g = 0;
    while (cur && g++ < 100000) {
      var x = B.map[cur];
      if (!x) break;
      if (x.parent === s) { side[s] = side[s] || {}; side[s][x.side] = 1; break; }
      cur = x.parent;
    }
  }
  function legT(id, sd) {
    var c = (B.kids[id] || {})[sd];
    return c ? ((active_(U, c) ? 1 : 0) + size(c).a) * PRICE_RUB : 0;
  }
  function bin(id) {
    if (!active_(U, id) || !side[id] || !side[id].L || !side[id].R) return 0;
    return Math.min(legT(id, 'L'), legT(id, 'R')) * BIN_BINARY_PCT / 100;
  }
  var sum = 0, gen = kidsBySp[me] || [];
  for (var lv = 0; lv < pcts.length && gen.length; lv++) {
    var nextGen = [];
    gen.forEach(function (id) { sum += bin(id) * pcts[lv] / 100; nextGen = nextGen.concat(kidsBySp[id] || []); });
    gen = nextGen;
  }
  return Math.round(sum);
}
// История дохода по месяцам (пока расчёт): пишем текущий месяц, только если цифры поменялись.
function monthKey_(ms) { return new Date(ms + 3 * 3600000).toISOString().slice(0, 7); }
function saveIncome_(me, vals) {
  var sh = incomeSheet_(), row = findRowById_(sh, me), data = {};
  if (row !== -1) data = parseJson_(readData_(sh, row)) || {};
  var mk = monthKey_(Date.now()), old = data[mk];
  if (!old || old.join(',') !== vals.join(',')) {
    data[mk] = vals;
    var keys = Object.keys(data).sort();
    while (keys.length > 36) delete data[keys.shift()];
    writeData_(sh, row, me, JSON.stringify(data));
  }
  var year = mk.slice(0, 4), out = { months: [], all: 0, year: 0, month: 0 };
  Object.keys(data).sort().forEach(function (k) {
    var v = data[k], t = (v[0] || 0) + (v[1] || 0) + (v[2] || 0);
    out.all += t;
    if (k.slice(0, 4) === year) out.year += t;
    if (k === mk) out.month = t;
    out.months.push({ m: k, i: v[0] || 0, b: v[1] || 0, x: v[2] || 0, t: v[3] || 0 });
  });
  out.months = out.months.slice(-12);
  out.now = mk;
  return out;
}

// ---------- управление бинаром (только Андрей) ----------
// подарить можно: пришёл к Андрею лично (или уже подарен) и с регистрации прошло меньше GIFT_DAYS дней
function giftable_(B, U, id, now) {
  var x = B.map[id];
  if (!x || !U[id] || !(x.sponsor === OWNER_ID || x.by === 'gift')) return false;
  return U[id].reg > 0 && now - U[id].reg < GIFT_DAYS * 86400000;
}
function admin_(action, p) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var U = usersLite_(), B = loadBin_();
    if (action === 'adm_users') {
      var list = Object.keys(U).map(function (id) {
        var x = B.map[id] || {};
        return { id: id, name: U[id].name, pro: U[id].pro, until: U[id].until, fz: U[id].frozen, sponsor: x.sponsor || '', parent: id === OWNER_ID ? '-' : (x.parent || ''), s: x.side || '' };
      });
      return jsonOut_({ ok: true, list: list });
    }
    if (action === 'adm_gift_list') {
      var gl = [], gnow = Date.now();
      for (var gid in B.map) {
        if (!U[gid] || !giftable_(B, U, gid, gnow)) continue;
        var gx = B.map[gid];
        gl.push({ id: gid, name: U[gid].name, pro: U[gid].pro, reg: U[gid].reg, left: Math.max(1, Math.ceil((U[gid].reg + GIFT_DAYS * 86400000 - gnow) / 86400000)),
                  to: gx.sponsor === OWNER_ID ? '' : gx.sponsor, toName: gx.sponsor === OWNER_ID ? '' : (U[gx.sponsor] ? U[gx.sponsor].name : gx.sponsor),
                  parent: gx.parent, parentName: gx.parent === OWNER_ID ? 'тобой' : (U[gx.parent] ? U[gx.parent].name : gx.parent), s: gx.side,
                  team: legSize_(B, gid, 'L') + legSize_(B, gid, 'R') });
      }
      gl.sort(function (a, b) { return b.reg - a.reg; });
      return jsonOut_({ ok: true, days: GIFT_DAYS, list: gl });
    }
    if (action === 'adm_legs') {   // сколько людей в левой и правой ноге (для «Подарка»)
      var lid = normId_(p.id) || OWNER_ID;
      if (lid !== OWNER_ID && (!U[lid] || !placed_(B, lid))) return jsonOut_({ ok: false, error: 'parent_not_placed' });
      return jsonOut_({ ok: true, id: lid, name: lid === OWNER_ID ? 'Ты' : U[lid].name, L: legSize_(B, lid, 'L'), R: legSize_(B, lid, 'R') });
    }
    if (action === 'adm_kassa') return kassa_();
    var id = normId_(p.id);
    if (!U[id] || id === OWNER_ID) return jsonOut_({ ok: false, error: 'bad_id' });

    if (action === 'adm_gift') {
      var to = normId_(p.to) || OWNER_ID, gs = p.s === 'R' ? 'R' : 'L';
      if (!giftable_(B, U, id, Date.now())) return jsonOut_({ ok: false, error: 'gift_late' });
      if (to !== OWNER_ID && (!U[to] || !placed_(B, to))) return jsonOut_({ ok: false, error: 'parent_not_placed' });
      if (to === id || under_(B, id, to)) return jsonOut_({ ok: false, error: 'loop' });
      var gx2 = B.map[id];
      // сам он со своей командой уезжает: на время поиска места его ветки как будто нет
      if (gx2.parent && B.kids[gx2.parent] && B.kids[gx2.parent][gx2.side] === id) delete B.kids[gx2.parent][gx2.side];
      var gp = bottom_(B, to, gs);
      binarSheet_().getRange(gx2.row, 1, 1, 3).setNumberFormat('@');
      binarSheet_().getRange(gx2.row, 1, 1, 6).setValues([[id, to, gp, gs, Date.now(), 'gift']]);
      return jsonOut_({ ok: true, under: gp === OWNER_ID ? 'тобой' : (U[gp] ? U[gp].name : gp), to: to === OWNER_ID ? '' : U[to].name });
    }
    if (action === 'adm_place') {
      var parent = normId_(p.parent), side = p.s === 'R' ? 'R' : 'L';
      if (!U[parent] || !placed_(B, parent)) return jsonOut_({ ok: false, error: 'parent_not_placed' });
      if (parent === id || under_(B, id, parent)) return jsonOut_({ ok: false, error: 'loop' });
      var busy = B.kids[parent] && B.kids[parent][side];
      if (busy && busy !== id) return jsonOut_({ ok: false, error: 'slot_taken', who: U[busy] ? U[busy].name : busy });
      var sponsor = normId_(p.sponsor) || (B.map[id] && B.map[id].sponsor) || OWNER_ID;
      if (!U[sponsor] || sponsor === id) return jsonOut_({ ok: false, error: 'bad_sponsor' });
      binWrite_(B, id, sponsor, parent, side, OWNER_ID);
      return jsonOut_({ ok: true });
    }
    if (action === 'adm_unplace') {
      var kk = B.kids[id] || {};
      if (kk.L || kk.R) return jsonOut_({ ok: false, error: 'has_kids' });
      if (!B.map[id]) return jsonOut_({ ok: true });
      binWrite_(B, id, B.map[id].sponsor, '', B.map[id].side, OWNER_ID);
      return jsonOut_({ ok: true });
    }
    if (action === 'adm_freeze') {
      var props = PropertiesService.getScriptProperties();
      var since = Number(props.getProperty('FROZEN_' + id) || 0);
      if (String(p.on) === '1') { if (!since) props.setProperty('FROZEN_' + id, String(Date.now())); }
      else if (since) {   // разморозка: срок заморозки помним, чтобы расчёт за те дни не поменялся
        var log = fzLog_(props.getProperty('FZLOG_' + id));
        log.push([since, Date.now()]);
        props.setProperty('FZLOG_' + id, JSON.stringify(log));
        props.deleteProperty('FROZEN_' + id);
      }
      return jsonOut_({ ok: true });
    }
    if (action === 'adm_pays') return admPays_(id);
    if (action === 'adm_kop') return admKop_(id);
    if (action === 'adm_kop_open') return admKopOpen_(id, p);
    if (action === 'adm_refund') return admRefund_(U, id, p);
    if (action === 'adm_pro') {
      var from = Math.max(Date.now(), U[id].until || 0), until = 0;
      if (p.mode === 'forever') until = OWNER_PAID_UNTIL;
      if (p.mode === 'month') until = addMonth_(from);
      if (p.mode === 'year') { until = from; for (var mi = 0; mi < 12; mi++) until = addMonth_(until); } // Е12: год в подарок команде Full Energy
      var us = usersSheet_();
      us.getRange(U[id].row, 7).setValue(until ? 'pro' : 'free');
      us.getRange(U[id].row, 11).setValue(until || '');
      // подарок: даёт активность, но не продажа (без бонусов и объёма)
      if (until) paymentsSheet_().appendRow(['gift-' + Date.now(), id, '', 0, 'gift', new Date().toISOString(), new Date(until).toISOString(), p.mode === 'month' ? 'E1' : 'E12', 0, 'gift']);
      return jsonOut_({ ok: true, until: until });
    }
    return jsonOut_({ ok: false, error: 'unknown_action' });
  } finally {
    lock.releaseLock();
  }
}

// ---------- исправить место нового (1 раз, в течение часа) ----------
function fixable_(B, me, id, now) {
  var x = B.map[id];
  if (!x || !x.parent || x.sponsor !== me || x.by !== 'link' || x.moved) return false;
  if (!(x.at > 0 && now - x.at < FIX_MS)) return false;
  var k = B.kids[id] || {};
  return !k.L && !k.R;
}
function binFix_(me, p) {
  var id = normId_(p.id), side = p.s === 'R' ? 'R' : 'L';
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var B = loadBin_();
    if (!fixable_(B, me, id, Date.now())) return jsonOut_({ ok: false, error: 'too_late' });
    var parent = bottom_(B, me, side);
    if (parent === id) return jsonOut_({ ok: false, error: 'same' }); // он и так в самом низу этой ноги
    var x = B.map[id];
    binarSheet_().getRange(x.row, 3, 1, 2).setValues([[parent, side]]);
    binarSheet_().getRange(x.row, 7).setValue('1');
    return jsonOut_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// ======================================================================
// ДЕНЬГИ (v18, ТЗ Андрея 26.10.2026). Всё считается из листа payments и дерева binar, ничего не хранится отдельно:
// поменялась нога в течение часа или кто-то оплатил — цифры пересчитаются сами.
//  • Личные: с каждой оплаты лично приглашённого. Первая оплата — всегда пригласившему
//    (активен: % его пакета; неактивен: 10 %, серым до оплаты своей подписки). Вторая и дальше —
//    пригласившему, если он активен в момент оплаты, иначе ближайшему активному выше по приглашениям
//    (а у пригласившего это «упущено»).
//  • Бинар: раз в неделю (пн–вс по Москве) % пакета от слабой ноги. Нужно: активен + лично приглашённый
//    слева и справа (лично = со сжатием: люди неактивного считаются у ближайшего активного выше).
//    Неактивный: объём недели сгорает для него («упущено»). Остаток сильной ноги хранится 13 недель.
//    Потолок в неделю по пакету.
//  • Матчинг: % от бинара поколений лично приглашённых (со сжатием), глубина по рангу. Те же условия, что бинар.
//  • Статусы для человека: sub — серое, нужна подписка; wait — 14 дней ожидания; tax — нужен ИП/НПД;
//    ok — доступно; week — идёт неделя (ещё считается).
// ======================================================================
var PKGS = {
  E1:  { price: 499,  months: 1,  inv: 10, bin: 10, cap: 30000 },
  E6:  { price: 2590,  months: 6,  inv: 20, bin: 15, cap: 60000 },
  E12: { price: 4990, months: 12, inv: 25, bin: 20, cap: 100000 }
};
var PKG_ORDER = { E1: 1, E6: 2, E12: 3 };   // апгрейд: пакет «больше» включается сразу
// Продукты (Андрей 26.10): покупка идёт в личные, бинар и мэтчинг как обычная продажа,
// но подписку не продлевает. Новый продукт: код латиницей → { name, price }.
var PRODUCTS = {
  EYRIE: { name: 'EYRIE by EAGLES', price: 50000 }
};
var FREE_INVITE_PCT = 10;          // бесплатный (неактивный): 10 % только за первую оплату лично приглашённого
var GIFT_DAYS = 13;                 // столько дней после регистрации Андрей может подарить своего личного другому (меньше холда 14 дней)
var HOLD_MS = 14 * 86400000;       // 14 дней «Ожидает подтверждения»
var MIN_WITHDRAW = 1000;            // минимум к выводу
var CARRY_WEEKS = 13;              // остаток сильной ноги живёт 3 месяца
var WEEK_MS = 7 * 86400000, MSK = 3 * 3600000;
var GLOBAL_PCT = 2;                // глобальный бонус: фонд 2 % оборота месяца, поровну всем с рангом от Кондора
var GLOBAL_RANK = 3;               // 0 Сокол, 1 Ястреб, 2 Беркут, 3 Кондор …
var PAY_CAP_PCT = 55;              // защита: выплаты недели не больше 55 % оборота недели; сверх — перенос, не сгорает. 0 = выключено
var MONEY_CACHE_MS = 10 * 60000;   // готовый расчёт живёт 10 минут или до любой оплаты, возврата, заморозки, перестановки

function pkgBySum_(sum) {
  sum = Number(sum) || 0;
  if (sum >= PKGS.E12.price) return 'E12';
  if (sum >= PKGS.E6.price) return 'E6';
  return 'E1';
}
function addMonths_(ms, n) { var d = new Date(ms); d.setMonth(d.getMonth() + n); return d.getTime(); }
// понедельник 00:00 по Москве
function weekStart_(t) {
  var d = new Date(t + MSK), day = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - day * 86400000 - MSK;
}
// начало следующего месяца по Москве для ключа «2026-11»
function monthEnd_(mk) { return Date.UTC(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)), 1) - MSK; }
function num_(v) { return parseFloat(String(v || '0').replace(',', '.')) || 0; }

// Все данные для расчёта. users: { id: { created, until, frozen, fzLog, tax } }, bin: loadBin_(), pays: строки payments.
// Возврат в первые 14 дней: оплаты как не было. Позже: оплата остаётся, у неё ref = { at, sum }.
function moneyData_() {
  var U = {}, d = usersSheet_().getDataRange().getValues(), P = PropertiesService.getScriptProperties().getProperties();
  for (var i = 1; i < d.length; i++) {
    var id = normId_(d[i][0]);
    if (!id) continue;
    U[id] = { created: new Date(d[i][4]).getTime() || 0, until: id === OWNER_ID ? OWNER_PAID_UNTIL : (Number(d[i][10]) || 0),
              frozen: P['FROZEN_' + id] ? (Number(P['FROZEN_' + id]) || 1) : 0, fzLog: fzLog_(P['FZLOG_' + id]),
              tax: String(d[i][15] || ''), name: String(d[i][7] || '').trim() || (String(d[i][1] || '') + ' ' + String(d[i][2] || '')).trim() };
  }
  return { U: U, B: loadBin_(), pays: payRows_() };
}
// оплаты из таблицы; want — только эти плательщики (для карточки), без него — все
function payRows_(want) {
  var pr = paymentsSheet_().getDataRange().getValues(), pays = [];
  for (var j = 1; j < pr.length; j++) {
    var st = String(pr[j][4] || '');
    if (st !== 'success' && st !== 'gift' && st !== 'refund') continue;
    var payer = normId_(pr[j][1]);
    if (!payer || (want && !want[payer])) continue;
    var sum = num_(pr[j][3]), at = new Date(pr[j][5]).getTime() || 0, ref = null;
    if (st === 'refund') {
      var rat = new Date(pr[j][10]).getTime() || 0;
      if (rat - at < HOLD_MS) continue;
      ref = { at: rat, sum: Math.min(sum, num_(pr[j][11])) };
    }
    pays.push({ id: String(pr[j][0] || ''), payer: payer, sum: st === 'gift' ? 0 : sum, gift: st === 'gift',
                at: at, pkg: String(pr[j][7] || '') || pkgBySum_(sum), months: Number(pr[j][8]) || 0,
                prod: String(pr[j][9] || '') === 'prod', ref: ref,
                until: new Date(pr[j][6]).getTime() || 0 });
  }
  return pays;
}
// пакет и срок прямо сейчас для нескольких людей: { id: { pkg:'E6', till: ms } }, '' — не активен
function pkgNow_(U, ids) {
  var want = {}, Ul = {}, now = Date.now(), out = {};
  ids.forEach(function (i) { if (i && U[i]) { want[i] = 1; Ul[i] = { until: U[i].until, frozen: U[i].frozen ? 1 : 0, fzLog: [] }; } });
  var D = { U: Ul, pays: payRows_(want) }, A = activity_(D);
  for (var i in want) {
    var pk = pkgAt_(D, A, i, now), till = 0;
    (A[i] || []).forEach(function (x) { if (x.from <= now && now < x.to) till = x.to; });
    out[i] = { pkg: pk, till: i === OWNER_ID ? OWNER_PAID_UNTIL : (pk ? till : 0) };
  }
  return out;
}

// Периоды активности каждого: из оплат и подарков. Андрей активен всегда (E12).
// Продление: новый срок встаёт после старого. Апгрейд (пакет больше текущего): новый пакет сразу,
// срок = оставшиеся дни + новый пакет. Поздний возврат: подписка кончается в день возврата.
function activity_(D) {
  var A = {}, by = {};
  D.pays.slice().sort(function (a, b) { return a.at - b.at; }).forEach(function (p) { if (!p.prod) (by[p.payer] = by[p.payer] || []).push(p); });
  for (var id in D.U) {
    var list = [], end = 0;
    (by[id] || []).forEach(function (p) {
      var pk = PKGS[p.pkg] ? p.pkg : 'E1', cur = list[list.length - 1], from, to;
      if (cur && !p.gift && cur.from <= p.at && p.at < cur.to && PKG_ORDER[pk] > PKG_ORDER[cur.pkg]) {
        from = p.at;
        to = p.until && p.until > end ? p.until : addMonths_(end, p.months || PKGS[pk].months);
        cur.to = p.at;
      } else {
        from = Math.max(p.at, end);
        to = p.until && p.until > from ? p.until : addMonths_(from, p.months || PKGS[pk].months);
      }
      if (p.ref && p.ref.at < to) to = Math.max(from, p.ref.at);
      list.push({ from: from, to: to, pkg: pk });
      end = to;
    });
    // PRO был выдан до v18 без записи в payments
    if (!list.length && D.U[id].until > 0) list.push({ from: D.U[id].created || 0, to: D.U[id].until, pkg: 'E1' });
    A[id] = list;
  }
  return A;
}
// сроки прошлых заморозок: [[с, по], …]
function fzLog_(s) { var x = parseJson_(s || ''); return Array.isArray(x) ? x : []; }
// заморожен ли в момент t: заморозка действует с даты заморозки, прошлое не трогает
function frozenAtT_(u, t) {
  if (u.frozen && t >= u.frozen) return true;
  var l = u.fzLog || [];
  for (var i = 0; i < l.length; i++) if (l[i][0] <= t && t < l[i][1]) return true;
  return false;
}
function pkgAt_(D, A, id, t) {
  if (id === OWNER_ID) return 'E12';
  if (!D.U[id] || frozenAtT_(D.U[id], t)) return '';
  var l = A[id] || [];
  for (var i = l.length - 1; i >= 0; i--) if (l[i].from <= t && t < l[i].to) return l[i].pkg;
  return '';
}
function activeAt_(D, A, id, t) { return !!pkgAt_(D, A, id, t); }
function sponsorOf_(D, id) { var x = D.B.map[id]; return x && x.sponsor ? x.sponsor : (id === OWNER_ID ? '' : OWNER_ID); }
// ближайший активный выше по приглашениям (сжатие)
function upActive_(D, A, from, t) {
  var s = from, g = 0;
  while (s && s !== OWNER_ID && !activeAt_(D, A, s, t) && g++ < 100000) s = sponsorOf_(D, s);
  return s || OWNER_ID;
}
// чей он «лично приглашённый» для расчёта в момент t
function effSponsorAt_(D, A, id, t) { return upActive_(D, A, sponsorOf_(D, id), t); }
// номера обхода дерева: человек в левой ноге y, если его номер внутри отрезка левого ребёнка y
function tour_(B) {
  var tin = {}, tout = {}, n = 0, st = [[OWNER_ID, 0]];
  while (st.length) {
    var top = st[st.length - 1], id = top[0];
    if (top[1] === 0) {
      top[1] = 1; tin[id] = n++;
      var k = B.kids[id] || {};
      if (k.R && tin[k.R] === undefined) st.push([k.R, 0]);
      if (k.L && tin[k.L] === undefined) st.push([k.L, 0]);
    } else { tout[id] = n; st.pop(); }
  }
  return { tin: tin, tout: tout };
}
// объём в ноге с учётом возврата: возврат вычитается из накопленного, старое первым
function pushVol_(list, w, v) {
  if (v > 0) { list.push({ w: w, v: v }); return; }
  if (!(v < 0)) return;
  var debt = -v;
  for (var i = 0; i < list.length && debt > 0; i++) if (list[i].v > 0) { var t = Math.min(list[i].v, debt); list[i].v -= t; debt -= t; }
  if (debt > 0) list.push({ w: w, v: -debt });
}

function calcMoney_(D, now) {
  var A = activity_(D), E = [], M = [];   // E — начисления, M — упущенное
  var pays = D.pays.filter(function (p) { return !p.gift && p.sum > 0 && p.at <= now; }).sort(function (a, b) { return a.at - b.at; });
  var refs = pays.filter(function (p) { return p.ref && p.ref.at <= now && p.ref.sum > 0; }).sort(function (a, b) { return a.ref.at - b.ref.at; });

  // ---- личные ----
  var cnt = {}, invOf = {};
  pays.forEach(function (p, pi) {
    var n = cnt[p.payer] = (cnt[p.payer] || 0) + 1;
    var s = sponsorOf_(D, p.payer), e = null;
    if (!s) return;
    var pk = pkgAt_(D, A, s, p.at);
    if (n === 1) {
      var pct = pk ? PKGS[pk].inv : FREE_INVITE_PCT;
      e = { to: s, k: 'inv', sum: Math.round(p.sum * pct) / 100, at: p.at, from: p.payer, pct: pct, first: 1, grey: pk ? 0 : 1 };
    } else if (pk) {
      e = { to: s, k: 'inv', sum: Math.round(p.sum * PKGS[pk].inv) / 100, at: p.at, from: p.payer, pct: PKGS[pk].inv };
    } else {
      var a = upActive_(D, A, s, p.at), apk = pkgAt_(D, A, a, p.at);
      e = { to: a, k: 'inv', sum: Math.round(p.sum * PKGS[apk].inv) / 100, at: p.at, from: p.payer, pct: PKGS[apk].inv, up: s };
      M.push({ to: s, k: 'inv', sum: Math.round(p.sum * FREE_INVITE_PCT) / 100, at: p.at, from: p.payer });
    }
    E.push(e); invOf[pi] = e; p._i = pi;
  });
  // поздний возврат: личный бонус с этой оплаты уменьшается в той же доле и вычитается из будущих начислений
  refs.forEach(function (p) {
    var e = invOf[p._i];
    if (e) E.push({ to: e.to, k: 'ret', sum: -Math.round(e.sum * p.ref.sum / p.sum * 100) / 100, at: p.ref.at, from: p.payer, pct: e.pct });
  });

  // ---- бинар и матчинг по неделям ----
  var B = D.B, T = tour_(B);
  function legOf(y, id) {
    var k = B.kids[y], i = T.tin[id];
    if (!k || i === undefined) return '';
    if (k.L && T.tin[k.L] <= i && i < T.tout[k.L]) return 'L';
    if (k.R && T.tin[k.R] <= i && i < T.tout[k.R]) return 'R';
    return '';
  }
  if (!pays.length) return { E: E, M: M, A: A, weeks: {} };
  var w0 = weekStart_(pays[0].at), wNow = weekStart_(now), pi = 0, ri = 0;
  var carry = {};   // y -> { L: [{w, v}], R: [...] }
  var weeks = {};   // для экрана: последняя неделя у каждого { L, R }
  var MV = {}, turnW = {}, turnM = {};   // слабая нога за месяц (ранг), оборот недели и месяца
  function addVol(id, sum, V, mk) {
    var mm = MV[mk] = MV[mk] || {}, cur = id, g = 0;
    while (B.map[cur] && B.map[cur].parent && g++ < 1000000) {
      var y = B.map[cur].parent, sd = B.map[cur].side;
      (V[y] = V[y] || { L: 0, R: 0 })[sd] += sum;
      (mm[y] = mm[y] || { L: 0, R: 0 })[sd] += sum;
      cur = y;
    }
  }
  for (var w = w0; w <= wNow; w += WEEK_MS) {
    var wEnd = w + WEEK_MS, tEnd = Math.min(wEnd, now) - 1, open = wEnd > now, V = {};
    while (pi < pays.length && pays[pi].at < wEnd) {
      var p = pays[pi++], mk = monthKey_(p.at);
      addVol(p.payer, p.sum, V, mk);
      turnW[w] = (turnW[w] || 0) + p.sum; turnM[mk] = (turnM[mk] || 0) + p.sum;
    }
    while (ri < refs.length && refs[ri].ref.at < wEnd) {
      var q = refs[ri++], mk2 = monthKey_(q.ref.at);
      addVol(q.payer, -q.ref.sum, V, mk2);
      turnW[w] = (turnW[w] || 0) - q.ref.sum; turnM[mk2] = (turnM[mk2] || 0) - q.ref.sum;
    }
    // лично приглашённые со сжатием на конец недели
    var first = {}, kids = {};
    for (var id in B.map) {
      if (!B.map[id].parent || !D.U[id]) continue;
      var es = effSponsorAt_(D, A, id, tEnd);
      (kids[es] = kids[es] || []).push(id);
      var lg = legOf(es, id);
      if (lg) { first[es] = first[es] || {}; first[es][lg] = 1; }
    }
    var ys = {};
    for (var y1 in V) ys[y1] = 1;
    for (var y2 in carry) ys[y2] = 1;
    var binPay = {};
    for (var y in ys) {
      if (y === OWNER_ID) continue;
      var c = carry[y] = carry[y] || { L: [], R: [] }, v = V[y] || { L: 0, R: 0 };
      ['L', 'R'].forEach(function (sd) { c[sd] = c[sd].filter(function (x) { return x.w > w - CARRY_WEEKS * WEEK_MS && x.v !== 0; }); });
      if (!c.L.length && !c.R.length && !V[y]) { delete carry[y]; continue; }
      var pk2 = pkgAt_(D, A, y, tEnd);
      function tot(sd) { return c[sd].reduce(function (s, x) { return s + x.v; }, 0) + v[sd]; }
      var L = tot('L'), R = tot('R'), m = Math.min(L, R);
      weeks[y] = { w: w, L: L, R: R, open: open };
      if (!pk2) {   // неактивен: объём этой недели ему не идёт
        if (Math.min(v.L, v.R) > 0) M.push({ to: y, k: 'bin', sum: Math.round(Math.min(v.L, v.R) * FREE_INVITE_PCT) / 100, at: tEnd, w: w });
        continue;
      }
      var qual = first[y] && first[y].L && first[y].R;
      if (!open) { pushVol_(c.L, w, v.L); pushVol_(c.R, w, v.R); }
      if (!qual || !(m > 0)) continue;
      var pay = Math.min(Math.round(m * PKGS[pk2].bin) / 100, PKGS[pk2].cap);
      binPay[y] = pay;
      E.push({ to: y, k: 'bin', sum: pay, at: tEnd, w: w, week: open ? 1 : 0, pct: PKGS[pk2].bin });
      if (!open) ['L', 'R'].forEach(function (sd) {   // оплаченное списываем с обеих ног, старое первым
        var left = m;
        c[sd].forEach(function (x) { var t = Math.min(x.v, left); x.v -= t; left -= t; });
      });
    }
    // матчинг: ранг по слабой ноге за месяц
    var mmNow = MV[monthKey_(tEnd)] || {};
    for (var mY in kids) {
      if (mY === OWNER_ID || !first[mY] || !first[mY].L || !first[mY].R || !activeAt_(D, A, mY, tEnd)) continue;
      var mv = mmNow[mY], rk = mv ? rankIdx_(Math.min(mv.L, mv.R)) : -1;
      if (rk < 0) continue;
      var pcts = MATCH_PCT[rk], gen = kids[mY] || [], sum = 0;
      for (var lv = 0; lv < pcts.length && gen.length; lv++) {
        var nx = [];
        gen.forEach(function (g) { sum += (binPay[g] || 0) * pcts[lv] / 100; var kk = kids[g]; if (kk) for (var z = 0; z < kk.length; z++) nx.push(kk[z]); });
        gen = nx;
      }
      if (sum > 0) E.push({ to: mY, k: 'mat', sum: Math.round(sum * 100) / 100, at: tEnd, w: w, week: open ? 1 : 0 });
    }
  }

  // ---- глобальный бонус: 2 % оборота месяца поровну всем активным с рангом от Кондора ----
  if (GLOBAL_PCT > 0) Object.keys(turnM).sort().forEach(function (mk) {
    var mEnd = monthEnd_(mk), t = Math.min(mEnd, now) - 1, fund = (turnM[mk] || 0) * GLOBAL_PCT / 100, mm = MV[mk] || {}, who = [];
    if (!(fund > 0)) return;
    for (var gy in mm) if (gy !== OWNER_ID && rankIdx_(Math.min(mm[gy].L, mm[gy].R)) >= GLOBAL_RANK && activeAt_(D, A, gy, t)) who.push(gy);
    if (!who.length) return;
    var each = Math.floor(fund / who.length * 100) / 100;
    who.forEach(function (gy) { E.push({ to: gy, k: 'glob', sum: each, at: t, week: mEnd > now ? 1 : 0, pct: GLOBAL_PCT, n: who.length }); });
  });

  if (PAY_CAP_PCT > 0) capWeeks_(E, turnW, now);
  return { E: E, M: M, A: A, weeks: weeks, turnW: turnW, turnM: turnM, MV: MV };
}

// Защита системы: все выплаты партнёрам за неделю не больше PAY_CAP_PCT % оборота недели.
// Если насчитано больше, ничего не сгорает: каждому платится одна и та же доля, остаток переходит
// на следующую неделю и выплачивается первым, как только оборот позволяет. Андрею (11111) не режем.
function capWeeks_(E, turnW, now) {
  var byW = {}, wNow = weekStart_(now), back = {};
  E.forEach(function (e) {
    if (e.to === OWNER_ID || e.week || !(e.sum > 0)) return;
    var w = e.w != null ? e.w : weekStart_(e.at);
    if (w < wNow) (byW[w] = byW[w] || []).push(e);
  });
  var ws = {};
  Object.keys(byW).forEach(function (w) { ws[w] = 1; });
  Object.keys(turnW).forEach(function (w) { if (Number(w) < wNow) ws[w] = 1; });
  Object.keys(ws).map(Number).sort(function (a, b) { return a - b; }).forEach(function (w) {
    var list = byW[w] || [], need = 0, tEnd = w + WEEK_MS - 1;
    list.forEach(function (e) { need += e.sum; });
    for (var b in back) need += back[b].sum;
    if (!(need > 0)) return;
    var budget = Math.max(0, (turnW[w] || 0) * PAY_CAP_PCT / 100), r = need <= budget ? 1 : budget / need;
    for (var b2 in back) {   // сначала отдаём перенесённое раньше
      var x = back[b2], rel = r >= 1 ? x.sum : Math.floor(x.sum * r * 100) / 100;
      if (rel > 0) { E.push({ to: b2, k: 'move', sum: rel, at: tEnd, hold: x.at }); x.sum = Math.round((x.sum - rel) * 100) / 100; }
      if (!(x.sum > 0)) delete back[b2];
    }
    if (r >= 1) return;
    list.forEach(function (e) {
      var keep = Math.floor(e.sum * r * 100) / 100, cut = Math.round((e.sum - keep) * 100) / 100;
      if (!(cut > 0)) return;
      e.full = e.sum; e.sum = keep;
      var y = back[e.to] = back[e.to] || { sum: 0, at: e.at };
      y.sum = Math.round((y.sum + cut) * 100) / 100; y.at = Math.min(y.at, e.at);
    });
  });
  for (var b3 in back) E.push({ to: b3, k: 'move', sum: back[b3].sum, at: now, hold: back[b3].at, next: 1 });
}

// Готовый расчёт на всю систему: один на всех, пока данные не поменялись (MoneyCache даёт index.js).
// Без кэша расчёт на 10 000 человек занимал бы секунды на каждое открытие «Моей команды».
function moneyCalc_(now) {
  var D = moneyData_(), C = typeof MoneyCache !== 'undefined' ? MoneyCache : null, key = '', R = null;
  if (C) {
    var parts = [Math.floor(now / MONEY_CACHE_MS)];
    D.pays.forEach(function (p) { parts.push(p.id + ':' + p.payer + ':' + p.sum + ':' + p.at + ':' + p.until + ':' + p.pkg + (p.ref ? ':r' + p.ref.at + ':' + p.ref.sum : '') + (p.gift ? ':g' : '')); });
    for (var b in D.B.map) { var x = D.B.map[b]; parts.push(b + '>' + x.sponsor + '>' + x.parent + x.side); }
    for (var u in D.U) { var uu = D.U[u]; if (uu.frozen || uu.fzLog.length || uu.until) parts.push(u + '#' + uu.frozen + '#' + JSON.stringify(uu.fzLog) + '#' + uu.until); }
    key = C.key(parts.join('|'));
    R = C.get(key);
  }
  if (!R) { R = calcMoney_(D, now); if (C) C.put(key, R); }
  return { D: D, R: R };
}

// Кабинет: суммы по статусам, упущено за месяц, последние начисления
function moneyFor_(me, now) {
  var X = moneyCalc_(now), D = X.D, R = X.R, A = R.A;
  var activeNow = activeAt_(D, A, me, now), tax = me === OWNER_ID ? 'owner' : (D.U[me] ? D.U[me].tax : '');
  var conf = [], tot = { sub: 0, wait: 0, tax: 0, ok: 0, week: 0, next: 0, kop: 0 }, by = { inv: 0, bin: 0, mat: 0, glob: 0 }, items = [], mk = monthKey_(now), month = { inv: 0, bin: 0, mat: 0, glob: 0 };
  R.E.forEach(function (e) {
    if (e.to !== me) return;
    var till = (e.hold || e.at) + HOLD_MS;
    // заработанное, пока был активен, остаётся его и после конца подписки; серое — только 10 % за первую оплату,
    // полученные бесплатным: их заберёт, когда оплатит подписку
    var st = e.next ? 'next' : e.week ? 'week' : e.grey && !activeNow ? 'sub' : e.sum > 0 && now < till ? 'wait' : !tax ? 'tax' : 'ok';
    tot[st] += e.sum;
    if (st === 'ok' || st === 'tax') conf.push({ at: e.at, sum: e.sum });
    var kk = e.k === 'ret' ? 'inv' : e.k, full = e.full != null ? e.full : e.sum;
    if (kk !== 'move') {   // по видам: насчитано целиком (перенос — та же сумма, только позже)
      if (!e.week) by[kk] += full;
      if (monthKey_(e.at) === mk) month[kk] += full;
    }
    items.push({ k: e.k, sum: e.sum, full: e.full || 0, at: e.at, st: st, till: till, from: e.from ? (D.U[e.from] ? D.U[e.from].name : e.from) : '', first: e.first ? 1 : 0, pct: e.pct || 0 });
  });
  var missMonth = 0;
  R.M.forEach(function (m) { if (m.to === me && monthKey_(m.at) === mk) missMonth += m.sum; });
  items.sort(function (a, b) { return b.at - a.at; });
  for (var k in tot) tot[k] = Math.round(tot[k] * 100) / 100;
  var kop = kopApply_(me, tot, conf, now);   // копилка мечты: отложенное не выводится до даты
  for (var k2 in month) month[k2] = Math.round(month[k2] * 100) / 100;
  var wk = R.weeks[me] || null;
  return { active: activeNow, pkg: pkgAt_(D, A, me, now), tax: tax, totals: tot, byKind: by, month: month,
           missMonth: Math.round(missMonth * 100) / 100, items: items.slice(0, 60), week: wk,
           canWithdraw: WITHDRAW_OPEN && !!tax && tot.ok >= MIN_WITHDRAW, minWithdraw: MIN_WITHDRAW, kop: kop };
}

// ---------- возврат (кнопка в «Управлении», только Андрей) ----------
// Сами деньги возвращаются в Prodamus. Здесь отмечаем возврат, чтобы пересчитались бонусы и подписка.
//  • в первые 14 дней: оплаты как не было (бонусы ещё «ожидают» — вычитать нечего), подписка короче на этот пакет;
//  • позже: возврат за неиспользованные дни (или sum, если передан), бонусы с оплаты уменьшаются в той же доле
//    и вычитаются из будущих начислений; подписка кончается сегодня.
function refundInfo_(row, now) {
  var sum = num_(row[3]), at = new Date(row[5]).getTime() || 0, until = new Date(row[6]).getTime() || 0, months = Number(row[8]) || 0;
  var early = now - at < HOLD_MS, part = sum;
  if (String(row[9] || '') !== 'prod' && until > 0 && months > 0) {   // 02.11: всегда по неиспользованным дням
    var start = addMonths_(until, -months);
    part = Math.round(sum * Math.max(0, Math.min(1, (until - Math.max(now, start)) / (until - start))) * 100) / 100;
  }
  return { sum: sum, at: at, until: until, months: months, early: early, part: part };
}
function admRefund_(U, id, p) {
  var ps = paymentsSheet_(), pd = ps.getDataRange().getValues(), now = Date.now(), order = String(p.order || '');
  for (var i = 1; i < pd.length; i++) {
    if (String(pd[i][0]) !== order || normId_(pd[i][1]) !== id) continue;
    if (String(pd[i][4]) !== 'success') return jsonOut_({ ok: false, error: 'not_refundable' });
    var r = refundInfo_(pd[i], now), sum = p.sum ? Math.min(r.sum, num_(p.sum)) : r.part;
    ps.getRange(i + 1, 5).setValue('refund');
    ps.getRange(i + 1, 11).setValue(new Date(now).toISOString());
    ps.getRange(i + 1, 12).setValue(sum);
    if (String(pd[i][9] || '') !== 'prod' && U[id]) {   // подписка: убираем оплаченный срок
      var until = U[id].until || 0;
      until = Math.min(until, now);   // 02.11: вернули неиспользованные дни — подписка кончается сегодня
      var us = usersSheet_();
      us.getRange(U[id].row, 7).setValue(until > now ? 'pro' : 'free');
      us.getRange(U[id].row, 11).setValue(until > now ? until : '');
    }
    return jsonOut_({ ok: true, early: r.early, sum: sum });
  }
  return jsonOut_({ ok: false, error: 'no_payment' });
}
function admPays_(id) {
  var pd = paymentsSheet_().getDataRange().getValues(), now = Date.now(), list = [];
  for (var i = 1; i < pd.length; i++) {
    if (normId_(pd[i][1]) !== id) continue;
    var st = String(pd[i][4] || '');
    if (st !== 'success' && st !== 'refund') continue;
    var r = refundInfo_(pd[i], now);
    list.push({ order: String(pd[i][0] || ''), sum: r.sum, at: r.at, pkg: String(pd[i][7] || ''), prod: String(pd[i][9] || '') === 'prod',
                st: st, early: r.early, part: st === 'refund' ? num_(pd[i][11]) : r.part });
  }
  list.sort(function (a, b) { return b.at - a.at; });
  return jsonOut_({ ok: true, list: list });
}



// ===================== KARTY EAGLES v1 (2026-11-07) =====================
// New "Karty" page /karty.html: deck of maps, islands, tasks. Stored as one JSON in sheet karty_<ID>.
// This block is only APPENDED to the end of server.js. Old code and the old map (map_<ID>) are not changed.
// Entry goes through the existing POST type=map_save with an extra field "karty":
//   karty=get              -> { ok, data|null, at, old }  old = the person's old map (for one-time import) while no new data exists
//   karty=save, data=JSON  -> { ok, at }  errors: bad_json, too_big
// Without the "karty" field map_save works exactly as before.
// FREE (Andrey 2026-11-07): 1 map and 3 islands on it ("Dela na segodnya" is there by default). PRO: no limit.
// Someone who already has more (old map imported, or PRO ended) keeps it, but cannot add more.
var KARTY_FREE_MAPS = 1, KARTY_FREE_ISL = 3;
var KARTY_MAX_LEN = 600000, KARTY_TEXT = 20000, KARTY_STR = 2000, KARTY_DEPTH = 40, KARTY_NODES = 20000;
function kartySheet_(id) { return getSheet_('karty_' + id, ['Json', 'At']); }
// Cleaning: plain values only, short keys, text up to 2000 chars, pictures and links only http(s).
function kartyClean_(v) {
  var left = KARTY_NODES;
  function go(x, depth, key) {
    if (--left < 0 || depth > KARTY_DEPTH) return undefined;
    if (x === null || typeof x === 'boolean') return x;
    if (typeof x === 'number') return isFinite(x) ? x : 0;
    if (typeof x === 'string') {
      var s = x.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, /^text$/.test(key) ? KARTY_TEXT : KARTY_STR);
      if (key === 'cover' || key === 'img' || key === 'url') return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : '';
      return s;
    }
    if (Array.isArray(x)) { var a = []; for (var i = 0; i < x.length && left > 0; i++) { var r = go(x[i], depth + 1, ''); if (r !== undefined) a.push(r); } return a; }
    if (typeof x === 'object') {
      var o = {};
      for (var k in x) { if (!Object.prototype.hasOwnProperty.call(x, k) || !/^[A-Za-z_][A-Za-z0-9_]{0,15}$/.test(k)) continue; var y = go(x[k], depth + 1, k); if (y !== undefined) o[k] = y; }
      return o;
    }
    return undefined;
  }
  return go(v, 0, '');
}
function kartyPro_(me) { return active_(usersLite_(), me) || me === OWNER_ID; }
function kartyCount_(o) {   // maps and the biggest number of top-level islands on one map
  var maps = Array.isArray(o && o.maps) ? o.maps : [], isl = 0;
  maps.forEach(function (m) { var k = (m && m.data && Array.isArray(m.data.kids)) ? m.data.kids : []; isl = Math.max(isl, k.filter(function (x) { return x && Array.isArray(x.kids); }).length); });
  return { maps: maps.length, isl: isl };
}
function kartyGet_(me) {
  var d = kartySheet_(me).getDataRange().getValues(), data = null, old = null;
  if (d.length > 1 && d[1][0]) { try { data = JSON.parse(String(d[1][0])); } catch (e) { data = null; } }
  if (!data) {   // no new maps yet: send the old map, the page imports it into the map "EAGLES"
    var od = mapSheet_(me).getDataRange().getValues();
    if (od.length > 1 && od[1][0]) { try { old = JSON.parse(String(od[1][0])); } catch (e2) { old = null; } }
  }
  var pro = kartyPro_(me);
  return jsonOut_({ ok: true, data: data, at: d.length > 1 ? Number(d[1][1]) || 0 : 0, old: old, tmax: KARTY_TEXT, pro: pro, lim: pro ? null : { maps: KARTY_FREE_MAPS, isl: KARTY_FREE_ISL } });
}
function kartySave_(me, p) {
  var raw = String(p.data || '');
  if (raw.length > KARTY_MAX_LEN) return jsonOut_({ ok: false, error: 'too_big' });
  var m; try { m = JSON.parse(raw); } catch (e) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  if (!m || typeof m !== 'object' || !Array.isArray(m.maps) || !m.maps.length) return jsonOut_({ ok: false, error: 'bad_json' });
  var json = JSON.stringify(kartyClean_(m)), at = Date.now();
  if (json.length > KARTY_MAX_LEN) return jsonOut_({ ok: false, error: 'too_big' });
  var sh = kartySheet_(me), d = sh.getDataRange().getValues();
  if (!kartyPro_(me)) {
    var was = { maps: 0, isl: 0 };
    if (d.length > 1 && d[1][0]) { try { was = kartyCount_(JSON.parse(String(d[1][0]))); } catch (e3) {} }
    else { var od = mapSheet_(me).getDataRange().getValues(); if (od.length > 1 && od[1][0]) { try { was = { maps: 1, isl: (JSON.parse(String(od[1][0])).n || []).length }; } catch (e4) {} } }
    var now = kartyCount_(m);
    if (now.maps > Math.max(KARTY_FREE_MAPS, was.maps) || now.isl > Math.max(KARTY_FREE_ISL, was.isl)) return jsonOut_({ ok: false, error: 'limit', maps: KARTY_FREE_MAPS, isl: KARTY_FREE_ISL });
  }
  if (d.length > 1) sh.getRange(2, 1, 1, 2).setValues([[json, at]]); else sh.appendRow([json, at]);
  return jsonOut_({ ok: true, at: at });
}
mapSave_ = (function (orig) {
  return function (me, p) {
    var k = String((p && p.karty) || '');
    if (k === 'get') return kartyGet_(me);
    if (k === 'save') return kartySave_(me, p);
    return orig(me, p);
  };
})(mapSave_);
// =================== end of block KARTY EAGLES v1 ===================

// ===================== EYE FRIENDS v1 (2026-11-16) =====================
// Друзья EAGLES для видеозвонков EYE. Правило Андрея 16.11.2026: звонить можно ТОЛЬКО взаимным друзьям,
// независимо от своей структуры и перелива. Дружба = запрос + подтверждение второго человека.
// У каждого человека свой лист fr_<ID>: Peer (с кем), State, At (когда).
// State: out — я отправил запрос, in — мне прислали запрос, yes — друзья, пусто — ничего.
// Действия (GET, нужен sess):
//   fr_list                 → { friends:[], incoming:[], outgoing:[] }  (каждый: id, name, av, pro, at)
//   fr_add&with=ID          → отправить запрос; если он уже звал меня — сразу друзья. { state: 'out'|'yes' }
//   fr_del&with=ID          → отменить запрос / отклонить / убрать из друзей (у обоих). { state: '' }
//   fr_state&with=ID        → { state, peer }
//   eye_check&with=ID       → для сервера звонков EYE: { can, why, friend, peer }
// Блок вставляется в самый конец server.js; в диспетчер добавлена одна строка после chat_open.
var FR_NEW_PER_DAY = 20, FR_MAX = 500, EYE_NEED_PRO = false;
function frSheet_(id) { return getSheet_('fr_' + id, ['Peer', 'State', 'At']); }
function frRow_(id, peer) {
  var sh = frSheet_(id), d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (normId_(d[i][0]) === peer) return { sh: sh, row: i + 1, st: String(d[i][1] || ''), at: Number(d[i][2]) || 0 };
  return { sh: sh, row: 0, st: '', at: 0 };
}
function frPut_(x, peer, st, at) {
  if (x.row) x.sh.getRange(x.row, 1, 1, 3).setValues([[peer, st, at]]);
  else if (st) x.sh.appendRow([peer, st, at]);
}
function frPeer_(U, id) {
  return { id: id, name: U[id] ? U[id].name : id, av: U[id] ? U[id].av : '', pro: active_(U, id) };
}
// заблокировал ли кто-то из двоих другого в «Сообщениях»
function frBlock_(me, peer) {
  return String(inboxRow_(me, peer).v[5]) === '1' || String(inboxRow_(peer, me).v[5]) === '1';
}
function frList_(me, U) {
  var d = frSheet_(me).getDataRange().getValues(), out = { friends: [], incoming: [], outgoing: [] };
  for (var i = 1; i < d.length; i++) {
    var id = normId_(d[i][0]), st = String(d[i][1] || '');
    if (!id || !U[id] || U[id].frozen) continue;
    var x = frPeer_(U, id); x.at = Number(d[i][2]) || 0;
    if (st === 'yes') out.friends.push(x); else if (st === 'in') out.incoming.push(x); else if (st === 'out') out.outgoing.push(x);
  }
  out.friends.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  out.incoming.sort(function (a, b) { return b.at - a.at; });
  out.outgoing.sort(function (a, b) { return b.at - a.at; });
  return jsonOut_({ ok: true, friends: out.friends, incoming: out.incoming, outgoing: out.outgoing });
}
function friends_(action, me, p) {
  var U = usersLite_();
  if (action === 'fr_list') return frList_(me, U);
  var peer = normId_(p['with']);
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  if (action === 'fr_state') return jsonOut_({ ok: true, state: frRow_(me, peer).st, peer: frPeer_(U, peer) });
  if (action === 'eye_check') {
    var fr = frRow_(me, peer).st === 'yes', pro = active_(U, me) || me === OWNER_ID;
    var why = !fr ? 'not_friends' : (U[peer].frozen || frBlock_(me, peer)) ? 'blocked' : (EYE_NEED_PRO && !pro) ? 'need_pro' : '';
    return jsonOut_({ ok: true, can: !why, why: why, friend: fr, peer: frPeer_(U, peer) });
  }
  if (action !== 'fr_add' && action !== 'fr_del') return jsonOut_({ ok: false, error: 'unknown_action' });
  frSheet_(me); frSheet_(peer);                // листы создаются ДО замка (getSheet_ сам берёт замок)
  var blocked = U[peer].frozen || frBlock_(me, peer);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var now = Date.now(), mine = frRow_(me, peer), theirs = frRow_(peer, me);
    if (action === 'fr_del') {
      frPut_(mine, peer, '', now);
      if (theirs.st) frPut_(theirs, me, '', now);
      return jsonOut_({ ok: true, state: '' });
    }
    if (mine.st === 'yes' || mine.st === 'out') return jsonOut_({ ok: true, state: mine.st });
    if (blocked) return jsonOut_({ ok: false, error: 'blocked' });
    if (mine.st === 'in') {
      frPut_(mine, peer, 'yes', now); frPut_(theirs, me, 'yes', now);
      return jsonOut_({ ok: true, state: 'yes' });
    }
    if (me !== OWNER_ID) {
      var cache = CacheService.getScriptCache(), ck = 'FRN_' + me + '_' + new Date(now + 3 * 3600000).toISOString().slice(0, 10);
      var used = Number(cache.get(ck) || 0);
      if (used >= FR_NEW_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
      cache.put(ck, String(used + 1), 21600);
      if (frSheet_(me).getDataRange().getValues().length > FR_MAX) return jsonOut_({ ok: false, error: 'too_many' });
    }
    frPut_(mine, peer, 'out', now); frPut_(theirs, me, 'in', now);
    return jsonOut_({ ok: true, state: 'out' });
  } finally {
    lock.releaseLock();
  }
}
// =================== end of block EYE FRIENDS v1 ===================

// ===================== KANAL POSTS v1 (2026-11-16) =====================
// Огоньки, комментарии и Swoop под постами канала EYRIE (kanal.html). Счётчики общие для всех.
// Правила Андрея 06.11/16.11: гость только смотрит и читает; зарегистрированный — огонёк;
// Pro (и Андрей) — комментарий и Swoop. Пост = канал (ID владельца) + имя поста, например 11111 / klod-k-hromu.
// Листы: kp_act (Ch, Post, Id, Kind l|s|-l, At) и kp_com (Ch, Post, Id, Name, Text, At, Del).
// Действия (GET). Без входа: kp_get, kp_coms. С входом (sess): kp_like, kp_com, kp_swoop, kp_cdel.
//   kp_get&ch=11111&ids=a,b,c      → { posts: { a:{l,c,s,my,sw} } }   (my/sw — только если передан sess)
//   kp_coms&ch=11111&p=a           → { items:[{k,id,name,text,ts,mine}] } (до 200 последних)
//   kp_like&ch=&p=&on=1|0          → { l, my }
//   kp_com&ch=&p=&text=            → { ok, item }   (Pro; до 500 знаков; не чаще 20 в час)
//   kp_swoop&ch=&p=                → { s, sw }      (Pro; один раз на пост)
//   kp_cdel&ch=&p=&k=              → удалить комментарий (автор или владелец канала)
// Свой канал у каждого Pro (Андрей 16.11: «для Pro сразу канал пустой с заготовкой и открывается»):
//   kp_ch&ch=ID                    → { ch:{id,name,av,pro,hello}, posts:[{p,text,url,ts}] } (без входа)
//   kp_add&text=&url=              → новый пост в СВОЁМ канале (Pro; до 2000 знаков; видео — ссылка VK Видео/Rutube/YouTube)
//   kp_del&p=                      → убрать свой пост
//   kp_hello&text=                 → свой текст приветствия (закреплённый первый пост)
// Лист kp_ch: (Ch, Post, Text, Url, At, Del); приветствие хранится как пост 'start'.
// В диспетчер добавлена одна строка рядом с v_open (до проверки входа).
var KP_COM_MAX = 500, KP_COM_PER_HOUR = 20, KP_LIKE_PER_MIN = 30;
function kpActSheet_() { return getSheet_('kp_act', ['Ch', 'Post', 'Id', 'Kind', 'At']); }
function kpChSheet_() { return getSheet_('kp_ch', ['Ch', 'Post', 'Text', 'Url', 'At', 'Del']); }
var KP_TEXT_MAX = 2000, KP_POSTS_PER_DAY = 20;
function kpUrl_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  return /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be))\/[^\s"'<>]{1,300}$/i.test(v) ? v : null;
}
function kpComSheet_() { return getSheet_('kp_com', ['Ch', 'Post', 'Id', 'Name', 'Text', 'At', 'Del']); }
function kpPost_(v) { v = String(v || '').trim().toLowerCase(); return /^[a-z0-9-]{1,40}$/.test(v) ? v : ''; }
function kpCh_(v) { var c = normRef_(v) || OWNER_ID; return validId_(c) ? c : ''; }
function kpRate_(key, max, sec) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), sec);
  return true;
}
function kanalPosts_(action, e, p) {
  var ch = kpCh_(p.ch);
  if (!ch) return jsonOut_({ ok: false, error: 'bad_ch' });
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }

  if (action === 'kp_ch') {
    var UU = usersLite_();
    if (!UU[ch] || UU[ch].frozen) return jsonOut_({ ok: false, error: 'not_found' });
    var rows = kpChSheet_().getDataRange().getValues(), posts = [], hello = '';
    for (var q = 1; q < rows.length; q++) {
      if (String(rows[q][0]) !== ch || String(rows[q][5]) === '1') continue;
      var pt = { p: String(rows[q][1]), text: String(rows[q][2] || '').replace(/^'/, ''), url: String(rows[q][3] || ''), ts: Number(rows[q][4]) || 0 };
      if (pt.p === 'start') hello = pt.text; else posts.push(pt);
    }
    posts.sort(function (x, y) { return y.ts - x.ts; });
    return jsonOut_({ ok: true, ch: { id: ch, name: UU[ch].name, av: UU[ch].av, pro: ch === OWNER_ID || active_(UU, ch), hello: hello }, posts: posts.slice(0, 200) });
  }

  if (action === 'kp_get') {
    var ids = String(p.ids || '').split(',').map(kpPost_).filter(String).slice(0, 80), want = {}, out = {};
    ids.forEach(function (x) { want[x] = 1; out[x] = { l: 0, c: 0, s: 0, my: false, sw: false }; });
    var a = kpActSheet_().getDataRange().getValues();
    for (var i = 1; i < a.length; i++) {
      if (String(a[i][0]) !== ch || !want[a[i][1]]) continue;
      var o = out[a[i][1]], who = normId_(a[i][2]);
      if (a[i][3] === 'l') { o.l++; if (who === me) o.my = true; }
      else if (a[i][3] === 's') { o.s++; if (who === me) o.sw = true; }
    }
    var c = kpComSheet_().getDataRange().getValues();
    for (var j = 1; j < c.length; j++) if (String(c[j][0]) === ch && want[c[j][1]] && String(c[j][6]) !== '1') out[c[j][1]].c++;
    return jsonOut_({ ok: true, posts: out });
  }

  if (action === 'kp_add' || action === 'kp_hello' || action === 'kp_del') return kpChEdit_(action, e, p);

  var post = kpPost_(p.p);
  if (!post) return jsonOut_({ ok: false, error: 'bad_post' });

  if (action === 'kp_coms') {
    var d = kpComSheet_().getDataRange().getValues(), items = [];
    for (var k = 1; k < d.length; k++) {
      if (String(d[k][0]) !== ch || String(d[k][1]) !== post || String(d[k][6]) === '1') continue;
      var cid = normId_(d[k][2]);
      items.push({ k: k + 1, id: cid, name: String(d[k][3] || ''), text: String(d[k][4] || '').replace(/^'/, ''), ts: Number(d[k][5]) || 0, mine: !!me && (cid === me || me === ch) });
    }
    return jsonOut_({ ok: true, items: items.slice(-200) });
  }

  if (!me) return noAuth_();
  if (frozenAt_(me)) return frozenOut_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  var pro = me === OWNER_ID || active_(U, me);

  if (action === 'kp_like' || action === 'kp_swoop') {
    var kind = action === 'kp_like' ? 'l' : 's', on = action === 'kp_swoop' || String(p.on) === '1';
    if (kind === 's' && !pro) return jsonOut_({ ok: false, error: 'need_pro' });
    if (!kpRate_('KPL_' + me, KP_LIKE_PER_MIN, 60)) return jsonOut_({ ok: false, error: 'limit' });
    var sh = kpActSheet_();
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      // строки не удаляются: снятый огонёк помечается '-l' и при новом нажатии возвращается в 'l'
      var v = sh.getDataRange().getValues(), row = 0, old = 0, n = 0;
      for (var r = 1; r < v.length; r++) {
        if (String(v[r][0]) !== ch || String(v[r][1]) !== post) continue;
        var mine = normId_(v[r][2]) === me;
        if (v[r][3] === kind) { n++; if (mine) row = r + 1; }
        else if (v[r][3] === '-' + kind && mine) old = r + 1;
      }
      if (on && !row) { if (old) sh.getRange(old, 4, 1, 2).setValues([[kind, Date.now()]]); else sh.appendRow([ch, post, me, kind, Date.now()]); n++; }
      else if (!on && row) { sh.getRange(row, 4).setValue('-' + kind); n--; }
      return jsonOut_(kind === 'l' ? { ok: true, l: n, my: on } : { ok: true, s: n, sw: true });
    } finally {
      lock.releaseLock();
    }
  }

  if (action === 'kp_com') {
    if (!pro) return jsonOut_({ ok: false, error: 'need_pro' });
    var text = String(p.text || '').replace(/\s+/g, ' ').trim().slice(0, KP_COM_MAX);
    if (!text) return jsonOut_({ ok: false, error: 'empty' });
    if (me !== OWNER_ID && !kpRate_('KPC_' + me, KP_COM_PER_HOUR, 3600)) return jsonOut_({ ok: false, error: 'limit' });
    var now = Date.now(), name = U[me].name || me;
    kpComSheet_().appendRow([ch, post, me, safe_(name), safe_(text), now, '']);
    return jsonOut_({ ok: true, item: { id: me, name: name, text: text, ts: now, mine: true } });
  }

  if (action === 'kp_cdel') {
    var csh = kpComSheet_(), krow = Number(p.k) || 0;
    if (krow < 2) return jsonOut_({ ok: false, error: 'bad_k' });
    var cv = csh.getRange(krow, 1, 1, 7).getValues()[0];
    if (String(cv[0]) !== ch || String(cv[1]) !== post) return jsonOut_({ ok: false, error: 'bad_k' });
    if (normId_(cv[2]) !== me && me !== ch && me !== OWNER_ID) return jsonOut_({ ok: false, error: 'forbidden' });
    csh.getRange(krow, 7).setValue('1');
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}
// свой канал: писать может только сам владелец (Pro)
function kpChEdit_(action, e, p) {
  var me = sessionId_(e);
  if (!me) return noAuth_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  if (me !== OWNER_ID && !active_(U, me)) return jsonOut_({ ok: false, error: 'need_pro' });
  var sh = kpChSheet_();
  if (action === 'kp_del') {
    var post = kpPost_(p.p), d = sh.getDataRange().getValues();
    for (var i = 1; i < d.length; i++) if (String(d[i][0]) === me && String(d[i][1]) === post) { sh.getRange(i + 1, 6).setValue('1'); return jsonOut_({ ok: true }); }
    return jsonOut_({ ok: false, error: 'not_found' });
  }
  var text = String(p.text || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, KP_TEXT_MAX);
  if (action === 'kp_hello') {
    var h = sh.getDataRange().getValues();
    for (var j = 1; j < h.length; j++) if (String(h[j][0]) === me && String(h[j][1]) === 'start') { sh.getRange(j + 1, 3, 1, 4).setValues([[safe_(text), '', Date.now(), text ? '' : '1']]); return jsonOut_({ ok: true }); }
    if (text) sh.appendRow([me, 'start', safe_(text), '', Date.now(), '']);
    return jsonOut_({ ok: true });
  }
  var url = kpUrl_(p.url);
  if (url === null) return jsonOut_({ ok: false, error: 'bad_url' });
  if (!text && !url) return jsonOut_({ ok: false, error: 'empty' });
  if (me !== OWNER_ID && !kpRate_('KPA_' + me, KP_POSTS_PER_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var now = Date.now(), id = 'p' + now.toString(36);
  sh.appendRow([me, id, safe_(text), url, now, '']);
  return jsonOut_({ ok: true, post: { p: id, text: text, url: url, ts: now } });
}
// =================== end of block KANAL POSTS v1 ===================

// ===================== KANAL POSTS v2 (2026-11-17) =====================
// Добавка к блоку KANAL POSTS v1 (он остаётся выше). Диспетчер зовёт kanalPosts2_ вместо kanalPosts_.
// Новое: Swoop кладёт пост в свой канал (лист kp_ch, пост sw-КАНАЛ-ПОСТ, текст = JSON {t,x,i,c,p,n});
//   kp_swoop&ch=&p=&on=1|0&t=&x=&i= → { s, sw } (Pro; свой пост нельзя — error own); снять: on=0 или kp_del поста-Swoop.
//   Свои Swoop в счётчик не идут. kp_ch отдаёт посты-Swoop с полем sw.
// Используются функции v1: kpActSheet_, kpChSheet_, kpComSheet_, kpCh_, kpRate_, kpUrl_ и константы KP_*.
function kpPost2_(v) { v = String(v || '').trim().toLowerCase(); return /^[a-z0-9-]{1,64}$/.test(v) ? v : ''; }
function kpImg_(v) { v = String(v || '').trim(); return /^\/[A-Za-z0-9_\/-]{1,100}\.(webp|jpe?g|png)$/i.test(v) ? v : ''; }
function kpSwId_(ch, post) { return ('sw-' + ch + '-' + post).slice(0, 64); }
function kanalPosts2_(action, e, p) {
  var ch = kpCh_(p.ch);
  if (!ch) return jsonOut_({ ok: false, error: 'bad_ch' });
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }

  if (action === 'kp_ch') {
    var UU = usersLite_();
    if (!UU[ch] || UU[ch].frozen) return jsonOut_({ ok: false, error: 'not_found' });
    var rows = kpChSheet_().getDataRange().getValues(), posts = [], hello = '';
    for (var q = 1; q < rows.length; q++) {
      if (String(rows[q][0]) !== ch || String(rows[q][5]) === '1') continue;
      var pt = { p: String(rows[q][1]), text: String(rows[q][2] || '').replace(/^'/, ''), url: String(rows[q][3] || ''), ts: Number(rows[q][4]) || 0 };
      if (pt.p.indexOf('sw-') === 0) { try { pt.sw = JSON.parse(pt.text); } catch (err) { continue; } pt.text = ''; pt.url = ''; }
      if (pt.p === 'start') hello = pt.text; else posts.push(pt);
    }
    posts.sort(function (x, y) { return y.ts - x.ts; });
    return jsonOut_({ ok: true, ch: { id: ch, name: UU[ch].name, av: UU[ch].av, pro: ch === OWNER_ID || active_(UU, ch), hello: hello }, posts: posts.slice(0, 200) });
  }

  if (action === 'kp_get') {
    var ids = String(p.ids || '').split(',').map(kpPost2_).filter(String).slice(0, 80), want = {}, out = {};
    ids.forEach(function (x) { want[x] = 1; out[x] = { l: 0, c: 0, s: 0, my: false, sw: false }; });
    var a = kpActSheet_().getDataRange().getValues();
    for (var i = 1; i < a.length; i++) {
      if (String(a[i][0]) !== ch || !want[a[i][1]]) continue;
      var o = out[a[i][1]], who = normId_(a[i][2]);
      if (a[i][3] === 'l') { o.l++; if (who === me) o.my = true; }
      else if (a[i][3] === 's' && who !== ch) { o.s++; if (who === me) o.sw = true; }
    }
    var c = kpComSheet_().getDataRange().getValues();
    for (var j = 1; j < c.length; j++) if (String(c[j][0]) === ch && want[c[j][1]] && String(c[j][6]) !== '1') out[c[j][1]].c++;
    return jsonOut_({ ok: true, posts: out });
  }

  if (action === 'kp_add' || action === 'kp_hello' || action === 'kp_del') return kpChEdit2_(action, e, p);

  var post = kpPost2_(p.p);
  if (!post) return jsonOut_({ ok: false, error: 'bad_post' });

  if (action === 'kp_coms') {
    var d = kpComSheet_().getDataRange().getValues(), items = [];
    for (var k = 1; k < d.length; k++) {
      if (String(d[k][0]) !== ch || String(d[k][1]) !== post || String(d[k][6]) === '1') continue;
      var cid = normId_(d[k][2]);
      items.push({ k: k + 1, id: cid, name: String(d[k][3] || ''), text: String(d[k][4] || '').replace(/^'/, ''), ts: Number(d[k][5]) || 0, mine: !!me && (cid === me || me === ch) });
    }
    return jsonOut_({ ok: true, items: items.slice(-200) });
  }

  if (!me) return noAuth_();
  if (frozenAt_(me)) return frozenOut_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  var pro = me === OWNER_ID || active_(U, me);

  if (action === 'kp_like' || action === 'kp_swoop') {
    var kind = action === 'kp_like' ? 'l' : 's', on = kind === 's' ? String(p.on) !== '0' : String(p.on) === '1';
    if (kind === 's' && !pro) return jsonOut_({ ok: false, error: 'need_pro' });
    if (kind === 's' && (me === ch || post.indexOf('sw-') === 0)) return jsonOut_({ ok: false, error: 'own' });
    if (!kpRate_('KPL_' + me, KP_LIKE_PER_MIN, 60)) return jsonOut_({ ok: false, error: 'limit' });
    var sh = kpActSheet_();
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      // строки не удаляются: снятый огонёк помечается '-l' и при новом нажатии возвращается в 'l'
      var v = sh.getDataRange().getValues(), row = 0, old = 0, n = 0;
      for (var r = 1; r < v.length; r++) {
        if (String(v[r][0]) !== ch || String(v[r][1]) !== post) continue;
        var mine = normId_(v[r][2]) === me;
        if (v[r][3] === kind) { n++; if (mine) row = r + 1; }
        else if (v[r][3] === '-' + kind && mine) old = r + 1;
      }
      if (on && !row) { if (old) sh.getRange(old, 4, 1, 2).setValues([[kind, Date.now()]]); else sh.appendRow([ch, post, me, kind, Date.now()]); n++; }
      else if (!on && row) { sh.getRange(row, 4).setValue('-' + kind); n--; }
      if (kind === 's') kpSwoopCh_(me, ch, post, on, p, U);
      return jsonOut_(kind === 'l' ? { ok: true, l: n, my: on } : { ok: true, s: n, sw: on });
    } finally {
      lock.releaseLock();
    }
  }

  if (action === 'kp_com') {
    if (!pro) return jsonOut_({ ok: false, error: 'need_pro' });
    var text = String(p.text || '').replace(/\s+/g, ' ').trim().slice(0, KP_COM_MAX);
    if (!text) return jsonOut_({ ok: false, error: 'empty' });
    if (me !== OWNER_ID && !kpRate_('KPC_' + me, KP_COM_PER_HOUR, 3600)) return jsonOut_({ ok: false, error: 'limit' });
    var now = Date.now(), name = U[me].name || me;
    kpComSheet_().appendRow([ch, post, me, safe_(name), safe_(text), now, '']);
    return jsonOut_({ ok: true, item: { id: me, name: name, text: text, ts: now, mine: true } });
  }

  if (action === 'kp_cdel') {
    var csh = kpComSheet_(), krow = Number(p.k) || 0;
    if (krow < 2) return jsonOut_({ ok: false, error: 'bad_k' });
    var cv = csh.getRange(krow, 1, 1, 7).getValues()[0];
    if (String(cv[0]) !== ch || String(cv[1]) !== post) return jsonOut_({ ok: false, error: 'bad_k' });
    if (normId_(cv[2]) !== me && me !== ch && me !== OWNER_ID) return jsonOut_({ ok: false, error: 'forbidden' });
    csh.getRange(krow, 7).setValue('1');
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}
function kpChEdit2_(action, e, p) {
  var me = sessionId_(e);
  if (!me) return noAuth_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  if (me !== OWNER_ID && !active_(U, me)) return jsonOut_({ ok: false, error: 'need_pro' });
  var sh = kpChSheet_();
  if (action === 'kp_del') {
    var post = kpPost2_(p.p), d = sh.getDataRange().getValues();
    for (var i = 1; i < d.length; i++) if (String(d[i][0]) === me && String(d[i][1]) === post) {
      sh.getRange(i + 1, 6).setValue('1');
      if (post.indexOf('sw-') === 0) { try { var o = JSON.parse(String(d[i][2] || '').replace(/^'/, '')); kpUnmark_(me, o.c, o.p); } catch (err) {} }
      return jsonOut_({ ok: true });
    }
    return jsonOut_({ ok: false, error: 'not_found' });
  }
  var text = String(p.text || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, KP_TEXT_MAX);
  if (action === 'kp_hello') {
    var h = sh.getDataRange().getValues();
    for (var j = 1; j < h.length; j++) if (String(h[j][0]) === me && String(h[j][1]) === 'start') { sh.getRange(j + 1, 3, 1, 4).setValues([[safe_(text), '', Date.now(), text ? '' : '1']]); return jsonOut_({ ok: true }); }
    if (text) sh.appendRow([me, 'start', safe_(text), '', Date.now(), '']);
    return jsonOut_({ ok: true });
  }
  var url = kpUrl_(p.url);
  if (url === null) return jsonOut_({ ok: false, error: 'bad_url' });
  if (!text && !url) return jsonOut_({ ok: false, error: 'empty' });
  if (me !== OWNER_ID && !kpRate_('KPA_' + me, KP_POSTS_PER_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var now = Date.now(), id = 'p' + now.toString(36);
  sh.appendRow([me, id, safe_(text), url, now, '']);
  return jsonOut_({ ok: true, post: { p: id, text: text, url: url, ts: now } });
}
function kpSwoopCh_(me, ch, post, on, p, U) {
  var sh = kpChSheet_(), id = kpSwId_(ch, post), d = sh.getDataRange().getValues(), row = 0;
  for (var i = 1; i < d.length; i++) if (String(d[i][0]) === me && String(d[i][1]) === id) { row = i + 1; break; }
  if (!on) { if (row) sh.getRange(row, 6).setValue('1'); return; }
  var clip = function (v, n) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, n); };
  var snap = JSON.stringify({ t: clip(p.t, 100), x: clip(p.x, 400), i: kpImg_(p.i), c: ch, p: post, n: (U[ch] && U[ch].name) || '' });
  if (row) sh.getRange(row, 3, 1, 4).setValues([[snap, '', Date.now(), '']]);
  else sh.appendRow([me, id, snap, '', Date.now(), '']);
}
function kpUnmark_(me, ch, post) {
  var sh = kpActSheet_(), v = sh.getDataRange().getValues();
  for (var r = 1; r < v.length; r++) if (String(v[r][0]) === String(ch) && String(v[r][1]) === String(post) && normId_(v[r][2]) === me && v[r][3] === 's') { sh.getRange(r + 1, 4).setValue('-s'); return; }
}
// =================== end of block KANAL POSTS v2 ===================

// ===================== KONTENT v4 (2026-11-17) =====================
// Задание 68: загрузка в Канал (kanal.html) и Обучение (obuchenie.html). Страничная часть — файл /eg-kontent.js.
// Места (place):
//   kanal, obuchenie, uroki — пишут только владельцы (11111, 23933), смотрят все (гости тоже);
//   ch-<ID> — свой канал Pro (kanal.html?u=ID): сторис и папки, пишет только сам хозяин канала с активным Pro.
// Лист kc: Place, Kind (story | post | rolik | urok | folder), Id, Json, At, Del ('1' = удалено, строки не стираются).
// Сторис: только кружочек, снятый камерой в приложении (t=vid, circle=1), до 60 секунд, 480p.
//   Живут 24 часа и потом не видны НИКОМУ (архива и «Актуального» нет — решение Андрея 17.11 11:02).
//   Файлы сторис лежат в папке бакета k/s/ — правило бакета само стирает их через 2 дня.
// «Актуальное» (kind folder) = карта темы («Похудение») с островками-роликами со стены (Андрей 17.11 11:18):
//   { title, cover: обложка кружка (с телефона, k/p/), items: [{ l: ссылка, t: название, th: превью, p: id поста на стене }] }.
//   Превью — с Rutube / VK / Яндекс Диска или своё (k/p/).
//   v4 (Андрей 17.11 16:10): островком может быть и СВОЯ сторис-кружок: { s: 1, u: видео k/a/, c: кадр, d, m, t, th }.
//   Сторис живёт 24 часа, поэтому её видео КОПИРУЕТСЯ в вечную папку k/a/ (kc_keep даёт подписанную ссылку, браузер
//   сам берёт файл сторис и кладёт копию). Папку k/a/ правило «срок жизни» не трогает.
// Посты, ролики и уроки — только ссылкой на VK Видео / Rutube / Яндекс Диск (+ своё превью th, не обязательно).
// Уроки Pro: гость и FREE получают только обложку и название (без видео и текста).
// Фото (обложка сторис k/s/, своё превью k/p/): POST kc_img (base64 до 2,6 млн знаков) → Storage.put в бакет сайта.
// Видео сторис: GET kc_upurl — одноразовая подписанная ссылка (15 минут), браузер сам кладёт файл PUT прямо в бакет
//   app.eaglesteam.ru (через функцию видео не пройдёт: лимит запроса ~3,5 МБ). Подпись SigV4 делает index.js
//   (Storage.presign, ключ KEY_ID/KEY_SECRET виден только ему), значения никуда не выводятся. Лимит размера: владелец 100 МБ, Pro 40 МБ (проверка при выдаче ссылки).
// Действия:
//   GET  kc_list&place=            → { stories, folders, posts, roliki, uroki }  (без входа; с sess — видно Pro-уроки)
//   GET  kc_upurl&place=&mime=&size= → { put, url, mime }                   (вход; право писать в place)
//   GET  kc_meta&u=                → { img, title, d, kind }                 (вход, Pro; превью и название ролика по ссылке)
//   GET  kc_keep&place=&id=        → { put, url, src, mime }  (вход; право писать в place; сторис из place → копия в k/a/)
//   GET  kc_diag                   → { presign, key, keyA, pub }     (только владелец: найден ли ключ — без значений)
//   POST type=kc_img  place, data, mime, use(s|p) → { url }   (s — обложка сторис, p — своё превью)
//   POST type=kc_add  place, kind, json        → { item }
//   POST type=kc_del  id                       → {}
//   POST type=kc_fold place, json {id,title,items} → { folder }
//   POST type=kc_folddel id                    → {}
// В диспетчер добавлены 2 строки: GET — рядом с v_open (до проверки входа), POST — после img_put.
var KC_OWNERS = ['11111', '23933'], KC_DAY = 864e5, KC_BUCKET = 'app.eaglesteam.ru', KC_HOST = 'storage.yandexcloud.net';
var KC_IMG_MAX_B64 = 2600000, KC_VID_OWNER = 100e6, KC_VID_PRO = 40e6, KC_STORY_SEC = 60;
var KC_PRO_STORIES_DAY = 30, KC_PRO_UPLOADS_DAY = 60, KC_META_DAY = 100, KC_FOLDERS = 30, KC_FOLDER_ITEMS = 40;
var KC_KINDS = { kanal: ['story', 'post', 'rolik', 'folder'], obuchenie: ['story'], uroki: ['urok'] };
function kcSheet_() { return getSheet_('kc', ['Place', 'Kind', 'Id', 'Json', 'At', 'Del']); }
function kcOwner_(id) { return KC_OWNERS.indexOf(String(id || '')) >= 0; }
function kcPlace_(v) {
  v = String(v || '');
  if (v === 'kanal' || v === 'obuchenie' || v === 'uroki') return v;
  var m = /^ch-([0-9]{1,12})$/.exec(v);
  return m && validId_(m[1]) ? v : '';
}
function kcCan_(me, place, U) {
  if (!me || !place) return false;
  if (place === 'kanal' || place === 'obuchenie' || place === 'uroki') return kcOwner_(me);
  return place === 'ch-' + me && (kcOwner_(me) || active_(U, me));
}
function kcKindOk_(place, kind) { return (KC_KINDS[place] || ['story', 'folder']).indexOf(kind) >= 0; }
function kcRate_(key, max, sec) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), sec);
  return true;
}
function kcStr_(v, n) { return String(v == null ? '' : v).replace(/\r/g, '').slice(0, n); }
function kcMedia_(v) { v = String(v || ''); return v.indexOf(Storage.url('k/')) === 0 && /^[^\s"'<>]{1,400}$/.test(v) ? v : ''; }
// превью: своё (из бакета) или картинка Rutube / VK / Яндекса / YouTube
function kcThumb_(v) {
  v = String(v || '').trim();
  if (kcMedia_(v)) return v;
  return /^https:\/\/([a-z0-9-]+\.)*(rutube\.ru|rutubelist\.ru|userapi\.com|vkuserphoto\.ru|vk\.com|vkvideo\.ru|yandex\.net|yandex\.ru|ytimg\.com)\/[^\s"'<>\\]{1,700}$/i.test(v) ? v : '';
}
function kcNum_(v, max) { v = Number(v) || 0; return v < 0 ? 0 : v > max ? max : Math.round(v); }
var KC_LINK_RE = /^https:\/\/((www\.|m\.)?(vk\.com|vkvideo\.ru|vk\.ru|rutube\.ru|youtube\.com|youtu\.be)|disk\.yandex\.(ru|com|kz|by)|yadi\.sk|disk\.360\.yandex\.ru)\/[^\s"'<>]{1,300}$/i;
function kcLink_(v) { v = String(v || '').trim(); return KC_LINK_RE.test(v) ? v : ''; }
function kcId_(v) { v = String(v || ''); return /^[a-z0-9]{4,40}$/.test(v) ? v : ''; }
function kcClean_(kind, x) {
  x = x && typeof x === 'object' ? x : {};
  if (kind === 'story') {
    var u = kcMedia_(x.u);
    if (!u || x.t !== 'vid' || Number(x.circle) !== 1 || u.indexOf(Storage.url('k/s/')) !== 0) return null;
    return { t: 'vid', circle: 1, u: u, c: kcMedia_(x.c), d: kcNum_(x.d, KC_STORY_SEC + 1), r: 's', m: x.m ? 1 : 0, cap: kcStr_(x.cap, 120) };
  }
  if (kind === 'post') {
    var pl = kcLink_(x.link);
    return pl ? { text: kcStr_(x.text, 4000), link: pl, th: kcThumb_(x.th) } : null;
  }
  if (kind === 'rolik') {
    var rl = kcLink_(x.link);
    return rl ? { title: kcStr_(x.title, 120), link: rl, lenta: x.lenta ? 1 : 0, th: kcThumb_(x.th) } : null;
  }
  if (kind === 'urok') {
    var ll = kcLink_(x.link), lt = kcStr_(x.title, 120);
    return ll && lt ? { title: lt, sub: kcStr_(x.sub, 120), cat: kcStr_(x.cat, 30), pro: x.pro ? 1 : 0, text: kcStr_(x.text, 6000), link: ll, th: kcThumb_(x.th) } : null;
  }
  return null;
}
function kcFoldClean_(x) {
  x = x && typeof x === 'object' ? x : {};
  var title = kcStr_(x.title, 24).replace(/\s+/g, ' ').trim(), seen = {};
  var items = (Array.isArray(x.items) ? x.items : []).map(function (i) {
    i = i && typeof i === 'object' ? i : {};
    var tt = kcStr_(i.t, 80).replace(/\s+/g, ' ').trim();
    if (Number(i.s) === 1) {   // своя сторис-кружок (копия в k/a/)
      var su = kcMedia_(i.u);
      return su && su.indexOf(Storage.url('k/a/')) === 0 ? { s: 1, l: '', u: su, c: kcMedia_(i.c), d: kcNum_(i.d, KC_STORY_SEC + 1), m: i.m ? 1 : 0, t: tt, th: kcThumb_(i.th), p: '' } : null;
    }
    var l = kcLink_(i.l);
    var pid = String(i.p || '');
    return l ? { l: l, t: tt, th: kcThumb_(i.th), p: /^[A-Za-z0-9_-]{1,48}$/.test(pid) ? pid : '' } : null;
  }).filter(function (i) { var k = i && (i.l || i.u); if (!k || seen[k]) return false; seen[k] = 1; return true; }).slice(0, KC_FOLDER_ITEMS);
  return title ? { title: title, cover: kcThumb_(x.cover), items: items } : null;
}
function kcRows_() {
  var d = kcSheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][5]) === '1' || !d[i][2]) continue;
    var j = null;
    try { j = JSON.parse(String(d[i][3] || '').replace(/^'/, '')); } catch (err) { continue; }
    if (!j || typeof j !== 'object') continue;
    out.push({ row: i + 1, place: String(d[i][0]), kind: String(d[i][1]), id: String(d[i][2]), at: Number(d[i][4]) || 0, j: j });
  }
  return out;
}
function kcFind_(id) { var r = kcRows_(); for (var i = 0; i < r.length; i++) if (r[i].id === id) return r[i]; return null; }

function kontent_(action, e, p) {
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }
  var U = me ? usersLite_() : {};
  if (me && (!U[me] || frozenAt_(me))) me = '';

  if (action === 'kc_list') return kcList_(p, me, U);

  if (!me) return noAuth_();

  if (action === 'kc_diag') {
    if (!kcOwner_(me)) return jsonOut_({ ok: false, error: 'owner' });
    var pu = kcPresign_('k/s/kanal/_diag.webm');
    var pa = kcPresign_('k/a/kanal/_diag.webm');
    return jsonOut_({ ok: true, presign: kcPresignOk_(), key: /^https:\/\/[^?]+\/k\/s\/kanal\/_diag\.webm\?X-Amz-Algorithm=AWS4-HMAC-SHA256&/.test(pu), keyA: /^https:\/\/[^?]+\/k\/a\/kanal\/_diag\.webm\?X-Amz-Algorithm=AWS4-HMAC-SHA256&/.test(pa), pub: Storage.url('k/') });
  }
  if (action === 'kc_keep') return kcKeep_(p, me, U);
  if (action === 'kc_upurl') return kcUpUrl_(p, me, U);
  if (action === 'kc_meta') return kcMeta_(p, me, U);
  if (action === 'kc_img') return kcImg_(p, me, U);
  if (action === 'kc_add') return kcAdd_(p, me, U);
  if (action === 'kc_fold') return kcFold_(p, me, U);
  if (action === 'kc_del' || action === 'kc_folddel') {
    var id = kcId_(p.id), x = id ? kcFind_(id) : null;
    if (!x || (action === 'kc_folddel') !== (x.kind === 'folder')) return jsonOut_({ ok: false, error: 'not_found' });
    if (!kcCan_(me, x.place, U) && !kcOwner_(me)) return jsonOut_({ ok: false, error: 'owner' });   // Андрей может убрать и чужое (модерация)
    kcSheet_().getRange(x.row, 6).setValue('1');
    return jsonOut_({ ok: true });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}

function kcList_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!place) return jsonOut_({ ok: false, error: 'bad_place' });
  var pro = !!me && (kcOwner_(me) || active_(U, me)), now = Date.now();
  var out = { ok: true, stories: [], folders: [], posts: [], roliki: [], uroki: [] };
  kcRows_().forEach(function (x) {
    if (x.place !== place) return;
    var it = x.j;
    it.id = x.id; it.at = x.at;
    if (x.kind === 'story') { if (now - x.at < KC_DAY) out.stories.push(it); }
    else if (x.kind === 'folder') out.folders.push({ id: x.id, at: x.at, title: kcStr_(it.title, 24), cover: it.cover || '', items: Array.isArray(it.items) ? it.items : [] });
    else if (x.kind === 'post') out.posts.push(it);
    else if (x.kind === 'rolik') out.roliki.push(it);
    else if (x.kind === 'urok') out.uroki.push(it.pro && !pro ? { id: it.id, at: it.at, title: it.title, sub: it.sub, cat: it.cat, th: it.th || '', pro: 1, locked: 1 } : it);
  });
  return jsonOut_(out);
}

function kcUpUrl_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var mime = String(p.mime || '').split(';')[0].trim().toLowerCase();
  var ext = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }[mime];
  if (!ext) return jsonOut_({ ok: false, error: 'type' });
  var size = Math.floor(Number(p.size) || 0), max = kcOwner_(me) ? KC_VID_OWNER : KC_VID_PRO;
  if (size < 1) return jsonOut_({ ok: false, error: 'type' });
  if (size > max) return jsonOut_({ ok: false, error: 'big', max: max });
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var key = 'k/s/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + '.' + ext;
  var put = kcPresign_(key);
  if (!put) return jsonOut_({ ok: false, error: 'no_key' });
  return jsonOut_({ ok: true, put: put, url: Storage.url(key), mime: mime });
}

// сторис → островок «Актуального»: копия видео в вечную папку k/a/ (Андрей 17.11 16:10)
function kcKeep_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var id = kcId_(p.id), x = id ? kcFind_(id) : null;
  if (!x || x.kind !== 'story' || x.place !== place) return jsonOut_({ ok: false, error: 'not_found' });
  if (Date.now() - x.at > 36 * 36e5) return jsonOut_({ ok: false, error: 'gone' });   // файл сторис стирается через 2 дня
  var src = kcMedia_(x.j.u), m = /\.(mp4|webm|mov)$/i.exec(src);
  if (!src || src.indexOf(Storage.url('k/s/')) !== 0 || !m) return jsonOut_({ ok: false, error: 'not_found' });
  var ext = m[1].toLowerCase(), mime = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }[ext];
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var key = 'k/a/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + '.' + ext;
  var put = kcPresign_(key);
  if (!put) return jsonOut_({ ok: false, error: 'no_key' });
  return jsonOut_({ ok: true, put: put, url: Storage.url(key), src: src, mime: mime });
}

function kcImg_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  var b64 = String(p.data || ''), mime = String(p.mime || ''), use = p.use === 'p' ? 'p' : 's';
  if (!/^image\/(webp|jpeg|png)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (b64.length > KC_IMG_MAX_B64) return jsonOut_({ ok: false, error: 'photo_big' });
  var head = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var okSig = mime === 'image/png' ? head[0] === 0x89 && head[1] === 0x50 : mime === 'image/jpeg' ? head[0] === 0xFF && head[1] === 0xD8 : head[0] === 0x52 && head[8] === 0x57;
  if (!okSig) return jsonOut_({ ok: false, error: 'bad_photo' });
  if (!kcOwner_(me) && !kcRate_('KCU_' + me, KC_PRO_UPLOADS_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var key = 'k/' + use + '/' + place + '/' + Utilities.getUuid().replace(/-/g, '').slice(0, 20) + (mime === 'image/png' ? '.png' : mime === 'image/jpeg' ? '.jpg' : '.webp');
  var r = Storage.put(key, b64, mime);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  return jsonOut_({ ok: true, url: Storage.url(key) });
}

function kcAdd_(p, me, U) {
  var place = kcPlace_(p.place), kind = String(p.kind || '');
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  if (kind === 'folder' || !kcKindOk_(place, kind)) return jsonOut_({ ok: false, error: 'bad_kind' });
  var x = null;
  try { x = JSON.parse(String(p.json || '')); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  var it = kcClean_(kind, x);
  if (!it) return jsonOut_({ ok: false, error: 'bad_item' });
  if (kind === 'story' && !kcOwner_(me) && !kcRate_('KCS_' + me, KC_PRO_STORIES_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var at = Date.now(), id = kind.charAt(0) + at.toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 4).toLowerCase();
  kcSheet_().appendRow([place, kind, id, JSON.stringify(it), at, '']);
  it.id = id; it.at = at;
  return jsonOut_({ ok: true, item: it });
}

function kcFold_(p, me, U) {
  var place = kcPlace_(p.place);
  if (!kcCan_(me, place, U)) return jsonOut_({ ok: false, error: 'owner' });
  if (!kcKindOk_(place, 'folder')) return jsonOut_({ ok: false, error: 'bad_kind' });
  var x = null;
  try { x = JSON.parse(String(p.json || '')); } catch (err) { return jsonOut_({ ok: false, error: 'bad_json' }); }
  var f = kcFoldClean_(x);
  if (!f) return jsonOut_({ ok: false, error: 'empty' });
  var id = kcId_(x && x.id), at = Date.now();
  if (id) {
    var old = kcFind_(id);
    if (!old || old.kind !== 'folder' || old.place !== place) return jsonOut_({ ok: false, error: 'not_found' });
    kcSheet_().getRange(old.row, 4).setValue(JSON.stringify(f));
    at = old.at;
  } else {
    var n = kcRows_().filter(function (r) { return r.place === place && r.kind === 'folder'; }).length;
    if (n >= KC_FOLDERS) return jsonOut_({ ok: false, error: 'limit' });
    id = 'f' + at.toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 4).toLowerCase();
    kcSheet_().appendRow([place, 'folder', id, JSON.stringify(f), at, '']);
  }
  f.id = id; f.at = at;
  return jsonOut_({ ok: true, folder: f });
}

// ---- превью и название ролика по ссылке (Rutube API, Яндекс Диск API, страница VK Видео) ----
function kcJson_(t) { try { return JSON.parse(t); } catch (err) { return {}; } }
function kcMeta_(p, me, U) {
  if (!kcOwner_(me) && !active_(U, me)) return jsonOut_({ ok: false, error: 'owner' });
  var u = kcLink_(p.u);
  if (!u) return jsonOut_({ ok: false, error: 'bad_link' });
  var cache = CacheService.getScriptCache(), key = 'KCM_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, u)).slice(0, 22);
  var hit = cache.get(key);
  if (hit) return jsonOut_(kcJson_(hit));
  if (!kcOwner_(me) && !kcRate_('KCMN_' + me, KC_META_DAY, 86400)) return jsonOut_({ ok: false, error: 'limit' });
  var out = { ok: true, img: '', title: '', d: 0, kind: '' }, m, r;
  try {
    if ((m = /rutube\.ru\/(?:video|shorts|play\/embed)\/(?:private\/)?([0-9a-f]{32})/i.exec(u))) {
      out.kind = 'rutube';
      r = UrlFetchApp.fetch('https://rutube.ru/api/video/' + m[1].toLowerCase() + '/?format=json', { muteHttpExceptions: true });
      if (r.getResponseCode() === 200) { var rj = kcJson_(r.getContentText()); out.img = String(rj.thumbnail_url || ''); out.title = String(rj.title || ''); out.d = Math.round(Number(rj.duration) || 0); }
    } else if (/^https:\/\/(disk\.yandex\.|yadi\.sk|disk\.360\.yandex\.ru)/i.test(u)) {
      out.kind = 'yadisk';
      r = UrlFetchApp.fetch('https://cloud-api.yandex.net/v1/disk/public/resources?fields=name,preview,media_type&preview_size=XXL&public_key=' + encodeURIComponent(u), { muteHttpExceptions: true });
      if (r.getResponseCode() === 200) { var yj = kcJson_(r.getContentText()); out.img = String(yj.preview || ''); out.title = String(yj.name || '').replace(/\.[a-z0-9]{2,4}$/i, '').replace(/_+/g, ' '); }
    } else if ((m = /[?&]oid=(-?\d{1,12})&(?:amp;)?id=(\d{1,12})/i.exec(u) || /(?:video|clip)(-?\d{1,12})_(\d{1,12})/i.exec(u))) {
      out.kind = 'vk';
      r = UrlFetchApp.fetch('https://vkvideo.ru/video' + m[1] + '_' + m[2], { muteHttpExceptions: true });
      var t = r.getResponseCode() === 200 ? String(r.getContentText() || '') : '';
      var og = function (n) { var x = new RegExp('<meta[^>]+property=["\']og:' + n + '["\'][^>]*content=["\']([^"\']+)["\']', 'i').exec(t); return x ? x[1].replace(/&amp;/g, '&') : ''; };
      out.img = og('image'); out.title = og('title');
    } else if ((m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(u))) {
      out.kind = 'youtube'; out.img = 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg';
    }
  } catch (err) { }
  out.img = kcThumb_(out.img); out.title = kcStr_(out.title, 80).replace(/\s+/g, ' ').trim();
  cache.put(key, JSON.stringify(out), 43200);
  return jsonOut_(out);
}

// ---- подписанная ссылка для загрузки видео сторис ----
// server.js работает в vm без process.env: ключ хранилища видит только index.js. Ссылку делает index.js —
// Storage.presign(key, sec) (добавлен заданием 68 v8; с задания 72 — ключи k/s/… и k/a/…, PUT, до 15 минут). Сам ключ сюда не попадает.
function kcPresignOk_() { try { return !!(typeof Storage !== 'undefined' && Storage && typeof Storage.presign === 'function'); } catch (err) { return false; } }
function kcPresign_(key) { try { return kcPresignOk_() ? String(Storage.presign(key, 900) || '') : ''; } catch (err) { return ''; } }
// =================== end of block KONTENT v4 ===================

// ===================== EYE CHAT v2 (2026-11-17) =====================
// Переписка EYE: галочки «доставлено / прочитано» и голосовые сообщения до 1 минуты (просьба Андрея 17.11.2026).
// Галочки: сервер уже хранит у каждого человека в in_<ID> столбец ReadAt — до какого времени он прочитал переписку.
//   Своё сообщение прочитано, если его время <= ReadAt собеседника. Ничего нового в базу не пишется.
// Голосовые: телефон записывает звук (webm/opus, на iPhone mp4/aac), присылает сюда base64, сервер кладёт файл
//   в бакет сайта в папку u/<ID>/v/ и пишет в переписку обычное сообщение-метку [[voice:<ключ файла>|<секунды>]].
//   Старые страницы покажут метку текстом, новая chat.html — плеер.
// Действия:
//   GET  ec_seen&with=ID        → { ok, seen }            до какого времени ID прочитал мою переписку с ним
//   GET  ec_seenlist            → { ok, seen:{ID:время} } то же для чатов, где последнее сообщение моё (до 40)
//   POST type=ec_voice  with, data (base64), mime, sec [, dry=1]  → { ok, at, key }
//        dry=1 — только проверка хранилища: файл кладётся и сразу удаляется, в переписку ничего не пишется.
// В диспетчер добавлены 2 строки: GET — после friends_ (ec_*), POST — после img_put (ec_voice).
var EC_VOICE_MAX_B64 = 1000000, EC_VOICE_SEC = 60, EC_VOICE_PER_DAY = 200;
function eyeChat_(action, me, p) {
  if (action === 'ec_del') return ecDel_(me, p); if (action === 'ec_hid') return ecHid_(me, p); if (action === 'ec_seen') {
    var peer = normId_(p['with']);
    if (!peer || peer === me) return jsonOut_({ ok: false, error: 'bad_id' });
    return jsonOut_({ ok: true, seen: Number(inboxRow_(peer, me).v[4]) || 0 });
  }
  if (action === 'ec_seenlist') {
    var d = inboxSheet_(me).getDataRange().getValues(), rows = [], out = {};
    for (var i = 1; i < d.length; i++) {
      var pr = normId_(d[i][0]);
      if (!pr || String(d[i][0]) === '#ann' || normId_(d[i][2]) !== me) continue;
      rows.push({ id: pr, at: Number(d[i][1]) || 0 });
    }
    rows.sort(function (a, b) { return b.at - a.at; });
    rows.slice(0, 40).forEach(function (x) { out[x.id] = Number(inboxRow_(x.id, me).v[4]) || 0; });
    return jsonOut_({ ok: true, seen: out });
  }
  return jsonOut_({ ok: false, error: 'unknown_action' });
}
function ecVoice_(me, p) {
  var U = usersLite_(), peer = normId_(p['with']), dry = String(p.dry || '') === '1';
  var b64 = String(p.data || '').replace(/\s/g, ''), mime = String(p.mime || '').split(';')[0].trim().toLowerCase();
  var sec = Math.round(Number(p.sec) || 0);
  if (!dry && (!peer || peer === me || !U[peer])) return jsonOut_({ ok: false, error: 'bad_id' });
  if (!/^audio\/(webm|ogg|mp4|aac|mpeg)$/.test(mime) || !b64 || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return jsonOut_({ ok: false, error: 'bad_audio' });
  if (b64.length > EC_VOICE_MAX_B64) return jsonOut_({ ok: false, error: 'audio_big' });
  if (sec < 1 || sec > EC_VOICE_SEC + 2) return jsonOut_({ ok: false, error: 'bad_len' });
  var h = Utilities.base64Decode(b64.slice(0, 16)).map(function (x) { return (x + 256) % 256; });
  var sig = (h[0] === 0x1A && h[1] === 0x45 && h[2] === 0xDF && h[3] === 0xA3) ? 'webm'
    : (h[0] === 0x4F && h[1] === 0x67 && h[2] === 0x67 && h[3] === 0x53) ? 'ogg'
    : (h[4] === 0x66 && h[5] === 0x74 && h[6] === 0x79 && h[7] === 0x70) ? 'm4a'
    : ((h[0] === 0x49 && h[1] === 0x44 && h[2] === 0x33) || (h[0] === 0xFF && (h[1] & 0xE0) === 0xE0)) ? 'mp3' : '';
  if (!sig) return jsonOut_({ ok: false, error: 'bad_audio' });
  var put = { webm: 'audio/webm', ogg: 'audio/ogg', m4a: 'audio/mp4', mp3: 'audio/mpeg' }[sig];
  if (!dry) {
    if (!(active_(U, me) || me === OWNER_ID)) return jsonOut_({ ok: false, error: 'need_pro' });
    if (String(inboxRow_(peer, me).v[5]) === '1') return jsonOut_({ ok: false, error: 'blocked' });
    var cache = CacheService.getScriptCache(), ck = 'ECV_' + me + '_' + new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
    var used = Number(cache.get(ck) || 0);
    if (me !== OWNER_ID && used >= EC_VOICE_PER_DAY) return jsonOut_({ ok: false, error: 'limit' });
    cache.put(ck, String(used + 1), 21600);
  }
  var key = 'u/' + me + '/v/' + Utilities.getUuid().replace(/-/g, '').slice(0, 16) + '.' + sig;
  var r = Storage.put(key, b64, put);
  if (!r || !r.ok) return jsonOut_({ ok: false, error: 'storage' });
  if (dry) { Storage.del(key); return jsonOut_({ ok: true, dry: true, key: key, type: put }); }
  // дальше обычная отправка: те же правила (кому можно писать, лимит новых переписок), что у текста
  var res = chatSend_(me, { 'with': peer, text: '[[voice:' + key + '|' + Math.min(sec, EC_VOICE_SEC) + ']]' });
  return res;
}
// =================== end of block EYE CHAT v2 ===================

// ===================== KANAL COMMENTS v1 (2026-11-18) =====================
// Добавка к блокам KANAL POSTS v1/v2 (они остаются выше). Диспетчер зовёт kanalPosts3_ вместо kanalPosts2_.
// Правило Андрея 18.11: человек в канале правит и удаляет ТОЛЬКО СВОИ комментарии.
// KP_OWNER_CAN_DEL = true → хозяин канала (и Андрей 11111) может УДАЛИТЬ чужой комментарий под своими постами (но не править).
//   kp_coms&ch=&p=            → { items:[{k,id,name,text,ts,ed,own,del,mine}] }  own — мой (можно править), del — можно удалить, ed — время правки
//   kp_cedit&ch=&p=&k=&text=  → { ok, item:{k,text,ed} }   только автор; до 500 знаков; не чаще 30 правок в час
//   kp_cdel&ch=&p=&k=         → { ok }                     автор (или хозяин канала, если KP_OWNER_CAN_DEL)
// Лист kp_com: столбец 8 (Ed) = время правки. Удаление мягкое (Del = '1'), как было.
var KP_OWNER_CAN_DEL = true, KP_EDIT_PER_HOUR = 30;
function kanalPosts3_(action, e, p) {
  if (action !== 'kp_coms' && action !== 'kp_cedit' && action !== 'kp_cdel') return kanalPosts2_(action, e, p);
  var ch = kpCh_(p.ch);
  if (!ch) return jsonOut_({ ok: false, error: 'bad_ch' });
  var post = kpPost2_(p.p);
  if (!post) return jsonOut_({ ok: false, error: 'bad_post' });
  var me = '';
  if (p.sess) { try { me = sessionId_(e) || ''; } catch (err) { me = ''; } }
  var boss = !!me && KP_OWNER_CAN_DEL && (me === ch || me === OWNER_ID);

  if (action === 'kp_coms') {
    var d = kpComSheet_().getDataRange().getValues(), items = [];
    for (var k = 1; k < d.length; k++) {
      if (String(d[k][0]) !== ch || String(d[k][1]) !== post || String(d[k][6]) === '1') continue;
      var cid = normId_(d[k][2]), own = !!me && cid === me;
      items.push({ k: k + 1, id: cid, name: String(d[k][3] || ''), text: String(d[k][4] || '').replace(/^'/, ''), ts: Number(d[k][5]) || 0,
        ed: Number(d[k][7]) || 0, own: own, del: own || boss, mine: own || boss });
    }
    return jsonOut_({ ok: true, items: items.slice(-200) });
  }

  if (!me) return noAuth_();
  if (frozenAt_(me)) return frozenOut_();
  var U = usersLite_();
  if (!U[me]) return noAuth_();
  var csh = kpComSheet_(), krow = Number(p.k) || 0;
  if (krow < 2 || krow > csh.getLastRow()) return jsonOut_({ ok: false, error: 'bad_k' });
  var cv = csh.getRange(krow, 1, 1, 7).getValues()[0];
  if (String(cv[0]) !== ch || String(cv[1]) !== post || String(cv[6]) === '1') return jsonOut_({ ok: false, error: 'bad_k' });
  var mine = normId_(cv[2]) === me;

  if (action === 'kp_cedit') {
    if (!mine) return jsonOut_({ ok: false, error: 'forbidden' });
    var text = String(p.text || '').replace(/\s+/g, ' ').trim().slice(0, KP_COM_MAX);
    if (!text) return jsonOut_({ ok: false, error: 'empty' });
    if (me !== OWNER_ID && !kpRate_('KPE_' + me, KP_EDIT_PER_HOUR, 3600)) return jsonOut_({ ok: false, error: 'limit' });
    var now = Date.now();
    csh.getRange(krow, 5).setValue(safe_(text));
    csh.getRange(krow, 8).setValue(now);
    return jsonOut_({ ok: true, item: { k: krow, text: text, ed: now } });
  }

  // kp_cdel
  if (!mine && !boss) return jsonOut_({ ok: false, error: 'forbidden' });
  csh.getRange(krow, 7).setValue('1');
  return jsonOut_({ ok: true });
}
// =================== end of block KANAL COMMENTS v1 ===================

// ===================== EYE CHAT v3 (2026-11-18) =====================
// Удаление сообщений в переписке EYE (просьба Андрея 18.11.2026): «Только у себя» и «У всех», в том числе чужие сообщения.
// «У всех»: текст строки в листе переписки c_<ID>_<ID> заменяется меткой [[del]] (строка остаётся, время и автор те же),
//   новая chat.html такие строки не показывает; голосовое — файл в бакете тоже удаляется.
// «Только у себя»: в лист hd_<мой ID> пишется строка (С кем, Время сообщения); новая chat.html эти сообщения прячет.
// В обоих случаях «последнее сообщение» в списке чатов (in_<ID>) пересчитывается.
// Действия (GET, через уже существующую строку диспетчера ec_* → eyeChat_):
//   ec_del&with=ID&at=ВРЕМЯ[&all=1]  → { ok }            all=1 — у всех, без него — только у себя
//   ec_hid&with=ID                   → { ok, hid:[время…] } что я спрятал у себя в переписке с ID
// В eyeChat_ в начало добавляется 1 строка: перед проверкой ec_seen — ec_del и ec_hid (замена в редакторе).
var EC_DEL = '[[del]]';
function ecHidSheet_(me) { return getSheet_('hd_' + me, ['Peer', 'At']); }
function ecHidSet_(me, peer) {
  var d = ecHidSheet_(me).getDataRange().getValues(), s = {};
  for (var i = 1; i < d.length; i++) if (normId_(d[i][0]) === peer) s[Number(d[i][1]) || 0] = 1;
  return s;
}
// пересчитать «последнее сообщение» в списке чатов owner для переписки с peer
function ecInboxFix_(owner, peer, rows, hid) {
  var x = inboxRow_(owner, peer);
  if (!x.row) return;
  var v = x.v.slice(), last = null;
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][2] || '') === EC_DEL || hid[Number(rows[i][0]) || 0]) continue;
    last = rows[i]; break;
  }
  if (last) {
    var t = String(last[2] || '');
    v[1] = Number(last[0]) || 0; v[2] = normId_(last[1]); v[3] = t.length > 120 ? t.slice(0, 117) + '…' : t;
  } else {
    v[3] = 'Сообщение удалено'; v[4] = Math.max(Number(v[4]) || 0, Number(v[1]) || 0);
  }
  inboxPut_(x, v);
}
function ecDel_(me, p) {
  var U = usersLite_(), peer = normId_(p['with']), at = Number(p.at) || 0, all = String(p.all || '') === '1';
  if (!peer || peer === me || !U[peer]) return jsonOut_({ ok: false, error: 'bad_id' });
  if (!at) return jsonOut_({ ok: false, error: 'bad_at' });
  if (!inboxRow_(me, peer).row) return jsonOut_({ ok: false, error: 'not_found' });
  var sh = chatSheet_(me, peer), d = sh.getDataRange().getValues(), r = 0;
  for (var i = d.length - 1; i >= 1; i--) if ((Number(d[i][0]) || 0) === at) { r = i; break; }
  if (!r || String(d[r][2] || '') === EC_DEL) return jsonOut_({ ok: false, error: 'not_found' });
  if (all) {
    var vm = /^\[\[voice:(u\/[a-z0-9_]+\/v\/[0-9a-f]{16}\.(?:webm|ogg|m4a|mp3))\|/.exec(String(d[r][2] || ''));
    sh.getRange(r + 1, 1, 1, 3).setValues([[d[r][0], d[r][1], EC_DEL]]);
    d[r][2] = EC_DEL;
    if (vm) { try { Storage.del(vm[1]); } catch (e) {} }
    ecInboxFix_(me, peer, d, ecHidSet_(me, peer));
    ecInboxFix_(peer, me, d, ecHidSet_(peer, me));
  } else {
    var h = ecHidSet_(me, peer);
    if (!h[at]) ecHidSheet_(me).appendRow([peer, at]);
    h[at] = 1;
    ecInboxFix_(me, peer, d, h);
  }
  return jsonOut_({ ok: true, all: all });
}
function ecHid_(me, p) {
  var peer = normId_(p['with']);
  if (!peer || peer === me) return jsonOut_({ ok: false, error: 'bad_id' });
  return jsonOut_({ ok: true, hid: Object.keys(ecHidSet_(me, peer)).map(Number) });
}
// =================== end of block EYE CHAT v3 ===================


// ======================================================================
// СТАРТ ПРОЕКТА v1 (задание 107, 21.11.2026, Андрей): время старта + общая статистика проекта.
//  • START_AT (свойство скрипта) ставит только Андрей (11111) кнопкой «СТАРТ», один раз.
//    В первые 30 минут после старта Андрей может «переснять» (сбросить и нажать снова) — для видео.
//  • start_info — открытое действие (страница регистрации без входа):
//      до старта: { at: 0 }; Андрею с preview=1 — статистика за всё время с пометкой preview (проверка до старта);
//      после старта: регистрации на пакеты E1/E6/E12 с момента старта, сколько начислено партнёрам,
//      сколько людей достигли каждого звания (лучший месяц с момента старта), последние 5 оплат.
//  • Только чтение: ничего, кроме START_AT, не пишет. Ответ кэшируется на 15 секунд.
//  • Имена в ленте: только при START_NAMES = true (нужно согласие людей). Иначе имя пустое — страница пишет «Новый орёл».
// ======================================================================
var START_NAMES = false;
var START_RESET_MS = 30 * 60000;
function startAt_() { return Number(PropertiesService.getScriptProperties().getProperty('START_AT') || 0) || 0; }
function startStats_(since, now) {
  var X = moneyCalc_(now), D = X.D, R = X.R;
  var pk = { E1: 0, E6: 0, E12: 0 }, feed = [], earned = 0;
  D.pays.forEach(function (p) {
    if (p.gift || p.prod || p.ref || !(p.sum > 0) || p.at < since || p.at > now) return;
    var k = PKGS[p.pkg] ? p.pkg : 'E1';
    pk[k]++;
    feed.push({ at: p.at, pkg: k, id: p.payer });
  });
  (R.E || []).forEach(function (e) {
    if (e.to === OWNER_ID || e.k === 'move' || e.next || !(e.at >= since)) return;
    earned += e.full != null ? e.full : (e.sum || 0);
  });
  var ranks = null;
  if (R.MV) {
    ranks = [0, 0, 0, 0, 0, 0];
    var best = {}, mk0 = monthKey_(since);
    for (var mk in R.MV) {
      if (mk < mk0) continue;
      var mm = R.MV[mk];
      for (var y in mm) {
        if (y === OWNER_ID) continue;
        var ri = rankIdx_(Math.min(mm[y].L, mm[y].R));
        if (ri > (best[y] == null ? -1 : best[y])) best[y] = ri;
      }
    }
    for (var b in best) if (best[b] >= 0 && best[b] < ranks.length) ranks[best[b]]++;
  }
  feed.sort(function (a, c) { return c.at - a.at; });
  feed = feed.slice(0, 5).map(function (f) {
    var nm = START_NAMES && D.U[f.id] ? String(D.U[f.id].name || '').split(' ')[0] : '';
    return { at: f.at, pkg: f.pkg, name: nm };
  });
  return { pk: pk, total: pk.E1 + pk.E6 + pk.E12, earned: Math.round(earned), ranks: ranks,
           rankNames: RANKS.map(function (r) { return [r[0], r[1]]; }), feed: feed };
}
function startInfo_(e, p) {
  var at = startAt_(), now = Date.now(), me = sessionId_(e), preview = !at && me === OWNER_ID && String(p.preview || '') === '1';
  if (!at && !preview) return jsonOut_({ ok: true, at: 0, now: now, owner: me === OWNER_ID });
  var since = at || 0, cache = CacheService.getScriptCache(), key = 'START_ST_' + since, hit = cache.get(key), st = null;
  if (hit) { try { st = JSON.parse(hit); } catch (x) { st = null; } }
  if (!st) { st = startStats_(since, now); cache.put(key, JSON.stringify(st), 15); }
  return jsonOut_(Object.assign({ ok: true, at: at, now: now, preview: preview ? 1 : 0, owner: me === OWNER_ID,
                                  canReset: me === OWNER_ID && at > 0 && now - at < START_RESET_MS }, st));
}
function startGo_(e, p) {
  if (sessionId_(e) !== OWNER_ID) return jsonOut_({ ok: false, error: 'owner' });
  var props = PropertiesService.getScriptProperties(), at = startAt_(), now = Date.now();
  if (String(p.reset || '') === '1') {
    if (!at) return jsonOut_({ ok: true, at: 0 });
    if (now - at >= START_RESET_MS) return jsonOut_({ ok: false, error: 'too_late', at: at });
    props.setProperty('START_AT', '');
    return jsonOut_({ ok: true, at: 0, reset: 1 });
  }
  if (at) return jsonOut_({ ok: true, at: at, already: 1, now: now });
  props.setProperty('START_AT', String(now));
  return jsonOut_({ ok: true, at: now, now: now });
}
// ===== /СТАРТ ПРОЕКТА v1 =====
