import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCommissionerProfiles extends Struct.ComponentSchema {
  collectionName: 'components_blocks_commissioner_profiles';
  info: {
    displayName: 'CommissionerProfiles';
    icon: 'user';
  };
  attributes: {
    commissioners: Schema.Attribute.Relation<
      'oneToMany',
      'api::commissioner.commissioner'
    >;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

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

export interface BlocksDistressBeaconCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_distress_beacon_ctas';
  info: {
    displayName: 'Distress Beacon Cta';
    icon: 'broadcast';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
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
    image: Schema.Attribute.Media<'images'>;
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

export interface BlocksLatestNews extends Struct.ComponentSchema {
  collectionName: 'components_blocks_latest_news';
  info: {
    displayName: 'LatestNews';
    icon: 'bell';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksMarketInsight extends Struct.ComponentSchema {
  collectionName: 'components_blocks_market_insights';
  info: {
    displayName: 'MarketInsight';
  };
  attributes: {
    iconName: Schema.Attribute.String;
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface BlocksMarketInsightsSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_market_insights_sections';
  info: {
    displayName: 'MarketInsightsSection';
    icon: 'chartBubble';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    insights: Schema.Attribute.Component<'blocks.market-insight', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksOrgChart extends Struct.ComponentSchema {
  collectionName: 'components_blocks_org_charts';
  info: {
    displayName: 'OrgChart';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
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

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    displayName: 'FooterColumn';
    icon: 'bulletList';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.nav-link', true>;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'NavLink';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
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
    icon: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'lucide:network'>;
    summary: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.commissioner-profiles': BlocksCommissionerProfiles;
      'blocks.cta': BlocksCta;
      'blocks.distress-beacon-cta': BlocksDistressBeaconCta;
      'blocks.faq': BlocksFaq;
      'blocks.featured-services': BlocksFeaturedServices;
      'blocks.form': BlocksForm;
      'blocks.hero': BlocksHero;
      'blocks.latest-news': BlocksLatestNews;
      'blocks.market-insight': BlocksMarketInsight;
      'blocks.market-insights-section': BlocksMarketInsightsSection;
      'blocks.org-chart': BlocksOrgChart;
      'blocks.profile-card': BlocksProfileCard;
      'blocks.rich-text': BlocksRichText;
      'blocks.services-grid': BlocksServicesGrid;
      'shared.footer-column': SharedFooterColumn;
      'shared.nav-link': SharedNavLink;
      'shared.service-item': SharedServiceItem;
    }
  }
}
