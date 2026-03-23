// ---------------------------------------------------------------------------
// Language-specific feeds (40+ languages)
// ---------------------------------------------------------------------------

export const LANG_FEEDS = {
  // ===== Indian Languages =====
  hi: [
    { url: 'https://feeds.bbci.co.uk/hindi/rss.xml', source: 'BBC Hindi' },
    { url: 'https://rss.jagran.com/rss/news/national.xml', source: 'Dainik Jagran' },
    { url: 'https://www.amarujala.com/rss/breaking-news.xml', source: 'Amar Ujala' },
    { url: 'https://www.bhaskar.com/rss-feed/1061/', source: 'Dainik Bhaskar' },
    { url: 'https://feeds.feedburner.com/ndtvkhabar', source: 'NDTV Hindi' },
    { url: 'https://feed.livehindustan.com/rss/3127', source: 'Live Hindustan' },
    { url: 'https://www.jansatta.com/feed/', source: 'Jansatta' },
    { url: 'https://www.aajtak.in/rssfeeds/story-of/home', source: 'Aaj Tak' },
    { url: 'https://www.indiatv.in/rssfeed/topstory-news.xml', source: 'India TV Hindi' },
    { url: 'https://navbharattimes.indiatimes.com/rssfeedsdefault.cms', source: 'Navbharat Times' },
    { url: 'https://hindi.webdunia.com/rss/rss-samachar.xml', source: 'Webdunia Hindi' },
    { url: 'https://www.patrika.com/rss/top-news', source: 'Rajasthan Patrika' },
  ],
  ta: [
    { url: 'https://feeds.bbci.co.uk/tamil/rss.xml', source: 'BBC Tamil' },
    { url: 'https://www.hindutamil.in/stories.rss', source: 'The Hindu Tamil' },
    { url: 'https://www.dinamalar.com/rssfeed.asp', source: 'Dinamalar' },
    { url: 'https://www.vikatan.com/rss', source: 'Vikatan' },
    { url: 'https://tamil.oneindia.com/rss/tamil-news.xml', source: 'Oneindia Tamil' },
    { url: 'https://www.dinakaran.com/rss_dkn.asp', source: 'Dinakaran' },
    { url: 'https://www.dinamani.com/rss.xml', source: 'Dinamani' },
  ],
  te: [
    { url: 'https://feeds.bbci.co.uk/telugu/rss.xml', source: 'BBC Telugu' },
    { url: 'https://www.sakshi.com/rss.xml', source: 'Sakshi' },
    { url: 'https://www.eenadu.net/rss/telugu-news.xml', source: 'Eenadu' },
    { url: 'https://telugu.oneindia.com/rss/telugu-news.xml', source: 'Oneindia Telugu' },
    { url: 'https://www.andhrajyothy.com/rss.xml', source: 'Andhra Jyothy' },
  ],
  bn: [
    { url: 'https://feeds.bbci.co.uk/bengali/rss.xml', source: 'BBC Bangla' },
    { url: 'https://eisamay.com/stories.rss', source: 'Ei Samay' },
    { url: 'https://zeenews.india.com/bengali/rssfeed/nation.xml', source: 'Zee News Bengali' },
    { url: 'https://www.anandabazar.com/rss/all-stories', source: 'Anandabazar Patrika' },
    { url: 'https://bengali.oneindia.com/rss/bengali-news.xml', source: 'Oneindia Bengali' },
    { url: 'https://www.thedailystar.net/bangla/rss.xml', source: 'Daily Star Bangla' },
    { url: 'https://en.prothomalo.com/feed/', source: 'Prothom Alo English' },
  ],
  mr: [
    { url: 'https://zeenews.india.com/marathi/rss/india-news.xml', source: 'Zee News Marathi' },
    { url: 'https://zeenews.india.com/marathi/rss/maharashtra-news.xml', source: 'Zee News Maharashtra' },
    { url: 'https://www.loksatta.com/desh-videsh/feed/', source: 'Loksatta' },
    { url: 'https://marathi.oneindia.com/rss/marathi-news.xml', source: 'Oneindia Marathi' },
    { url: 'https://www.lokmat.com/rss/feed/', source: 'Lokmat' },
  ],
  kn: [
    { url: 'https://vijaykarnataka.com/rssfeedsdefault.cms', source: 'Vijaya Karnataka' },
    { url: 'https://kannada.oneindia.com/rss/kannada-news.xml', source: 'Oneindia Kannada' },
    { url: 'https://www.prajavani.net/rss.xml', source: 'Prajavani' },
  ],
  ml: [
    { url: 'http://feeds.feedburner.com/mathrubhumi', source: 'Mathrubhumi' },
    { url: 'https://www.manoramaonline.com/rss/news/', source: 'Manorama Online' },
    { url: 'https://malayalam.oneindia.com/rss/malayalam-news.xml', source: 'Oneindia Malayalam' },
    { url: 'https://www.mathrubhumi.com/rss/news', source: 'Mathrubhumi' },
  ],
  gu: [
    { url: 'https://feeds.bbci.co.uk/gujarati/rss.xml', source: 'BBC Gujarati' },
    { url: 'https://www.gujaratsamachar.com/rss/top-stories', source: 'Gujarat Samachar' },
    { url: 'https://www.divyabhaskar.co.in/rss-feed/1037/', source: 'Divya Bhaskar' },
    { url: 'https://gujarati.oneindia.com/rss/gujarati-news.xml', source: 'Oneindia Gujarati' },
  ],
  pa: [
    { url: 'https://feeds.bbci.co.uk/punjabi/rss.xml', source: 'BBC Punjabi' },
    { url: 'https://punjabi.oneindia.com/rss/punjabi-news.xml', source: 'Oneindia Punjabi' },
  ],
  ur: [
    { url: 'https://feeds.bbci.co.uk/urdu/rss.xml', source: 'BBC Urdu' },
    { url: 'https://www.dawnnews.tv/feed/', source: 'Dawn Urdu' },
    { url: 'https://urdu.geo.tv/rss/1/0', source: 'Geo Urdu' },
  ],
  as: [
    { url: 'https://nenow.in/feed', source: 'Northeast Now' },
  ],

  // ===== Middle East & Africa =====
  ar: [
    { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', source: 'BBC Arabic' },
    { url: 'https://aawsat.com/feed', source: 'Asharq Al-Awsat' },
    { url: 'https://arabic.rt.com/rss/', source: 'RT Arabic' },
    { url: 'https://www.youm7.com/rss/SectionRss', source: 'Youm7' },
    { url: 'https://www.alarabiya.net/tools/mrss', source: 'Al Arabiya Arabic' },
    { url: 'https://www.aljazeera.net/feed', source: 'Al Jazeera Arabic' },
    { url: 'https://www.france24.com/ar/rss', source: 'France 24 Arabic' },
    { url: 'https://www.independentarabia.com/rss', source: 'Independent Arabia' },
    { url: 'https://rss.dw.com/xml/rss-ar-all', source: 'DW Arabic' },
  ],
  fa: [
    { url: 'https://feeds.bbci.co.uk/persian/rss.xml', source: 'BBC Persian' },
    { url: 'https://www.mehrnews.com/rss', source: 'Mehr News' },
    { url: 'https://www.tabnak.ir/fa/rss/allnews', source: 'Tabnak' },
    { url: 'https://rss.dw.com/xml/rss-fa-all', source: 'DW Persian' },
    { url: 'https://www.radiofarda.com/api/zrqitequmi', source: 'Radio Farda' },
  ],
  he: [
    { url: 'https://www.haaretz.com/srv/htz-atom', source: 'Haaretz' },
    { url: 'https://www.ynet.co.il/Integration/StoryRss3082.xml', source: 'Ynet' },
  ],
  sw: [
    { url: 'https://feeds.bbci.co.uk/swahili/rss.xml', source: 'BBC Swahili' },
    { url: 'https://www.dw.com/rss/sw/s-11588', source: 'DW Swahili' },
  ],

  // ===== European Languages =====
  fr: [
    { url: 'https://www.france24.com/fr/rss', source: 'France 24' },
    { url: 'https://www.rfi.fr/fr/rss', source: 'RFI French' },
    { url: 'https://www.lemonde.fr/rss/une.xml', source: 'Le Monde' },
    { url: 'http://www.lefigaro.fr/rss/figaro_actualites.xml', source: 'Le Figaro' },
    { url: 'https://www.20minutes.fr/feeds/rss-une.xml', source: '20 Minutes' },
    { url: 'https://feeds.leparisien.fr/leparisien/rss', source: 'Le Parisien' },
    { url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/collection/accueil-une/', source: 'Liberation' },
    { url: 'https://www.mediapart.fr/articles/feed', source: 'Mediapart' },
    { url: 'https://www.lepoint.fr/rss.xml', source: 'Le Point' },
    { url: 'https://www.lopinion.fr/rss', source: 'L\'Opinion' },
  ],
  de: [
    { url: 'https://rss.dw.com/xml/rss-de-all', source: 'DW German' },
    { url: 'https://www.tagesschau.de/xml/rss2', source: 'Tagesschau' },
    { url: 'https://www.spiegel.de/schlagzeilen/index.rss', source: 'Der Spiegel' },
    { url: 'https://rss.sueddeutsche.de/rss/Topthemen', source: 'Süddeutsche Zeitung' },
    { url: 'https://www.faz.net/rss/aktuell/', source: 'FAZ' },
    { url: 'https://newsfeed.zeit.de/index', source: 'ZEIT Online' },
    { url: 'https://www.stern.de/feed/standard/all/', source: 'Stern' },
    { url: 'https://www.handelsblatt.com/contentexport/feed/top-themen', source: 'Handelsblatt' },
    { url: 'https://www.n-tv.de/rss', source: 'n-tv' },
  ],
  es: [
    { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', source: 'BBC Mundo' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', source: 'El Pais' },
    { url: 'https://www.clarin.com/rss/lo-ultimo/', source: 'Clarín' },
    { url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', source: 'La Nación Argentina' },
    { url: 'https://www.eltiempo.com/rss/eltiempo.xml', source: 'El Tiempo Colombia' },
    { url: 'https://www.excelsior.com.mx/rss.xml', source: 'Excelsior Mexico' },
    { url: 'https://www.elmundo.es/rss/portada.xml', source: 'El Mundo Spain' },
    { url: 'https://www.abc.es/rss/feeds/abc_EspsYa.xml', source: 'ABC Spain' },
    { url: 'https://www.elcolombiano.com/rss/inicio.xml', source: 'El Colombiano' },
  ],
  pt: [
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', source: 'BBC Portuguese' },
    { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', source: 'Folha de S.Paulo' },
    { url: 'http://rss.home.uol.com.br/index.xml', source: 'UOL' },
    { url: 'https://www1.folha.uol.com.br/feed/', source: 'Folha de S.Paulo' },
    { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', source: 'Agencia Brasil' },
    { url: 'https://www.ebc.com.br/rss/feed.xml', source: 'Portal EBC Brazil' },
    { url: 'https://jornaldebrasilia.com.br/feed/', source: 'Jornal de Brasilia' },
    { url: 'https://www.rtp.pt/noticias/rss', source: 'RTP Noticias Portugal' },
    { url: 'https://feeds.feedburner.com/PublicoRSS', source: 'Publico Portugal' },
    { url: 'https://observador.pt/feed/', source: 'Observador Portugal' },
  ],
  it: [
    { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
    { url: 'http://xml2.corriereobjects.it/rss/homepage.xml', source: 'Corriere della Sera' },
    { url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', source: 'La Repubblica' },
    { url: 'https://www.rainews.it/rss/tutti', source: 'RAI News' },
    { url: 'https://www.ilpost.it/feed/', source: 'Il Post' },
    { url: 'https://www.ilfattoquotidiano.it/feed/', source: 'Il Fatto Quotidiano' },
  ],
  nl: [
    { url: 'https://feeds.nos.nl/nosnieuwsalgemeen', source: 'NOS Nieuws' },
    { url: 'https://www.telegraaf.nl/rss', source: 'De Telegraaf' },
    { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews' },
    { url: 'https://www.rtlnieuws.nl/rss.xml', source: 'RTL Nieuws' },
    { url: 'https://www.ad.nl/rss.xml', source: 'AD' },
    { url: 'https://www.volkskrant.nl/voorpagina/rss.xml', source: 'De Volkskrant' },
  ],
  sv: [
    { url: 'https://www.svt.se/nyheter/rss.xml', source: 'SVT Nyheter' },
    { url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/', source: 'Aftonbladet' },
    { url: 'https://www.dn.se/rss/', source: 'Dagens Nyheter' },
    { url: 'https://www.expressen.se/rss/nyheter', source: 'Expressen' },
  ],
  tr: [
    { url: 'https://feeds.bbci.co.uk/turkce/rss.xml', source: 'BBC Turkish' },
    { url: 'https://www.dailysabah.com/rss', source: 'Daily Sabah' },
    { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', source: 'Sabah' },
    { url: 'https://www.haberturk.com/rss', source: 'Haberturk' },
    { url: 'https://www.ensonhaber.com/rss.xml', source: 'En Son Haber' },
    { url: 'https://www.cumhuriyet.com.tr/rss/son_dakika.xml', source: 'Cumhuriyet' },
    { url: 'https://www.yenisafak.com/rss', source: 'Yeni Safak' },
  ],
  pl: [
    { url: 'https://www.rmf24.pl/feed', source: 'RMF24' },
    { url: 'https://www.tvn24.pl/najnowsze.xml', source: 'TVN24' },
    { url: 'https://www.polsatnews.pl/rss/polska.xml', source: 'Polsat News' },
  ],
  ru: [
    { url: 'https://feeds.bbci.co.uk/russian/rss.xml', source: 'BBC Russian' },
    { url: 'https://meduza.io/rss/en/all', source: 'Meduza English' },
    { url: 'https://rss.dw.com/xml/rss-ru-all', source: 'DW Russian' },
  ],

  // ===== East Asia =====
  zh: [
    { url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', source: 'BBC Chinese' },
    { url: 'https://www.rfa.org/cantonese/RSS', source: 'RFA Cantonese' },
    { url: 'https://www.rfa.org/mandarin/RSS', source: 'RFA Mandarin' },
    { url: 'https://news.ltn.com.tw/rss/all.xml', source: 'Liberty Times Taiwan' },
    { url: 'https://rss.dw.com/xml/rss-zh-all', source: 'DW Chinese' },
    { url: 'https://www.taiwannews.com.tw/ch/news/rss', source: 'Taiwan News Chinese' },
  ],
  ja: [
    { url: 'https://feeds.bbci.co.uk/japanese/rss.xml', source: 'BBC Japanese' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK' },
    { url: 'https://www.nippon.com/en/rss/all.xml', source: 'Nippon.com' },
    { url: 'https://news.livedoor.com/topics/rss/top.xml', source: 'Livedoor News' },
    { url: 'https://www.japannews.yomiuri.co.jp/feed/', source: 'Japan News (Yomiuri)' },
    { url: 'https://mainichi.jp/english/rss/etc/top.rss', source: 'Mainichi English' },
  ],
  ko: [
    { url: 'https://feeds.bbci.co.uk/korean/rss.xml', source: 'BBC Korean' },
    { url: 'https://www.koreaherald.com/rss/newsAll', source: 'Korea Herald' },
    { url: 'https://www.koreatimes.co.kr/www2/common/rss.asp', source: 'Korea Times' },
    { url: 'https://english.hani.co.kr/rss/', source: 'Hankyoreh English' },
    { url: 'https://koreajoongangdaily.joins.com/xmlFile/rss.xml', source: 'Korea JoongAng Daily' },
  ],

  // ===== Southeast Asia =====
  th: [
    { url: 'https://feeds.bbci.co.uk/thai/rss.xml', source: 'BBC Thai' },
    { url: 'https://www.nationthailand.com/rss', source: 'Nation Thailand' },
  ],
  id: [
    { url: 'https://feeds.bbci.co.uk/indonesia/rss.xml', source: 'BBC Indonesia' },
    { url: 'https://www.republika.co.id/rss/', source: 'Republika' },
    { url: 'https://www.tribunnews.com/rss', source: 'Tribunnews' },
    { url: 'https://www.merdeka.com/feed/', source: 'Merdeka' },
    { url: 'https://www.suara.com/rss', source: 'Suara' },
    { url: 'https://www.antaranews.com/rss/terkini', source: 'Antara News' },
    { url: 'https://feed.liputan6.com/rss', source: 'Liputan6' },
  ],
  vi: [
    { url: 'https://vnexpress.net/rss/tin-moi-nhat.rss', source: 'VnExpress' },
    { url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss', source: 'Tuoi Tre' },
    { url: 'https://thanhnien.vn/rss/home.rss', source: 'Thanh Nien' },
    { url: 'https://vietnamnews.vn/rss', source: 'Vietnam News' },
  ],
  ms: [
    { url: 'https://www.bernama.com/en/rssfeed.php', source: 'Bernama' },
    { url: 'https://www.freemalaysiatoday.com/feed/', source: 'Free Malaysia Today' },
  ],
  fil: [
    { url: 'https://www.philstar.com/rss/nation', source: 'Philstar' },
    { url: 'https://data.gmanews.tv/gno/rss/news/feed.xml', source: 'GMA News' },
    { url: 'https://www.bworldonline.com/feed/', source: 'BusinessWorld PH' },
    { url: 'https://manilastandard.net/feed/all', source: 'Manila Standard' },
  ],
  ha: [
    { url: 'https://feeds.bbci.co.uk/hausa/rss.xml', source: 'BBC Hausa' },
    { url: 'https://www.voahausa.com/api/zrqitequmi', source: 'VOA Hausa' },
  ],
  am: [
    { url: 'https://feeds.bbci.co.uk/amharic/rss.xml', source: 'BBC Amharic' },
  ],
  yo: [
    { url: 'https://feeds.bbci.co.uk/yoruba/rss.xml', source: 'BBC Yoruba' },
  ],
  ig: [
    { url: 'https://feeds.bbci.co.uk/igbo/rss.xml', source: 'BBC Igbo' },
  ],
  so: [
    { url: 'https://feeds.bbci.co.uk/somali/rss.xml', source: 'BBC Somali' },
  ],
  da: [
    { url: 'https://nyheder.tv2.dk/rss', source: 'TV2 Denmark' },
  ],
  no: [
    { url: 'https://www.nrk.no/toppsaker.rss', source: 'NRK' },
    { url: 'https://www.vg.no/rss/feed/', source: 'VG' },
    { url: 'https://www.aftenposten.no/rss', source: 'Aftenposten' },
  ],
  fi: [
    { url: 'https://yle.fi/uutiset/rss/uutiset.rss', source: 'YLE Uutiset' },
    { url: 'https://www.hs.fi/rss/tuoreimmat.xml', source: 'Helsingin Sanomat' },
  ],
  el: [
    { url: 'https://www.ekathimerini.com/rss', source: 'Ekathimerini' },
  ],
  ro: [
    { url: 'https://www.digi24.ro/rss', source: 'Digi24' },
    { url: 'https://www.hotnews.ro/rss', source: 'HotNews Romania' },
  ],
  cs: [
    { url: 'https://www.novinky.cz/rss', source: 'Novinky.cz' },
  ],
  hu: [
    { url: 'https://index.hu/24ora/rss/', source: 'Index.hu' },
    { url: 'https://www.budapesttimes.hu/feed/', source: 'Budapest Times' },
  ],
  uk: [
    { url: 'https://feeds.bbci.co.uk/ukrainian/rss.xml', source: 'BBC Ukrainian' },
    { url: 'https://www.ukrinform.net/rss/block-lastnews', source: 'Ukrinform English' },
    { url: 'https://www.pravda.com.ua/eng/rss/', source: 'Ukrayinska Pravda English' },
  ],
  bg: [
    { url: 'https://www.novinite.com/rss.php', source: 'Novinite' },
  ],
  my: [
    { url: 'https://feeds.bbci.co.uk/burmese/rss.xml', source: 'BBC Burmese' },
    { url: 'https://www.rfa.org/burmese/RSS', source: 'RFA Burmese' },
  ],
  km: [
    { url: 'https://www.rfa.org/khmer/RSS', source: 'RFA Khmer' },
  ],
  si: [
    { url: 'https://feeds.bbci.co.uk/sinhala/rss.xml', source: 'BBC Sinhala' },
  ],
  ne: [
    { url: 'https://feeds.bbci.co.uk/nepali/rss.xml', source: 'BBC Nepali' },
  ],
};
