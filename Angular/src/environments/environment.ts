// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  title: 'Open Source Classics Commentary (Development)',
  short_title: 'OSCC (Dev)',
  dashboard_id: 255, 
  referencer_id: 256, 
  playground_id: 0,
  //flask_api: 'http://localhost:5003/',
  flask_api: 'https://oscc.nolden.biz:5004/',
  is_logged_in: true,
  current_user_name: 'Lucus',
  current_user_role: 'teacher',
  production: false,
  zotero_url: "https://api.zotero.org/groups/5089557/items?v=3",
  debug: true,
};
