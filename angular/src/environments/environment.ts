// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  title: 'Open Source Classics Commentary (Development)',
  short_title: 'OSCC (Dev)',
  flask_api: 'http://localhost:5003/',
  //flask_api: 'https://oscc.nolden.biz:5004/',
  is_logged_in: true,
  current_user_name: 'Lucus',
  current_user_role: 'teacher',
  production: false,
  debug: true,

  fragments: 'fragments',
  fragment: 'fragment',
  testimonia: 'testimonia',
  testimonium: 'testimonium',
};
