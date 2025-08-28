/**
 * installment service
 */

import { factories } from '@strapi/strapi';
import { InstallmentEntity } from '../types/installment-entity';
import { InstallmentInitialModel } from '../types/installment-initial-model';
import { mapToInstallment } from '../types/installment-mapper';

export default factories.createCoreService('api::installment.installment', ({ strapi }) => ({
  async bulkCreate(installmentModels: InstallmentInitialModel[]) {
    console.log('Creating installments:', installmentModels);
    const installments = mapToInstallment(installmentModels);

    return await Promise.all(
      installments.map(installment =>
        strapi.db.query("api::installment.installment").create({ data: {...installment, skipDueCalculation: true} })
      )
    );
  },
}));
