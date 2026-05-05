export const SITE = {
  website: "https://e-know.github.io/tobydev/", // replace this with your deployed domain
  author: "Inho Choi",
  profile: "https://github.com/E-know",
  desc: "iOS와 프론트엔드 개발 경험을 기록하는 Toby의 개발 블로그입니다.",
  title: "Toby의 개발 블로그",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/E-know/tobydev/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ko", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Seoul", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
