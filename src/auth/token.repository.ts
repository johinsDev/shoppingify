import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { safeEqual } from '@poppinss/utils/build/helpers';
import { DateTime } from 'luxon';
import { Op } from 'sequelize';
import { ProviderToken } from './provider-token';
import { Token } from './token.model';

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZ";

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token)
    public model: typeof Token,
  ) {}

  /**
   * Returns the builder query for a given token + type
   */
  private getLookupQuery(tokenId: string, tokenType: string) {
    return this.model.findOne({
      where: {
        [Op.and]: {
          id: tokenId,
          type: tokenType,
        },
      },
    });
  }

  write(token: ProviderToken) {
    return this.model.create({
      userId: token.userId,
      name: token.name,
      token: token.tokenHash,
      type: token.type,
      expiresAt: token.expiresAt
        ? token.expiresAt.toFormat(dateTimeFormat)
        : null,
      ...token.meta,
    });
  }

  async read(
    tokenId: string,
    tokenType: string,
    tokenHash: string,
  ): Promise<ProviderToken | null> {
    const tokenRow = await this.model.findOne({
      where: {
        [Op.and]: {
          id: tokenId,
          type: tokenType,
        },
      },
    });

    if (!tokenRow) {
      return null;
    }

    if (!safeEqual(tokenRow.token, tokenHash)) {
      return null;
    }

    let normalizedExpiryDate: undefined | DateTime;

    const { expiresAt, name, userId, type, meta, token: value } = tokenRow;

    if (expiresAt instanceof Date) {
      normalizedExpiryDate = DateTime.fromJSDate(expiresAt);
    } else if (expiresAt && typeof expiresAt === 'string') {
      normalizedExpiryDate = DateTime.fromFormat(expiresAt, dateTimeFormat);
    } else if (expiresAt && typeof expiresAt === 'number') {
      normalizedExpiryDate = DateTime.fromMillis(expiresAt);
    }

    if (
      normalizedExpiryDate &&
      normalizedExpiryDate.diff(DateTime.local(), 'milliseconds')
        .milliseconds <= 0
    ) {
      return null;
    }

    const token = new ProviderToken(name, value, userId, type);
    token.expiresAt = normalizedExpiryDate;
    token.meta = meta;

    return token;
  }

  /**
   * Removes a given token
   */
  public async destroy(tokenId: string, tokenType: string) {
    return (await this.getLookupQuery(tokenId, tokenType)).destroy();
  }
}
