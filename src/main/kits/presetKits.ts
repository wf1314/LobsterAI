const InvestmentExpertKitId = {
  BuiltIn: 'investment-expert',
} as const;

export function buildInvestmentExpertMarketplaceKit(): Record<string, unknown> {
  return {
    id: InvestmentExpertKitId.BuiltIn,
    name: {
      zh: '招商专家',
      en: 'Investment expert',
    },
    description: {
      zh: '服务于招商引资、产业研究与企业推荐场景的专家套件。',
      en: 'An expert suite serving scenarios of investment promotion, industrial research, and enterprise recommendation.',
    },
    icon: '',
    author: 'IndustryAI',
    version: '1.0.0',
    downloadCount: '1200',
    tryAsking: [
      {
        zh: '我是北京招商局，请帮我推荐人工智能类企业并生成一份招商报告。',
        en: 'I am a Beijing Investment Promotion Bureau, please help me recommend artificial intelligence companies and generate an investment report.',
      },
      {
        zh: '我要去北京招商，给我推荐一些人工智能类企业。',
        en: 'I am going to Beijing to attract investment and recommend some artificial intelligence companies to me.',
      },
    ],
    skills: {
      bundle: 'https://sq-internal-capability-platform.ks3-cn-beijing.ksyuncs.com/IndustryAI/investment-attraction-advisor.zip',
      list: [
        {
          id: 'investment-attraction-advisor',
          name: {
            zh: '招商企业推荐',
            en: 'Investment Enterprise Recommendation',
          }
        }
      ],
    },
    mcpServers: [
      {
        id: 'industry_dimension_quick_company_recommend_mcp',
        name: '招商场景企业推荐',
        description: {
          zh: '招商场景企业推荐',
          en: 'Recommended companies in investment scenarios.',
        },
        transportType: 'sse',
        url: 'https://chanyedata.com/industry_dimension_quick_company_recommend_mcp/sse',
        headers: {
          'App-Key': '',
        },
        requiredHeaderKeys: [
          'App-Key',
        ],
      },
    ],
    connectors: [],
  };
}

export function buildPresetMarketplaceKits(): Record<string, unknown>[] {
  return [
    buildInvestmentExpertMarketplaceKit(),
  ];
}
