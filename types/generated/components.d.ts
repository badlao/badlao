import type { Schema, Struct } from '@strapi/strapi';

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
      ['good', 'average', 'bad']
    >;
    food_cost: Schema.Attribute.Integer;
    has_chronic_disease: Schema.Attribute.Boolean;
    has_legal_or_social_problem: Schema.Attribute.Boolean;
    has_other_loan: Schema.Attribute.Boolean;
    house_rent: Schema.Attribute.Integer;
    house_type: Schema.Attribute.Enumeration<['own', 'rented']>;
    main_income_source: Schema.Attribute.Enumeration<['job', 'business']>;
    male_members: Schema.Attribute.Integer;
    medical_cost: Schema.Attribute.Integer;
    monthly_income: Schema.Attribute.Integer;
    other_cost: Schema.Attribute.Integer;
    total_expense: Schema.Attribute.Integer;
    total_family_members: Schema.Attribute.Integer;
    utility_bill: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-evaluation': SharedSocialEvaluation;
    }
  }
}
