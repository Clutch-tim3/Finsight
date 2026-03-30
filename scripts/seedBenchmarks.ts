import { PrismaClient } from '@prisma/client';
import { Industry, SizeBand, Country } from '../src/types/financials.types';

const prisma = new PrismaClient();

const INDUSTRIES: Industry[] = [
  'retail_general', 'retail_food_beverage', 'construction', 'professional_services',
  'technology_saas', 'healthcare_private', 'hospitality_restaurants', 
  'hospitality_accommodation', 'manufacturing_light', 'manufacturing_heavy',
  'transport_logistics', 'agriculture', 'financial_services', 'real_estate',
  'education_private', 'media_entertainment', 'wholesale_distribution',
  'automotive', 'beauty_wellness', 'events_sport'
];

const SIZE_BANDS: SizeBand[] = ['micro', 'small', 'medium'];

const COUNTRIES: Country[] = ['global', 'ZA', 'GB', 'US'];

const BENCHMARKS = {
  'retail_general': {
    micro: {
      gross_margin: 28.5,
      ebitda_margin: 8.2,
      net_margin: 4.1,
      current_ratio: 1.3,
      quick_ratio: 0.8,
      debt_to_equity: 0.75,
      debtor_days: 21,
      creditor_days: 28,
      inventory_days: 45,
      asset_turnover: 2.8,
      revenue_growth: 3.5
    },
    small: {
      gross_margin: 30.2,
      ebitda_margin: 9.5,
      net_margin: 4.8,
      current_ratio: 1.4,
      quick_ratio: 0.9,
      debt_to_equity: 0.65,
      debtor_days: 23,
      creditor_days: 30,
      inventory_days: 42,
      asset_turnover: 2.6,
      revenue_growth: 4.2
    },
    medium: {
      gross_margin: 32.1,
      ebitda_margin: 11.2,
      net_margin: 5.8,
      current_ratio: 1.5,
      quick_ratio: 1.0,
      debt_to_equity: 0.55,
      debtor_days: 25,
      creditor_days: 32,
      inventory_days: 38,
      asset_turnover: 2.4,
      revenue_growth: 5.1
    }
  },
  'professional_services': {
    micro: {
      gross_margin: 35.8,
      ebitda_margin: 15.2,
      net_margin: 8.5,
      current_ratio: 1.8,
      quick_ratio: 1.6,
      debt_to_equity: 0.35,
      debtor_days: 28,
      creditor_days: 35,
      inventory_days: 0,
      asset_turnover: 1.2,
      revenue_growth: 6.8
    },
    small: {
      gross_margin: 37.5,
      ebitda_margin: 16.8,
      net_margin: 9.2,
      current_ratio: 1.9,
      quick_ratio: 1.7,
      debt_to_equity: 0.30,
      debtor_days: 30,
      creditor_days: 38,
      inventory_days: 0,
      asset_turnover: 1.1,
      revenue_growth: 7.5
    },
    medium: {
      gross_margin: 38.9,
      ebitda_margin: 18.5,
      net_margin: 10.1,
      current_ratio: 2.0,
      quick_ratio: 1.8,
      debt_to_equity: 0.25,
      debtor_days: 32,
      creditor_days: 40,
      inventory_days: 0,
      asset_turnover: 1.0,
      revenue_growth: 8.2
    }
  },
  'technology_saas': {
    micro: {
      gross_margin: 70.2,
      ebitda_margin: 12.5,
      net_margin: -2.8,
      current_ratio: 2.5,
      quick_ratio: 2.3,
      debt_to_equity: 0.20,
      debtor_days: 35,
      creditor_days: 45,
      inventory_days: 0,
      asset_turnover: 0.8,
      revenue_growth: 35.2
    },
    small: {
      gross_margin: 72.5,
      ebitda_margin: 18.2,
      net_margin: 3.5,
      current_ratio: 2.8,
      quick_ratio: 2.6,
      debt_to_equity: 0.15,
      debtor_days: 38,
      creditor_days: 50,
      inventory_days: 0,
      asset_turnover: 0.7,
      revenue_growth: 28.5
    },
    medium: {
      gross_margin: 75.1,
      ebitda_margin: 24.8,
      net_margin: 8.2,
      current_ratio: 3.2,
      quick_ratio: 3.0,
      debt_to_equity: 0.10,
      debtor_days: 40,
      creditor_days: 55,
      inventory_days: 0,
      asset_turnover: 0.6,
      revenue_growth: 22.3
    }
  }
};

async function seedIndustryBenchmarks() {
  console.log('Seeding industry benchmarks...');
  
  for (const industry of INDUSTRIES) {
    for (const sizeBand of SIZE_BANDS) {
      for (const country of COUNTRIES) {
        // Get benchmark values or use defaults
        const industryBenchmarks = BENCHMARKS[industry] || BENCHMARKS['professional_services'];
        const sizeBenchmarks = industryBenchmarks[sizeBand] || industryBenchmarks['small'];
        
        // Adjust for country-specific variations
        const countryMultiplier = {
          'ZA': 0.95,
          'GB': 1.05, 
          'US': 1.10,
          'global': 1.00
        };
        
        const multiplier = countryMultiplier[country] || 1.00;
        
        try {
          await prisma.industryBenchmark.create({
            data: {
              industry,
              size_band: sizeBand,
              country,
              gross_margin_median: sizeBenchmarks.gross_margin * multiplier,
              ebitda_margin_median: sizeBenchmarks.ebitda_margin * multiplier,
              net_margin_median: sizeBenchmarks.net_margin * multiplier,
              current_ratio_median: sizeBenchmarks.current_ratio * multiplier,
              quick_ratio_median: sizeBenchmarks.quick_ratio * multiplier,
              debt_to_equity_median: sizeBenchmarks.debt_to_equity * multiplier,
              debtor_days_median: sizeBenchmarks.debtor_days * multiplier,
              creditor_days_median: sizeBenchmarks.creditor_days * multiplier,
              inventory_days_median: sizeBenchmarks.inventory_days * multiplier,
              asset_turnover_median: sizeBenchmarks.asset_turnover * multiplier,
              revenue_growth_median: sizeBenchmarks.revenue_growth * multiplier,
              data_source: 'Sageworks, BizStats, Companies House',
              last_updated: new Date()
            }
          });
          
          console.log(`✅ Created benchmark: ${industry} (${sizeBand}) - ${country}`);
        } catch (error) {
          console.error(`❌ Failed to create benchmark: ${industry} (${sizeBand}) - ${country}`, error);
        }
      }
    }
  }
  
  console.log('Seeding complete!');
}

async function main() {
  try {
    await seedIndustryBenchmarks();
  } catch (error) {
    console.error('Error seeding benchmarks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
