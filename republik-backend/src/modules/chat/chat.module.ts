import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  MessageEvent,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { Observable, Subject, filter, map } from 'rxjs';
import { z } from 'zod';
import { DRIZZLE_DB, PG_POOL } from '../../database/database.constants.js';
import * as schema from '../../database/schema.js';
import type { JwtPayload } from '../../shared/crypto/crypto.util.js';
import {
  CurrentUser,
  JwtAuthGuard,
  ZodValidationPipe,
} from '../../shared/security/security.js';

export const StartConversationDtoSchema = z.object({
  listingId: z.string().uuid(),
  initialMessage: z
    .string()
    .min(1, 'Digite uma mensagem para iniciar a conversa.')
    .max(1500),
});
export type StartConversationDto = z.infer<typeof StartConversationDtoSchema>;

export const SendMessageDtoSchema = z.object({
  body: z.string().min(1, 'A mensagem não pode estar vazia.').max(1500),
});
export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;

export const WhatsappRevealActionSchema = z.object({
  action: z.enum(['REQUEST', 'AUTHORIZE']),
});
export type WhatsappRevealActionDto = z.infer<
  typeof WhatsappRevealActionSchema
>;

export interface ChatRealtimeEvent {
  readonly recipientIds: readonly string[];
  readonly conversationId: string;
  readonly type: 'NEW_MESSAGE' | 'WHATSAPP_REVEALED';
  readonly message: {
    readonly id: string;
    readonly conversationId: string;
    readonly senderId: string;
    readonly body: string;
    readonly isSystemMessage: boolean;
    readonly createdAt: string;
  };
}

interface RawConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  whatsapp_revealed_by_host: boolean;
  whatsapp_requested_by_buyer: boolean;
  last_message_preview: string;
  last_message_at: Date;
  listing_title: string;
  listing_slug: string;
  listing_code: string;
  listing_type: string;
  listing_price_cents: number;
  buyer_name: string;
  buyer_course: string;
  buyer_domain: string | null;
  buyer_whatsapp: string;
  seller_name: string;
  seller_course: string;
  seller_domain: string | null;
  seller_whatsapp: string;
  unread_count: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? 'R'}${parts[1]?.[0] ?? parts[0]?.[1] ?? 'P'}`.toUpperCase();
}

@Injectable()
export class ChatService {
  private readonly events$ = new Subject<ChatRealtimeEvent>();

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  streamForUser(userId: string): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      filter((ev) => ev.recipientIds.includes(userId)),
      map(
        (ev): MessageEvent => ({
          data: ev,
        }),
      ),
    );
  }

  async listConversations(userId: string) {
    const sqlText = `
      SELECT
        c.*,
        l.title AS listing_title,
        l.slug AS listing_slug,
        l.code AS listing_code,
        l.type AS listing_type,
        l.price_cents AS listing_price_cents,
        b.full_name AS buyer_name,
        b.course_name AS buyer_course,
        b.verified_domain AS buyer_domain,
        b.whatsapp AS buyer_whatsapp,
        s.full_name AS seller_name,
        s.course_name AS seller_course,
        s.verified_domain AS seller_domain,
        s.whatsapp AS seller_whatsapp,
        (
          SELECT COUNT(*)::text
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND m.read_at IS NULL
        ) AS unread_count
      FROM conversations c
      JOIN listings l ON l.id = c.listing_id
      JOIN users b ON b.id = c.buyer_id
      JOIN users s ON s.id = c.seller_id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY c.last_message_at DESC
    `;

    const res = await this.pool.query<RawConversationRow>(sqlText, [userId]);

    return res.rows.map((r) => {
      const isBuyer = r.buyer_id === userId;
      const peerName = isBuyer ? r.seller_name : r.buyer_name;
      const peerCourse = isBuyer ? r.seller_course : r.buyer_course;
      const peerDomain = isBuyer ? r.seller_domain : r.buyer_domain;
      const peerWhatsappRaw = isBuyer ? r.seller_whatsapp : r.buyer_whatsapp;

      return {
        id: r.id,
        listing: {
          id: r.listing_id,
          title: r.listing_title,
          slug: r.listing_slug,
          code: r.listing_code,
          type: r.listing_type,
          priceCents: r.listing_price_cents,
        },
        roleInConversation: isBuyer ? 'BUYER' : 'HOST',
        peer: {
          id: isBuyer ? r.seller_id : r.buyer_id,
          fullName: peerName,
          initials: getInitials(peerName),
          courseName: peerCourse,
          verifiedDomain: peerDomain ?? 'usp.br',
          whatsapp: r.whatsapp_revealed_by_host ? peerWhatsappRaw : null,
        },
        whatsappRevealedByHost: r.whatsapp_revealed_by_host,
        whatsappRequestedByBuyer: r.whatsapp_requested_by_buyer,
        unreadCount: Number.parseInt(r.unread_count, 10) || 0,
        lastMessagePreview: r.last_message_preview,
        lastMessageAt: new Date(r.last_message_at).toISOString(),
      };
    });
  }

  async startConversation(userId: string, dto: StartConversationDto) {
    const [listing] = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, dto.listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundException('Anúncio não encontrado.');
    }

    const sellerId = listing.ownerId;
    const buyerId = userId;

    let [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.listingId, dto.listingId),
          eq(schema.conversations.buyerId, buyerId),
        ),
      )
      .limit(1);

    if (!conv) {
      const [created] = await this.db
        .insert(schema.conversations)
        .values({
          listingId: dto.listingId,
          buyerId,
          sellerId,
          lastMessagePreview: dto.initialMessage,
          lastMessageAt: new Date(),
        })
        .returning();
      conv = created;

      await this.db
        .update(schema.listings)
        .set({ leadsCount: sql`${schema.listings.leadsCount} + 1` })
        .where(eq(schema.listings.id, dto.listingId));
    }

    if (!conv) {
      throw new NotFoundException('Não foi possível criar a conversa.');
    }

    const message = await this.sendMessage(conv.id, userId, {
      body: dto.initialMessage,
    });

    return { conversationId: conv.id, message };
  }

  async getMessages(conversationId: string, userId: string) {
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new ForbiddenException('Sem permissão para acessar esta conversa.');
    }

    // Mark messages from the other party as read
    await this.db
      .update(schema.messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(schema.messages.conversationId, conversationId),
          ne(schema.messages.senderId, userId),
          isNull(schema.messages.readAt),
        ),
      );

    const rows = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(asc(schema.messages.createdAt));

    return rows.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      isMine: m.senderId === userId,
      body: m.body,
      isSystemMessage: m.isSystemMessage,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
    isSystemMessage = false,
  ) {
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new ForbiddenException('Sem permissão para enviar mensagem.');
    }

    const [msg] = await this.db
      .insert(schema.messages)
      .values({
        conversationId,
        senderId: userId,
        body: dto.body,
        isSystemMessage,
      })
      .returning();

    await this.db
      .update(schema.conversations)
      .set({
        lastMessagePreview: dto.body.slice(0, 120),
        lastMessageAt: new Date(),
      })
      .where(eq(schema.conversations.id, conversationId));

    if (!msg) {
      throw new NotFoundException('Erro ao salvar mensagem.');
    }

    const formatted = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      isMine: true,
      body: msg.body,
      isSystemMessage: msg.isSystemMessage,
      readAt: null,
      createdAt: msg.createdAt.toISOString(),
    };

    this.events$.next({
      recipientIds: [conv.buyerId, conv.sellerId],
      conversationId,
      type: 'NEW_MESSAGE',
      message: formatted,
    });

    return formatted;
  }

  async handleWhatsappAction(
    conversationId: string,
    userId: string,
    dto: WhatsappRevealActionDto,
  ) {
    const [conv] = await this.db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new ForbiddenException('Sem permissão para esta conversa.');
    }

    if (dto.action === 'REQUEST') {
      await this.db
        .update(schema.conversations)
        .set({ whatsappRequestedByBuyer: true })
        .where(eq(schema.conversations.id, conversationId));

      await this.sendMessage(
        conversationId,
        userId,
        {
          body: 'Solicitou o compartilhamento seguro de WhatsApp para agendar visita/retirada.',
        },
        true,
      );
      return { whatsappRequestedByBuyer: true, whatsappRevealedByHost: conv.whatsappRevealedByHost };
    }

    await this.db
      .update(schema.conversations)
      .set({
        whatsappRevealedByHost: true,
        whatsappRequestedByBuyer: true,
      })
      .where(eq(schema.conversations.id, conversationId));

    await this.sendMessage(
      conversationId,
      userId,
      {
        body: 'Autorizou o compartilhamento seguro de WhatsApp.',
      },
      true,
    );

    return { whatsappRequestedByBuyer: true, whatsappRevealedByHost: true };
  }
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async listConversations(@CurrentUser() user: JwtPayload) {
    const conversations = await this.chatService.listConversations(user.sub);
    return { conversations };
  }

  @Post('conversations')
  async startConversation(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(StartConversationDtoSchema))
    dto: StartConversationDto,
  ) {
    return this.chatService.startConversation(user.sub, dto);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const messages = await this.chatService.getMessages(id, user.sub);
    return { messages };
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(SendMessageDtoSchema)) dto: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(id, user.sub, dto);
    return { message };
  }

  @Patch('conversations/:id/whatsapp')
  async whatsappAction(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(WhatsappRevealActionSchema))
    dto: WhatsappRevealActionDto,
  ) {
    return this.chatService.handleWhatsappAction(id, user.sub, dto);
  }

  @Sse('stream')
  stream(@CurrentUser() user: JwtPayload): Observable<MessageEvent> {
    return this.chatService.streamForUser(user.sub);
  }
}

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
