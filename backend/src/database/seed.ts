/**
 * Popula o banco com a base de imóveis de São Paulo.
 * Uso: npm run db:seed  (o backend cria as tabelas na primeira subida via
 * synchronize; rode o seed com a API já iniciada ao menos uma vez, ou ele
 * mesmo sincroniza o schema antes de inserir).
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Property } from './entities/property.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SearchResult } from './entities/search-result.entity';
import { Search } from './entities/search.entity';
import { User } from './entities/user.entity';
import { SEED_PROPERTIES } from './seed-data';

const img = (seed: string) => `https://picsum.photos/seed/spotly-${seed}/800/600`;

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, RefreshToken, Property, Search, SearchResult],
    synchronize: true, // garante o schema mesmo se a API nunca subiu
  });
  await ds.initialize();

  console.log('🌱 Limpando e populando imóveis...');
  await ds.getRepository(SearchResult).createQueryBuilder().delete().execute();
  await ds.getRepository(Search).createQueryBuilder().delete().execute();
  await ds.getRepository(Property).createQueryBuilder().delete().execute();

  const repo = ds.getRepository(Property);
  for (const [i, p] of SEED_PROPERTIES.entries()) {
    await repo.save(
      repo.create({
        ...p,
        city: 'São Paulo',
        state: 'SP',
        imageUrl: img(String(i + 1)),
      }),
    );
  }
  console.log(`✅ ${SEED_PROPERTIES.length} imóveis criados em São Paulo.`);
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
