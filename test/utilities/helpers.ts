import { TextEncoder } from 'util';

export class Helpers {
  static initTextEncoder() {
    global.TextEncoder = TextEncoder;
  }

  static btoa(str: string): string {
    return Buffer.from(str, 'binary').toString('base64');
  }

  static atob(str: string): string {
    return Buffer.from(str, 'base64').toString('binary');
  }
}

export default Helpers;
