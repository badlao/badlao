import React from 'react';
import { Button } from '@strapi/design-system';

import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
// import {useFetchClient, unstable_useContentManagerContext } from '@strapi/strapi/admin';
// import { useFetchClient, useNotification } from '@strapi/admin/strapi-admin';

const ApproveButton: React.FC = () => {
    const { post } = useFetchClient();
    //   const toggleNotification = useNotification();

    const {
        model,
        collectionType,
        id,
        slug,
        isCreatingEntry,
        isSingleType,
        hasDraftAndPublish,
    } = useContentManagerContext();

    const handleApprove = async () => {
        try {
            await post(`/api/loan-applications/${id}/approve`);
            //   toggleNotification({
            //     type: 'success',
            //     message: { id: 'approve.success', defaultMessage: 'Loan approved!' },
            //   });
        } catch (error) {
            //   toggleNotification({
            //     type: 'warning',
            //     message: { id: 'approve.error', defaultMessage: 'Approval failed.' },
            //   });
        }
    };

    return <Button onClick={handleApprove}>Approve</Button>;
};

export default ApproveButton;
