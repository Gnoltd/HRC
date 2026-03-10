/* =====================================================
   i18n.js — EN / VN Language Switch
   ===================================================== */

const TRANSLATIONS = {
  en: {
    /* ---- Navbar ---- */
    'nav.projects':      'Projects',
    'nav.submit':        'Submit Project',
    'nav.about':         'About Us',
    'nav.lang.label':    'Tiếng Việt',

    /* ---- Index: Hero ---- */
    'hero.title':        'Research Projects Portal',
    'hero.subtitle':     'Discover, explore, and connect with cutting-edge research opportunities across all disciplines.',
    'hero.btn.about':    'About Us',
    'hero.btn.submit':   'Submit a Project',

    /* ---- Index: Stats banner ---- */
    'stats.loading':     'Loading stats…',

    /* ---- Index: Filter bar ---- */
    'filter.search.label':       'Search',
    'filter.search.placeholder': 'Keywords, supervisor name, tags…',
    'filter.category.label':     'Category',
    'filter.category.all':       'All Categories',
    'filter.dept.label':         'Department',
    'filter.dept.all':           'All Departments',
    'filter.sort.label':         'Sort By',
    'filter.sort.newest':        'Newest First',
    'filter.sort.oldest':        'Oldest First',
    'filter.sort.downloads':     'Most Downloaded',
    'filter.sort.title':         'Title A–Z',
    'filter.reset':              'Reset',

    /* ---- Index: CTA banner ---- */
    'cta.heading':  'Have a research project to share?',
    'cta.sub':      'Submit your project for review and let students discover your work.',
    'cta.btn':      'Submit a Project',

    /* ---- About page ---- */
    'about.hero.title':   'HSB Research Club (HRC)',
    'about.hero.sub':     'Building a world-class student research program, supporting AACSB goals and positioning HSB among the top 100 business schools in Asia.',

    'about.section1.title': 'Research Development Roadmap for Students',
    'about.s1.why.title':   '1. Why join research',
    'about.stat1':          '2x graduation rate compared to non-research students',
    'about.stat2':          '1.8x higher likelihood of pursuing graduate studies',
    'about.stat3':          'Employers prioritise candidates with research experience',
    'about.stat4':          'MIT students participate in research before graduating',
    'about.s1.benefits.title': '2. Specific benefits',
    'about.b1':  '<strong>Co-authorship:</strong> Become a co-author on academic publications.',
    'about.b2':  '<strong>Graduate school preparation:</strong> The most decisive factor for MBA/PhD applications.',
    'about.b3':  '<strong>Stand-out CV:</strong> 87% of employers say they need candidates with research experience.',
    'about.b4':  '<strong>Thinking skills:</strong> 80% of employers need graduates with strong writing and presentation skills, while 79% want students who have completed real projects.',
    'about.b5':  '<strong>Network:</strong> Recommendation letters from professors.',
    'about.s1.roadmap.title': '3. Specific roadmap',
    'about.road1.label': 'Year 1–2',
    'about.road1.text':  'Learn research methods, find suitable lecturers, work as a basic research assistant.',
    'about.road2.label': 'Year 3',
    'about.road2.text':  'Data analysis, write the literature review section, propose ideas for expansion.',
    'about.road3.label': 'Year 4',
    'about.road3.text':  'Independent thesis, present at conferences, prepare for publication.',

    /* ---- Submit page ---- */
    'submit.title':     'Submit a Research Project',
    'submit.subtitle':  'Fill in the details below. Your project will be reviewed by an administrator before being published.',

    /* ---- Footer ---- */
    'footer.text': '© 2026 HRC.HSB.EDU.VN - Research Projects Portal',
  },

  vi: {
    /* ---- Navbar ---- */
    'nav.projects':      'Dự Án',
    'nav.submit':        'Nộp Dự Án',
    'nav.about':         'Giới Thiệu',
    'nav.lang.label':    'English',

    /* ---- Index: Hero ---- */
    'hero.title':        'Cổng Dự Án Nghiên Cứu',
    'hero.subtitle':     'Khám phá và kết nối với các cơ hội nghiên cứu tiên tiến trong mọi lĩnh vực.',
    'hero.btn.about':    'Giới Thiệu',
    'hero.btn.submit':   'Nộp Dự Án',

    /* ---- Index: Stats banner ---- */
    'stats.loading':     'Đang tải…',

    /* ---- Index: Filter bar ---- */
    'filter.search.label':       'Tìm Kiếm',
    'filter.search.placeholder': 'Từ khóa, tên giảng viên, thẻ…',
    'filter.category.label':     'Danh Mục',
    'filter.category.all':       'Tất Cả Danh Mục',
    'filter.dept.label':         'Khoa',
    'filter.dept.all':           'Tất Cả Các Khoa',
    'filter.sort.label':         'Sắp Xếp',
    'filter.sort.newest':        'Mới Nhất',
    'filter.sort.oldest':        'Cũ Nhất',
    'filter.sort.downloads':     'Tải Nhiều Nhất',
    'filter.sort.title':         'Tên A–Z',
    'filter.reset':              'Đặt Lại',

    /* ---- Index: CTA banner ---- */
    'cta.heading':  'Bạn có dự án nghiên cứu muốn chia sẻ?',
    'cta.sub':      'Nộp dự án để được xét duyệt và để sinh viên khám phá công trình của bạn.',
    'cta.btn':      'Nộp Dự Án',

    /* ---- About page ---- */
    'about.hero.title': 'Câu lạc bộ Nghiên cứu HSB (HRC)',
    'about.hero.sub':   'Xây dựng chương trình nghiên cứu sinh viên đẳng cấp quốc tế, hỗ trợ mục tiêu AACSB và định vị HSB trong top 100 trường kinh doanh châu Á.',

    'about.section1.title': 'Định Hướng Phát Triển Nghiên Cứu Cho Sinh Viên',
    'about.s1.why.title':   '1. Tại sao nên tham gia nghiên cứu',
    'about.stat1':          'Tỷ lệ tốt nghiệp cao gấp 2 lần so với sinh viên không nghiên cứu',
    'about.stat2':          'Khả năng học cao học cao gấp 1.8 lần',
    'about.stat3':          'Nhà tuyển dụng ưu tiên ứng viên có kinh nghiệm nghiên cứu',
    'about.stat4':          'Sinh viên MIT tham gia nghiên cứu trước khi tốt nghiệp',
    'about.s1.benefits.title': '2. Lợi ích cụ thể',
    'about.b1':  '<strong>Đồng tác giả xuất bản:</strong> Trở thành co-author trên các bài báo khoa học.',
    'about.b2':  '<strong>Chuẩn bị cao học:</strong> Yếu tố quyết định nhất cho MBA/PhD.',
    'about.b3':  '<strong>CV nổi bật hơn trong mắt nhà tuyển dụng:</strong> 87% các nhà tuyển dụng cho rằng họ cần ứng viên với kinh nghiệm nghiên cứu.',
    'about.b4':  '<strong>Kỹ năng tư duy:</strong> 80% nhà tuyển dụng cho rằng họ cần cử nhân có kỹ năng viết và thuyết trình tốt, trong khi 79% muốn sinh viên đã hoàn thiện một vài dự án thật.',
    'about.b5':  '<strong>Mạng lưới quan hệ:</strong> Thư giới thiệu từ giáo sư.',
    'about.s1.roadmap.title': '3. Lộ trình cụ thể',
    'about.road1.label': 'Năm 1 – 2',
    'about.road1.text':  'Học phương pháp nghiên cứu, tìm giảng viên phù hợp, làm trợ lý nghiên cứu cơ bản.',
    'about.road2.label': 'Năm 3',
    'about.road2.text':  'Phân tích dữ liệu, viết phần literature review, đề xuất ý tưởng mở rộng.',
    'about.road3.label': 'Năm 4',
    'about.road3.text':  'Khóa luận độc lập, trình bày hội thảo, chuẩn bị xuất bản.',

    /* ---- Submit page ---- */
    'submit.title':     'Nộp Dự Án Nghiên Cứu',
    'submit.subtitle':  'Điền thông tin bên dưới. Dự án sẽ được quản trị viên xét duyệt trước khi công bố.',

    /* ---- Footer ---- */
    'footer.text': '© 2026 HRC.HSB.EDU.VN - Cổng Dự Án Nghiên Cứu',
  }
};

/* ---- Storage key ---- */
const LANG_KEY = 'hrc_lang';

/* ---- Get current language (default: 'en') ---- */
function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

/* ---- Translate a single key ---- */
function t(key) {
  const lang = getCurrentLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) ||
         (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) ||
         key;
}

/* ---- Apply all translations on the current page ---- */
function applyTranslations() {
  const lang = getCurrentLang();

  /* Update html lang attribute */
  document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';

  /* Update all elements with data-i18n (text content) */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== key) el.textContent = val;
  });

  /* Update all elements with data-i18n-html (innerHTML – for bold tags etc.) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = t(key);
    if (val !== key) el.innerHTML = val;
  });

  /* Update all elements with data-i18n-placeholder */
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val !== key) el.placeholder = val;
  });

  /* Update the lang-toggle button label */
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = t('nav.lang.label');
}

/* ---- Toggle language and re-render ---- */
function toggleLanguage() {
  const next = getCurrentLang() === 'en' ? 'vi' : 'en';
  localStorage.setItem(LANG_KEY, next);
  applyTranslations();
}

/* ---- Initialise on DOM ready ---- */
document.addEventListener('DOMContentLoaded', applyTranslations);
