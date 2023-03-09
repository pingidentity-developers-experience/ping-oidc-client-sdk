import { TextEncoder } from 'util';

export class Helpers {
  static initTextEncoder() {
    global.TextEncoder = TextEncoder;
  }
}

export default Helpers;
