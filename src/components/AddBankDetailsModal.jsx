import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { createBankDetail } from "../api/banking"
import './Modal.css'
import axios from "axios"

const tajikBanks = ['Spitamen', 'Eskhata', 'IBT', 'IMON']
const abkhasianBanks = ['Amra', 'Aurora', 'Bank Abskasia']
const russianBanks = [
  {
    "code": "sberbank",
    "name": "Сбербанк",
    "nspkCode": "100000000111"
  },
  {
    "code": "tinkoff",
    "name": "Т-Банк",
    "nspkCode": "100000000004"
  },
  {
    "code": "vtb",
    "name": "Банк ВТБ",
    "nspkCode": "110000000005"
  },
  {
    "code": "alfabank",
    "name": "АЛЬФА-БАНК",
    "nspkCode": "100000000008"
  },
  {
    "code": "raiffeisenbank",
    "name": "Райффайзенбанк",
    "nspkCode": "100000000007"
  },
  {
    "code": "bank_open",
    "name": "Банк ОТКРЫТИЕ",
    "nspkCode": "100000000015"
  },
  {
    "code": "gazprombank",
    "name": "Газпромбанк",
    "nspkCode": "100000000001"
  },
  {
    "code": "promsvyaz",
    "name": "Промсвязьбанк",
    "nspkCode": "100000000010"
  },
  {
    "code": "sovkom",
    "name": "Совкомбанк",
    "nspkCode": "100000000013"
  },
  {
    "code": "ros_bank",
    "name": "РОСБАНК",
    "nspkCode": "100000000012"
  },
  {
    "code": "rsb",
    "name": "Банк Русский Стандарт",
    "nspkCode": "100000000014"
  },
  {
    "code": "absolute_bank",
    "name": "АКБ Абсолют Банк",
    "nspkCode": "100000000047"
  },
  {
    "code": "home_bank",
    "name": "Хоум кредит",
    "nspkCode": "100000000024"
  },
  {
    "code": "otp_bank",
    "name": "ОТП Банк",
    "nspkCode": "100000000018"
  },
  {
    "code": "uralsib",
    "name": "БАНК УРАЛСИБ",
    "nspkCode": "100000000026"
  },
  {
    "code": "ak_bars_bank",
    "name": "АК БАРС БАНК",
    "nspkCode": "100000000006"
  },
  {
    "code": "fora",
    "name": "АКБ ФОРА-БАНК",
    "nspkCode": "100000000217"
  },
  {
    "code": "rost_finance",
    "name": "КБ РостФинанс",
    "nspkCode": "100000000098"
  },
  {
    "code": "ozon",
    "name": "Озон Банк (Ozon)",
    "nspkCode": "100000000273"
  },
  {
    "code": "unistream",
    "name": "КБ ЮНИСТРИМ",
    "nspkCode": "100000000042"
  },
  {
    "code": "mts",
    "name": "МТС-Банк",
    "nspkCode": "100000000017"
  },
  {
    "code": "tkb",
    "name": "ТрансКапиталБанк",
    "nspkCode": "100000000034"
  },
  {
    "code": "pochta",
    "name": "Почта Банк",
    "nspkCode": "100000000016"
  },
  {
    "code": "rncb",
    "name": "РНКБ Банк",
    "nspkCode": "100000000011"
  },
  {
    "code": "genbank",
    "name": "ГЕНБАНК",
    "nspkCode": "100000000037"
  },
  {
    "code": "cifra",
    "name": "Цифра банк",
    "nspkCode": "100000000265"
  },
  {
    "code": "ingo",
    "name": "Ингосстрах Банк",
    "nspkCode": "100000000078"
  },
  {
    "code": "svoi",
    "name": "Свой Банк",
    "nspkCode": "100000000006"
  },
  {
    "code": "avangard",
    "name": "АКБ АВАНГАРД",
    "nspkCode": "100000000028"
  },
  {
    "code": "rencredit",
    "name": "КБ Ренессанс Кредит",
    "nspkCode": "100000000032"
  },
  {
    "code": "solid",
    "name": "КБ Солидарность",
    "nspkCode": "100000000121"
  },
  {
    "code": "pucbr",
    "name": "ПУ Банк России",
    "nspkCode": "100000000027"
  },
  {
    "code": "expobank",
    "name": "Экспобанк",
    "nspkCode": "100000000044"
  },
  {
    "code": "apkbank",
    "name": "КБ АГРОПРОМКРЕДИТ",
    "nspkCode": "100000000118"
  },
  {
    "code": "bktb",
    "name": "Кубаньторгбанк",
    "nspkCode": "100000000180"
  },
  {
    "code": "bystrobank",
    "name": "БыстроБанк",
    "nspkCode": "100000000092"
  },
  {
    "code": "nico-bank",
    "name": "НИКО-БАНК",
    "nspkCode": "100000000115"
  },
  {
    "code": "okbank",
    "name": "Банк Объединенный капитал",
    "nspkCode": "100000000182"
  },
  {
    "code": "pscb",
    "name": "Банк ПСКБ",
    "nspkCode": "100000000087"
  },
  {
    "code": "zarech",
    "name": "Банк Заречье",
    "nspkCode": "100000000205"
  },
  {
    "code": "zemsky",
    "name": "Земский банк",
    "nspkCode": "100000000066"
  },
  {
    "code": "abr",
    "name": "АБ РОССИЯ",
    "nspkCode": "100000000095"
  },
  {
    "code": "bksbank",
    "name": "БКС Банк",
    "nspkCode": "100000000041"
  },
  {
    "code": "chelinvest",
    "name": "ЧЕЛЯБИНВЕСТБАНК",
    "nspkCode": "100000000094"
  },
  {
    "code": "databank",
    "name": "Датабанк",
    "nspkCode": "100000000070"
  },
  {
    "code": "domrfbank",
    "name": "Банк ДОМ.РФ",
    "nspkCode": "100000000082"
  },
  {
    "code": "energobank",
    "name": "АКБ Энергобанк",
    "nspkCode": "100000000159"
  },
  {
    "code": "forshtadt",
    "name": "АКБ Форштадт",
    "nspkCode": "100000000081"
  },
  {
    "code": "gaztransbank",
    "name": "Газтрансбанк",
    "nspkCode": "100000000183"
  },
  {
    "code": "gebank",
    "name": "Газэнергобанк",
    "nspkCode": "100000000043"
  },
  {
    "code": "in-bank",
    "name": "Инбанк",
    "nspkCode": "100000000196"
  },
  {
    "code": "iturupbank",
    "name": "Банк ИТУРУП",
    "nspkCode": "100000000158"
  },
  {
    "code": "kbb",
    "name": "Кузнецкбизнесбанк",
    "nspkCode": "100000000195"
  },
  {
    "code": "kbhmb",
    "name": "Хакасский муниципальный банк",
    "nspkCode": "100000000127"
  },
  {
    "code": "kkbank",
    "name": "КБ Кубань Кредит",
    "nspkCode": "100000000050"
  },
  {
    "code": "koshelev-bank",
    "name": "КОШЕЛЕВ-БАНК",
    "nspkCode": "100000000146"
  },
  {
    "code": "kremlinbank",
    "name": "Банк Кремлевский",
    "nspkCode": "100000000201"
  },
  {
    "code": "maritimebank",
    "name": "МОРСКОЙ БАНК",
    "nspkCode": "100000000171"
  },
  {
    "code": "mcbank",
    "name": "БАНК МОСКВА-СИТИ",
    "nspkCode": "100000000234"
  },
  {
    "code": "metallinvestbank",
    "name": "Металлинвестбанк",
    "nspkCode": "100000000046"
  },
  {
    "code": "akibank",
    "name": "АКИБАНК",
    "nspkCode": "100000000107"
  },
  {
    "code": "modulbank",
    "name": "КБ Модульбанк",
    "nspkCode": "100000000099"
  },
  {
    "code": "mp-bank",
    "name": "МП Банк",
    "nspkCode": "100000000169"
  },
  {
    "code": "nkbank",
    "name": "НК Банк",
    "nspkCode": "100000000233"
  },
  {
    "code": "norvikbank",
    "name": "Норвик Банк",
    "nspkCode": "100000000202"
  },
  {
    "code": "novikom",
    "name": "Банк НОВИКОМ (НОВИКОМБАНК)",
    "nspkCode": "100000000177"
  },
  {
    "code": "novobank",
    "name": "УКБ Новобанк",
    "nspkCode": "100000000222"
  },
  {
    "code": "nsbank",
    "name": "НС Банк",
    "nspkCode": "100000000071"
  },
  {
    "code": "orbank",
    "name": "БАНК ОРЕНБУРГ",
    "nspkCode": "100000000124"
  },
  {
    "code": "crediteurope",
    "name": "Кредит Европа Банк (Россия)",
    "nspkCode": "100000000027"
  },
  {
    "code": "pskb",
    "name": "СКБ Приморья Примсоцбанк",
    "nspkCode": "100000000088"
  },
  {
    "code": "realistbank",
    "name": "РЕАЛИСТ БАНК",
    "nspkCode": "100000000232"
  },
  {
    "code": "resocreditbank",
    "name": "Банк РЕСО Кредит",
    "nspkCode": "100000000187"
  },
  {
    "code": "sinko-bank",
    "name": "КБ СИНКО-БАНК",
    "nspkCode": "100000000148"
  },
  {
    "code": "socium-bank",
    "name": "СОЦИУМ-БАНК",
    "nspkCode": "100000000223"
  },
  {
    "code": "tatsotsbank",
    "name": "ТАТСОЦБАНК",
    "nspkCode": "100000000189"
  },
  {
    "code": "timerbank",
    "name": "Тимер Банк",
    "nspkCode": "100000000144"
  },
  {
    "code": "transstroybank",
    "name": "АКБ Трансстройбанк",
    "nspkCode": "100000000197"
  },
  {
    "code": "agros",
    "name": "Банк Агророс",
    "nspkCode": "100000000102"
  },
  {
    "code": "akcept",
    "name": "Банк Акцепт",
    "nspkCode": "100000000135"
  },
  {
    "code": "alefbank",
    "name": "АКБ Алеф-Банк",
    "nspkCode": "100000000113"
  },
  {
    "code": "aresbank",
    "name": "КБ АРЕСБАНК",
    "nspkCode": "100000000129"
  },
  {
    "code": "bancaintesa",
    "name": "Банк Интеза",
    "nspkCode": "100000000170"
  },
  {
    "code": "bank-hlynov",
    "name": "КБ Хлынов",
    "nspkCode": "100000000056"
  },
  {
    "code": "bankofkazan",
    "name": "КБЭР Банк Казани",
    "nspkCode": "100000000191"
  },
  {
    "code": "bspb",
    "name": "Банк Санкт-Петербург",
    "nspkCode": "100000000029"
  },
  {
    "code": "centrinvest",
    "name": "КБ Центр-инвест",
    "nspkCode": "100000000059"
  },
  {
    "code": "cfb",
    "name": "Банк БКФ",
    "nspkCode": "100000000227"
  },
  {
    "code": "chelindbank",
    "name": "ЧЕЛИНДБАНК",
    "nspkCode": "100000000106"
  },
  {
    "code": "coalmetbank",
    "name": "Углеметбанк",
    "nspkCode": "100000000093"
  },
  {
    "code": "creditural",
    "name": "Кредит Урал Банк",
    "nspkCode": "100000000064"
  },
  {
    "code": "dcapital",
    "name": "Банк Развитие-Столица",
    "nspkCode": "100000000172"
  },
  {
    "code": "dvbank",
    "name": "Дальневосточный банк",
    "nspkCode": "100000000083"
  },
  {
    "code": "el-plat",
    "name": "ПНКО ЭЛПЛАТ",
    "nspkCode": "100000000086"
  },
  {
    "code": "energotransbank",
    "name": "КБ ЭНЕРГОТРАНСБАНК",
    "nspkCode": "100000000139"
  },
  {
    "code": "finam",
    "name": "Банк ФИНАМ",
    "nspkCode": "100000000040"
  },
  {
    "code": "gibank",
    "name": "КБ Гарант-Инвест",
    "nspkCode": "100000000112"
  },
  {
    "code": "gorbank",
    "name": "ГОРБАНК",
    "nspkCode": "100000000125"
  },
  {
    "code": "gutabank",
    "name": "ГУТА-БАНК",
    "nspkCode": "100000000149"
  },
  {
    "code": "icbru",
    "name": "ИК Банк",
    "nspkCode": "100000000122"
  },
  {
    "code": "lanta",
    "name": "АКБ Ланта-Банк",
    "nspkCode": "100000000245"
  },
  {
    "code": "lockobank",
    "name": "КБ ЛОКО-Банк",
    "nspkCode": "100000000161"
  },
  {
    "code": "mcbankrus",
    "name": "МС Банк Рус",
    "nspkCode": "100000000229"
  },
  {
    "code": "metcom",
    "name": "МЕТКОМБАНК",
    "nspkCode": "100000000136"
  },
  {
    "code": "mspbank",
    "name": "МС Примбанк",
    "nspkCode": "100000000255"
  },
  {
    "code": "nipbank",
    "name": "Нацинвестпромбанк",
    "nspkCode": "100000000185"
  },
  {
    "code": "ns-bank",
    "name": "Банк Национальный стандарт",
    "nspkCode": "100000000243"
  },
  {
    "code": "nskbl",
    "name": "Банк Левобережный",
    "nspkCode": "100000000052"
  },
  {
    "code": "poidem",
    "name": "КБ Пойдём",
    "nspkCode": "100000000103"
  },
  {
    "code": "primbank",
    "name": "АКБ Приморье",
    "nspkCode": "100000000226"
  },
  {
    "code": "probank",
    "name": "ПроБанк",
    "nspkCode": "100000000117"
  },
  {
    "code": "rdb",
    "name": "РосДорБанк",
    "nspkCode": "100000000084"
  },
  {
    "code": "sdm",
    "name": "СДМ-Банк",
    "nspkCode": "100000000069"
  },
  {
    "code": "sevnb",
    "name": "Северный Народный Банк",
    "nspkCode": "100000000208"
  },
  {
    "code": "sibsoc",
    "name": "СИБСОЦБАНК",
    "nspkCode": "100000000166"
  },
  {
    "code": "sngb",
    "name": "БАНК СНГБ",
    "nspkCode": "100000000091"
  },
  {
    "code": "tavrich",
    "name": "Таврический Банк",
    "nspkCode": "100000000173"
  },
  {
    "code": "tenderbank",
    "name": "АКБ ТЕНДЕР-БАНК",
    "nspkCode": "100000000175"
  },
  {
    "code": "thbank",
    "name": "Тольяттихимбанк",
    "nspkCode": "100000000152"
  },
  {
    "code": "tpsbank",
    "name": "Томскпромстройбанк",
    "nspkCode": "100000000206"
  },
  {
    "code": "unicreditbank",
    "name": "ЮниКредит Банк",
    "nspkCode": "100000000030"
  },
  {
    "code": "uralfd",
    "name": "КБ Урал ФД",
    "nspkCode": "100000000151"
  },
  {
    "code": "vbrr",
    "name": "Банк ВБРР",
    "nspkCode": "100000000049"
  },
  {
    "code": "venets-bank",
    "name": "Банк Венец",
    "nspkCode": "100000000153"
  },
  {
    "code": "vfbank",
    "name": "КБ ВНЕШФИНБАНК",
    "nspkCode": "100000000248"
  },
  {
    "code": "zenit",
    "name": "Банк ЗЕНИТ",
    "nspkCode": "100000000045"
  },
  {
    "code": "yoomoney",
    "name": "НКО ЮМани",
    "nspkCode": "100000000022"
  },
  {
    "code": "avtofinbank",
    "name": "Авто Финанс Банк",
    "nspkCode": "100000000253"
  },
  {
    "code": "avtotorgbank",
    "name": "Автоторгбанк",
    "nspkCode": "100000000181"
  },
  {
    "code": "aikb-enisejskij-obedinennyj-bank",
    "name": "АИКБ Енисейский объединенный банк",
    "nspkCode": "100000000258"
  },
  {
    "code": "bank-sinara",
    "name": "Банк Синара",
    "nspkCode": "100000000003"
  },
  {
    "code": "bank-uralfinans",
    "name": "Уралфинанс",
    "nspkCode": "100000000096"
  },
  {
    "code": "bank-centrokredit",
    "name": "ЦентроКредит",
    "nspkCode": "100000000231"
  },
  {
    "code": "is-bank",
    "name": "ИС Банк",
    "nspkCode": "100000000239"
  },
  {
    "code": "kb-dolinsk",
    "name": "КБ Долинск",
    "nspkCode": "100000000270"
  },
  {
    "code": "novyj-vek",
    "name": "КБ Новый век",
    "nspkCode": "100000000067"
  },
  {
    "code": "ukb-belgorodsocbank",
    "name": "УКБ Белгородсоцбанк",
    "nspkCode": "100000000225"
  },
  {
    "code": "avtogradbank",
    "name": "Автоградбанк",
    "nspkCode": "100000000130"
  },
  {
    "code": "bank-ekaterinburg",
    "name": "Банк Екатеринбург",
    "nspkCode": "100000000090"
  },
  {
    "code": "bank-sgb",
    "name": "БАНК СГБ",
    "nspkCode": "100000000219"
  },
  {
    "code": "bank-siab",
    "name": "Банк СИАБ",
    "nspkCode": "100000000278"
  },
  {
    "code": "dzhej-jend-ti-bank",
    "name": "Джей энд Ти Банк (АО)",
    "nspkCode": "100000000213"
  },
  {
    "code": "mb-bank",
    "name": "МБ Банк",
    "nspkCode": "100000000140"
  },
  {
    "code": "smp-bank",
    "name": "СМП Банк",
    "nspkCode": "100000000036"
  },
  {
    "code": "tochka-otkrytie",
    "name": "ТОЧКА (ФК Открытие)",
    "nspkCode": "100000000284"
  },
  {
    "code": "bsdbank",
    "name": "Черноморский банк развития",
    "nspkCode": "100000000215"
  },
  {
    "code": "klookva",
    "name": "Клюква",
    "nspkCode": "100000000154"
  },
  {
    "code": "blanc",
    "name": "Бланк банк",
    "nspkCode": "100000000053"
  },
  {
    "code": "tkbbank",
    "name": "ТКБ БАНК",
    "nspkCode": "100000000034"
  },
  {
    "code": "severgazbank",
    "name": "Севергазбанк",
    "nspkCode": "100000000219"
  },
  {
    "code": "nrb",
    "name": "АКБ НРБанк",
    "nspkCode": "100000000184"
  },
  {
    "code": "finstarbank",
    "name": "ФИНСТАР БАНК",
    "nspkCode": "100000000278"
  },
  {
    "code": "round",
    "name": "банк Раунд",
    "nspkCode": "100000000247"
  },
  {
    "code": "dtb1",
    "name": "Первый Дортрансбанк",
    "nspkCode": "100000000137"
  },
  {
    "code": "cmrbank",
    "name": "ЦМРБанк",
    "nspkCode": "100000000282"
  },
  {
    "code": "plait",
    "name": "Плайт",
    "nspkCode": "100000000296"
  },
  {
    "code": "bankorange",
    "name": "Банк Оранжевый",
    "nspkCode": "100000000286"
  },
  {
    "code": "yarinterbank",
    "name": "ИКБР ЯРИНТЕРБАНК",
    "nspkCode": "100000000293"
  },
  {
    "code": "yandexbank",
    "name": "Яндекс Банк",
    "nspkCode": "100000000150"
  },
  {
    "code": "bank-mba-moskva",
    "name": "Банк МБА МОСКВА",
    "nspkCode": "100000000192"
  },
  {
    "code": "bank-ipb",
    "name": "Банк ИПБ",
    "nspkCode": "100000000236"
  },
  {
    "code": "bank-jelita",
    "name": "банк Элита",
    "nspkCode": "100000000266"
  },
  {
    "code": "bank-vologzhanin",
    "name": "Банк Вологжанин",
    "nspkCode": "100000000257"
  },
  {
    "code": "drajv-klik-bank",
    "name": "Драйв Клик Банк",
    "nspkCode": "100000000250"
  },
  {
    "code": "rosselhozbank",
    "name": "Россельхозбанк",
    "nspkCode": "100000000020"
  },
  {
    "code": "hajs",
    "name": "Хайс",
    "nspkCode": "100000000272"
  },
  {
    "code": "jes-bi-aj-bank",
    "name": "Эс-Би-Ай Банк",
    "nspkCode": "100000000105"
  },
  {
    "code": "rusnarbank",
    "name": "РУСНАРБАНК",
    "nspkCode": "100000000194"
  },
  {
    "code": "bank-saratov",
    "name": "Банк Саратов",
    "nspkCode": "100000000126"
  },
  {
    "code": "pervyj-investicionnyj-bank",
    "name": "Первый Инвестиционный Банк",
    "nspkCode": "100000000174"
  },
  {
    "code": "akb-derzhava",
    "name": "АКБ Держава",
    "nspkCode": "100000000235"
  },
  {
    "code": "kb-strojlesbank",
    "name": "КБ Стройлесбанк",
    "nspkCode": "100000000193"
  },
  {
    "code": "tojota-bank",
    "name": "Тойота Банк",
    "nspkCode": "100000000138"
  },
  {
    "code": "kb-moskommercbank",
    "name": "КБ Москоммерцбанк",
    "nspkCode": "100000000110"
  },
  {
    "code": "uralprombank",
    "name": "УРАЛПРОМБАНК",
    "nspkCode": "100000000142"
  },
  {
    "code": "sitibank",
    "name": "Ситибанк",
    "nspkCode": "100000000128"
  },
  {
    "code": "bank-aleksandrovskij",
    "name": "Банк АЛЕКСАНДРОВСКИЙ",
    "nspkCode": "100000000211"
  },
  {
    "code": "mezhdunarodnyj-finansovyj-klub",
    "name": "МЕЖДУНАРОДНЫЙ ФИНАНСОВЫЙ КЛУБ",
    "nspkCode": "100000000203"
  },
  {
    "code": "mkb",
    "name": "Московский кредитный банк",
    "nspkCode": "100000000025"
  },
  {
    "code": "nbd-bank",
    "name": "НБД-Банк",
    "nspkCode": "100000000134"
  },
  {
    "code": "jandeks-bank",
    "name": "Яндекс Банк",
    "nspkCode": "100000000150"
  },
  {
    "code": "nokssbank",
    "name": "НОКССБАНК",
    "nspkCode": "100000000062"
  },
  {
    "code": "vuz-bank",
    "name": "ВУЗ-банк",
    "nspkCode": "100000000215"
  },
  {
    "code": "bank-bzhf",
    "name": "Банк БЖФ",
    "nspkCode": "100000000260"
  },
  {
    "code": "jug-investbank",
    "name": "ЮГ-Инвестбанк",
    "nspkCode": "100000000160"
  },
  {
    "code": "kb-krokus-bank",
    "name": "КБ Крокус Банк",
    "nspkCode": "100000000212"
  },
  {
    "code": "vladbiznesbank",
    "name": "ВЛАДБИЗНЕСБАНК",
    "nspkCode": "100000000058"
  },
  {
    "code": "bank-avers",
    "name": "Банк Аверс",
    "nspkCode": "100000000154"
  },
  {
    "code": "wbbank",
    "name": "Вайлдберриз Банк",
    "nspkCode": "100000000259"
  },
  {
    "code": "ishbank",
    "name": "ИШБАНК",
    "nspkCode": "100000000199"
  },
  {
    "code": "almazjergijenbank",
    "name": "Алмазэргиэнбанк",
    "nspkCode": ""
  },
  {
    "code": "aziatsko-tihookeanskij-bank",
    "name": "Азиатско-Тихоокеанский Банк",
    "nspkCode": "100000000108"
  },
  {
    "code": "agroros",
    "name": "Банк Агророс",
    "nspkCode": "100000000102"
  },
  {
    "code": "bbr-bank",
    "name": "ББР Банк",
    "nspkCode": "100000000133"
  },
  {
    "code": "solid-bank",
    "name": "Солид Банк",
    "nspkCode": "100000000230"
  },
  {
    "code": "rus-universalbank",
    "name": "Русьуниверсалбанк",
    "nspkCode": "100000000165"
  },
  {
    "code": "akb-slavija",
    "name": "АКБ СЛАВИЯ",
    "nspkCode": "100000000200"
  },
  {
    "code": "akb-evrofinans-mosnarbank",
    "name": "АКБ ЕВРОФИНАНС МОСНАРБАНК",
    "nspkCode": "100000000167"
  },
  {
    "code": "ubrib",
    "name": "Банк УБРиР",
    "nspkCode": "100000000031"
  },
  {
    "code": "bank-raund",
    "name": "банк Раунд",
    "nspkCode": "100000000247"
  },
  {
    "code": "tochka-bank",
    "name": "Точка Банк",
    "nspkCode": "100000000284"
  },
  {
    "code": "prio-vneshtorgbank",
    "name": "Прио-Внешторгбанк",
    "nspkCode": "100000000228"
  },
  {
    "code": "bank-snezhinskij",
    "name": "Банк Снежинский",
    "nspkCode": "100000000163"
  },
  {
    "code": "moskombank",
    "name": "МОСКОМБАНК",
    "nspkCode": "100000000176"
  }
]

const AddBankDetailsModal = ({isOpen, onClose, onSuccess}) => {

    const {traderID} = useAuth()

    const [form, setForm] = useState({
        trader_id: traderID,
        currency: '',
        inflow_currency: '',
        payment_system: '',
        bank_name: '',
        bank_code: '',
        nspk_code: '',
        card_number: '',
        phone: '',
        owner: '',
        min_amount: 0,
        max_amount: 0,
        max_amount_day: 0,
        max_amount_month: 0,
        max_quantity_day: 0,
        max_quantity_month: 0,
        max_orders_simultaneosly: 0,
        delay: 0,
        enabled: false
    })

    const [bankOptions, setBankOptions] = useState([])
    const [paymentSystemOptions, setPaymentSystemOptions] = useState([])
    const [inflowCurrencyVisible, setInflowCurrencyVisible] = useState(false)

    useEffect(() => {
        switch (form.currency) {
            case 'RUB':
                setPaymentSystemOptions([
                    {
                        value: "SBP",
                        name: "СБП"
                    },
                    {
                        value: "C2C",
                        name: "Перевод на карту"
                    },
                    {
                        value: "TRANSGRAN",
                        name: "Трансграничный перевод"
                    }
                ])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            case 'TJS':
                setPaymentSystemOptions([
                    {
                        value: "C2C_TJK",
                        name: "Перевод на карту"
                    },
                    {
                        value: "ACCOUNT_NUMBER_TJK",
                        name: "По номеру счёта"
                    }
                ])
                // setBankOptions(tajikBanks)
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            default:
                setPaymentSystemOptions([])
                setForm(prev => ({...prev, payment_system: ""}))
                // setBankOptions([])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                break
        }
        console.log(paymentSystemOptions)
    }, [form.currency])

    useEffect(() => {
        switch (form.payment_system) {
            case 'TRANSGRAN':
                setInflowCurrencyVisible(true)
                setForm(prev => ({...prev, inflow_currency: ""}))
                break
            case 'C2C':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
            case 'SBP':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
            case 'C2C_TJK':
                setForm(prev => ({...prev, inflow_currency: 'TJK'}))
                setInflowCurrencyVisible(false)
                break
            default:
                setForm(prev => ({...prev, inflow_currency: ''}))
                setInflowCurrencyVisible(false)
                break
        }
    }, [form.payment_system])

    useEffect(() => {
        switch (form.inflow_currency) {
            case 'RUB':
                if (form.payment_system == 'TRANSGRAN'){
                    setBankOptions(abkhasianBanks)
                }else{
                    setBankOptions(russianBanks)
                }
                setForm(prev => ({...prev, bank_name: ""}))
                break
            case 'TJS':
                setBankOptions(tajikBanks)
                setForm(prev => ({...prev, bank_name: ""}))
                break
            default:
                setBankOptions([])
                setForm(prev => ({...prev, bank_name:""}))
                break
        }
    }, [form.inflow_currency])

    const handleOnChange = (e) => {
      const { name, type, value, checked, selectedOptions } = e.target;
    
      if (name === "bank_code") {
        const selected = selectedOptions[0];
        const selectedName = selected.getAttribute("data-name");
        const selectedNspk = selected.getAttribute("data-nspk");
    
        setForm((prev) => ({
          ...prev,
          bank_code: value,
          bank_name: selectedName,
          nspk_code: selectedNspk,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
      }
    };

    // useEffect(() => {
    //     const getBanks = async () => {
    //         const response = await axios.get('https://api.bitwire.finance/api/integration/bank')
    //         console.log(response.data)
    //         return response.data
    //     }
    //     getBanks()
    // }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        async function sendData() {
            const data = await createBankDetail(form)
            onSuccess()
            onClose()
        }
        sendData()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
        <div className="bank-modal">
            <div className="bank-modal-header">
                <h2>Добавить реквизит</h2>
                <button className="modal-close-btn" onClick={onClose}>×</button>
            </div>
            <div className="bank-modal-body">
            <form onSubmit={handleSubmit} className="bank-modal-form">
                <div className="bank-modal-row">
                    <label htmlFor="currency">Валюта</label>
                    <select 
                        name="currency"
                        id="currency"
                        type="text"
                        value={form.currency}
                        onChange={handleOnChange}
                    >
                        <option value="">Выберите валюту</option>
                        <option value="RUB">RUB</option>
                        <option value="TJS">TJS</option>
                    </select>
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="payment_system">Способ оплаты</label>
                    <select
                        name="payment_system"
                        id="payment_system"
                        type="text"
                        value={form.payment_system}
                        onChange={handleOnChange}
                        disabled={form.currency == ""}
                    >
                        <option value="">Выберите способ оплаты</option>
                        {
                            paymentSystemOptions.map((paymentSystem) => (
                                <option 
                                    key={paymentSystem.value}
                                    value={paymentSystem.value}
                                >
                                    {paymentSystem.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                {inflowCurrencyVisible && <div className="bank-modal-row">
                    <label htmlFor="inflow_currency">Валюта поступления</label>
                    <select
                        name="inflow_currency"
                        id="inflow_currency"
                        type="text"
                        value={form.inflow_currency}
                        onChange={handleOnChange}
                        
                    >
                        <option value="">Выберите валюту</option>
                        <option value="RUB">RUB</option>
                        <option value="TJS">TJS</option>
                    </select>
                </div>}

                 <div className="bank-modal-row">
                    <label htmlFor="bank_code">Банк</label>
                    <select
                        name="bank_code"
                        id="bank_code"
                        type="text"
                        placeholder="Банк"
                        value={form.bank_code}
                        onChange={handleOnChange}
                        disabled={bankOptions.length === 0}
                    >
                        <option value="">Выберите банк</option>
                        {
                            bankOptions.map((bank) => (
                                <option 
                                  key={bank.code} 
                                  value={bank.code}
                                  data-name={bank.name}
                                  data-nspk={bank.nspkCode}
                                >{bank.name}</option>
                            ))
                        }
                    </select>
                </div>

                {(form.payment_system === 'C2C') && <div className="bank-modal-row">
                    <label htmlFor="card_number">Номер карты</label>
                    <input
                        name="card_number"
                        id="card_number"
                        type="text"
                        placeholder="Номер карты"
                        value={form.card_number}
                        onChange={handleOnChange}
                    />
                </div>}

                { (form.payment_system === 'SBP' || form.payment_system === 'SBP_TJK' || form.payment_system === 'TRANSGRAN' && form.currency === 'RUB' && form.inflow_currency === 'TJS') 
                && <div className="bank-modal-row">
                    <label>Номер телефона</label>
                    <input
                        name="phone"
                        id="phone"
                        type="text"
                        placeholder="Номер телефона"
                        value={form.phone}
                        onChange={handleOnChange}
                    />
                </div>}

                <div className="bank-modal-row">
                    <label htmlFor="owner">Имя владельца</label>
                    <input
                        name="owner"
                        id="owner"
                        type="text"
                        value={form.owner}
                        onChange={handleOnChange}
                    />
                </div>
                <h2>Лимиты</h2>
                <div className="bank-modal-row">
                    <label htmlFor="min_amount">Мин сумма сделки</label>
                    <input
                        name="min_amount"
                        id="min_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.min_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount">Макс сумма сделки</label>
                    <input
                        name="max_amount"
                        id="max_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_day">Сумма (день)</label>
                    <input
                        name="max_amount_day"
                        id="max_amount_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_month">Сумма (месяц)</label>
                    <input
                        name="max_amount_month"
                        id="max_amount_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_day">Макс кол-во сделок (день)</label>
                    <input
                        name="max_quantity_day"
                        id="max_quantity_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_month">Макс кол-во сделок (месяц)</label>
                    <input
                        name="max_quantity_month"
                        id="max_quantity_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_orders_simultaneosly">Сделок одновременно</label>
                    <input
                        name="max_orders_simultaneosly"
                        id="max_orders_simultaneosly"
                        type="number"
                        min={0}
                        max={10000}
                        value={form.max_orders_simultaneosly}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="delay">Задержка между сделками(мин)</label>
                    <input
                        name="delay"
                        id="delay"
                        type="number"
                        min={0}
                        max={100000}
                        value={form.delay}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="enabled">Активность</label>
                    <input
                        name="enabled"
                        id="enabled"
                        type="checkbox"
                        checked={form.enabled}
                        onChange={handleOnChange}
                    />
                </div>

                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Выйти</button>
            </form>
            </div>
        </div>
        </div>
    )
}

export default AddBankDetailsModal