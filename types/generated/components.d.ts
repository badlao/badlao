import type { Schema, Struct } from '@strapi/strapi';

export interface SharedBusinessExpense extends Struct.ComponentSchema {
  collectionName: 'components_shared_business_expenses';
  info: {
    displayName: 'Business Expense';
  };
  attributes: {
    expenseDetails: Schema.Attribute.String;
    number: Schema.Attribute.Integer;
    quantity: Schema.Attribute.Integer;
  };
}

export interface SharedBusinessMonthlyIncome extends Struct.ComponentSchema {
  collectionName: 'components_shared_business_monthly_incomes';
  info: {
    displayName: 'Business Monthly Income';
  };
  attributes: {
    monthlyIncome: Schema.Attribute.Integer;
    sourceOfIncome: Schema.Attribute.String;
  };
}

export interface SharedContinuedInvestment extends Struct.ComponentSchema {
  collectionName: 'components_shared_continued_investments';
  info: {
    displayName: 'Continued Investment';
  };
  attributes: {
    productNameAndAmount: Schema.Attribute.String;
    purchasePrice: Schema.Attribute.Integer;
  };
}

export interface SharedLoaneeInformation extends Struct.ComponentSchema {
  collectionName: 'components_shared_loanee_informations';
  info: {
    displayName: 'Loanee Information';
  };
  attributes: {
    cheque_no: Schema.Attribute.String;
    loan_amount: Schema.Attribute.Decimal & Schema.Attribute.Required;
    national_id: Schema.Attribute.String & Schema.Attribute.Required;
    recipient_name: Schema.Attribute.String & Schema.Attribute.Required;
    repayment_duration: Schema.Attribute.String;
    repayment_duration_unit: Schema.Attribute.Enumeration<
      ['DAYS', 'WEEKLY', 'MONTHLY', 'YEARLY']
    >;
    repayment_method: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedPermanentBusinessAsset extends Struct.ComponentSchema {
  collectionName: 'components_shared_permanent_business_assets';
  info: {
    displayName: 'Permanent Business Asset';
  };
  attributes: {
    assetDescription: Schema.Attribute.String;
    assetNumber: Schema.Attribute.Integer;
    assetPrice: Schema.Attribute.Integer;
  };
}

export interface SharedPossibleIncome extends Struct.ComponentSchema {
  collectionName: 'components_shared_possible_incomes';
  info: {
    displayName: 'Possible Income';
  };
  attributes: {
    previousBusinessIncome: Schema.Attribute.Integer;
    totalBusinessCost: Schema.Attribute.Integer;
    totalBusinessExpense: Schema.Attribute.Integer;
    totalBusinessIncome: Schema.Attribute.Integer;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRequiredMaterials extends Struct.ComponentSchema {
  collectionName: 'components_shared_required_materials';
  info: {
    displayName: 'Required Materials';
  };
  attributes: {
    materialName: Schema.Attribute.String;
    price: Schema.Attribute.Integer;
    quantity: Schema.Attribute.Integer;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialEvaluation extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_evaluations';
  info: {
    displayName: 'Social Evaluation';
    icon: 'walk';
  };
  attributes: {
    disease_details: Schema.Attribute.Text;
    earners_in_family: Schema.Attribute.Integer;
    education_cost: Schema.Attribute.Integer;
    female_members: Schema.Attribute.Integer;
    financial_behavior_rating: Schema.Attribute.Enumeration<
      ['GOOD', 'AVERAGE', 'BAD']
    >;
    food_cost: Schema.Attribute.Integer;
    has_chronic_disease: Schema.Attribute.Boolean;
    has_legal_or_social_problem: Schema.Attribute.Boolean;
    has_other_loan: Schema.Attribute.Boolean;
    house_rent: Schema.Attribute.Integer;
    house_total_expense: Schema.Attribute.Integer;
    house_type: Schema.Attribute.Enumeration<['OWN', 'RENTED']>;
    is_other_org_defaulter: Schema.Attribute.Boolean;
    legal_social_problem_desc: Schema.Attribute.Text;
    main_income_source: Schema.Attribute.Enumeration<
      ['JOB', 'BUSINESS', 'OTHER']
    >;
    male_members: Schema.Attribute.Integer;
    medical_cost: Schema.Attribute.Integer;
    monthly_income: Schema.Attribute.Integer;
    other_cost: Schema.Attribute.Integer;
    other_org_exit_date: Schema.Attribute.Date;
    other_org_monthly_installment: Schema.Attribute.Integer;
    other_org_total_liability: Schema.Attribute.Integer;
    personal_social_behaviour: Schema.Attribute.Text;
    total_expense: Schema.Attribute.Integer;
    total_family_members: Schema.Attribute.Integer;
    utility_bill: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.business-expense': SharedBusinessExpense;
      'shared.business-monthly-income': SharedBusinessMonthlyIncome;
      'shared.continued-investment': SharedContinuedInvestment;
      'shared.loanee-information': SharedLoaneeInformation;
      'shared.media': SharedMedia;
      'shared.permanent-business-asset': SharedPermanentBusinessAsset;
      'shared.possible-income': SharedPossibleIncome;
      'shared.quote': SharedQuote;
      'shared.required-materials': SharedRequiredMaterials;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-evaluation': SharedSocialEvaluation;
    }
  }
}
