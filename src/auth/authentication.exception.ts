import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationException extends HttpException {
  /**
   * Missing/Invalid token or unable to lookup user from the token
   */
  public static invalidToken() {
    return new this('Invalid API token', HttpStatus.UNAUTHORIZED);
  }
}
