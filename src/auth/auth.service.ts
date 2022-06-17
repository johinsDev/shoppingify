import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { base64, string } from '@poppinss/utils/build/helpers';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { DateTime } from 'luxon';
import { Op } from 'sequelize';
import { AuthRepository } from './auth.repository';
import { TokenRepository } from './token.repository';
import { User } from './user.model';

export type AuthServiceLoginOptions = {
  name?: string;
  expiresIn?: number | string;
} & { [key: string]: any };

const uids = ['email'];

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  /**
   * Lookup user using UID
   */
  public async lookupUsingUid(uidValue: string): Promise<any> {
    const user = await this.userRepository.userModel.findOne({
      where: {
        [Op.or]: uids.map((field) => ({ [field]: uidValue })),
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Verify user password
   */
  public async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(user.password, password);
  }

  /**
   * Verifies user credentials
   */
  public async verifyCredentials(uid: string, password: string): Promise<any> {
    if (!uid || !password) {
      throw new BadRequestException('User not found');
    }

    const user = await this.lookupUsingUid(uid);

    await this.verifyPassword(user, password);

    return user;
  }

  /**
   * Verify user credentials and perform login
   */
  public async attempt(
    uid: string,
    password: string,
    options?: AuthServiceLoginOptions,
  ): Promise<any> {
    const user = await this.verifyCredentials(uid, password);

    return this.login(user, options);
  }

  /**
   * Converts value to a sha256 hash
   */
  private generateHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Converts expiry duration to an absolute date/time value
   */
  private getExpiresAtDate(expiresIn?: string | number) {
    if (!expiresIn) {
      return;
    }

    const milliseconds =
      typeof expiresIn === 'string' ? string.toMs(expiresIn) : expiresIn;

    return DateTime.local().plus({ milliseconds });
  }

  /**
   * Generates a new token + hash for the persistance
   */
  private generateTokenForPersistance(expiresIn?: string | number) {
    const token = string.generateRandom(60);

    return {
      token,
      hash: this.generateHash(token),
      expiresAt: this.getExpiresAtDate(expiresIn),
    };
  }
  /**
   * Login a user
   */
  public async login(
    user: User,
    options?: AuthServiceLoginOptions,
  ): Promise<any> {
    /**
     * Normalize options with defaults
     */
    const { expiresIn, name, ...meta } = Object.assign(
      {
        name: 'Opaque Access Token',
        expiresIn: '30 days',
      },
      options,
    );

    const id = user.id;

    if (!id) {
      throw new InternalServerErrorException(
        `Cannot login user. Value of id is not defined`,
      );
    }

    const token = this.generateTokenForPersistance(expiresIn);
    /**
     * Persist token to the database. Make sure that we are always
     * passing the hash to the storage driver
     */
    const tokenProvider = await this.tokenRepository.model.create({
      userId: user.id,
      name,
      token: token.hash,
      type: 'opaque_token',
      expiresAt: token.expiresAt
        ? token.expiresAt.toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZ")
        : null,
      createdAt: DateTime.local().toFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZ"),
      ...meta,
    });

    //   /**
    //  * Emit login event. It can be used to track user logins.
    //  */
    //    this.emitter.emit('adonis:api:login', this.getLoginEventData(providerUser.user, apiToken))

    //    /**
    //     * Marking user as logged in
    //     */
    //    this.markUserAsLoggedIn(providerUser.user)

    return {
      // name,
      type: 'bearer',
      token: `${base64.urlEncode(`${tokenProvider.id}`)}.${token.token}`,
      // meta: meta ?? {},
      // user,
      // tokenHash: token.hash,
      ...(token.expiresAt
        ? { expiresAt: token.expiresAt.toISO() || undefined }
        : {}),
    };
  }
}
