import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { base64, string } from '@poppinss/utils/build/helpers';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { FastifyRequest } from 'fastify';
import { DateTime } from 'luxon';
import { Op } from 'sequelize';
import { AuthenticationException } from './authentication.exception';
import { OpaqueToken } from './opaque-token';
import { ProviderToken } from './provider-token';
import { TokenRepository } from './token.repository';
import { User } from './user.model';
import { UserRepository } from './user.repository';

export type AuthServiceLoginOptions = {
  name?: string;
  expiresIn?: number | string;
} & { [key: string]: any };

const uids = ['email'];

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZ";

@Injectable({
  scope: Scope.REQUEST,
})
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  /**
   * Reference to the parsed token
   */
  private parsedToken?: {
    value: string;
    tokenId: string;
  };

  /**
   * Length of the raw token. The hash length will vary
   */
  private tokenLength = 60;

  /**
   * Token type for the persistance store
   */
  private tokenType = 'opaque_token';

  /**
   * Token fetched as part of the authenticate or the login
   * call
   */
  public token?: ProviderToken;

  /**
   * Logged in or authenticated user
   */
  public user?: User;

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  public authenticationAttempted = false;

  /**
   * Find if the user has been logged out in the current request
   */
  public isLoggedOut = false;

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not
   */
  public isAuthenticated = false;

  /**
   * A boolean to know if user is loggedin via remember me token
   * or not.
   */
  public viaRemember = false;

  /**
   * Accessor to know if user is logged in
   */
  public get isLoggedIn() {
    return !!this.user;
  }

  /**
   * Accessor to know if user is a guest. It is always opposite
   * of [[isLoggedIn]]
   */
  public get isGuest() {
    return !this.isLoggedIn;
  }

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
    const token = string.generateRandom(this.tokenLength);

    return {
      token,
      hash: this.generateHash(token),
      expiresAt: this.getExpiresAtDate(expiresIn),
    };
  }

  /**
   * Marks user as logged-in
   */
  protected markUserAsLoggedIn(
    user: any,
    authenticated?: boolean,
    viaRemember?: boolean,
  ) {
    this.user = user;
    this.isLoggedOut = false;
    authenticated && (this.isAuthenticated = true);
    viaRemember && (this.viaRemember = true);
  }

  /**
   * Login a user
   */
  public async login(
    user: User,
    options?: AuthServiceLoginOptions,
  ): Promise<any> {
    const { expiresIn, name, ...meta } = Object.assign(
      {
        name: 'Opaque Access Token',
        expiresIn: '30 days',
      },
      options,
    );

    const token = this.generateTokenForPersistance(expiresIn);

    const providerToken = new ProviderToken(
      name,
      token.hash,
      user.id,
      this.tokenType,
    );
    providerToken.expiresAt = token.expiresAt;
    providerToken.meta = meta;

    const tokenProvider = await this.tokenRepository.write(providerToken);

    const apiToken = new OpaqueToken(
      name,
      `${base64.urlEncode(`${tokenProvider.id}`)}.${token.token}`,
      user,
    );
    apiToken.tokenHash = token.hash;
    apiToken.expiresAt = token.expiresAt;
    apiToken.meta = meta || {};

    this.markUserAsLoggedIn(user);

    this.token = providerToken;

    return apiToken;
  }

  /**
   * Returns the bearer token
   */
  private getBearerToken(request: FastifyRequest): string {
    const token = request.headers.authorization;

    if (!token) {
      throw AuthenticationException.invalidToken();
    }

    const [type, value] = token.split(' ');
    if (!type || type.toLowerCase() !== 'bearer' || !value) {
      throw AuthenticationException.invalidToken();
    }

    return value;
  }

  /**
   * Parses the token received in the request. The method also performs
   * some initial level of sanity checks.
   */
  private parsePublicToken(token: string) {
    const parts = token.split('.');

    if (parts.length !== 2) {
      throw AuthenticationException.invalidToken();
    }

    const tokenId = base64.urlDecode(parts[0], undefined, true);

    if (!tokenId) {
      throw AuthenticationException.invalidToken();
    }

    if (parts[1].length !== this.tokenLength) {
      throw AuthenticationException.invalidToken();
    }

    this.parsedToken = {
      tokenId,
      value: parts[1],
    };

    return this.parsedToken;
  }

  /**
   * Returns the token by reading it from the token provider
   */
  private async getProviderToken(
    tokenId: string,
    value: string,
  ): Promise<ProviderToken | null> {
    const providerToken = await this.tokenRepository.read(
      tokenId,
      this.tokenType,
      this.generateHash(value),
    );
    if (!providerToken) {
      throw AuthenticationException.invalidToken();
    }

    return providerToken;
  }

  /**
   * Returns user from the user session id
   */
  private async getUserById(id: string | number) {
    const user = await this.userRepository.userModel.findByPk(id);

    if (!user) {
      throw AuthenticationException.invalidToken();
    }

    return user;
  }

  /**
   * Authenticates the current HTTP request by checking for the bearer token
   */
  public async authenticate(request: FastifyRequest): Promise<any> {
    if (this.authenticationAttempted) {
      return this.user;
    }

    this.authenticationAttempted = true;

    const token = this.getBearerToken(request);
    const { tokenId, value } = this.parsePublicToken(token);

    const providerToken = await this.getProviderToken(tokenId, value);
    const user = await this.getUserById(providerToken.userId);

    this.markUserAsLoggedIn(user, true);
    this.token = providerToken;

    return user;
  }

  /**
   * Same as [[authenticate]] but returns a boolean over raising exceptions
   */
  public async check(request: FastifyRequest): Promise<boolean> {
    try {
      await this.authenticate(request);
    } catch (error) {
      /**
       * Throw error when it is not an instance of the authentication
       */
      if (error instanceof AuthenticationException === false) {
        throw error;
      }
    }

    return this.isAuthenticated;
  }

  /**
   * Serialize toJSON for JSON.stringify
   */
  public toJSON() {
    return {
      isLoggedIn: this.isLoggedIn,
      isGuest: this.isGuest,
      authenticationAttempted: this.authenticationAttempted,
      isAuthenticated: this.isAuthenticated,
      user: this.user,
      token: this.token,
    };
  }
}
