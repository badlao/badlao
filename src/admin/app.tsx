import { StrapiApp } from "@strapi/admin/strapi-admin";
import { registerLoanApplicationView } from "./loan-application";
// import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
  },

  // register(app: StrapiApp) {
  //   registerLoanApplicationView(app);
  // },

  bootstrap(app: StrapiApp) {
    registerLoanApplicationView(app);
    console.log(app);
  },
};
