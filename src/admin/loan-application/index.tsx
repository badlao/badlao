// import ApproveButton from './ApproveButton';
// import pluginId from './pluginId';

// export const registerLoanApplicationView = (app: any) => {
//   app.injectContentManagerComponent('editView', 'right-links', {
//     name: 'ApproveButton',
//     Component: ApproveButton,
//     pluginId,
//     uid: 'api::loan-application.loan-application',
//   });
// };

import React from 'react';
import ApproveButton from './ApproveButton';
import pluginId from './pluginId';
import {Button} from '@strapi/design-system';
import { StrapiApp } from '@strapi/admin/strapi-admin';

export const registerLoanApplicationView = (app: StrapiApp) => {
  app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
    // name: 'PreviewButton',
    // Component: () => (
    //   <Button onClick={() => window.alert('Not here, The preview is.')}>Preview</Button>
    // ),
    name: 'ApproveButton',
    // only render ApproveButton for loan-application type
    Component: (props: any) => {
      const uid = props.slug;
      console.log('props', props);
      if (uid === 'api::loan-application.loan-application') {
        return <ApproveButton />;
      }
      return null;
    },
  });
};
