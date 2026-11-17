import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { count } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { getEnvConfig } from '../config/env.config.js';
import { hashPassword } from '../shared/crypto/crypto.util.js';
import { DRIZZLE_DB, PG_POOL } from './database.constants.js';
import * as schema from './schema.js';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_DB_INIT === 'true') {
      return;
    }
    const env = getEnvConfig();
    if (env.DB_AUTO_MIGRATE) {
      await this.ensureSchemaAndIndexes();
    }
    if (env.DB_AUTO_SEED) {
      await this.seedIfEmpty();
    } else {
      this.logger.log(
        'DB_AUTO_SEED is false in .env; skipping automatic database seed.',
      );
    }
  }

  async ensureSchemaAndIndexes(): Promise<void> {
    await this.pool.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE EXTENSION IF NOT EXISTS unaccent;

      CREATE TABLE IF NOT EXISTS universities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        campus_name TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        email_domains TEXT[] NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        hide_whatsapp_for_guests BOOLEAN NOT NULL DEFAULT TRUE,
        avatar_url TEXT,
        university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
        course_name TEXT NOT NULL DEFAULT 'Graduação',
        course_semester TEXT NOT NULL DEFAULT '1º Semestre',
        enrollment_status TEXT NOT NULL DEFAULT 'CURSANDO',
        verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
        verified_domain TEXT,
        role TEXT NOT NULL DEFAULT 'STUDENT',
        is_banned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        user_agent TEXT,
        ip_address TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        purpose TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price_cents INTEGER NOT NULL,
        neighborhood TEXT NOT NULL,
        proximity_label TEXT NOT NULL,
        distance_meters INTEGER NOT NULL DEFAULT 500,
        badge_text TEXT NOT NULL DEFAULT 'Vaga Imediata',
        rating TEXT NOT NULL DEFAULT '4.95',
        status TEXT NOT NULL DEFAULT 'DISPONIVEL',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        views_count INTEGER NOT NULL DEFAULT 0,
        favorites_count INTEGER NOT NULL DEFAULT 0,
        leads_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS housing_details (
        listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
        modality TEXT NOT NULL DEFAULT 'QUARTO_INDIVIDUAL',
        base_rent_cents INTEGER NOT NULL,
        condo_and_bills_cents INTEGER NOT NULL DEFAULT 0,
        bills_summary TEXT NOT NULL DEFAULT '(contas inclusas)',
        bills_included BOOLEAN NOT NULL DEFAULT TRUE,
        included_expenses TEXT[] NOT NULL DEFAULT ARRAY['AGUA', 'LUZ', 'INTERNET'],
        furnished BOOLEAN NOT NULL DEFAULT TRUE,
        no_guarantor BOOLEAN NOT NULL DEFAULT TRUE,
        pets_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        smoking_policy TEXT NOT NULL DEFAULT 'Apenas na varanda',
        gender_preference TEXT NOT NULL DEFAULT 'MISTO',
        house_routine TEXT NOT NULL DEFAULT 'Perfil de silêncio p/ estudos',
        move_in_date_label TEXT NOT NULL DEFAULT 'Entrada: 01 Agosto 2025 (2º Semestre)',
        residents_summary TEXT NOT NULL DEFAULT 'Engenharia e Direito',
        roommates_json TEXT NOT NULL DEFAULT '[]',
        amenities TEXT[] NOT NULL DEFAULT ARRAY['Wi-Fi 500Mb incluso', 'Quarto mobiliado']
      );

      CREATE TABLE IF NOT EXISTS marketplace_details (
        listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
        category TEXT NOT NULL DEFAULT 'MOVEIS',
        condition TEXT NOT NULL DEFAULT 'SEMINOVO',
        condition_label TEXT NOT NULL DEFAULT 'Seminovo (Nota 9/10)',
        retail_price_cents INTEGER,
        accepts_offer BOOLEAN NOT NULL DEFAULT TRUE,
        is_urgent_moving BOOLEAN NOT NULL DEFAULT FALSE,
        disassembles_for_transport BOOLEAN NOT NULL DEFAULT TRUE,
        pickup_location_label TEXT NOT NULL DEFAULT 'Retirar próximo ao campus',
        pickup_notes TEXT NOT NULL DEFAULT 'Combine a retirada na portaria do prédio ou no Centro Acadêmico.'
      );

      CREATE TABLE IF NOT EXISTS listing_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        caption TEXT NOT NULL DEFAULT '',
        is_cover BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS saved_listings (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, listing_id)
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        whatsapp_revealed_by_host BOOLEAN NOT NULL DEFAULT FALSE,
        whatsapp_requested_by_buyer BOOLEAN NOT NULL DEFAULT FALSE,
        last_message_preview TEXT NOT NULL DEFAULT '',
        last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        is_system_message BOOLEAN NOT NULL DEFAULT FALSE,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS verification_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        university_name TEXT NOT NULL,
        registration_number TEXT NOT NULL,
        document_name TEXT NOT NULL,
        document_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        reviewer_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS safety_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        details TEXT NOT NULL,
        reporters_count INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_listings_fts ON listings USING GIN (
        to_tsvector(
          'portuguese',
          coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(neighborhood, '') || ' ' || coalesce(proximity_label, '')
        )
      );

      CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING GIN (title gin_trgm_ops);
    `);
  }

  async seedIfEmpty(): Promise<void> {
    const existingCount = await this.db
      .select({ value: count() })
      .from(schema.universities);

    if ((existingCount[0]?.value ?? 0) > 0) {
      return;
    }

    this.logger.log('Seeding initial Republik database matching .pen design...');

    const [usp, ufba, uefs, unicamp, ufmg] = await this.db
      .insert(schema.universities)
      .values([
        {
          code: 'USP',
          name: 'Universidade de São Paulo',
          campusName: 'USP Butantã • São Paulo, SP',
          city: 'São Paulo',
          state: 'SP',
          emailDomains: ['usp.br', 'alumni.usp.br'],
        },
        {
          code: 'UFBA',
          name: 'Universidade Federal da Bahia',
          campusName: 'UFBA Ondina / Federação • Salvador, BA',
          city: 'Salvador',
          state: 'BA',
          emailDomains: ['ufba.br'],
        },
        {
          code: 'UEFS',
          name: 'Universidade Estadual de Feira de Santana',
          campusName: 'UEFS Campus Universitário • Feira de Santana, BA',
          city: 'Feira de Santana',
          state: 'BA',
          emailDomains: ['uefs.br', 'ecomp.uefs.br'],
        },
        {
          code: 'UNICAMP',
          name: 'Universidade Estadual de Campinas',
          campusName: 'Unicamp Barão Geraldo • Campinas, SP',
          city: 'Campinas',
          state: 'SP',
          emailDomains: ['unicamp.br', 'dac.unicamp.br'],
        },
        {
          code: 'UFMG',
          name: 'Universidade Federal de Minas Gerais',
          campusName: 'UFMG Pampulha • Belo Horizonte, MG',
          city: 'Belo Horizonte',
          state: 'MG',
          emailDomains: ['ufmg.br'],
        },
      ])
      .returning();

    if (!usp || !ufba || !uefs || !unicamp || !ufmg) {
      return;
    }

    const env = getEnvConfig();
    const defaultPasswordHash = await hashPassword(env.SEED_DEFAULT_PASSWORD);

    const [
      jhonatanUser,
      marinaUser,
      lucasUser,
      beatrizUser,
      gustavoUser,
      adminUser,
    ] = await this.db
      .insert(schema.users)
      .values([
        {
          fullName: 'Jhonatan Mizu',
          email: 'jhonatan.mizu@uefs.br',
          passwordHash: defaultPasswordHash,
          whatsapp: '+55 (75) 99142-8830',
          hideWhatsappForGuests: true,
          universityId: uefs.id,
          courseName: 'Engenharia de Computação',
          courseSemester: '6º Semestre',
          enrollmentStatus: 'CURSANDO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'uefs.br',
          role: 'STUDENT',
        },
        {
          fullName: 'Marina Silva',
          email: 'marina.silva@usp.br',
          passwordHash: defaultPasswordHash,
          whatsapp: '+55 (11) 99812-4410',
          hideWhatsappForGuests: true,
          universityId: usp.id,
          courseName: 'Arquitetura e Urbanismo (FAU)',
          courseSemester: '5º Semestre',
          enrollmentStatus: 'CURSANDO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'usp.br',
          role: 'STUDENT',
        },
        {
          fullName: 'Lucas Carvalho',
          email: 'lucas.carvalho@usp.br',
          passwordHash: defaultPasswordHash,
          whatsapp: '+55 (11) 98421-3309',
          hideWhatsappForGuests: true,
          universityId: usp.id,
          courseName: 'Ciência da Computação — IME/USP',
          courseSemester: '6º Semestre',
          enrollmentStatus: 'CURSANDO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'usp.br',
          role: 'STUDENT',
        },
        {
          fullName: 'Beatriz Silveira',
          email: 'beatriz.silveira@usp.br',
          passwordHash: defaultPasswordHash,
          whatsapp: '+55 (11) 97233-1902',
          hideWhatsappForGuests: true,
          universityId: usp.id,
          courseName: 'Farmácia — USP',
          courseSemester: '6º Semestre',
          enrollmentStatus: 'CURSANDO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'usp.br',
          role: 'STUDENT',
        },
        {
          fullName: 'Gustavo Vasconcelos',
          email: 'gustavo.v@usp.br',
          passwordHash: defaultPasswordHash,
          whatsapp: '+55 (11) 99104-7721',
          hideWhatsappForGuests: true,
          universityId: usp.id,
          courseName: 'Engenharia Mecânica (Poli-USP)',
          courseSemester: 'Formando 2026',
          enrollmentStatus: 'CURSANDO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'usp.br',
          role: 'STUDENT',
        },
        {
          fullName: env.SEED_ADMIN_NAME,
          email: env.SEED_ADMIN_EMAIL,
          passwordHash: defaultPasswordHash,
          whatsapp: env.SEED_ADMIN_WHATSAPP,
          hideWhatsappForGuests: true,
          universityId: usp.id,
          courseName: 'Trust & Safety Moderation',
          courseSemester: 'Staff',
          enrollmentStatus: 'FORMADO',
          verificationStatus: 'VERIFIED',
          verifiedDomain: 'republik.com.br',
          role: 'ADMIN',
        },
      ])
      .returning();

    if (
      !jhonatanUser ||
      !marinaUser ||
      !lucasUser ||
      !beatrizUser ||
      !gustavoUser ||
      !adminUser
    ) {
      return;
    }

    // Seed Housing Listings matching Screen 1, Screen 2, Screen 14 & Screen 15
    const insertedHousingListings = await this.db
      .insert(schema.listings)
      .values([
        {
          slug: 'quarto-individual-mobiliado-varanda-butanta-8291',
          code: '8291',
          ownerId: lucasUser.id,
          universityId: usp.id,
          type: 'HOUSING',
          title:
            'Quarto individual mobiliado c/ varanda — Apê 3 quartos no Butantã',
          description:
            'Quarto individual super arejado com janela anti-ruído e sol da manhã, a apenas 5 minutos caminhando do Portão 1 da USP e do metrô Butantã. O clima da casa é tranquilo durante a semana (foco em estudos e estágio) e amigável nos finais de semana. Temos faxina quinzenal já incluída no rateio das contas.',
          priceCents: 75_000,
          neighborhood: 'Butantã, São Paulo',
          proximityLabel: '5 min da USP • Portão 1',
          distanceMeters: 450,
          badgeText: '5 min da USP • Portão 1',
          rating: '4.98',
          status: 'DISPONIVEL',
          isFeatured: true,
          viewsCount: 342,
          favoritesCount: 14,
          leadsCount: 9,
        },
        {
          slug: 'suite-iluminada-republica-feminina-8292',
          code: '8292',
          ownerId: marinaUser.id,
          universityId: ufba.id,
          type: 'HOUSING',
          title: 'Suíte iluminada em República Feminina',
          description:
            'Suíte individual ampla e silenciosa a 800m da UFBA Ondina. Ambiente acolhedor com estudantes de Medicina e Arquitetura, internet fibra 600Mb e despesas inclusas.',
          priceCents: 89_000,
          neighborhood: 'Ondina, Salvador',
          proximityLabel: '800m da UFBA • Medicina e Arquitetura',
          distanceMeters: 800,
          badgeText: 'Vaga Imediata',
          rating: '4.95',
          status: 'DISPONIVEL',
          isFeatured: true,
          viewsCount: 280,
          favoritesCount: 19,
          leadsCount: 6,
        },
        {
          slug: 'quarto-amplo-varanda-republica-mista-8293',
          code: '8293',
          ownerId: lucasUser.id,
          universityId: unicamp.id,
          type: 'HOUSING',
          title: 'Quarto amplo c/ varanda - República Mista',
          description:
            'Quarto arejado com varanda a 600m da Unicamp Barão Geraldo. Sem fiador, contas todas inclusas e faxina quinzenal nas áreas comuns.',
          priceCents: 68_000,
          neighborhood: 'Barão Geraldo, Campinas',
          proximityLabel: '600m da Unicamp • Economia e Biologia',
          distanceMeters: 600,
          badgeText: 'Sem Fiador • Contas Inclusas',
          rating: '4.92',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 195,
          favoritesCount: 11,
          leadsCount: 4,
        },
        {
          slug: 'studio-kitnet-universitario-mobiliado-8294',
          code: '8294',
          ownerId: beatrizUser.id,
          universityId: usp.id,
          type: 'HOUSING',
          title: 'Studio Kitnet Universitário Mobiliado',
          description:
            'Studio completo recém-reformado a 300m do Metrô Butantã com portaria 24h, biometria e lavanderia compartilhada no prédio.',
          priceCents: 125_000,
          neighborhood: 'Butantã, São Paulo',
          proximityLabel: '300m do Metrô Butantã • Portaria 24h',
          distanceMeters: 300,
          badgeText: 'Vaga Imediata',
          rating: '5.0',
          status: 'DISPONIVEL',
          isFeatured: true,
          viewsCount: 410,
          favoritesCount: 24,
          leadsCount: 12,
        },
        {
          slug: 'quarto-individual-casa-vila-arborizada-8295',
          code: '8295',
          ownerId: jhonatanUser.id,
          universityId: uefs.id,
          type: 'HOUSING',
          title: 'Quarto Individual Mobiliado • Bairro Cidade Nova (em frente à UEFS)',
          description:
            'Casa de vila arborizada com quintal amplo e ambiente tranquilo para estudos em frente à passarela da UEFS. Aceita pets e contas inclusas.',
          priceCents: 55_000,
          neighborhood: 'Cidade Nova, Feira de Santana',
          proximityLabel: '400m da UEFS • Passarela Principal',
          distanceMeters: 400,
          badgeText: 'Aceita Pets • Quintal',
          rating: '4.96',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 164,
          favoritesCount: 8,
          leadsCount: 5,
        },
        {
          slug: 'vaga-quarto-duplo-planejado-ufmg-8296',
          code: '8296',
          ownerId: gustavoUser.id,
          universityId: ufmg.id,
          type: 'HOUSING',
          title: 'Vaga em Quarto Duplo Planejado',
          description:
            'Quarto duplo com armários e bancadas individuais planejadas a 7 minutos da UFMG Pampulha. Moradores de Engenharia Civil e Odontologia.',
          priceCents: 52_000,
          neighborhood: 'Ouro Preto, Belo Horizonte',
          proximityLabel: '7 min da UFMG Pampulha',
          distanceMeters: 700,
          badgeText: '7 min da UFMG Pampulha',
          rating: '4.89',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 140,
          favoritesCount: 7,
          leadsCount: 3,
        },
      ])
      .returning();

    const housing1 = insertedHousingListings[0];
    const housing2 = insertedHousingListings[1];
    const housing3 = insertedHousingListings[2];
    const housing4 = insertedHousingListings[3];
    const housing5 = insertedHousingListings[4];
    const housing6 = insertedHousingListings[5];

    if (housing1 && housing2 && housing3 && housing4 && housing5 && housing6) {
      await this.db.insert(schema.housingDetails).values([
        {
          listingId: housing1.id,
          modality: 'QUARTO_INDIVIDUAL',
          baseRentCents: 60_000,
          condoAndBillsCents: 15_000,
          billsSummary: '(contas inclusas)',
          billsIncluded: true,
          includedExpenses: ['AGUA', 'LUZ', 'INTERNET', 'FAXINA', 'CONDOMINIO'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: true,
          smokingPolicy: 'Apenas na varanda',
          genderPreference: 'MISTO',
          houseRoutine: 'Faxina quinzenal + escala leve • Foco em estudos',
          moveInDateLabel: 'Entrada: 01 Agosto 2025 (2º Semestre)',
          residentsSummary: '450m do campus • Moradores: Engenharia e Direito',
          roommatesJson: JSON.stringify([
            { initials: 'LC', name: 'Lucas', course: 'Computação' },
            { initials: 'TH', name: 'Thiago', course: 'Poli USP' },
            { initials: 'AN', name: 'Amanda', course: 'Direito' },
          ]),
          amenities: [
            'Máquina Lava e Seca 11kg',
            'Geladeira Duplex Frost Free',
            'Escrivaninha 1,40m + Cadeira',
            'Portaria 24h + Biometria',
          ],
        },
        {
          listingId: housing2.id,
          modality: 'SUITE',
          baseRentCents: 74_000,
          condoAndBillsCents: 15_000,
          billsSummary: '(água, luz e fibra 600Mb)',
          billsIncluded: true,
          includedExpenses: ['AGUA', 'LUZ', 'INTERNET'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: false,
          smokingPolicy: 'Fumo proibido dentro do apê',
          genderPreference: 'SO_MENINAS',
          houseRoutine: 'Silêncio após 22h durante a semana',
          moveInDateLabel: 'Entrada Imediata',
          residentsSummary: '800m da UFBA • Moradoras: Medicina e Arquitetura',
          roommatesJson: JSON.stringify([
            { initials: 'MS', name: 'Marina', course: 'Arquitetura' },
            { initials: 'CL', name: 'Clara', course: 'Medicina' },
          ]),
          amenities: [
            'Banheiro privativo na suíte',
            'Internet Fibra 600Mb',
            'Máquina de Lavar',
            'Portaria 24h',
          ],
        },
        {
          listingId: housing3.id,
          modality: 'QUARTO_INDIVIDUAL',
          baseRentCents: 55_000,
          condoAndBillsCents: 13_000,
          billsSummary: '(tudo incluso + faxina quinzenal)',
          billsIncluded: true,
          includedExpenses: ['AGUA', 'LUZ', 'INTERNET', 'FAXINA'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: true,
          smokingPolicy: 'Apenas área externa',
          genderPreference: 'MISTO',
          houseRoutine: 'Convivência tranquila e colaborativa',
          moveInDateLabel: 'Entrada Imediata',
          residentsSummary: '600m da Unicamp • Moradores: Economia e Biologia',
          roommatesJson: JSON.stringify([
            { initials: 'RM', name: 'Rafael', course: 'Economia' },
          ]),
          amenities: ['Varanda privativa', 'Faxina quinzenal', 'Wi-Fi 500Mb'],
        },
        {
          listingId: housing4.id,
          modality: 'STUDIO_KITNET',
          baseRentCents: 105_000,
          condoAndBillsCents: 20_000,
          billsSummary: '(condomínio e IPTU inclusos)',
          billsIncluded: true,
          includedExpenses: ['CONDOMINIO', 'IPTU', 'AGUA', 'INTERNET'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: true,
          smokingPolicy: 'Não fumante',
          genderPreference: 'MISTO',
          houseRoutine: 'Studio individual independente',
          moveInDateLabel: 'Entrada Imediata',
          residentsSummary: '300m do Metrô Butantã • Portaria 24h e Lavanderia',
          roommatesJson: JSON.stringify([]),
          amenities: [
            'Portaria 24h + Biometria',
            'Lavanderia OMO no prédio',
            'Cooktop e Frigobar inclusos',
          ],
        },
        {
          listingId: housing5.id,
          modality: 'QUARTO_INDIVIDUAL',
          baseRentCents: 45_000,
          condoAndBillsCents: 10_000,
          billsSummary: '(contas inclusas)',
          billsIncluded: true,
          includedExpenses: ['AGUA', 'LUZ', 'INTERNET'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: true,
          smokingPolicy: 'Apenas quintal',
          genderPreference: 'MISTO',
          houseRoutine: 'Foco em estudos e projetos acadêmicos',
          moveInDateLabel: 'Entrada Imediata',
          residentsSummary: '400m da UEFS • Moradores: Eng. Computação e Física',
          roommatesJson: JSON.stringify([
            { initials: 'JM', name: 'Jhonatan', course: 'Eng. Computação' },
          ]),
          amenities: [
            'Quintal arborizado',
            'Internet Fibra 500Mb',
            'Escrivaninha e Cadeira inclusas',
          ],
        },
        {
          listingId: housing6.id,
          modality: 'VAGA_COMPARTILHADA',
          baseRentCents: 42_000,
          condoAndBillsCents: 10_000,
          billsSummary: '(contas inclusas)',
          billsIncluded: true,
          includedExpenses: ['AGUA', 'LUZ', 'INTERNET'],
          furnished: true,
          noGuarantor: true,
          petsAllowed: false,
          smokingPolicy: 'Não fumante',
          genderPreference: 'SO_MENINOS',
          houseRoutine: 'Rotina tranquila de estudos',
          moveInDateLabel: 'Entrada Imediata',
          residentsSummary: '700m do campus • Moradores: Eng. Civil e Odonto',
          roommatesJson: JSON.stringify([
            { initials: 'MF', name: 'Matheus', course: 'Odontologia' },
          ]),
          amenities: ['Bancada individual planejada', 'Wi-Fi Fibra'],
        },
      ]);

      await this.db.insert(schema.listingPhotos).values([
        {
          listingId: housing1.id,
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
          caption: 'Quarto individual mobiliado com luz natural',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: housing1.id,
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          caption: 'Sala de convivência e varanda',
          isCover: false,
          sortOrder: 1,
        },
        {
          listingId: housing2.id,
          url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4efb?auto=format&fit=crop&w=1000&q=80',
          caption: 'Suíte iluminada',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: housing3.id,
          url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
          caption: 'Quarto amplo com varanda',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: housing4.id,
          url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80',
          caption: 'Studio Kitnet Universitário',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: housing5.id,
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
          caption: 'Quarto em frente à UEFS',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: housing6.id,
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
          caption: 'Quarto duplo planejado UFMG',
          isCover: true,
          sortOrder: 0,
        },
      ]);
    }

    // Seed Marketplace ("Desapego") Listings matching Screen 3 & Screen 4
    const insertedMarketListings = await this.db
      .insert(schema.listings)
      .values([
        {
          slug: 'escrivaninha-em-l-cadeira-ergonomica-mesh-9001',
          code: '9001',
          ownerId: gustavoUser.id,
          universityId: usp.id,
          type: 'MARKETPLACE',
          title:
            'Escrivaninha em L (1,50m x 1,20m) + Cadeira Ergonômica Mesh c/ Apoio Lombar',
          description:
            'Estou me formando na Poli agora em julho e voltando para o interior! A escrivaninha em L cabe dois monitores + cadernos tranquilamente. A cadeira tem pistão a gás classe 4 e tela mesh super fresca. Vendo juntos por R$ 320 ou separados.',
          priceCents: 32_000,
          neighborhood: 'Butantã, São Paulo',
          proximityLabel: 'Retirar no Butantã (Portão 1)',
          distanceMeters: 300,
          badgeText: 'Urgente - Mudança',
          rating: '5.0',
          status: 'DISPONIVEL',
          isFeatured: true,
          viewsCount: 245,
          favoritesCount: 18,
          leadsCount: 7,
        },
        {
          slug: 'frigobar-consul-117l-branco-110v-9002',
          code: '9002',
          ownerId: beatrizUser.id,
          universityId: usp.id,
          type: 'MARKETPLACE',
          title: 'Frigobar Consul 117L Branco 110v impecável',
          description:
            'Frigobar super silencioso usado apenas no quarto durante a graduação. Gela muito rápido, acompanha gaveta multiuso e compartimento extra-frio. Ajudo a levar no carro se for na região do Butantã.',
          priceCents: 58_000,
          neighborhood: 'Vila Indiana, São Paulo',
          proximityLabel: 'Ajudo a levar no carro',
          distanceMeters: 500,
          badgeText: 'Seminovo • 8 meses',
          rating: '4.97',
          status: 'DISPONIVEL',
          isFeatured: true,
          viewsCount: 189,
          favoritesCount: 15,
          leadsCount: 5,
        },
        {
          slug: 'monitor-dell-24-ips-full-hd-braco-articulado-9003',
          code: '9003',
          ownerId: lucasUser.id,
          universityId: usp.id,
          type: 'MARKETPLACE',
          title: 'Monitor Dell 24" IPS Full HD + Braço Articulado',
          description:
            'Monitor Dell P2422H IPS com ajuste de altura/rotação + suporte articulado de pistão a gás ELG F80N. Sem dead pixels, acompanha cabo HDMI e DisplayPort.',
          priceCents: 65_000,
          neighborhood: 'Cidade Universitária, São Paulo',
          proximityLabel: 'Entrega no Campus (Bandejão)',
          distanceMeters: 200,
          badgeText: 'Estado de Novo',
          rating: '5.0',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 310,
          favoritesCount: 22,
          leadsCount: 9,
        },
        {
          slug: 'mesa-desenho-arquitetura-regulavel-luminaria-9004',
          code: '9004',
          ownerId: marinaUser.id,
          universityId: usp.id,
          type: 'MARKETPLACE',
          title: 'Mesa Desenho Arquitetura Regulável + Luminária Articulada Pixar',
          description:
            'Prancheta e mesa de desenho com inclinação regulável perfeita para estudantes de Arquitetura ou Design, acompanhada de luminária articulada metálica.',
          priceCents: 28_000,
          neighborhood: 'Pinheiros, São Paulo',
          proximityLabel: 'Retirar na FAU-USP ou Pinheiros',
          distanceMeters: 600,
          badgeText: 'Urgente - Formatura',
          rating: '4.95',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 128,
          favoritesCount: 9,
          leadsCount: 4,
        },
        {
          slug: 'micro-ondas-electrolux-20l-inox-espelhado-9005',
          code: '9005',
          ownerId: jhonatanUser.id,
          universityId: uefs.id,
          type: 'MARKETPLACE',
          title: 'Micro-ondas Electrolux 20L Inox Espelhado',
          description:
            'Micro-ondas Electrolux 20L em perfeito funcionamento, sem marcas de uso. Ideal para república ou kitnet universitária.',
          priceCents: 26_000,
          neighborhood: 'Cidade Nova, Feira de Santana',
          proximityLabel: 'Retirar em frente à UEFS',
          distanceMeters: 350,
          badgeText: 'Seminovo',
          rating: '4.93',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 112,
          favoritesCount: 6,
          leadsCount: 3,
        },
        {
          slug: 'bicicleta-caloi-aro-29-trava-ulock-kryptonite-9006',
          code: '9006',
          ownerId: gustavoUser.id,
          universityId: usp.id,
          type: 'MARKETPLACE',
          title: 'Bicicleta Caloi Aro 29 c/ Trava U-Lock Kryptonite',
          description:
            'Bicicleta aro 29 revisada para pedalar na ciclovia da USP. Inclui trava U-Lock Kryptonite com 2 chaves e farol recarregável USB.',
          priceCents: 79_000,
          neighborhood: 'Butantã, São Paulo',
          proximityLabel: 'Entrega na Praça do Relógio USP',
          distanceMeters: 250,
          badgeText: 'Seminovo',
          rating: '4.99',
          status: 'DISPONIVEL',
          isFeatured: false,
          viewsCount: 175,
          favoritesCount: 12,
          leadsCount: 4,
        },
      ])
      .returning();

    const m1 = insertedMarketListings[0];
    const m2 = insertedMarketListings[1];
    const m3 = insertedMarketListings[2];
    const m4 = insertedMarketListings[3];
    const m5 = insertedMarketListings[4];
    const m6 = insertedMarketListings[5];

    if (m1 && m2 && m3 && m4 && m5 && m6) {
      await this.db.insert(schema.marketplaceDetails).values([
        {
          listingId: m1.id,
          category: 'MOVEIS',
          condition: 'SEMINOVO',
          conditionLabel: 'Seminovo (Nota 9/10)',
          retailPriceCents: 89_000,
          acceptsOffer: true,
          isUrgentMoving: true,
          disassemblesForTransport: true,
          pickupLocationLabel: 'Retirada: Butantã (~300m Portão 1 USP)',
          pickupNotes:
            'Av. Vital Brasil / Metrô Butantã • Prédio com elevador de serviço',
        },
        {
          listingId: m2.id,
          category: 'ELETRODOMESTICOS',
          condition: 'SEMINOVO',
          conditionLabel: 'Seminovo • 8 meses',
          retailPriceCents: 115_000,
          acceptsOffer: true,
          isUrgentMoving: false,
          disassemblesForTransport: false,
          pickupLocationLabel: 'Retirada: Vila Indiana (Ajudo a levar no carro)',
          pickupNotes: 'Posso ajudar no transporte até 3km do campus.',
        },
        {
          listingId: m3.id,
          category: 'ELETRONICOS_ESTUDO',
          condition: 'ESTADO_DE_NOVO',
          conditionLabel: 'Estado de Novo (Nota 10/10)',
          retailPriceCents: 110_000,
          acceptsOffer: false,
          isUrgentMoving: false,
          disassemblesForTransport: true,
          pickupLocationLabel: 'Entrega no Campus (Bandejão Central USP)',
          pickupNotes: 'Posso testar na hora no IME ou Bandejão.',
        },
        {
          listingId: m4.id,
          category: 'MOVEIS',
          condition: 'SEMINOVO',
          conditionLabel: 'Seminovo (Nota 9/10)',
          retailPriceCents: 62_000,
          acceptsOffer: true,
          isUrgentMoving: true,
          disassemblesForTransport: true,
          pickupLocationLabel: 'Retirar na FAU-USP ou Pinheiros',
          pickupNotes: 'Desmonta fácil para caber no banco traseiro.',
        },
        {
          listingId: m5.id,
          category: 'ELETRODOMESTICOS',
          condition: 'SEMINOVO',
          conditionLabel: 'Seminovo (Nota 9/10)',
          retailPriceCents: 54_000,
          acceptsOffer: true,
          isUrgentMoving: false,
          disassemblesForTransport: false,
          pickupLocationLabel: 'Retirar no Bairro Cidade Nova (UEFS)',
          pickupNotes: 'Entrega na portaria do prédio.',
        },
        {
          listingId: m6.id,
          category: 'BICICLETAS',
          condition: 'SEMINOVO',
          conditionLabel: 'Seminovo Revisado',
          retailPriceCents: 145_000,
          acceptsOffer: true,
          isUrgentMoving: false,
          disassemblesForTransport: false,
          pickupLocationLabel: 'Entrega na Praça do Relógio USP',
          pickupNotes: 'Acompanha nota fiscal do quadro e trava U-Lock.',
        },
      ]);

      await this.db.insert(schema.listingPhotos).values([
        {
          listingId: m1.id,
          url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
          caption: 'Escrivaninha em L + Cadeira Ergonômica Mesh',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: m2.id,
          url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1000&q=80',
          caption: 'Frigobar Consul 117L',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: m3.id,
          url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
          caption: 'Monitor Dell 24 IPS Full HD',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: m4.id,
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
          caption: 'Mesa de Desenho Arquitetura',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: m5.id,
          url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=1000&q=80',
          caption: 'Micro-ondas Electrolux 20L',
          isCover: true,
          sortOrder: 0,
        },
        {
          listingId: m6.id,
          url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
          caption: 'Bicicleta Caloi Aro 29',
          isCover: true,
          sortOrder: 0,
        },
      ]);
    }

    // Seed Saved Favorites & Chat Conversations (Screen 13 & Mobile 6)
    if (housing1 && m1) {
      await this.db.insert(schema.savedListings).values([
        { userId: jhonatanUser.id, listingId: housing1.id },
        { userId: jhonatanUser.id, listingId: m1.id },
        { userId: marinaUser.id, listingId: housing1.id },
      ]);

      const [conv1, conv2] = await this.db
        .insert(schema.conversations)
        .values([
          {
            listingId: housing1.id,
            buyerId: beatrizUser.id,
            sellerId: jhonatanUser.id,
            whatsappRevealedByHost: true,
            whatsappRequestedByBuyer: true,
            lastMessagePreview:
              'Sim, estudo no Butantã! Sábado às 10h fica ótimo para mim.',
          },
          {
            listingId: m1.id,
            buyerId: jhonatanUser.id,
            sellerId: gustavoUser.id,
            whatsappRevealedByHost: false,
            whatsappRequestedByBuyer: false,
            lastMessagePreview:
              'Aceita R$ 300 no PIX? Retiro hoje no campus perto do Portão 1.',
          },
        ])
        .returning();

      if (conv1 && conv2) {
        await this.db.insert(schema.messages).values([
          {
            conversationId: conv1.id,
            senderId: beatrizUser.id,
            body: 'Oi! Sou aluna do 3º ano de Farmácia e procuro quarto a partir do mês que vem. Podemos agendar uma visita?',
          },
          {
            conversationId: conv1.id,
            senderId: jhonatanUser.id,
            body: 'Oi Beatriz! Claro, temos visitas quinta e sábado. Você estuda no campus Butantã?',
          },
          {
            conversationId: conv1.id,
            senderId: beatrizUser.id,
            body: 'Sim, estudo no Butantã! Sábado às 10h fica ótimo para mim. Se quiser, podemos liberar o contato do WhatsApp por aqui.',
          },
          {
            conversationId: conv2.id,
            senderId: jhonatanUser.id,
            body: 'Aceita R$ 300 no PIX? Retiro hoje no campus perto do Portão 1.',
          },
        ]);
      }

      // Seed Admin Moderation & Academic Verification Queue (Screen 16)
      await this.db.insert(schema.verificationRequests).values([
        {
          userId: lucasUser.id,
          universityName: 'USP • RA 11849201',
          registrationNumber: '11849201',
          documentName: 'Atestado_Matricula_USP_2026.pdf',
          documentUrl: '/uploads/sample-atestado-usp.pdf',
          status: 'IN_REVIEW',
          reviewerNotes:
            'Documento em inspeção: Atestado de Matrícula USP 2026 (JupiterWeb Autenticado)',
        },
        {
          userId: marinaUser.id,
          universityName: 'UFBA • Mat. 202610492',
          registrationNumber: '202610492',
          documentName: 'Comprovante_SIGAA_UFBA.pdf',
          documentUrl: '/uploads/sample-sigaa-ufba.pdf',
          status: 'PENDING',
        },
        {
          userId: jhonatanUser.id,
          universityName: 'UEFS • Mat. 23110942',
          registrationNumber: '23110942',
          documentName: 'Declaracao_Semestre_UEFS.jpg',
          documentUrl: '/uploads/sample-declaracao-uefs.jpg',
          status: 'PENDING',
        },
      ]);

      await this.db.insert(schema.safetyReports).values([
        {
          listingId: housing4.id,
          reporterId: beatrizUser.id,
          reason: 'Aluguel muito abaixo do mercado - suspeita de golpe',
          details:
            'Anúncio #9104: Studio Completo Jardins por R$ 400/mês • Anunciante pediu caução antecipada via PIX antes da visita.',
          reportersCount: 4,
          status: 'PENDING',
        },
      ]);
    }

    this.logger.log('Initial Republik database seed completed!');
  }
}

