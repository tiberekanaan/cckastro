import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    displayName: 'Cta';
    icon: 'cursor';
  };
  attributes: {
    body: Schema.Attribute.Text;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'danger']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface BlocksFaq extends Struct.ComponentSchema {
  collectionName: 'components_blocks_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    question: Schema.Attribute.String;
  };
}

export interface BlocksFeaturedServices extends Struct.ComponentSchema {
  collectionName: 'components_blocks_featured_services';
  info: {
    displayName: 'FeaturedServices';
    icon: 'apps';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    services: Schema.Attribute.Relation<'oneToMany', 'api::service.service'>;
  };
}

export interface BlocksForm extends Struct.ComponentSchema {
  collectionName: 'components_blocks_forms';
  info: {
    displayName: 'Form';
  };
  attributes: {
    formType: Schema.Attribute.Enumeration<['General Inquiry', 'Registration']>;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    icon: 'rocket';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksMarketInsight extends Struct.ComponentSchema {
  collectionName: 'components_blocks_market_insights';
  info: {
    displayName: 'MarketInsight';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface BlocksProfileCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_profile_cards';
  info: {
    displayName: 'ProfileCard';
  };
  attributes: {
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    displayName: 'RichText';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

export interface BlocksServicesGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_services_grids';
  info: {
    displayName: 'ServicesGrid';
    icon: 'grid';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    services: Schema.Attribute.Component<'shared.service-item', true>;
  };
}

export interface SharedServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_service_items';
  info: {
    displayName: 'ServiceItem';
    icon: 'bulletList';
  };
  attributes: {
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Enumeration<
      [
        'network',
        'approval',
        'antenna',
        'domain',
        'hash',
        'license',
        'mobile',
        'globe',
        'coverage',
        'users',
      ]
    > &
      Schema.Attribute.DefaultTo<'network'>;
    summary: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cta': BlocksCta;
      'blocks.faq': BlocksFaq;
      'blocks.featured-services': BlocksFeaturedServices;
      'blocks.form': BlocksForm;
      'blocks.hero': BlocksHero;
      'blocks.market-insight': BlocksMarketInsight;
      'blocks.profile-card': BlocksProfileCard;
      'blocks.rich-text': BlocksRichText;
      'blocks.services-grid': BlocksServicesGrid;
      'shared.service-item': SharedServiceItem;
    }
  }
}
